<script setup>
import { ref, computed } from 'vue'
import { useOrdersStore } from '../../stores/orders'
import { useInventoryStore } from '../../stores/inventory'
import { formatCRC, parseEsDate } from '../../utils/format'

const orders = useOrdersStore()
const inventory = useInventoryStore()

const from = ref('2026-07-01')
const to = ref('2026-08-31')

function approvedBudget(order) {
  return [...order.budgets].reverse().find(b => b.status === 'aprobado') || null
}

function itemKind(item) {
  if (item.kind) return item.kind
  if (/mano de obra/i.test(item.label)) return 'labor'
  if (inventory.parts.some(p => p.id === item.partId || p.name.toLowerCase() === String(item.label).toLowerCase())) return 'part'
  return 'service'
}

function amountByKind(order, kind) {
  const budget = approvedBudget(order)
  if (!budget) return 0
  return budget.items
    .filter(item => itemKind(item) === kind)
    .reduce((sum, item) => sum + Number(item.qty || 0) * Number(item.price || 0), 0)
}

// RF-36: reporte financiero por periodo con servicios, repuestos y mano de obra.
const invalidRange = computed(() => Boolean(from.value && to.value && from.value > to.value))
const periodOrders = computed(() => {
  if (invalidRange.value) return []
  const start = new Date(`${from.value}T00:00:00`)
  const end = new Date(`${to.value}T23:59:59`)
  return orders.orders.filter(order => {
    const budget = approvedBudget(order)
    if (!budget) return false
    const date = parseEsDate(budget.createdAt)
    return date && date >= start && date <= end
  })
})

const partsRevenue = computed(() => periodOrders.value.reduce((sum, order) => sum + amountByKind(order, 'part'), 0))
const laborRevenue = computed(() => periodOrders.value.reduce((sum, order) => sum + amountByKind(order, 'labor'), 0))
const serviceRevenue = computed(() => periodOrders.value.reduce((sum, order) => sum + amountByKind(order, 'service'), 0))
const total = computed(() => partsRevenue.value + laborRevenue.value + serviceRevenue.value)
</script>

<template>
  <div class="card" style="margin-bottom:16px;">
    <div class="card-body">
      <div class="eyebrow" style="margin-bottom:12px;">Periodo del reporte</div>
      <div class="flex gap-12" style="align-items:flex-end;flex-wrap:wrap;">
        <div class="field" style="margin-bottom:0;"><label>Desde</label><input type="date" v-model="from"></div>
        <div class="field" style="margin-bottom:0;"><label>Hasta</label><input type="date" v-model="to"></div>
      </div>
      <p v-if="invalidRange" style="color:var(--red);font-size:.84rem;margin:10px 0 0;">La fecha inicial no puede ser posterior a la fecha final.</p>
    </div>
  </div>

  <div class="report-grid" style="margin-bottom:16px;">
    <div class="card"><div class="card-body">
      <div class="eyebrow">Ingresos por servicios</div>
      <div class="stat-value">{{ formatCRC(serviceRevenue) }}</div>
    </div></div>
    <div class="card"><div class="card-body">
      <div class="eyebrow">Ingresos por repuestos</div>
      <div class="stat-value">{{ formatCRC(partsRevenue) }}</div>
    </div></div>
    <div class="card"><div class="card-body">
      <div class="eyebrow">Ingresos por mano de obra</div>
      <div class="stat-value">{{ formatCRC(laborRevenue) }}</div>
    </div></div>
    <div class="card total-card"><div class="card-body">
      <div class="eyebrow" style="color:#9AA2AA;">Total del periodo</div>
      <div class="stat-value" style="color:#fff;">{{ formatCRC(total) }}</div>
    </div></div>
  </div>

  <div class="card">
    <div class="card-body">
      <div class="eyebrow" style="margin-bottom:10px;">Órdenes incluidas en el periodo</div>
      <table>
        <thead><tr><th>Orden</th><th>Servicios</th><th>Repuestos</th><th>Mano de obra</th><th class="text-right">Total</th></tr></thead>
        <tbody>
          <tr v-for="o in periodOrders" :key="o.id">
            <td class="mono">{{ o.id }}</td>
            <td class="mono">{{ formatCRC(amountByKind(o, 'service')) }}</td>
            <td class="mono">{{ formatCRC(amountByKind(o, 'part')) }}</td>
            <td class="mono">{{ formatCRC(amountByKind(o, 'labor')) }}</td>
            <td class="mono text-right">{{ formatCRC(amountByKind(o, 'service') + amountByKind(o, 'part') + amountByKind(o, 'labor')) }}</td>
          </tr>
          <tr v-if="!periodOrders.length"><td colspan="5" style="text-align:center;color:var(--muted);padding:24px;">No hay órdenes con presupuesto aprobado en este periodo.</td></tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.report-grid{ display:grid; grid-template-columns:repeat(auto-fit,minmax(200px,1fr)); gap:16px; }
.total-card{ background:var(--asphalt); border-color:var(--asphalt); }
</style>
