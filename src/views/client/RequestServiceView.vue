<script setup>
import { reactive, ref, computed } from 'vue'
import { useAuthStore } from '../../stores/auth'
import { useVehiclesStore } from '../../stores/vehicles'
import { useOrdersStore } from '../../stores/orders'
import { useCatalogStore } from '../../stores/catalog'
import { useUiStore } from '../../stores/ui'
import FileDrop from '../../components/ui/FileDrop.vue'

const auth = useAuthStore()
const vehiclesStore = useVehiclesStore()
const orders = useOrdersStore()
const catalog = useCatalogStore()
const ui = useUiStore()

const myVehicles = computed(() => vehiclesStore.byOwner(auth.currentUser.id))

const form = reactive({
  vehicleId: myVehicles.value[0]?.id || '',
  serviceType: 'Diagnóstico general',
  description: '',
  photos: [],
})
const serviceTypes = ['Mantenimiento preventivo', 'Reparación', 'Revisión', 'Diagnóstico general']
const sent = ref(false)
const lastRequest = ref(null)

function addPhoto(p) { form.photos.push(p) }
function removePhoto(i) { form.photos.splice(i, 1) }

// RF-01/02: crear solicitud con vehículo, tipo de servicio, descripción y fotos
function submit() {
  if (!form.vehicleId || !form.description.trim()) { ui.showToast('Completá el vehículo y la descripción del problema.', 'error'); return }
  const req = orders.createRequest(auth.currentUser.id, {
    vehicleId: form.vehicleId, serviceType: form.serviceType, description: form.description, photos: form.photos,
  })
  lastRequest.value = req
  sent.value = true
  ui.showToast('Solicitud enviada al taller ✔') // HU-02: confirmación
  form.description = ''
  form.photos = []
}
function newRequest() { sent.value = false; lastRequest.value = null }
</script>

<template>
  <div style="max-width:620px;">
    <!-- HU-02: confirmación tras enviar -->
    <div v-if="sent" class="card">
      <div class="card-body" style="text-align:center;padding:40px 24px;">
        <i class="bi bi-check-circle-fill" style="font-size:2.6rem;color:var(--green);"></i>
        <h3 style="margin:14px 0 6px;">Solicitud enviada</h3>
        <p class="text-muted">
          Tu solicitud <b class="mono">{{ lastRequest.id }}</b> quedó registrada con estado
          <span class="badge b-solicitud" style="margin-left:4px;">Solicitud enviada</span>.
          El taller la revisará y te avisaremos por notificación.
        </p>
        <button class="btn btn-primary" style="margin-top:16px;" @click="newRequest">Enviar otra solicitud</button>
      </div>
    </div>

    <div class="card" v-else>
      <div class="card-body form-stack">
        <h4 style="margin-top:0;">Nueva solicitud de servicio</h4>
        <div class="field">
          <label>Vehículo</label>
          <select v-model="form.vehicleId">
            <option v-for="v in myVehicles" :key="v.id" :value="v.id">{{ v.brand }} {{ v.model }} — {{ v.plate }}</option>
          </select>
          <p v-if="!myVehicles.length" class="field-hint">No tenés vehículos registrados todavía — registrá uno primero.</p>
        </div>
        <div class="field">
          <label>Tipo de servicio</label>
          <select v-model="form.serviceType">
            <option v-for="t in serviceTypes" :key="t">{{ t }}</option>
          </select>
        </div>
        <div class="field">
          <label>¿Qué le pasa al vehículo?</label>
          <textarea rows="4" v-model="form.description" placeholder="Ej: hace un ruido metálico al frenar y el pedal se siente esponjoso..."></textarea>
        </div>
        <div class="field">
          <label>Fotos (opcional)</label>
          <FileDrop @add="addPhoto" />
          <div v-if="form.photos.length" class="photo-row">
            <div class="photo-thumb" v-for="(p, i) in form.photos" :key="i">
              <img :src="p.url" :alt="p.name">
              <button @click="removePhoto(i)"><i class="bi bi-x"></i></button>
            </div>
          </div>
        </div>
        <button class="btn btn-primary btn-block" :disabled="!myVehicles.length" @click="submit"><i class="bi bi-send-check"></i> Enviar solicitud</button>
        <p class="field-hint" style="text-align:center;">Después de que el taller revise tu solicitud, vas a poder agendar una cita desde "Mis citas".</p>
      </div>
    </div>

    <div class="card" style="margin-top:20px;">
      <div class="card-body">
        <div class="eyebrow" style="margin-bottom:10px;">Tarifas de referencia</div>
        <table>
          <tbody>
            <tr v-for="s in catalog.services.slice(0, 4)" :key="s.id"><td>{{ s.name }}</td><td class="mono text-right">desde ₡{{ s.rate.toLocaleString('es-CR') }}</td></tr>
          </tbody>
        </table>
        <router-link to="/cliente/catalogo" class="field-hint" style="display:inline-block;margin-top:8px;">Ver catálogo completo <i class="bi bi-arrow-right"></i></router-link>
      </div>
    </div>
  </div>
</template>

<style scoped>
.photo-row{ display:flex; gap:8px; flex-wrap:wrap; margin-top:10px; }
.photo-thumb{ position:relative; width:64px; height:64px; border-radius:8px; overflow:hidden; border:1px solid var(--border); }
.photo-thumb img{ width:100%; height:100%; object-fit:cover; }
.photo-thumb button{ position:absolute; top:2px; right:2px; background:rgba(0,0,0,.6); color:#fff; border:none; border-radius:50%; width:18px; height:18px; font-size:.7rem; line-height:1; }
</style>
