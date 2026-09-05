import { defineStore } from 'pinia'
import { seedOrders, seedRequests, seedChecklistPoints } from '../data/seed'
import { useNotificationsStore } from './notifications'
import { useInventoryStore } from './inventory'

export const CHECKLIST_POINTS = seedChecklistPoints

export const STATUS_LABEL = {
  solicitud: 'Solicitud enviada',
  diagnostico: 'Diagnóstico',
  presupuesto: 'Presupuesto generado',
  espera: 'Esperando aprobación',
  aprobado: 'Aprobado',
  rechazado: 'Rechazado',
  proceso: 'En proceso',
  listo: 'Listo',
  entregado: 'Entregado',
}
export const STATUS_BADGE = {
  solicitud: 'b-solicitud', diagnostico: 'b-diag', presupuesto: 'b-diag',
  espera: 'b-espera', aprobado: 'b-proceso', proceso: 'b-proceso',
  listo: 'b-listo', entregado: 'b-listo', rechazado: 'b-rechazado',
}

let orderSeq = 515

function nowStr() {
  const d = new Date()
  return d.toLocaleString('es-CR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
}

export const useOrdersStore = defineStore('orders', {
  state: () => ({
    requests: JSON.parse(JSON.stringify(seedRequests)),
    orders: JSON.parse(JSON.stringify(seedOrders)),
  }),
  getters: {
    ordersForClient: (state) => (clientId) => state.orders.filter(o => o.clientId === clientId),
    ordersForMechanic: (state) => (mechanicId) => state.orders.filter(o => o.mechanicId === mechanicId),
    orderById: (state) => (id) => state.orders.find(o => o.id === id) || null,
    pendingRequests: (state) => state.requests.filter(r => r.status === 'pendiente'),
    activeCount: (state) => state.orders.filter(o => !['entregado', 'rechazado'].includes(o.status)).length,
    waitingApprovalCount: (state) => state.orders.filter(o => o.status === 'espera').length,
    completedCount: (state) => state.orders.filter(o => o.status === 'entregado').length,
    currentBudget: () => (order) => order.budgets[order.budgets.length - 1] || null,
    workloadByMechanic: (state) => (mechanicId) => state.orders.filter(o => o.mechanicId === mechanicId && !['entregado', 'rechazado'].includes(o.status)).length,
    vehicleHasActiveOrders: (state) => (vehicleId) => state.orders.some(o => o.vehicleId === vehicleId && !['entregado', 'rechazado'].includes(o.status)),
  },
  actions: {
    // RF-01/RF-02: cliente crea una solicitud (con fotos opcionales)
    createRequest(clientId, { vehicleId, serviceType, description, photos }) {
      const req = {
        id: 'sol-' + Date.now(),
        clientId, vehicleId, serviceType, description,
        photos: photos || [],
        createdAt: nowStr(),
        status: 'pendiente',
      }
      this.requests.unshift(req)
      const notif = useNotificationsStore()
      notif.push('u-admin-1', `Nueva solicitud de servicio recibida (${serviceType}).`)
      return req
    },

    // RF-03: administrador convierte una solicitud en orden de trabajo
    convertToOrder(requestId, mechanicId) {
      const req = this.requests.find(r => r.id === requestId)
      if (!req) return null
      req.status = 'convertida'
      const order = {
        id: '#0' + (orderSeq++),
        requestId: req.id,
        clientId: req.clientId,
        vehicleId: req.vehicleId,
        mechanicId,
        serviceType: req.serviceType,
        description: req.description,
        photosRequest: req.photos,
        status: 'diagnostico',
        statusHistory: [{ status: 'solicitud', at: req.createdAt }, { status: 'diagnostico', at: nowStr() }],
        diagnostic: null,
        budgets: [],
        photos: { antes: [], durante: [], despues: [] },
        rating: null,
      }
      this.orders.unshift(order)
      const notif = useNotificationsStore()
      notif.push(req.clientId, `Se creó la orden ${order.id} a partir de tu solicitud.`, order.id)
      return order
    },

    // RF-04: mecánico registra diagnóstico + checklist (RF-04/HU-08)
    saveDiagnostic(orderId, { notes, laborEstimate, checklist }) {
      const o = this.orderById(orderId)
      if (!o) return
      o.diagnostic = { notes, laborEstimate: Number(laborEstimate) || 0, checklist }
      this._pushStatus(o, 'diagnostico')
      const notif = useNotificationsStore()
      notif.push(o.clientId, `Se registró el diagnóstico de tu orden ${o.id}.`, o.id)
    },

    // RF-05: generar presupuesto (nueva versión) a partir del diagnóstico
    createBudget(orderId, { items, taxRate }) {
      const o = this.orderById(orderId)
      if (!o) return
      const version = o.budgets.length + 1
      o.budgets.push({ version, items, taxRate: Number(taxRate), createdAt: nowStr(), status: 'pendiente', clientComment: '' })
      this._pushStatus(o, 'presupuesto')
    },

    // RF-06: enviar presupuesto al cliente
    sendBudget(orderId) {
      const o = this.orderById(orderId)
      if (!o) return
      this._pushStatus(o, 'espera')
      const notif = useNotificationsStore()
      notif.push(o.clientId, `Tu presupuesto para la orden ${o.id} está listo para revisión.`, o.id)
    },

    // RF-07: cliente aprueba
    approveBudget(orderId) {
      const o = this.orderById(orderId)
      if (!o) return
      const b = this.currentBudget(o)
      if (b) b.status = 'aprobado'
      // RF-32: descuenta del inventario los repuestos utilizados que coincidan por nombre en el inventario
      const inv = useInventoryStore()
      if (b) {
        b.items.forEach(it => {
          const match = inv.parts.find(p => p.name.toLowerCase() === it.label.toLowerCase())
          if (match) inv.deduct(match.id, it.qty, o.id)
        })
      }
      this._pushStatus(o, 'aprobado')
      const notif = useNotificationsStore()
      notif.push('u-admin-1', `El cliente aprobó el presupuesto de la orden ${o.id}.`, o.id)
    },

    // RF-07: cliente rechaza con comentario
    rejectBudget(orderId, comment) {
      const o = this.orderById(orderId)
      if (!o) return
      const b = this.currentBudget(o)
      if (b) { b.status = 'rechazado'; b.clientComment = comment || '' }
      this._pushStatus(o, 'rechazado')
      const notif = useNotificationsStore()
      notif.push('u-admin-1', `El cliente rechazó el presupuesto de la orden ${o.id}${comment ? ': "' + comment + '"' : '.'}`, o.id)
    },

    // RF-08: crear nueva versión de presupuesto tras un rechazo
    reviseBudget(orderId, { items, taxRate }) {
      const o = this.orderById(orderId)
      if (!o) return
      const version = o.budgets.length + 1
      o.budgets.push({ version, items, taxRate: Number(taxRate), createdAt: nowStr(), status: 'pendiente', clientComment: '' })
      this._pushStatus(o, 'presupuesto')
    },

    // RF-13/RF-16: actualizar estado manualmente, con comentario opcional visible para el cliente
    setStatus(orderId, status, comment = '') {
      const o = this.orderById(orderId)
      if (!o) return
      this._pushStatus(o, status, comment)
      const notif = useNotificationsStore()
      notif.push(o.clientId, `Tu orden ${o.id} cambió de estado a "${STATUS_LABEL[status]}".`, o.id)
    },

    // RF-10/RF-11/RF-12: evidencia fotográfica antes/durante/después
    addPhoto(orderId, stage, photo) {
      const o = this.orderById(orderId)
      if (!o) return
      o.photos[stage].push({ ...photo, at: nowStr() })
    },

    // RF-16: asignar / reasignar orden a un mecánico
    assignMechanic(orderId, mechanicId) {
      const o = this.orderById(orderId)
      if (o) o.mechanicId = mechanicId
    },

    // RF-35: calificar servicio (solo una vez, orden entregada)
    rateOrder(orderId, { stars, comment }) {
      const o = this.orderById(orderId)
      if (!o || o.rating) return
      o.rating = { stars, comment }
    },

    _pushStatus(order, status, comment = '') {
      order.status = status
      order.statusHistory.push({ status, at: nowStr(), comment })
    },
  },
})
