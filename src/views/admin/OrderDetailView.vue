<script setup>
import { computed, reactive, ref, nextTick } from 'vue'
import { useOrdersStore, STATUS_LABEL } from '../../stores/orders'
import { useAuthStore } from '../../stores/auth'
import { useVehiclesStore } from '../../stores/vehicles'
import { useInventoryStore } from '../../stores/inventory'
import { useMessagesStore } from '../../stores/messages'
import { useUiStore } from '../../stores/ui'
import StatusBadge from '../../components/ui/StatusBadge.vue'
import JobTicketStepper from '../../components/ui/JobTicketStepper.vue'
import FileDrop from '../../components/ui/FileDrop.vue'
import { toOrderId, formatCRC, parseEsDate } from '../../utils/format'

const props = defineProps({ id: String })
const orders = useOrdersStore()
const auth = useAuthStore()
const vehiclesStore = useVehiclesStore()
const inventory = useInventoryStore()
const messagesStore = useMessagesStore()
const ui = useUiStore()

const order = computed(() => orders.orderById(toOrderId(props.id)))
const vehicle = computed(() => order.value ? vehiclesStore.byId(order.value.vehicleId) : null)
const client = computed(() => order.value ? auth.userById(order.value.clientId) : null)
const budget = computed(() => order.value ? orders.currentBudget(order.value) : null)
const assignmentHistory = computed(() => {
  if (!order.value) return []
  if (order.value.assignmentHistory?.length) return order.value.assignmentHistory
  return [{ mechanicId: order.value.mechanicId, at: order.value.statusHistory[0]?.at || '—' }]
})

// HU-30: historial del vehículo (contexto antes de una nueva reparación), sin incluir la orden actual
const vehicleHistory = computed(() => {
  if (!order.value) return []
  return orders.orders
    .filter(o => o.vehicleId === order.value.vehicleId && o.id !== order.value.id)
    .sort((a, b) => (a.id < b.id ? 1 : -1))
})

// HU-30: cuánto tiempo estuvo la orden en cada estado (aprox., a partir de los timestamps registrados)
const statusDurations = computed(() => {
  if (!order.value) return []
  const h = order.value.statusHistory
  return h.map((entry, i) => {
    const start = parseEsDate(entry.at)
    const end = i < h.length - 1 ? parseEsDate(h[i + 1].at) : new Date()
    let label = '—'
    if (start && end) {
      const hours = Math.max(0, Math.round((end - start) / 36e5))
      label = hours < 1 ? '< 1 h' : hours < 24 ? `${hours} h` : `${Math.round(hours / 24)} día(s)`
    }
    return { ...entry, duration: label }
  })
})

// ---- reasignar mecánico (RF-11) ----
function reassign(e) { orders.assignMechanic(order.value.id, e.target.value); ui.showToast('Mecánico reasignado ✔') }

// ---- actualizar estado con comentario (RF-13/RF-16) ----
const STATUS_OPTIONS = ['diagnostico', 'presupuesto', 'aprobado', 'proceso', 'listo', 'entregado']
const statusForm = reactive({ status: '', comment: '' })
function updateStatus() {
  if (!statusForm.status) return
  orders.setStatus(order.value.id, statusForm.status, statusForm.comment)
  statusForm.comment = ''
  ui.showToast('Estado actualizado ✔')
}

// ---- presupuesto (RF-05/RF-06/RF-08) ----
const budgetItems = ref([{ kind: 'service', label: '', qty: 1, price: 0, partId: '' }])
const taxRate = ref(0.13)
function addLine() { budgetItems.value.push({ kind: 'service', label: '', qty: 1, price: 0, partId: '' }) }
function addLaborLine() {
  budgetItems.value.push({
    kind: 'labor', label: 'Mano de obra', qty: 1,
    price: Number(order.value?.diagnostic?.laborEstimate) || 0, partId: '',
  })
}
function removeLine(i) { budgetItems.value.splice(i, 1) }
function fillFromInventory(line) {
  const p = inventory.byId(line.partId)
  if (p) { line.kind = 'part'; line.label = p.name; line.price = p.price }
}
const stockWarning = computed(() =>
  budgetItems.value.filter(l => l.partId).map(l => {
    const p = inventory.byId(l.partId)
    return p && l.qty > p.stock ? `Solo hay ${p.stock} unidades de "${p.name}" en inventario.` : null
  }).filter(Boolean)
)
const subtotalDraft = computed(() => budgetItems.value.reduce((s, l) => s + (Number(l.qty) || 0) * (Number(l.price) || 0), 0))

function generateAndSend() {
  if (stockWarning.value.length) { ui.showToast(stockWarning.value[0], 'error'); return }
  const invalidLine = budgetItems.value.find(l => l.label && (!Number.isFinite(Number(l.qty)) || Number(l.qty) <= 0 || !Number.isFinite(Number(l.price)) || Number(l.price) < 0))
  if (invalidLine) { ui.showToast('Cada línea debe tener una cantidad mayor a 0 y un precio válido.', 'error'); return }
  const items = budgetItems.value.filter(l => l.label).map(l => ({
    kind: l.kind || (/mano de obra/i.test(l.label) ? 'labor' : (l.partId ? 'part' : 'service')),
    partId: l.partId || null, label: l.label.trim(), qty: Number(l.qty) || 1, price: Number(l.price) || 0,
  }))
  if (!items.length) { ui.showToast('Agregá al menos una línea.', 'error'); return }
  if (order.value.budgets.length === 0) orders.createBudget(order.value.id, { items, taxRate: taxRate.value })
  else orders.reviseBudget(order.value.id, { items, taxRate: taxRate.value })
  orders.sendBudget(order.value.id)
  budgetItems.value = [{ kind: 'service', label: '', qty: 1, price: 0, partId: '' }]
  ui.showToast('Presupuesto enviado al cliente ✔')
}

// ---- fotos (RF-14) ----
function addPhoto(stage, photo) { orders.addPhoto(order.value.id, stage, photo) }

// ---- mensajes (RF-29/30) ----
const messages = computed(() => messagesStore.forOrder(order.value?.id))
const chatInput = ref('')
const chatAttachments = ref([])
const chatBox = ref(null)
function addChatAttachment(photo) { chatAttachments.value.push(photo) }
function removeChatAttachment(index) { chatAttachments.value.splice(index, 1) }
function sendMessage() {
  const text = chatInput.value.trim()
  if (!text && !chatAttachments.value.length) return
  messagesStore.send(order.value.id, {
    from: 'admin', authorName: auth.currentUser.name, text, attachments: chatAttachments.value,
  })
  chatInput.value = ''
  chatAttachments.value = []
  nextTick(() => { if (chatBox.value) chatBox.value.scrollTop = chatBox.value.scrollHeight })
}
</script>

<template>
  <div v-if="!order" class="card"><div class="card-body">No se encontró la orden.</div></div>

  <div v-else class="grid grid-7-5">
    <div>
      <div class="card" style="margin-bottom:18px;">
        <div class="card-body">
          <div class="flex-between">
            <div>
              <div class="eyebrow">{{ order.id }} · {{ client?.name }}</div>
              <h3 style="margin:4px 0 0;">{{ vehicle?.brand }} {{ vehicle?.model }} {{ vehicle?.year }} <span class="plate">{{ vehicle?.plate }}</span></h3>
            </div>
            <StatusBadge :status="order.status" />
          </div>
          <p class="text-muted" style="margin-top:10px;font-size:.89rem;">{{ order.description }}</p>
          <div v-if="order.photosRequest?.length" class="request-photos">
            <div class="eyebrow" style="margin-bottom:6px;">Fotos de la solicitud inicial</div>
            <div class="photo-grid request-grid">
              <img v-for="(p,i) in order.photosRequest" :key="i" :src="p.url" :alt="p.name" @click="ui.openLightbox(p.url)">
            </div>
          </div>
          <JobTicketStepper :status="order.status" />

          <div class="grid grid-2" style="margin-top:16px;">
            <div class="field">
              <label>Mecánico asignado</label>
              <select :value="order.mechanicId" @change="reassign">
                <option v-for="m in auth.activeMechanics" :key="m.id" :value="m.id">{{ m.name }} ({{ orders.workloadByMechanic(m.id) }} activas)</option>
              </select>
            </div>
            <div class="field">
              <label>Actualizar estado</label>
              <select v-model="statusForm.status">
                <option value="">Elegir...</option>
                <option v-for="s in STATUS_OPTIONS" :key="s" :value="s">{{ STATUS_LABEL[s] }}</option>
              </select>
            </div>
          </div>
          <div v-if="statusForm.status" class="flex gap-8">
            <input v-model="statusForm.comment" placeholder="Nota para el cliente (opcional)" style="flex:1;border:1.5px solid var(--border);border-radius:10px;padding:9px 12px;">
            <button class="btn btn-primary btn-sm" @click="updateStatus">Actualizar</button>
          </div>
          <div class="assignment-history">
            <span class="text-muted">Historial de asignación:</span>
            <span v-for="(a,i) in assignmentHistory" :key="i">{{ auth.userById(a.mechanicId)?.name || 'Mecánico' }} <small>({{ a.at }})</small></span>
          </div>
        </div>
      </div>

      <!-- HU-30: historial completo de estados de la orden -->
      <div class="card" style="margin-bottom:18px;">
        <div class="card-body">
          <div class="eyebrow" style="margin-bottom:10px;">Historial de estados</div>
          <div class="timeline">
            <div class="tl-item" v-for="(h, i) in statusDurations" :key="i">
              <div class="tl-dot"></div>
              <div>
                <div class="flex-between"><b style="font-size:.88rem;">{{ STATUS_LABEL[h.status] }}</b><span class="mono text-muted" style="font-size:.76rem;">{{ h.at }}</span></div>
                <div v-if="h.comment" class="text-muted" style="font-size:.82rem;margin-top:2px;">{{ h.comment }}</div>
                <div class="text-muted" style="font-size:.76rem;margin-top:2px;">Duración en este estado: {{ h.duration }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- HU-44: historial del vehículo para dar contexto antes de la reparación -->
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

      <div class="card" style="margin-bottom:18px;" v-if="order.diagnostic">
        <div class="card-body">
          <div class="eyebrow" style="margin-bottom:10px;">Diagnóstico técnico</div>
          <p style="font-size:.9rem;margin-bottom:8px;">{{ order.diagnostic.notes }}</p>
          <p class="text-muted" style="font-size:.84rem;">Mano de obra estimada: <b class="mono">{{ formatCRC(order.diagnostic.laborEstimate) }}</b></p>
        </div>
      </div>
      <div class="card" style="margin-bottom:18px;" v-else>
        <div class="card-body text-muted">El mecánico asignado todavía no registró el diagnóstico de esta orden.</div>
      </div>

      <!-- Evidencia fotográfica (RF-14) -->
      <div class="card" style="margin-bottom:18px;">
        <div class="card-body">
          <div class="eyebrow" style="margin-bottom:10px;">Evidencia fotográfica</div>
          <div class="grid grid-3">
            <div v-for="stage in ['antes','durante','despues']" :key="stage">
              <div class="stage-label">{{ stage === 'despues' ? 'Después' : stage[0].toUpperCase()+stage.slice(1) }}</div>
              <div v-if="order.photos[stage].length" class="photo-grid">
                <img v-for="(p,i) in order.photos[stage]" :key="i" :src="p.url" @click="ui.openLightbox(p.url)">
              </div>
              <FileDrop :label="'Subir foto ' + stage" @add="p => addPhoto(stage, p)" />
            </div>
          </div>
        </div>
      </div>

      <!-- Generar / revisar presupuesto (RF-05, RF-06, RF-08) -->
      <div class="card">
        <div class="card-body">
          <div class="eyebrow" style="margin-bottom:10px;">
            {{ budget ? 'Nueva versión de presupuesto' : 'Generar presupuesto' }}
            <span v-if="order.diagnostic" class="text-muted" style="text-transform:none;font-weight:400;">(mano de obra sugerida: {{ formatCRC(order.diagnostic.laborEstimate) }})</span>
          </div>
          <div class="line-row" v-for="(l,i) in budgetItems" :key="i">
            <select v-model="l.partId" @change="fillFromInventory(l)">
              <option value="">Repuesto de inventario (opcional)</option>
              <option v-for="p in inventory.parts" :key="p.id" :value="p.id">{{ p.name }} ({{ p.stock }} disp.)</option>
            </select>
          </div>
          <div class="line-row" v-for="(l,i) in budgetItems" :key="'r'+i" style="grid-template-columns:1fr 60px 110px 34px;">
            <input placeholder="Descripción" v-model="l.label">
            <input placeholder="Cant." v-model.number="l.qty" type="number" min="1">
            <input class="mono" placeholder="Precio unit." v-model.number="l.price" type="number">
            <button class="btn btn-ghost btn-icon" @click="removeLine(i)"><i class="bi bi-trash"></i></button>
          </div>
          <div class="flex gap-8" style="flex-wrap:wrap;">
            <button class="btn btn-ghost btn-sm" @click="addLine"><i class="bi bi-plus-lg"></i> Agregar repuesto/servicio</button>
            <button class="btn btn-ghost btn-sm" @click="addLaborLine"><i class="bi bi-person-gear"></i> Agregar mano de obra</button>
          </div>

          <div class="field" style="margin-top:12px;max-width:180px;">
            <label>Impuesto</label>
            <select v-model.number="taxRate"><option :value="0.13">13%</option><option :value="0">Exento</option></select>
          </div>

          <p v-for="(w,i) in stockWarning" :key="i" style="color:var(--red);font-size:.82rem;"><i class="bi bi-exclamation-triangle"></i> {{ w }}</p>

          <div class="line-total"><span>Subtotal</span><span class="mono">{{ formatCRC(subtotalDraft) }}</span></div>
          <button class="btn btn-primary btn-block" style="margin-top:14px;" @click="generateAndSend">
            <i class="bi bi-send-check"></i> {{ budget ? 'Enviar nueva versión al cliente' : 'Generar y enviar presupuesto' }}
          </button>

          <div v-if="order.budgets.length" style="margin-top:18px;border-top:1px dashed var(--border);padding-top:12px;">
            <div class="eyebrow" style="margin-bottom:8px;">Historial de versiones</div>
            <div class="version-row" v-for="b in order.budgets" :key="b.version">
              <span>v{{ b.version }} · creada {{ b.createdAt }}<span v-if="b.decidedAt"> · decisión {{ b.decidedAt }}</span> · {{ formatCRC(b.items.reduce((s,i)=>s+i.qty*i.price,0) * (1+b.taxRate)) }}</span>
              <span class="badge" :class="b.status === 'aprobado' ? 'b-proceso' : b.status === 'rechazado' ? 'b-rechazado' : 'b-espera'">{{ b.status }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="card" style="margin-top:18px;" v-if="order.rating">
        <div class="card-body">
          <div class="eyebrow" style="margin-bottom:6px;">Calificación del cliente</div>
          <div class="mono">{{ '★'.repeat(order.rating.stars) }}{{ '☆'.repeat(5-order.rating.stars) }}</div>
          <p class="text-muted" style="margin-top:6px;font-size:.86rem;">"{{ order.rating.comment }}"</p>
        </div>
      </div>
    </div>

    <div>
      <div class="card" style="height:100%;">
        <div class="card-body" style="display:flex;flex-direction:column;height:100%;">
          <div class="eyebrow" style="margin-bottom:10px;">Mensajes con {{ client?.name }}</div>
          <div class="chat-box" ref="chatBox">
            <div class="chat-bubble" :class="m.from === 'admin' ? 'mine' : 'theirs'" v-for="(m,i) in messages" :key="i">
              <div v-if="m.text">{{ m.text }}</div>
              <div v-if="m.attachments?.length" class="chat-images">
                <img v-for="(a,ai) in m.attachments" :key="ai" :src="a.url" :alt="a.name" @click="ui.openLightbox(a.url)">
              </div>
              <div class="chat-meta">{{ m.authorName || (m.from === 'admin' ? 'Taller' : 'Cliente') }} · {{ m.at }}</div>
            </div>
          </div>
          <div v-if="chatAttachments.length" class="pending-images">
            <div v-for="(a,i) in chatAttachments" :key="i" class="pending-image">
              <img :src="a.url" :alt="a.name">
              <button type="button" @click="removeChatAttachment(i)"><i class="bi bi-x"></i></button>
            </div>
          </div>
          <FileDrop label="Adjuntar imagen al mensaje" @add="addChatAttachment" />
          <form class="chat-form" @submit.prevent="sendMessage">
            <input v-model="chatInput" placeholder="Responder...">
            <button class="btn btn-primary btn-icon" type="submit" :disabled="!chatInput.trim() && !chatAttachments.length"><i class="bi bi-send-fill"></i></button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.assignment-history{ display:flex; gap:8px; flex-wrap:wrap; margin-top:10px; font-size:.76rem; }
.assignment-history span:not(.text-muted){ background:var(--paper); border:1px solid var(--border); border-radius:999px; padding:3px 8px; }
.request-photos{ margin:14px 0 4px; }
.request-grid{ max-width:360px; }
.timeline{ position:relative; padding-left:18px; }
.tl-item{ position:relative; padding-bottom:16px; display:flex; gap:12px; }
.tl-item:not(:last-child)::before{ content:""; position:absolute; left:-13px; top:14px; bottom:-2px; width:2px; background:var(--border); }
.tl-dot{ position:absolute; left:-18px; top:3px; width:10px; height:10px; border-radius:50%; background:var(--orange); }
.stage-label{ font-size:.74rem; font-weight:700; text-transform:uppercase; color:var(--muted); margin-bottom:6px; }
.photo-grid{ display:grid; grid-template-columns:repeat(3,1fr); gap:6px; margin-bottom:8px; }
.photo-grid img{ width:100%; aspect-ratio:1; object-fit:cover; border-radius:8px; border:1px solid var(--border); cursor:zoom-in; }
.line-row{ display:grid; grid-template-columns:1fr; gap:8px; margin-bottom:8px; }
.line-row input, .line-row select{ border:1.5px solid var(--border); border-radius:8px; padding:8px 10px; font-size:.85rem; font-family:inherit; }
.line-total{ display:flex; justify-content:space-between; font-weight:700; border-top:1.5px solid var(--border); padding-top:12px; margin-top:10px; font-size:1.02rem; }
.version-row{ display:flex; justify-content:space-between; padding:6px 0; font-size:.82rem; }
.chat-box{ max-height:400px; overflow-y:auto; display:flex; flex-direction:column; padding-right:4px; }
.chat-bubble{ max-width:82%; padding:10px 14px; border-radius:14px; font-size:.87rem; margin-bottom:9px; line-height:1.4; }
.chat-bubble.mine{ background:var(--asphalt); color:#fff; margin-left:auto; border-bottom-right-radius:3px; }
.chat-bubble.theirs{ background:var(--paper); border:1px solid var(--border); border-bottom-left-radius:3px; }
.chat-meta{ font-size:.68rem; opacity:.65; margin-top:4px; }
.chat-images{ display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:6px; margin-top:8px; }
.chat-images img{ width:100%; aspect-ratio:1; object-fit:cover; border-radius:8px; cursor:zoom-in; }
.pending-images{ display:flex; gap:7px; flex-wrap:wrap; margin:8px 0; }
.pending-image{ width:54px; height:54px; position:relative; }
.pending-image img{ width:100%; height:100%; object-fit:cover; border-radius:8px; border:1px solid var(--border); }
.pending-image button{ position:absolute; right:-5px; top:-5px; width:20px; height:20px; border:0; border-radius:50%; background:var(--asphalt); color:#fff; display:grid; place-items:center; }
.chat-form{ display:flex; gap:8px; margin-top:12px; }
.chat-form input{ flex:1; border:1.5px solid var(--border); border-radius:10px; padding:10px 13px; font-family:inherit; font-size:.87rem; }
</style>
