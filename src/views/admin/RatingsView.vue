<script setup>
import { computed, ref } from 'vue'
import { useOrdersStore } from '../../stores/orders'
import { useAuthStore } from '../../stores/auth'
import { parseEsDate } from '../../utils/format'

const orders = useOrdersStore()
const auth = useAuthStore()

const rated = computed(() => orders.orders.filter(o => o.rating))
const mechanicFilter = ref('')
const serviceFilter = ref('')
const serviceTypes = computed(() => [...new Set(rated.value.map(o => o.serviceType))])
const filtered = computed(() => rated.value
  .filter(o =>
    (!mechanicFilter.value || o.mechanicId === mechanicFilter.value) &&
    (!serviceFilter.value || o.serviceType === serviceFilter.value)
  )
  .sort((a, b) => {
    const ad = parseEsDate(a.rating?.at || a.statusHistory.at(-1)?.at)?.getTime() || 0
    const bd = parseEsDate(b.rating?.at || b.statusHistory.at(-1)?.at)?.getTime() || 0
    return bd - ad
  })
)

// RF-33: promedio general
const average = computed(() => {
  if (!rated.value.length) return 0
  return (rated.value.reduce((s, o) => s + o.rating.stars, 0) / rated.value.length).toFixed(1)
})
</script>

<template>
  <div class="grid grid-4" style="margin-bottom:16px;">
    <div class="card"><div class="card-body">
      <div class="eyebrow">Calificación promedio</div>
      <div class="stat-value">{{ average }} <span style="font-size:1.2rem;color:var(--yellow);">★</span></div>
      <div class="text-muted" style="font-size:.8rem;margin-top:6px;">sobre {{ rated.length }} calificaciones</div>
    </div></div>
  </div>

  <div class="card">
    <div class="card-body">
      <div class="flex-between" style="margin-bottom:16px;">
        <h4 class="mt-0 mb-0">Calificaciones recibidas</h4>
        <select v-model="mechanicFilter" style="border:1.5px solid var(--border);border-radius:10px;padding:8px 12px;">
          <option value="">Todos los mecánicos</option>
          <option v-for="m in auth.mechanics" :key="m.id" :value="m.id">{{ m.name }}</option>
        </select>
        <select v-model="serviceFilter" style="border:1.5px solid var(--border);border-radius:10px;padding:8px 12px;">
          <option value="">Todos los servicios</option>
          <option v-for="s in serviceTypes" :key="s" :value="s">{{ s }}</option>
        </select>
      </div>
      <table>
        <thead><tr><th>Fecha</th><th>Orden</th><th>Cliente</th><th>Mecánico</th><th>Calificación</th><th>Comentario</th></tr></thead>
        <tbody>
          <tr v-for="o in filtered" :key="o.id">
            <td class="mono">{{ o.rating?.at || o.statusHistory.at(-1)?.at }}</td>
            <td class="mono">{{ o.id }}</td>
            <td>{{ auth.userById(o.clientId)?.name }}</td>
            <td>{{ auth.userById(o.mechanicId)?.name }}</td>
            <td class="mono">{{ '★'.repeat(o.rating.stars) }}{{ '☆'.repeat(5 - o.rating.stars) }}</td>
            <td class="text-muted">{{ o.rating.comment || '—' }}</td>
          </tr>
          <tr v-if="!filtered.length"><td colspan="6" style="text-align:center;color:var(--muted);padding:24px;">Sin calificaciones todavía.</td></tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
