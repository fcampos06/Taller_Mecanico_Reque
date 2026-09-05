<script setup>
import { reactive, ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import { useVehiclesStore } from '../../stores/vehicles'
import { useOrdersStore } from '../../stores/orders'
import { useUiStore } from '../../stores/ui'
import { useNotificationsStore } from '../../stores/notifications'
import BaseModal from '../../components/ui/BaseModal.vue'
import StatusBadge from '../../components/ui/StatusBadge.vue'
import { toRouteId } from '../../utils/format'

const auth = useAuthStore()
const vehiclesStore = useVehiclesStore()
const orders = useOrdersStore()
const ui = useUiStore()
const notif = useNotificationsStore()
const router = useRouter()

const myVehicles = computed(() => vehiclesStore.byOwner(auth.currentUser.id))

// RF-24/HU-47: al detectar un recordatorio pendiente, generar la notificación real
// (una sola vez por vehículo+servicio, para no duplicar avisos en cada visita)
onMounted(() => {
  myVehicles.value.forEach(v => {
    vehiclesStore.remindersFor(v.id).forEach(r => {
      const already = notif.forUser(auth.currentUser.id).some(n => n.text === r.message)
      if (!already) notif.push(auth.currentUser.id, r.message, null)
    })
  })
})

function activeOrderFor(vehicleId) {
  return orders.orders.find(o => o.vehicleId === vehicleId && !['entregado', 'rechazado'].includes(o.status))
}
function reminders(vehicleId) {
  return vehiclesStore.remindersFor(vehicleId)
}

// ---- alta / edición de vehículo (RF-21 / RF-23) ----
const modalOpen = ref(false)
const editingId = ref(null)
const form = reactive({ brand: '', model: '', year: new Date().getFullYear(), plate: '', color: '', km: 0 })
const error = ref('')

function openNew() {
  editingId.value = null
  Object.assign(form, { brand: '', model: '', year: new Date().getFullYear(), plate: '', color: '', km: 0 })
  error.value = ''
  modalOpen.value = true
}
function openEdit(v) {
  editingId.value = v.id
  Object.assign(form, v)
  error.value = ''
  modalOpen.value = true
}
function save() {
  error.value = ''
  if (!form.brand || !form.model || !form.plate) { error.value = 'Marca, modelo y placa son obligatorios.'; return }
  if (editingId.value) {
    vehiclesStore.updateVehicle(editingId.value, { ...form, year: Number(form.year), km: Number(form.km) })
    ui.showToast('Vehículo actualizado ✔')
  } else {
    const res = vehiclesStore.addVehicle(auth.currentUser.id, form)
    if (!res.ok) { error.value = res.message; return }
    ui.showToast('Vehículo registrado ✔')
  }
  modalOpen.value = false
}
function remove(v) {
  if (!confirm(`¿Eliminar ${v.brand} ${v.model} (${v.plate})?`)) return
  const res = vehiclesStore.removeVehicle(v.id)
  if (!res.ok) { ui.showToast(res.message, 'error'); return }
  ui.showToast('Vehículo eliminado')
}
</script>

<template>
  <div class="grid grid-2">
    <div class="card vehicle-card" v-for="v in myVehicles" :key="v.id">
      <div class="card-body">
        <div class="flex-between" style="align-items:flex-start;">
          <div>
            <h4 style="margin:0 0 4px;">{{ v.brand }} {{ v.model }} {{ v.year }}</h4>
            <span class="plate">{{ v.plate }}</span>
          </div>
          <StatusBadge v-if="activeOrderFor(v.id)" :status="activeOrderFor(v.id).status" />
          <span v-else class="badge b-listo">Sin órdenes activas</span>
        </div>

        <div class="vehicle-stats">
          <div><div class="lbl">Kilometraje</div><div class="val">{{ v.km.toLocaleString('es-CR') }} km</div></div>
          <div><div class="lbl">Color</div><div class="val">{{ v.color || '—' }}</div></div>
          <div><div class="lbl">Año</div><div class="val">{{ v.year }}</div></div>
        </div>

        <div v-if="reminders(v.id).length" class="reminder-box">
          <i class="bi bi-bell-fill"></i>
          <div>
            <div v-for="(r, i) in reminders(v.id)" :key="i">{{ r.message }}</div>
          </div>
        </div>

        <div class="flex gap-8" style="margin-top:14px;">
          <button v-if="activeOrderFor(v.id)" class="btn btn-ghost btn-block" @click="router.push('/cliente/orden/' + toRouteId(activeOrderFor(v.id).id))">
            Ver reparación activa <i class="bi bi-arrow-right"></i>
          </button>
          <button class="btn btn-ghost btn-icon" @click="openEdit(v)"><i class="bi bi-pencil"></i></button>
          <button class="btn btn-danger-ghost btn-icon" @click="remove(v)"><i class="bi bi-trash"></i></button>
        </div>
      </div>
    </div>

    <div style="grid-column:1/-1;">
      <button class="btn btn-primary" @click="openNew"><i class="bi bi-plus-lg"></i> Registrar nuevo vehículo</button>
    </div>
  </div>

  <BaseModal v-if="modalOpen" :title="editingId ? 'Editar vehículo' : 'Registrar vehículo'" @close="modalOpen = false">
    <div class="form-stack">
      <div class="grid grid-2">
        <div class="field"><label>Marca</label><input v-model="form.brand" type="text"></div>
        <div class="field"><label>Modelo</label><input v-model="form.model" type="text"></div>
      </div>
      <div class="grid grid-2">
        <div class="field"><label>Año</label><input v-model="form.year" type="number"></div>
        <div class="field"><label>Placa</label><input v-model="form.plate" type="text" placeholder="ABC-123"></div>
      </div>
      <div class="grid grid-2">
        <div class="field"><label>Color</label><input v-model="form.color" type="text"></div>
        <div class="field"><label>Kilometraje actual</label><input v-model="form.km" type="number"></div>
      </div>
      <p v-if="error" style="color:var(--red);font-size:.85rem;">{{ error }}</p>
    </div>
    <template #footer>
      <button class="btn btn-primary btn-block" @click="save">{{ editingId ? 'Guardar cambios' : 'Registrar vehículo' }}</button>
    </template>
  </BaseModal>
</template>

<style scoped>
.vehicle-card{ position:relative; overflow:hidden; }
.vehicle-card::before{ content:""; position:absolute; top:0; left:0; width:6px; height:100%; background:var(--orange); }
.vehicle-stats{ display:grid; grid-template-columns:repeat(3,1fr); gap:8px; margin:18px 0; text-align:center; }
.vehicle-stats .lbl{ font-size:.72rem; color:var(--muted); }
.vehicle-stats .val{ font-weight:600; font-size:.92rem; margin-top:2px; }
.reminder-box{ display:flex; gap:10px; background:#FFF6E8; border:1px solid #F3DDA9; border-radius:10px; padding:10px 12px; font-size:.8rem; color:#8A5A00; margin-bottom:4px; }
.reminder-box i{ color:var(--orange-dark); margin-top:2px; }
</style>
