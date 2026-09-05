<script setup>
import { computed, ref } from 'vue'
import { useAuthStore } from '../../stores/auth'
import { useVehiclesStore } from '../../stores/vehicles'
import { useOrdersStore, STATUS_LABEL } from '../../stores/orders'
import { useRouter } from 'vue-router'
import StatusBadge from '../../components/ui/StatusBadge.vue'
import { toRouteId } from '../../utils/format'

const auth = useAuthStore()
const vehiclesStore = useVehiclesStore()
const ordersStore = useOrdersStore()
const router = useRouter()

const myVehicles = computed(() => vehiclesStore.byOwner(auth.currentUser.id))
const selectedVehicle = ref(myVehicles.value[0]?.id || '')

const vehicleOrders = computed(() =>
  ordersStore.ordersForClient(auth.currentUser.id)
    .filter(o => o.vehicleId === selectedVehicle.value)
    .sort((a, b) => (a.statusHistory[0].at < b.statusHistory[0].at ? 1 : -1))
)
</script>

<template>
  <div class="card">
    <div class="card-body">
      <div class="flex-between" style="margin-bottom:18px;flex-wrap:wrap;gap:10px;">
        <h4 class="mt-0 mb-0">Historial de mantenimiento</h4>
        <select v-model="selectedVehicle" style="max-width:280px;border:1.5px solid var(--border);border-radius:10px;padding:9px 12px;">
          <option v-for="v in myVehicles" :key="v.id" :value="v.id">{{ v.brand }} {{ v.model }} — {{ v.plate }}</option>
        </select>
      </div>
      <table>
        <thead><tr><th>Orden</th><th>Fecha</th><th>Servicio</th><th>Estado final</th><th></th></tr></thead>
        <tbody>
          <tr v-for="o in vehicleOrders" :key="o.id">
            <td class="mono">{{ o.id }}</td>
            <td>{{ o.statusHistory[0].at }}</td>
            <td>{{ o.serviceType }}</td>
            <td><StatusBadge :status="o.status" /></td>
            <td class="text-right"><button class="btn btn-ghost btn-sm" @click="router.push('/cliente/orden/' + toRouteId(o.id))">Ver detalle</button></td>
          </tr>
          <tr v-if="!vehicleOrders.length"><td colspan="5" class="text-center text-muted" style="text-align:center;padding:24px;">Este vehículo aún no tiene órdenes registradas.</td></tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
