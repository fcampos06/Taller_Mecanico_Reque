<script setup>
import { computed, ref, onMounted } from 'vue'
import { useOrdersStore } from '../../stores/orders'
import { useAuthStore } from '../../stores/auth'
import { useCatalogStore } from '../../stores/catalog'
import { parseEsDate } from '../../utils/format'

const orders = useOrdersStore()
const auth = useAuthStore()
const catalog = useCatalogStore()
const mounted = ref(false)
onMounted(() => setTimeout(() => { mounted.value = true }, 150))

// RF-34: indicadores operativos
const activeCount = computed(() => orders.activeCount)
const waitingCount = computed(() => orders.waitingApprovalCount)
const completedCount = computed(() => orders.completedCount)

// RF-34 HU-68: tiempo promedio de reparación por tipo de servicio (entre solicitud y entrega)
const avgTimeByService = computed(() => {
  const groups = {}
  orders.orders.filter(o => o.status === 'entregado').forEach(o => {
    const start = parseEsDate(o.statusHistory[0].at)
    const end = parseEsDate(o.statusHistory[o.statusHistory.length - 1].at)
    if (!start || !end) return
    const hours = Math.max(1, Math.round((end - start) / 36e5))
    if (!groups[o.serviceType]) groups[o.serviceType] = []
    groups[o.serviceType].push(hours)
  })
  return Object.entries(groups).map(([type, arr]) => ({ type, avg: Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) }))
})

// RF-35: carga de trabajo por mecánico
const workload = computed(() => auth.mechanics.map(m => ({ name: m.name, count: orders.workloadByMechanic(m.id) })))
const maxWorkload = computed(() => Math.max(1, ...workload.value.map(w => w.count)))

const revenueWeeks = [60, 75, 50, 85, 95, 70]
</script>

<template>
  <div class="grid grid-4" style="margin-bottom:16px;">
    <div class="card"><div class="card-body">
      <div class="eyebrow">Órdenes activas</div>
      <div class="stat-value">{{ activeCount }}</div>
      <div class="text-muted" style="font-size:.8rem;margin-top:6px;">en proceso dentro del taller</div>
    </div></div>
    <div class="card"><div class="card-body">
      <div class="eyebrow">Esperando aprobación</div>
      <div class="stat-value">{{ waitingCount }}</div>
      <div class="text-muted" style="font-size:.8rem;margin-top:6px;">presupuestos enviados al cliente</div>
    </div></div>
    <div class="card"><div class="card-body">
      <div class="eyebrow">Órdenes finalizadas</div>
      <div class="stat-value">{{ completedCount }}</div>
      <div class="text-muted" style="font-size:.8rem;margin-top:6px;">entregadas al cliente</div>
    </div></div>
    <div class="card"><div class="card-body">
      <div class="eyebrow">Solicitudes por convertir</div>
      <div class="stat-value">{{ orders.pendingRequests.length }}</div>
      <router-link to="/admin/solicitudes" class="text-muted" style="font-size:.8rem;">Ver bandeja <i class="bi bi-arrow-right"></i></router-link>
    </div></div>
  </div>

  <div class="grid grid-7-5">
    <div class="card">
      <div class="card-body">
        <div class="eyebrow" style="margin-bottom:14px;">Ingresos — últimas 6 semanas</div>
        <div class="bars">
          <div class="col" v-for="(w,i) in revenueWeeks" :key="i">
            <div class="stick" :class="{ hi: i >= 4 }" :style="{ height: (mounted ? w : 0) + '%' }"></div>
            <div class="lbl">S{{ i+1 }}</div>
          </div>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-body">
        <div class="eyebrow" style="margin-bottom:14px;">Carga de trabajo por mecánico</div>
        <div v-for="w in workload" :key="w.name" style="margin-bottom:12px;">
          <div class="flex-between" style="font-size:.86rem;margin-bottom:4px;"><span>{{ w.name }}</span><b>{{ w.count }} activas</b></div>
          <div class="bar"><div :style="{ width: (mounted ? (w.count / maxWorkload * 100) : 0) + '%' }"></div></div>
        </div>
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
.bars{ display:flex; align-items:flex-end; gap:14px; height:150px; }
.bars .col{ flex:1; display:flex; flex-direction:column; align-items:center; height:100%; justify-content:flex-end; }
.bars .stick{ width:100%; border-radius:6px 6px 2px 2px; background:var(--border); transition:height 1s cubic-bezier(.2,.8,.2,1); }
.bars .stick.hi{ background:linear-gradient(180deg,var(--orange),var(--orange-dark)); }
.bars .lbl{ font-size:.72rem; color:var(--muted); margin-top:8px; font-weight:600; }
</style>
