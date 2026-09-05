import { defineStore } from 'pinia'
import { seedCatalog } from '../data/seed'

export const useCatalogStore = defineStore('catalog', {
  state: () => ({
    services: JSON.parse(JSON.stringify(seedCatalog)),
  }),
  actions: {
    addService({ name, description, rate }) {
      this.services.push({ id: 'sv-' + Date.now(), name, description, rate: Number(rate) || 0 })
    },
    updateService(id, patch) {
      const s = this.services.find(s => s.id === id)
      if (s) Object.assign(s, patch)
    },
    removeService(id) {
      this.services = this.services.filter(s => s.id !== id)
    },
  },
})
