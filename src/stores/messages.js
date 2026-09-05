import { defineStore } from 'pinia'
import { seedMessages } from '../data/seed'
import { useNotificationsStore } from './notifications'
import { useOrdersStore } from './orders'

export const useMessagesStore = defineStore('messages', {
  state: () => ({
    byOrder: JSON.parse(JSON.stringify(seedMessages)),
  }),
  getters: {
    forOrder: (state) => (orderId) => state.byOrder[orderId] || [],
  },
  actions: {
    // RF-29/RF-30: enviar mensaje y notificar a la otra parte (cliente <-> taller)
    send(orderId, { from, authorName, text }) {
      if (!this.byOrder[orderId]) this.byOrder[orderId] = []
      this.byOrder[orderId].push({ from, authorName, text, at: nowStr() })

      const notif = useNotificationsStore()
      const order = useOrdersStore().orderById(orderId)
      if (!order) return
      if (from === 'cliente') {
        notif.push('u-admin-1', `${authorName} te escribió sobre la orden ${orderId}.`, orderId)
      } else {
        notif.push(order.clientId, `El taller te respondió en tu orden ${orderId}.`, orderId)
      }
    },
  },
})

function nowStr() {
  const d = new Date()
  return d.toLocaleString('es-CR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
}
