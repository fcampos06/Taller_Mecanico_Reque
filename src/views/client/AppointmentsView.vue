<script setup>
import { reactive, ref, computed } from 'vue'
import { useAuthStore } from '../../stores/auth'
import { useVehiclesStore } from '../../stores/vehicles'
import { useAppointmentsStore, WEEK_DAYS } from '../../stores/appointments'
import { useOrdersStore } from '../../stores/orders'
import { useUiStore } from '../../stores/ui'
import BaseModal from '../../components/ui/BaseModal.vue'

const auth = useAuthStore()
const vehiclesStore = useVehiclesStore()
const appt = useAppointmentsStore()
const orders = useOrdersStore()
const ui = useUiStore()

const myVehicles = computed(() => vehiclesStore.byOwner(auth.currentUser.id))
const myAppointments = computed(() =>
  appt.forClient(auth.currentUser.id).map(a => ({ ...a, vehicle: vehiclesStore.byId(a.vehicleId) }))
)

// ---- agendar nueva cita (RF-09) ----
const modalOpen = ref(false)
const editingId = ref(null)
const form = reactive({ vehicleId: myVehicles.value[0]?.id || '', day: WEEK_DAYS[0], time: '', requestId: null, reason: '' })
const mySolicitudes = computed(() => orders.requests.filter(r => r.clientId === auth.currentUser.id && r.status === 'pendiente'))
const availableSlots = computed(() => appt.availableSlots(form.day))

function openNew() {
  editingId.value = null
  Object.assign(form, { vehicleId: myVehicles.value[0]?.id || '', day: WEEK_DAYS[0], time: '', requestId: null, reason: '' })
  modalOpen.value = true
}
function openReschedule(a) {
  editingId.value = a.id
  Object.assign(form, { vehicleId: a.vehicleId, day: a.day, time: '', requestId: a.requestId, reason: a.reason || '' })
  modalOpen.value = true
}
function save() {
  if (!form.time) { ui.showToast('Elegí un horario disponible.', 'error'); return }
  if (!editingId.value && !form.requestId && !form.reason.trim()) { ui.showToast('Indicá el motivo de la cita o asociá una solicitud.', 'error'); return }
  if (editingId.value) {
    appt.reschedule(editingId.value, { day: form.day, time: form.time })
    ui.showToast('Cita reprogramada ✔')
  } else {
    // asignación simple: se reparte entre los dos mecánicos según menor carga
    const mechanics = auth.activeMechanics
    if (!mechanics.length) { ui.showToast('No hay mecánicos activos disponibles.', 'error'); return }
    const mech = mechanics.reduce((a, b) => (orders.workloadByMechanic(a.id) <= orders.workloadByMechanic(b.id) ? a : b))
    appt.book({ clientId: auth.currentUser.id, vehicleId: form.vehicleId, day: form.day, time: form.time, mechanicId: mech.id, requestId: form.requestId, reason: form.reason })
    ui.showToast('Cita agendada ✔')
  }
  modalOpen.value = false
}
function cancel(a) {
  if (!confirm('¿Cancelar esta cita?')) return
  const reason = window.prompt('Motivo de cancelación (opcional):', '') ?? ''
  appt.cancel(a.id, reason)
  ui.showToast('Cita cancelada')
}

</script>

<template>
  <div class="grid grid-2">
    <div class="card" v-for="a in myAppointments" :key="a.id">
      <div class="card-body">
        <div class="flex-between">
          <div>
            <div class="eyebrow">{{ a.day }} · {{ a.time }}</div>
            <h4 style="margin:4px 0 0;">{{ a.vehicle?.brand }} {{ a.vehicle?.model }}</h4>
            <span class="plate">{{ a.vehicle?.plate }}</span>
          </div>
          <span class="badge" :class="a.status === 'cancelada' ? 'b-rechazado' : 'b-proceso'">{{ a.status === 'cancelada' ? 'Cancelada' : 'Confirmada' }}</span>
        </div>
        <p v-if="a.reason" class="text-muted" style="font-size:.84rem;margin-top:12px;"><b>Motivo:</b> {{ a.reason }}</p>
        <p v-if="a.status === 'cancelada' && a.cancelReason" class="text-muted" style="font-size:.84rem;margin-top:6px;"><b>Motivo de cancelación:</b> {{ a.cancelReason }}</p>
        <div v-if="a.status !== 'cancelada'" class="flex gap-8" style="margin-top:16px;">
          <button class="btn btn-ghost btn-sm" @click="openReschedule(a)"><i class="bi bi-calendar2-week"></i> Reprogramar</button>
          <button class="btn btn-danger-ghost btn-sm" @click="cancel(a)"><i class="bi bi-x-circle"></i> Cancelar</button>
        </div>
      </div>
    </div>
    <div v-if="!myAppointments.length" class="card"><div class="card-body text-muted">No tenés citas agendadas por el momento.</div></div>

    <div style="grid-column:1/-1;">
      <button class="btn btn-primary" @click="openNew"><i class="bi bi-plus-lg"></i> Agendar nueva cita</button>
    </div>
  </div>

  <BaseModal v-if="modalOpen" :title="editingId ? 'Reprogramar cita' : 'Agendar cita'" @close="modalOpen = false">
    <div class="form-stack">
      <div class="field" v-if="!editingId">
        <label>Vehículo</label>
        <select v-model="form.vehicleId">
          <option v-for="v in myVehicles" :key="v.id" :value="v.id">{{ v.brand }} {{ v.model }} — {{ v.plate }}</option>
        </select>
      </div>
      <div class="field" v-if="!editingId && mySolicitudes.length">
        <label>Asociar a una solicitud existente (opcional)</label>
        <select v-model="form.requestId">
          <option :value="null">— Sin asociar —</option>
          <option v-for="r in mySolicitudes" :key="r.id" :value="r.id">{{ r.id }} — {{ r.serviceType }}</option>
        </select>
      </div>
      <div class="field" v-if="!editingId">
        <label>Motivo de la cita {{ form.requestId ? '(opcional si ya asociás una solicitud)' : '' }}</label>
        <input v-model="form.reason" type="text" placeholder="Ej. cambio de aceite, revisión de frenos...">
      </div>
      <div class="field">
        <label>Día</label>
        <select v-model="form.day" @change="form.time = ''">
          <option v-for="d in WEEK_DAYS" :key="d">{{ d }}</option>
        </select>
      </div>
      <div class="field">
        <label>Horario disponible</label>
        <div class="chip-row">
          <button type="button" class="chip" v-for="s in availableSlots" :key="s" :class="{ active: form.time === s }" @click="form.time = s">{{ s }}</button>
          <span v-if="!availableSlots.length" class="text-muted" style="font-size:.85rem;">No hay horarios disponibles ese día.</span>
        </div>
      </div>
    </div>
    <template #footer>
      <button class="btn btn-primary btn-block" @click="save">{{ editingId ? 'Confirmar cambio' : 'Agendar cita' }}</button>
    </template>
  </BaseModal>
</template>
