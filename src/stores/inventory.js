import { defineStore } from 'pinia'
import { seedInventory, seedMovements } from '../data/seed'

function nowStr() {
  const d = new Date()
  return d.toLocaleString('es-CR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
}

export const useInventoryStore = defineStore('inventory', {
  state: () => ({
    parts: JSON.parse(JSON.stringify(seedInventory)),
    // RF-27/HU-53/HU-50: bitácora de movimientos de inventario (salidas por orden y ajustes manuales)
    movements: JSON.parse(JSON.stringify(seedMovements)),
  }),
  getters: {
    lowStock: (state) => state.parts.filter(p => p.stock <= p.min),
    categories: (state) => [...new Set(state.parts.map(p => p.category))],
    byId: (state) => (id) => state.parts.find(p => p.id === id) || null,
    movementsFor: (state) => (partId) => state.movements.filter(m => m.partId === partId).sort((a, b) => (a.at < b.at ? 1 : -1)),
  },
  actions: {
    // RF-25: registrar repuesto (nombre, cantidad, precio y proveedor)
    addPart({ code, name, category, provider, price, stock, min }) {
      this.parts.push({ id: 'p-' + Date.now(), code, name, category, provider, price: Number(price) || 0, stock: Number(stock) || 0, min: Number(min) || 1 })
    },
    // HU-50: actualizar cantidad manualmente, dejando registro del ajuste
    updatePart(id, patch) {
      const p = this.byId(id)
      if (!p) return
      if (patch.stock !== undefined && Number(patch.stock) !== p.stock) {
        this.movements.unshift({ id: 'mov-' + Date.now(), partId: id, type: 'ajuste', qty: Number(patch.stock) - p.stock, at: nowStr(), orderId: null })
      }
      Object.assign(p, patch)
    },
    // RF-27/HU-53: descontar stock al usarse un repuesto en una orden, registrando el movimiento de salida
    deduct(id, qty, orderId = null) {
      const p = this.byId(id)
      if (!p) return { ok: false, message: 'Repuesto no encontrado.' }
      if (qty > p.stock) return { ok: false, message: `Solo hay ${p.stock} unidades disponibles de "${p.name}".` }
      p.stock -= qty
      this.movements.unshift({ id: 'mov-' + Date.now() + Math.random().toString(36).slice(2, 5), partId: id, type: 'salida', qty: -qty, at: nowStr(), orderId })
      return { ok: true }
    },
  },
})
