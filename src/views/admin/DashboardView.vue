<script setup>
import { computed, ref, onMounted } from 'vue'
import { useOrdersStore } from '../../stores/orders'
import { useAuthStore } from '../../stores/auth'
import { parseEsDate, formatCRC } from '../../utils/format'

const orders = useOrdersStore()
const auth = useAuthStore()
const mounted = ref(false)
onMounted(() => setTimeout(() => { mounted.value = true }, 120))

// RF-34: indicadores operativos calculados desde las órdenes actuales.
const activeCount = computed(() => orders.activeCount)
const waitingCount = computed(() => orders.waitingApprovalCount)
const completedCount = computed(() => orders.completedCount)

// RF-33/HU-66: el promedio general también debe ser visible en el dashboard.
const averageRating = computed(() => {
  const rated = orders.orders.filter(o => o.rating)
  if (!rated.length) return '0.0'
  return (rated.reduce((sum, o) => sum + o.rating.stars, 0) / rated.length).toFixed(1)
})
const ratingCount = computed(() => orders.orders.filter(o => o.rating).length)

// RF-34/HU-68: tiempo promedio desde ingreso hasta entrega por tipo de servicio.
const avgTimeByService = computed(() => {
  const groups = {}
  orders.orders.filter(o => o.status === 'entregado').forEach(o => {
    const start = parseEsDate(o.statusHistory[0]?.at)
    const end = parseEsDate(o.statusHistory.at(-1)?.at)
    if (!start || !end) return
    const hours = Math.max(1, Math.round((end - start) / 36e5))
    if (!groups[o.serviceType]) groups[o.serviceType] = []
    groups[o.serviceType].push(hours)
  })
  return Object.entries(groups).map(([type, arr]) => ({
    type,
    avg: Math.round(arr.reduce((a, b) => a + b, 0) / arr.length),
  }))
})

// RF-35: únicamente mecánicos activos para nuevas decisiones de carga.
const workload = computed(() => auth.activeMechanics.map(m => ({
  name: m.name,
  count: orders.workloadByMechanic(m.id),
})))
const maxWorkload = computed(() => Math.max(1, ...workload.value.map(w => w.count)))

function approvedBudget(order) {
  return [...order.budgets].reverse().find(b => b.status === 'aprobado') || null
}
function budgetRevenue(order) {
  const b = approvedBudget(order)
  return b ? b.items.reduce((sum, item) => sum + Number(item.qty || 0) * Number(item.price || 0), 0) : 0
}
function shortDate(date) {
  return date.toLocaleDateString('es-CR', { day: '2-digit', month: 'short' })
}

// Dashboard financiero real: reemplaza los porcentajes fijos por datos de los presupuestos aprobados.
// Para que el prototipo sembrado siga siendo demostrable, las 6 semanas terminan en la fecha
// más reciente presente en los datos, no en una semana futura sin movimientos.
const revenueWeeks = computed(() => {
  const rows = orders.orders
    .map(order => ({ order, budget: approvedBudget(order) }))
    .filter(x => x.budget)
    .map(x => ({ ...x, date: parseEsDate(x.budget.createdAt) }))
    .filter(x => x.date)

  const latest = rows.length
    ? new Date(Math.max(...rows.map(x => x.date.getTime())))
    : new Date()
  latest.setHours(23, 59, 59, 999)

  const buckets = []
  for (let i = 5; i >= 0; i--) {
    const end = new Date(latest)
    end.setDate(end.getDate() - i * 7)
    const start = new Date(end)
    start.setDate(start.getDate() - 6)
    start.setHours(0, 0, 0, 0)
    const amount = rows
      .filter(x => x.date >= start && x.date <= end)
      .reduce((sum, x) => sum + budgetRevenue(x.order), 0)
    buckets.push({ label: `${shortDate(start)}–${shortDate(end)}`, amount })
  }
  return buckets
})
const maxRevenue = computed(() => Math.max(1, ...revenueWeeks.value.map(w => w.amount)))
</script>

<template>
  <div class="kpi-grid" style="margin-bottom:16px;">
    <div class="card"><div class="card-body">
      <div class="eyebrow">Órdenes activas</div>
      <div class="stat-value">{{ activeCount }}</div>
      <div class="text-muted kpi-note">en proceso dentro del taller</div>
    </div></div>
    <div class="card"><div class="card-body">
      <div class="eyebrow">Esperando aprobación</div>
      <div class="stat-value">{{ waitingCount }}</div>
      <div class="text-muted kpi-note">presupuestos enviados al cliente</div>
    </div></div>
    <div class="card"><div class="card-body">
      <div class="eyebrow">Órdenes finalizadas</div>
      <div class="stat-value">{{ completedCount }}</div>
      <div class="text-muted kpi-note">entregadas al cliente</div>
    </div></div>
    <div class="card"><div class="card-body">
      <div class="eyebrow">Solicitudes por convertir</div>
      <div class="stat-value">{{ orders.pendingRequests.length }}</div>
      <router-link to="/admin/solicitudes" class="text-muted kpi-note">Ver bandeja <i class="bi bi-arrow-right"></i></router-link>
    </div></div>
    <div class="card"><div class="card-body">
      <div class="eyebrow">Calificación promedio</div>
      <div class="stat-value">{{ averageRating }} <span class="star">★</span></div>
      <router-link to="/admin/calificaciones" class="text-muted kpi-note">{{ ratingCount }} calificaciones registradas</router-link>
    </div></div>
  </div>

  <div class="grid grid-7-5">
    <div class="card">
      <div class="card-body">
        <div class="eyebrow" style="margin-bottom:14px;">Ingresos — últimas 6 semanas con datos</div>
        <div class="bars">
          <div class="col" v-for="w in revenueWeeks" :key="w.label" :title="`${w.label}: ${formatCRC(w.amount)}`">
            <div class="amount">{{ w.amount ? formatCRC(w.amount) : '₡0' }}</div>
            <div class="stick" :style="{ height: (mounted ? (w.amount / maxRevenue * 100) : 0) + '%' }"></div>
            <div class="lbl">{{ w.label }}</div>
          </div>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-body">
        <div class="eyebrow" style="margin-bottom:14px;">Carga de trabajo por mecánico activo</div>
        <div v-for="w in workload" :key="w.name" style="margin-bottom:12px;">
          <div class="flex-between" style="font-size:.86rem;margin-bottom:4px;"><span>{{ w.name }}</span><b>{{ w.count }} activas</b></div>
          <div class="bar"><div :style="{ width: (mounted ? (w.count / maxWorkload * 100) : 0) + '%' }"></div></div>
        </div>
        <p v-if="!workload.length" class="text-muted" style="font-size:.84rem;">No hay mecánicos activos registrados.</p>
      </div>
    </div>
  </div>

  <div class="card" style="margin-top:16px;" v-if="avgTimeByService.length">
    <div class="card-body">
      <div class="eyebrow" style="margin-bottom:10px;">Tiempo promedio de reparación por tipo de servicio</div>
      <table>
        <thead><tr><th>Servicio</th><th class="text-right">Tiempo promedio</th></tr></thead>
        <tbody>
          <tr v-for="t in avgTimeByService" :key="t.type"><td>{{ t.type }}</td><td class="mono text-right">{{ t.avg }} h</td></tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.kpi-grid{ display:grid; grid-template-columns:repeat(auto-fit,minmax(190px,1fr)); gap:16px; }
.kpi-note{ font-size:.8rem; margin-top:6px; display:block; }
.star{ font-size:1.2rem; color:var(--yellow); }
.bars{ display:flex; align-items:flex-end; gap:10px; height:190px; }
.bars .col{ flex:1; min-width:0; display:flex; flex-direction:column; align-items:center; height:100%; justify-content:flex-end; }
.bars .stick{ width:100%; min-height:2px; border-radius:6px 6px 2px 2px; background:linear-gradient(180deg,var(--orange),var(--orange-dark)); transition:height .8s cubic-bezier(.2,.8,.2,1); }
.bars .lbl{ font-size:.62rem; color:var(--muted); margin-top:8px; font-weight:600; text-align:center; }
.bars .amount{ font-size:.62rem; color:var(--muted); margin-bottom:4px; white-space:nowrap; }
</style>
