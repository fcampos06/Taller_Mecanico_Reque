import { defineStore } from 'pinia'
import { seedVehicles, maintenanceRules } from '../data/seed'
import { useOrdersStore } from './orders'

export const useVehiclesStore = defineStore('vehicles', {
  state: () => ({
    vehicles: JSON.parse(JSON.stringify(seedVehicles)),
  }),
  getters: {
    byOwner: (state) => (ownerId) => state.vehicles.filter(v => v.ownerId === ownerId),
    byId: (state) => (id) => state.vehicles.find(v => v.id === id) || null,
  },
  actions: {
    // RF-21: registrar vehículo, validando que la placa no esté duplicada
    addVehicle(ownerId, { brand, model, year, plate, color, km }) {
      const normalizedPlate = plate.toUpperCase().trim()
      const exists = this.vehicles.some(v => v.plate === normalizedPlate)
      if (exists) return { ok: false, message: 'Ya existe un vehículo registrado con esa placa.' }
      const vehicle = { id: 'v-' + Date.now(), ownerId, brand, model, year: Number(year), plate: normalizedPlate, color, km: Number(km) || 0 }
      this.vehicles.push(vehicle)
      return { ok: true, vehicle }
    },
    // RF-19: editar vehículo
    updateVehicle(id, patch) {
      const v = this.byId(id)
      if (v) Object.assign(v, patch)
    },
    // RF-23: eliminar vehículo — impedido si tiene órdenes activas
    removeVehicle(id) {
      const orders = useOrdersStore()
      if (orders.vehicleHasActiveOrders(id)) {
        return { ok: false, message: 'Este vehículo tiene una orden en curso. No se puede eliminar hasta que finalice.' }
      }
      this.vehicles = this.vehicles.filter(v => v.id !== id)
      return { ok: true }
    },
    // RF-21: recordatorios de mantenimiento preventivo según kilometraje
    remindersFor(vehicleId) {
      const v = this.byId(vehicleId)
      if (!v) return []
      return maintenanceRules
        .filter(r => r.everyKm && v.km % r.everyKm >= r.everyKm - 800)
        .map(r => ({ service: r.service, message: `Tu ${v.brand} ${v.model} está por cumplir el intervalo de "${r.service}" (cada ${r.everyKm.toLocaleString('es-CR')} km).` }))
    },
  },
})
