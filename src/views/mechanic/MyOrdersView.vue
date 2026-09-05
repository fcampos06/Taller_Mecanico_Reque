<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import { useOrdersStore } from '../../stores/orders'
import { useVehiclesStore } from '../../stores/vehicles'
import StatusBadge from '../../components/ui/StatusBadge.vue'
import { toRouteId } from '../../utils/format'

const auth = useAuthStore()
const orders = useOrdersStore()
const vehiclesStore = useVehiclesStore()
const router = useRouter()

// RF-18/HU-36: el mecánico solo ve sus órdenes asignadas, activas primero
const myOrders = computed(() =>
  orders.ordersForMechanic(auth.currentUser.id)
    .filter(o => !['entregado', 'rechazado'].includes(o.status))
    .sort((a, b) => (a.id < b.id ? 1 : -1))
)
</script>

<template>
  <div class="card">
    <div class="card-body">
      <h4 class="mt-0" style="margin-bottom:16px;">Órdenes asignadas ({{ myOrders.length }})</h4>
      <table>
        <thead><tr><th>Orden</th><th>Vehículo</th><th>Servicio</th><th>Estado</th><th class="text-right">Acción</th></tr></thead>
        <tbody>
          <tr v-for="o in myOrders" :key="o.id">
            <td class="mono">{{ o.id }}</td>
            <td>{{ vehiclesStore.byId(o.vehicleId)?.brand }} {{ vehiclesStore.byId(o.vehicleId)?.model }} <span class="plate">{{ vehiclesStore.byId(o.vehicleId)?.plate }}</span></td>
            <td>{{ o.serviceType }}</td>
            <td><StatusBadge :status="o.status" /></td>
            <td class="text-right"><button class="btn btn-primary btn-sm" @click="router.push('/mecanico/orden/' + toRouteId(o.id))">
              {{ o.diagnostic ? 'Continuar' : 'Diagnosticar' }}
            </button></td>
          </tr>
          <tr v-if="!myOrders.length"><td colspan="5" style="text-align:center;color:var(--muted);padding:26px;">No tenés órdenes activas asignadas.</td></tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
