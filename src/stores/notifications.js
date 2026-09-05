import { defineStore } from 'pinia'
import { seedNotifications } from '../data/seed'

export const useNotificationsStore = defineStore('notifications', {
  state: () => ({
    items: JSON.parse(JSON.stringify(seedNotifications)),
  }),
  getters: {
    forUser: (state) => (userId) => state.items.filter(n => n.userId === userId).sort((a, b) => (a.at < b.at ? 1 : -1)),
    unreadCount: (state) => (userId) => state.items.filter(n => n.userId === userId && !n.read).length,
  },
  actions: {
    push(userId, text, orderId = null) {
      this.items.unshift({ id: 'n-' + Date.now() + Math.random().toString(36).slice(2, 5), userId, text, read: false, at: nowStr(), orderId })
    },
    markRead(id) {
      const n = this.items.find(n => n.id === id)
      if (n) n.read = true
    },
    markAllRead(userId) {
      this.items.filter(n => n.userId === userId).forEach(n => { n.read = true })
    },
  },
})

function nowStr() {
  const d = new Date()
  return d.toLocaleString('es-CR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
}
