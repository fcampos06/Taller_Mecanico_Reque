<script setup>
import { ref, computed } from 'vue'
import { useOrdersStore } from '../../stores/orders'
import { useInventoryStore } from '../../stores/inventory'
import { formatCRC, parseEsDate } from '../../utils/format'

const orders = useOrdersStore()
const inventory = useInventoryStore()

const from = ref('2026-07-01')
const to = ref('2026-08-31')

// RF-36: reporte financiero por periodo, desglosado en repuestos y mano de obra.
const periodOrders = computed(() => {
  const f = new Date(from.value), t = new Date(to.value)
  return orders.orders.filter(o => {
    if (o.status !== 'entregado' && o.status !== 'aprobado' && o.status !== 'proceso' && o.status !== 'listo') return false
    const approvedBudget = o.budgets.find(b => b.status === 'aprobado')
    if (!approvedBudget) return false
    const d = parseEsDate(approvedBudget.createdAt)
    return d && d >= f && d <= t
  })
})

const partsRevenue = computed(() => periodOrders.value.reduce((sum, o) => {
  const b = o.budgets.find(x => x.status === 'aprobado')
  const parts = b.items.filter(i => !/mano de obra/i.test(i.label))
  return sum + parts.reduce((s, i) => s + i.qty * i.price, 0)
}, 0))

const laborRevenue = computed(() => periodOrders.value.reduce((sum, o) => {
  const b = o.budgets.find(x => x.status === 'aprobado')
  const labor = b.items.filter(i => /mano de obra/i.test(i.label))
  return sum + labor.reduce((s, i) => s + i.qty * i.price, 0)
}, 0))

const total = computed(() => partsRevenue.value + laborRevenue.value)
</script>

<template>
  <div class="card" style="margin-bottom:16px;">
    <div class="card-body">
      <div class="eyebrow" style="margin-bottom:12px;">Periodo del reporte</div>
      <div class="flex gap-12" style="align-items:flex-end;flex-wrap:wrap;">
        <div class="field" style="margin-bottom:0;"><label>Desde</label><input type="date" v-model="from"></div>
        <div class="field" style="margin-bottom:0;"><label>Hasta</label><input type="date" v-model="to"></div>
      </div>
    </div>
  </div>

  <div class="grid grid-3" style="margin-bottom:16px;">
    <div class="card"><div class="card-body">
      <div class="eyebrow">Ingresos por repuestos</div>
      <div class="stat-value">{{ formatCRC(partsRevenue) }}</div>
    </div></div>
    <div class="card"><div class="card-body">
      <div class="eyebrow">Ingresos por mano de obra</div>
      <div class="stat-value">{{ formatCRC(laborRevenue) }}</div>
    </div></div>
    <div class="card" style="background:var(--asphalt);border-color:var(--asphalt);"><div class="card-body">
      <div class="eyebrow" style="color:#9AA2AA;">Total del periodo</div>
      <div class="stat-value" style="color:#fff;">{{ formatCRC(total) }}</div>
    </div></div>
  </div>

  <div class="card">
    <div class="card-body">
      <div class="eyebrow" style="margin-bottom:10px;">Órdenes incluidas en el periodo</div>
      <table>
        <thead><tr><th>Orden</th><th>Repuestos</th><th>Mano de obra</th><th class="text-right">Total</th></tr></thead>
        <tbody>
          <tr v-for="o in periodOrders" :key="o.id">
            <td class="mono">{{ o.id }}</td>
            <td class="mono">{{ formatCRC(o.budgets.find(b=>b.status==='aprobado').items.filter(i=>!/mano de obra/i.test(i.label)).reduce((s,i)=>s+i.qty*i.price,0)) }}</td>
            <td class="mono">{{ formatCRC(o.budgets.find(b=>b.status==='aprobado').items.filter(i=>/mano de obra/i.test(i.label)).reduce((s,i)=>s+i.qty*i.price,0)) }}</td>
            <td class="mono text-right">{{ formatCRC(o.budgets.find(b=>b.status==='aprobado').items.reduce((s,i)=>s+i.qty*i.price,0)) }}</td>
          </tr>
          <tr v-if="!periodOrders.length"><td colspan="4" style="text-align:center;color:var(--muted);padding:24px;">No hay órdenes con presupuesto aprobado en este periodo.</td></tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
