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
    // RF-29/RF-30: texto + imágenes dentro de la conversación de una orden.
    send(orderId, { from, authorName, text = '', attachments = [] }) {
      const cleanText = String(text || '').trim()
      const cleanAttachments = (attachments || []).map(a => ({ name: a.name, url: a.url }))
      if (!cleanText && !cleanAttachments.length) return { ok: false }

      if (!this.byOrder[orderId]) this.byOrder[orderId] = []
      this.byOrder[orderId].push({
        from,
        authorName,
        text: cleanText,
        attachments: cleanAttachments,
        at: nowStr(),
      })

      const notif = useNotificationsStore()
      const order = useOrdersStore().orderById(orderId)
      if (!order) return { ok: true }
      if (from === 'cliente') {
        notif.push('u-admin-1', `${authorName} te escribió sobre la orden ${orderId}.`, orderId)
      } else {
        notif.push(order.clientId, `${authorName || 'El taller'} te respondió en tu orden ${orderId}.`, orderId)
      }
      return { ok: true }
    },
  },
})

function nowStr() {
  const d = new Date()
  return d.toLocaleString('es-CR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
}
