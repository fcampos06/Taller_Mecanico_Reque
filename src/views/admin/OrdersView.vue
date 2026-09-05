<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useOrdersStore } from '../../stores/orders'
import { useAuthStore } from '../../stores/auth'
import { useVehiclesStore } from '../../stores/vehicles'
import StatusBadge from '../../components/ui/StatusBadge.vue'
import { toRouteId } from '../../utils/format'

const orders = useOrdersStore()
const auth = useAuthStore()
const vehiclesStore = useVehiclesStore()
const router = useRouter()

const search = ref('')
const filteredOrders = computed(() => {
  const q = search.value.trim().toLowerCase()
  const list = [...orders.orders].sort((a, b) => (a.id < b.id ? 1 : -1))
  if (!q) return list
  return list.filter(o => {
    const client = auth.userById(o.clientId)?.name || ''
    const vehicle = vehiclesStore.byId(o.vehicleId)
    return (o.id + client + (vehicle?.plate || '') + (vehicle?.brand || '')).toLowerCase().includes(q)
  })
})

function clientName(id) { return auth.userById(id)?.name || '—' }
function vehicleLabel(id) { const v = vehiclesStore.byId(id); return v || {} }
</script>

<template>
  <div class="card">
    <div class="card-body">
      <div class="flex-between" style="margin-bottom:18px;flex-wrap:wrap;gap:12px;">
        <h4 class="mt-0 mb-0">Órdenes de trabajo</h4>
        <div class="search-box"><i class="bi bi-search"></i><input v-model="search" placeholder="Buscar cliente, placa u orden..."></div>
      </div>
      <table>
        <thead><tr><th>Orden</th><th>Cliente</th><th>Vehículo</th><th>Mecánico</th><th>Estado</th><th class="text-right">Acciones</th></tr></thead>
        <tbody>
          <tr v-for="o in filteredOrders" :key="o.id">
            <td class="mono">{{ o.id }}</td>
            <td>{{ clientName(o.clientId) }}</td>
            <td>{{ vehicleLabel(o.vehicleId).brand }} {{ vehicleLabel(o.vehicleId).model }} <span class="plate">{{ vehicleLabel(o.vehicleId).plate }}</span></td>
            <td>{{ auth.userById(o.mechanicId)?.name || '—' }}</td>
            <td><StatusBadge :status="o.status" /></td>
            <td class="text-right"><button class="btn btn-ghost btn-sm" @click="router.push('/admin/orden/' + toRouteId(o.id))">Abrir</button></td>
          </tr>
          <tr v-if="!filteredOrders.length"><td colspan="6" style="text-align:center;color:var(--muted);padding:26px;">No se encontraron órdenes para "{{ search }}"</td></tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
