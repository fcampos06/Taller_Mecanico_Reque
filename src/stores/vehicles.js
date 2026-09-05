import { defineStore } from 'pinia'
import { seedVehicles, maintenanceRules } from '../data/seed'
import { useOrdersStore } from './orders'
import { parseEsDate } from '../utils/format'

function addMonths(date, months) {
  const next = new Date(date)
  next.setMonth(next.getMonth() + months)
  return next
}

function formatDate(date) {
  return date.toLocaleDateString('es-CR', { day: '2-digit', month: 'long', year: 'numeric' })
}

export const useVehiclesStore = defineStore('vehicles', {
  state: () => ({
    vehicles: JSON.parse(JSON.stringify(seedVehicles)),
    handledReminderKeys: [],
  }),
  getters: {
    byOwner: (state) => (ownerId) => state.vehicles.filter(v => v.ownerId === ownerId),
    byId: (state) => (id) => state.vehicles.find(v => v.id === id) || null,
  },
  actions: {
    addVehicle(ownerId, { brand, model, year, plate, color, km }) {
      const normalizedPlate = plate.toUpperCase().trim()
      const exists = this.vehicles.some(v => v.plate === normalizedPlate)
      if (exists) return { ok: false, message: 'Ya existe un vehículo registrado con esa placa.' }
      const vehicle = { id: 'v-' + Date.now(), ownerId, brand, model, year: Number(year), plate: normalizedPlate, color, km: Number(km) || 0 }
      this.vehicles.push(vehicle)
      return { ok: true, vehicle }
    },
    updateVehicle(id, patch) {
      const v = this.byId(id)
      if (!v) return { ok: false, message: 'Vehículo no encontrado.' }
      if (patch.plate) {
        const plate = String(patch.plate).toUpperCase().trim()
        const duplicate = this.vehicles.some(other => other.id !== id && other.plate === plate)
        if (duplicate) return { ok: false, message: 'Ya existe otro vehículo registrado con esa placa.' }
        patch = { ...patch, plate }
      }
      Object.assign(v, patch)
      return { ok: true }
    },
    removeVehicle(id) {
      const orders = useOrdersStore()
      if (orders.vehicleHasActiveOrders(id)) {
        return { ok: false, message: 'Este vehículo tiene una orden en curso. No se puede eliminar hasta que finalice.' }
      }
      this.vehicles = this.vehicles.filter(v => v.id !== id)
      return { ok: true }
    },

    // RF-24: recordatorios basados en el historial real de servicios del vehículo.
    remindersFor(vehicleId) {
      const vehicle = this.byId(vehicleId)
      if (!vehicle) return []
      const orders = useOrdersStore()
      const completed = orders.orders
        .filter(o => o.vehicleId === vehicleId && o.status === 'entregado')
        .map(o => ({ order: o, date: parseEsDate(o.statusHistory.at(-1)?.at || o.statusHistory[0]?.at) }))
        .filter(x => x.date)

      const today = new Date()
      const alertLimit = new Date(today)
      alertLimit.setDate(alertLimit.getDate() + 45)

      return maintenanceRules.flatMap(rule => {
        const matches = completed.filter(({ order }) => {
          const labels = order.budgets.flatMap(b => b.items.map(i => i.label)).join(' ').toLowerCase()
          return rule.match.some(term => labels.includes(term) || order.serviceType.toLowerCase().includes(term))
        })
        if (!matches.length) return []
        matches.sort((a, b) => b.date - a.date)
        const last = matches[0]
        const dueDate = addMonths(last.date, rule.everyMonths)
        if (dueDate > alertLimit) return []

        const key = `${vehicleId}:${rule.service}:${dueDate.toISOString().slice(0, 10)}`
        if (this.handledReminderKeys.includes(key)) return []
        const overdue = dueDate < today
        return [{
          key,
          vehicleId,
          service: rule.service,
          dueDate: dueDate.toISOString().slice(0, 10),
          message: `${vehicle.brand} ${vehicle.model}: ${rule.service} ${overdue ? 'está vencido desde' : 'se recomienda para'} ${formatDate(dueDate)} (último servicio: ${formatDate(last.date)}).`,
        }]
      })
    },
    markReminderHandled(key) {
      if (!this.handledReminderKeys.includes(key)) this.handledReminderKeys.push(key)
    },
  },
})
