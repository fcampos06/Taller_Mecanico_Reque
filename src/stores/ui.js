import { defineStore } from 'pinia'

let nextId = 1

export const useUiStore = defineStore('ui', {
  state: () => ({
    toasts: [],
    mobileNavOpen: false,
    lightboxUrl: null, // RF-14/HU-28: foto ampliada actualmente en pantalla completa
  }),
  actions: {
    openLightbox(url) { this.lightboxUrl = url },
    closeLightbox() { this.lightboxUrl = null },
    showToast(message, tone = 'ok') {
      const id = nextId++
      this.toasts.push({ id, message, tone })
      setTimeout(() => this.dismissToast(id), 3400)
    },
    dismissToast(id) {
      this.toasts = this.toasts.filter(t => t.id !== id)
    },
  },
})
