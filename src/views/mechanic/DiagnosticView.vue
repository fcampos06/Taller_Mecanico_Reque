<script setup>
import { computed, reactive, ref } from 'vue'
import { useAuthStore } from '../../stores/auth'
import { useOrdersStore, CHECKLIST_POINTS, STATUS_LABEL } from '../../stores/orders'
import { useVehiclesStore } from '../../stores/vehicles'
import { useUiStore } from '../../stores/ui'
import JobTicketStepper from '../../components/ui/JobTicketStepper.vue'
import StatusBadge from '../../components/ui/StatusBadge.vue'
import FileDrop from '../../components/ui/FileDrop.vue'
import { toOrderId } from '../../utils/format'

const props = defineProps({ id: String })
const auth = useAuthStore()
const orders = useOrdersStore()
const vehiclesStore = useVehiclesStore()
const ui = useUiStore()

const order = computed(() => orders.orderById(toOrderId(props.id)))
const vehicle = computed(() => order.value ? vehiclesStore.byId(order.value.vehicleId) : null)
const notMine = computed(() => order.value && order.value.mechanicId !== auth.currentUser.id)

// HU-44: historial del vehículo, contexto antes de reparar
const vehicleHistory = computed(() => {
  if (!order.value) return []
  return orders.orders
    .filter(o => o.vehicleId === order.value.vehicleId && o.id !== order.value.id)
    .sort((a, b) => (a.id < b.id ? 1 : -1))
})

// RF-04: registrar diagnóstico + checklist
const form = reactive({
  notes: order.value?.diagnostic?.notes || '',
  laborEstimate: order.value?.diagnostic?.laborEstimate || 0,
  checklist: order.value?.diagnostic
    ? { ...order.value.diagnostic.checklist }
    : Object.fromEntries(CHECKLIST_POINTS.map(p => [p, 'ok'])),
})

function saveDiagnostic() {
  if (!form.notes.trim()) { ui.showToast('Describí los hallazgos del diagnóstico.', 'error'); return }
  orders.saveDiagnostic(order.value.id, { ...form })
  ui.showToast('Diagnóstico guardado ✔')
}

// RF-13/16: actualizar estado con comentario, RF-14: fotos de avance
const STATUS_OPTIONS = ['proceso', 'listo']
const statusForm = reactive({ status: '', comment: '' })
function updateStatus() {
  if (!statusForm.status) return
  orders.setStatus(order.value.id, statusForm.status, statusForm.comment)
  statusForm.comment = ''
  ui.showToast('Estado actualizado ✔')
}
function addPhoto(stage, photo) { orders.addPhoto(order.value.id, stage, photo) }
</script>

<template>
  <div v-if="!order" class="card"><div class="card-body">No se encontró la orden.</div></div>
  <div v-else-if="notMine" class="card"><div class="card-body">Esta orden no está asignada a vos.</div></div>

  <div v-else>
    <div class="card" style="margin-bottom:18px;">
      <div class="card-body">
        <div class="flex-between">
          <div>
            <div class="eyebrow">{{ order.id }}</div>
            <h3 style="margin:4px 0 0;">{{ vehicle?.brand }} {{ vehicle?.model }} {{ vehicle?.year }} <span class="plate">{{ vehicle?.plate }}</span></h3>
          </div>
        </div>
        <p class="text-muted" style="margin-top:8px;font-size:.89rem;">{{ order.description }}</p>
        <div v-if="order.photosRequest?.length" class="request-photos">
          <div class="eyebrow" style="margin-bottom:6px;">Fotos enviadas por el cliente</div>
          <div class="photo-grid request-grid">
            <img v-for="(p,i) in order.photosRequest" :key="i" :src="p.url" :alt="p.name" @click="ui.openLightbox(p.url)">
          </div>
        </div>
        <JobTicketStepper :status="order.status" />
      </div>
    </div>

    <div class="card" style="margin-bottom:18px;" v-if="vehicleHistory.length">
      <div class="card-body">
        <div class="eyebrow" style="margin-bottom:10px;">Historial de este vehículo</div>
        <table>
          <tbody>
            <tr v-for="h in vehicleHistory" :key="h.id">
              <td class="mono">{{ h.id }}</td>
              <td>{{ h.statusHistory[0].at }}</td>
              <td>{{ h.serviceType }}</td>
              <td class="text-muted" style="max-width:280px;">{{ h.diagnostic?.notes || 'Sin diagnóstico registrado' }}</td>
              <td><StatusBadge :status="h.status" /></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="card" style="margin-bottom:18px;">
      <div class="card-body form-stack">
        <div class="eyebrow" style="margin-bottom:10px;">Diagnóstico técnico</div>
        <div class="field"><label>Hallazgos</label><textarea rows="4" v-model="form.notes" placeholder="Describí lo que encontraste en la inspección..."></textarea></div>
        <div class="field"><label>Mano de obra estimada (₡)</label><input v-model.number="form.laborEstimate" type="number"></div>

        <div class="eyebrow" style="margin:16px 0 4px;">Checklist de inspección</div>
        <div class="checklist-item" v-for="point in CHECKLIST_POINTS" :key="point">
          <span>{{ point }}</span>
          <div class="check-pill">
            <button type="button" class="ok" :class="{ active: form.checklist[point] === 'ok' }" @click="form.checklist[point] = 'ok'">Correcto</button>
            <button type="button" class="warn" :class="{ active: form.checklist[point] === 'warn' }" @click="form.checklist[point] = 'warn'">Revisar</button>
            <button type="button" class="fail" :class="{ active: form.checklist[point] === 'fail' }" @click="form.checklist[point] = 'fail'">Con falla</button>
          </div>
        </div>

        <button class="btn btn-primary" @click="saveDiagnostic"><i class="bi bi-check2"></i> Guardar diagnóstico</button>
      </div>
    </div>

    <div class="card" style="margin-bottom:18px;" v-if="order.diagnostic">
      <div class="card-body">
        <div class="eyebrow" style="margin-bottom:10px;">Actualizar estado de la orden</div>
        <div class="grid grid-2">
          <div class="field">
            <label>Nuevo estado</label>
            <select v-model="statusForm.status">
              <option value="">Elegir...</option>
              <option v-for="s in STATUS_OPTIONS" :key="s" :value="s">{{ STATUS_LABEL[s] }}</option>
            </select>
          </div>
          <div class="field">
            <label>Nota para el cliente (opcional)</label>
            <input v-model="statusForm.comment" placeholder="Ej: se instalaron las pastillas nuevas">
          </div>
        </div>
        <button class="btn btn-primary btn-sm" @click="updateStatus">Actualizar estado</button>
      </div>
    </div>

    <div class="card">
      <div class="card-body">
        <div class="eyebrow" style="margin-bottom:10px;">Evidencia fotográfica</div>
        <div class="grid grid-3">
          <div v-for="stage in ['antes','durante','despues']" :key="stage">
            <div class="stage-label">{{ stage === 'despues' ? 'Después' : stage[0].toUpperCase()+stage.slice(1) }}</div>
            <div v-if="order.photos[stage].length" class="photo-grid">
              <img v-for="(p,i) in order.photos[stage]" :key="i" :src="p.url" @click="ui.openLightbox(p.url)">
            </div>
            <FileDrop :label="'Subir foto'" @add="p => addPhoto(stage, p)" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.request-photos{ margin:14px 0 4px; }
.request-grid{ max-width:360px; }
.stage-label{ font-size:.74rem; font-weight:700; text-transform:uppercase; color:var(--muted); margin-bottom:6px; }
.photo-grid{ display:grid; grid-template-columns:repeat(3,1fr); gap:6px; margin-bottom:8px; }
.photo-grid img{ width:100%; aspect-ratio:1; object-fit:cover; border-radius:8px; border:1px solid var(--border); cursor:zoom-in; }
</style>
