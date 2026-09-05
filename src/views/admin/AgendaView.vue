<script setup>
import { ref, computed } from 'vue'
import { useAppointmentsStore, weekLabelsFor } from '../../stores/appointments'
import { useAuthStore } from '../../stores/auth'
import { useVehiclesStore } from '../../stores/vehicles'
import { useOrdersStore, STATUS_LABEL } from '../../stores/orders'

const apptStore = useAppointmentsStore()
const auth = useAuthStore()
const vehiclesStore = useVehiclesStore()
const ordersStore = useOrdersStore()

// RF-10: filtrar por mecánico y por estado de la orden asociada a la cita
const mechanicFilter = ref('')
const statusFilter = ref('')
function orderStatusFor(appt) {
  if (!appt.requestId) return null
  const order = ordersStore.orders.find(o => o.requestId === appt.requestId)
  return order ? order.status : null
}
// RF-10/HU-19: navegar entre semanas
const weekOffset = ref(0)
const weekLabel = computed(() => weekOffset.value === 0 ? 'Semana actual' : (weekOffset.value > 0 ? `${weekOffset.value} semana(s) adelante` : `${Math.abs(weekOffset.value)} semana(s) atrás`))
const currentWeekDays = computed(() => weekLabelsFor(weekOffset.value))

const byDay = computed(() => {
  const map = apptStore.byDayForOffset(weekOffset.value)
  const filtered = {}
  Object.entries(map).forEach(([day, list]) => {
    filtered[day] = list.filter(a => {
      const matchMech = !mechanicFilter.value || a.mechanicId === mechanicFilter.value
      const matchStatus = !statusFilter.value || orderStatusFor(a) === statusFilter.value
      return matchMech && matchStatus
    })
  })
  return filtered
})

function clientName(id) { return auth.userById(id)?.name || '—' }
function vehicleLabel(id) { const v = vehiclesStore.byId(id); return v ? `${v.brand} ${v.model}` : '—' }
function mechanicName(id) { return auth.userById(id)?.name || '—' }
</script>

<template>
  <div class="card">
    <div class="card-body">
      <div class="flex-between" style="margin-bottom:18px;flex-wrap:wrap;gap:10px;">
        <div class="flex gap-8" style="align-items:center;">
          <button class="btn btn-ghost btn-icon" @click="weekOffset--"><i class="bi bi-chevron-left"></i></button>
          <h4 class="mt-0 mb-0" style="min-width:180px;">{{ weekLabel }}</h4>
          <button class="btn btn-ghost btn-icon" @click="weekOffset++"><i class="bi bi-chevron-right"></i></button>
          <button v-if="weekOffset !== 0" class="btn btn-ghost btn-sm" @click="weekOffset = 0">Hoy</button>
        </div>
        <select v-model="mechanicFilter" style="border:1.5px solid var(--border);border-radius:10px;padding:8px 12px;">
          <option value="">Todos los mecánicos</option>
          <option v-for="m in auth.mechanics" :key="m.id" :value="m.id">{{ m.name }}</option>
        </select>
        <select v-model="statusFilter" style="border:1.5px solid var(--border);border-radius:10px;padding:8px 12px;">
          <option value="">Cualquier estado de orden</option>
          <option v-for="(label, key) in STATUS_LABEL" :key="key" :value="key">{{ label }}</option>
        </select>
      </div>
      <div class="agenda-grid">
        <div v-for="d in currentWeekDays" :key="d">
          <div class="agenda-day-title">{{ d }}</div>
          <div v-if="!byDay[d].length" class="empty-day">Sin citas</div>
          <div class="appt" v-for="a in byDay[d]" :key="a.id">
            <b class="mono">{{ a.time }}</b>
            <div>{{ clientName(a.clientId) }}</div>
            <div class="veh">{{ vehicleLabel(a.vehicleId) }}</div>
            <div class="veh" style="margin-top:4px;"><i class="bi bi-person-badge"></i> {{ mechanicName(a.mechanicId) }}</div>
          </div>
        </div>
      </div>
      <p v-if="weekOffset !== 0" class="field-hint" style="margin-top:14px;">
        Este prototipo solo tiene datos sembrados para la semana actual — las demás semanas se muestran vacías a modo de demostración de la navegación.
      </p>
    </div>
  </div>
</template>

<style scoped>
.agenda-grid{ display:grid; grid-template-columns:repeat(5,1fr); gap:14px; }
@media (max-width:900px){ .agenda-grid{ grid-template-columns:repeat(2,1fr); } }
.agenda-day-title{ text-align:center; font-weight:700; font-size:.78rem; color:var(--muted); margin-bottom:10px; letter-spacing:.04em; }
.appt{ background:var(--card); border:1px solid var(--border); border-left:4px solid var(--orange); border-radius:10px; padding:10px 12px; margin-bottom:8px; font-size:.82rem; }
.appt .veh{ color:var(--muted); }
.empty-day{ text-align:center; color:var(--muted); font-size:.8rem; padding-top:28px; }
</style>
