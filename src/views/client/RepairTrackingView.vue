<script setup>
import { computed, ref, nextTick } from 'vue'
import { useAuthStore } from '../../stores/auth'
import { useVehiclesStore } from '../../stores/vehicles'
import { useOrdersStore, STATUS_LABEL } from '../../stores/orders'
import { useMessagesStore } from '../../stores/messages'
import { useUiStore } from '../../stores/ui'
import JobTicketStepper from '../../components/ui/JobTicketStepper.vue'
import StarRating from '../../components/ui/StarRating.vue'
import FileDrop from '../../components/ui/FileDrop.vue'
import { toOrderId, formatCRC } from '../../utils/format'

const props = defineProps({ id: String })
const auth = useAuthStore()
const vehiclesStore = useVehiclesStore()
const ordersStore = useOrdersStore()
const messagesStore = useMessagesStore()
const ui = useUiStore()
const order = computed(() => {
  const found = ordersStore.orderById(toOrderId(props.id))
  return found && found.clientId === auth.currentUser?.id ? found : null
})
const vehicle = computed(() => order.value ? vehiclesStore.byId(order.value.vehicleId) : null)
const budget = computed(() => order.value ? ordersStore.currentBudget(order.value) : null)
const budgetTotal = computed(() => {
  if (!budget.value) return 0
  const sub = budget.value.items.reduce((s, i) => s + i.qty * i.price, 0)
  return sub + sub * budget.value.taxRate
})
const budgetSubtotal = computed(() => budget.value ? budget.value.items.reduce((s, i) => s + i.qty * i.price, 0) : 0)

const showVersions = ref(false)
const expandedVersion = ref(null)
function toggleVersion(v) { expandedVersion.value = expandedVersion.value === v ? null : v }

function approve() {
  const result = ordersStore.approveBudget(order.value.id)
  if (result?.ok === false) { ui.showToast(result.message, 'error'); return }
  ui.showToast('Presupuesto aprobado en 1 clic ✔')
}
const rejectComment = ref('')
const showReject = ref(false)
function reject() {
  ordersStore.rejectBudget(order.value.id, rejectComment.value)
  showReject.value = false
  rejectComment.value = ''
  ui.showToast('Presupuesto rechazado')
}

// ---- chat (RF-29) ----
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
    from: 'cliente', authorName: auth.currentUser.name, text, attachments: chatAttachments.value,
  })
  chatInput.value = ''
  chatAttachments.value = []
  nextTick(() => { if (chatBox.value) chatBox.value.scrollTop = chatBox.value.scrollHeight })
}

// ---- calificación (RF-32) ----
const ratingStars = ref(0)
const ratingComment = ref('')
function submitRating() {
  if (!ratingStars.value) return
  ordersStore.rateOrder(order.value.id, { stars: ratingStars.value, comment: ratingComment.value })
  ui.showToast('¡Gracias por tu calificación!')
}
</script>

<template>
  <div v-if="!order" class="card"><div class="card-body">No se encontró la orden.</div></div>

  <div v-else class="grid grid-7-5">
    <div>
      <!-- Ticket + línea de tiempo (RF-13/RF-15) -->
      <div class="ticket" style="margin-bottom:18px;">
        <div class="ticket-head">
          <span class="mono" style="font-size:.78rem;color:#B9C0C7;">ORDEN {{ order.id }}</span>
          <span class="plate">{{ vehicle?.plate }}</span>
        </div>
        <div class="ticket-body">
          <h3>{{ vehicle?.brand }} {{ vehicle?.model }} {{ vehicle?.year }}</h3>
          <div class="desc">{{ order.description }}</div>
          <JobTicketStepper :status="order.status" />
        </div>
      </div>

      <div class="card" style="margin-bottom:18px;">
        <div class="card-body">
          <div class="eyebrow" style="margin-bottom:10px;">Historial de estados</div>
          <div class="timeline">
            <div class="tl-item" v-for="(h, i) in order.statusHistory" :key="i">
              <div class="tl-dot"></div>
              <div>
                <div class="flex-between"><b style="font-size:.88rem;">{{ STATUS_LABEL[h.status] }}</b><span class="mono text-muted" style="font-size:.76rem;">{{ h.at }}</span></div>
                <div v-if="h.comment" class="text-muted" style="font-size:.82rem;margin-top:2px;">{{ h.comment }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Diagnóstico (RF-04, solo lectura para el cliente) -->
      <div class="card" style="margin-bottom:18px;" v-if="order.diagnostic">
        <div class="card-body">
          <div class="eyebrow" style="margin-bottom:10px;">Diagnóstico técnico</div>
          <p style="font-size:.9rem;margin-bottom:12px;">{{ order.diagnostic.notes }}</p>
          <div class="checklist-item" v-for="(v, point) in order.diagnostic.checklist" :key="point">
            <span>{{ point }}</span>
            <span class="badge" :class="v === 'ok' ? 'b-proceso' : v === 'warn' ? 'b-espera' : 'b-rechazado'">
              {{ v === 'ok' ? 'Correcto' : v === 'warn' ? 'Por revisar' : 'Con falla' }}
            </span>
          </div>
        </div>
      </div>

      <!-- Evidencia fotográfica (RF-14) -->
      <div class="card" style="margin-bottom:18px;">
        <div class="card-body">
          <div class="eyebrow" style="margin-bottom:10px;">Evidencia fotográfica</div>
          <div class="grid grid-3">
            <div v-for="stage in ['antes','durante','despues']" :key="stage">
              <div class="stage-label">{{ stage === 'despues' ? 'Después' : stage[0].toUpperCase()+stage.slice(1) }}</div>
              <div v-if="order.photos[stage].length" class="photo-grid">
                <img v-for="(p,i) in order.photos[stage]" :key="i" :src="p.url" :alt="p.name" @click="ui.openLightbox(p.url)">
              </div>
              <div v-else class="empty-stage">Sin fotos aún</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Presupuesto (RF-05..08) -->
      <div class="card" v-if="budget">
        <div class="card-body">
          <div class="flex-between" style="margin-bottom:10px;">
            <div class="eyebrow">Presupuesto — versión {{ budget.version }}</div>
            <button v-if="order.budgets.length > 1" class="btn btn-ghost btn-sm" @click="showVersions = !showVersions">
              {{ showVersions ? 'Ocultar' : 'Ver' }} versiones anteriores
            </button>
          </div>
          <table>
            <tbody>
              <tr v-for="(it,i) in budget.items" :key="i">
                <td>{{ it.label }} <span class="text-muted" v-if="it.qty > 1">× {{ it.qty }}</span></td>
                <td class="mono text-right">{{ formatCRC(it.qty * it.price) }}</td>
              </tr>
            </tbody>
            <tfoot>
              <tr><td class="text-muted">Subtotal</td><td class="mono text-right text-muted">{{ formatCRC(budgetSubtotal) }}</td></tr>
              <tr><td class="text-muted">Impuesto ({{ (budget.taxRate*100).toFixed(0) }}%)</td><td class="mono text-right text-muted">{{ formatCRC(budgetSubtotal * budget.taxRate) }}</td></tr>
              <tr style="font-weight:700;"><td style="padding-top:8px;">Total</td><td class="mono text-right" style="padding-top:8px;">{{ formatCRC(budgetTotal) }}</td></tr>
            </tfoot>
          </table>

          <div v-if="budget.status === 'pendiente' && order.status === 'espera'" style="display:flex;gap:10px;margin-top:14px;">
            <button class="btn btn-primary" style="flex:1;" @click="approve"><i class="bi bi-check2-circle"></i> Aprobar presupuesto</button>
            <button class="btn btn-danger-ghost" style="flex:1;" @click="showReject = true"><i class="bi bi-x-circle"></i> Rechazar</button>
          </div>
          <div v-else-if="budget.status !== 'pendiente'" style="margin-top:16px;display:flex;align-items:center;gap:14px;flex-wrap:wrap;">
            <span class="stamp" :class="{ rejected: budget.status === 'rechazado' }">
              <i :class="budget.status === 'aprobado' ? 'bi bi-check-lg' : 'bi bi-x-lg'"></i>
              {{ budget.status === 'aprobado' ? 'Aprobado' : 'Rechazado' }}
            </span>
            <span class="text-muted" style="font-size:.84rem;">{{ budget.decidedAt || 'Decisión registrada' }}</span>
            <span v-if="budget.clientComment" class="text-muted" style="font-size:.84rem;">"{{ budget.clientComment }}"</span>
          </div>

          <div v-if="showReject" class="reject-box">
            <textarea rows="2" v-model="rejectComment" placeholder="Contanos por qué (opcional)..."></textarea>
            <div class="flex gap-8" style="margin-top:8px;">
              <button class="btn btn-danger-ghost btn-sm" @click="reject">Confirmar rechazo</button>
              <button class="btn btn-ghost btn-sm" @click="showReject = false">Cancelar</button>
            </div>
          </div>

          <div v-if="showVersions" class="versions-list">
            <div v-for="b in order.budgets.slice(0, -1)" :key="b.version">
              <div class="version-row clickable" @click="toggleVersion(b.version)">
                <span><i class="bi" :class="expandedVersion === b.version ? 'bi-chevron-down' : 'bi-chevron-right'"></i> Versión {{ b.version }} · {{ b.createdAt }}</span>
                <span class="badge" :class="b.status === 'aprobado' ? 'b-proceso' : b.status === 'rechazado' ? 'b-rechazado' : 'b-espera'">{{ b.status }}</span>
              </div>
              <div v-if="expandedVersion === b.version" class="version-detail">
                <div class="version-line" v-for="(it,i) in b.items" :key="i">
                  <span>{{ it.label }} <span class="text-muted" v-if="it.qty > 1">× {{ it.qty }}</span></span>
                  <span class="mono">{{ formatCRC(it.qty * it.price) }}</span>
                </div>
                <div class="version-line" style="font-weight:700;border-top:1px dashed var(--border);padding-top:6px;">
                  <span>Total (con {{ (b.taxRate*100).toFixed(0) }}% imp.)</span>
                  <span class="mono">{{ formatCRC(b.items.reduce((s,i)=>s+i.qty*i.price,0) * (1+b.taxRate)) }}</span>
                </div>
                <p v-if="b.decidedAt" class="text-muted" style="font-size:.78rem;margin-top:6px;">Decisión: {{ b.decidedAt }}</p>
                <p v-if="b.clientComment" class="text-muted" style="font-size:.82rem;margin-top:6px;">Comentario del cliente: "{{ b.clientComment }}"</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Calificación (RF-32) -->
      <div class="card" style="margin-top:18px;" v-if="order.status === 'entregado'">
        <div class="card-body">
          <div class="eyebrow" style="margin-bottom:10px;">Calificá el servicio</div>
          <div v-if="order.rating">
            <StarRating :model-value="order.rating.stars" readonly />
            <p class="text-muted" style="margin-top:6px;font-size:.88rem;">"{{ order.rating.comment }}"</p>
          </div>
          <div v-else>
            <StarRating v-model="ratingStars" />
            <textarea rows="2" v-model="ratingComment" placeholder="Contanos tu experiencia (opcional)" style="margin-top:10px;"></textarea>
            <button class="btn btn-primary btn-sm" style="margin-top:8px;" @click="submitRating">Enviar calificación</button>
          </div>
        </div>
      </div>
    </div>

    <div>
      <div class="card" style="height:100%;">
        <div class="card-body" style="display:flex;flex-direction:column;height:100%;">
          <div class="eyebrow" style="margin-bottom:10px;">Mensajes con el taller</div>
          <div class="chat-box" ref="chatBox">
            <div class="chat-bubble" :class="m.from === 'cliente' ? 'mine' : 'theirs'" v-for="(m,i) in messages" :key="i">
              <div v-if="m.text">{{ m.text }}</div>
              <div v-if="m.attachments?.length" class="chat-images">
                <img v-for="(a,ai) in m.attachments" :key="ai" :src="a.url" :alt="a.name" @click="ui.openLightbox(a.url)">
              </div>
              <div class="chat-meta">{{ m.authorName || (m.from === 'cliente' ? 'Cliente' : 'Taller') }} · {{ m.at }}</div>
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
            <input v-model="chatInput" placeholder="Escribí un mensaje...">
            <button class="btn btn-primary btn-icon" type="submit" :disabled="!chatInput.trim() && !chatAttachments.length"><i class="bi bi-send-fill"></i></button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ticket{ background:#fff; border-radius:16px; border:1px solid var(--border); box-shadow:var(--shadow); }
.ticket-head{
  background:var(--asphalt); color:#fff; padding:18px 26px; border-radius:16px 16px 0 0; position:relative;
  display:flex; justify-content:space-between; align-items:center;
  background-image:repeating-linear-gradient(-45deg, rgba(255,255,255,.04) 0 10px, transparent 10px 20px);
}
.ticket-head::before,.ticket-head::after{ content:""; position:absolute; width:20px; height:20px; background:var(--paper); border-radius:50%; top:50%; transform:translateY(-50%); box-shadow:inset 0 0 0 1px var(--border); }
.ticket-head::before{ left:-10px; } .ticket-head::after{ right:-10px; }
.ticket-body{ padding:26px 30px 22px; }
.ticket-body h3{ margin:2px 0 2px; font-size:1.4rem; }
.ticket-body .desc{ color:var(--muted); font-size:.86rem; }

.stamp{ display:inline-flex; align-items:center; gap:8px; border:3px solid var(--green); color:var(--green);
  font-family:'Oswald',sans-serif; font-weight:700; text-transform:uppercase; letter-spacing:.06em; font-size:1rem;
  padding:8px 18px; border-radius:8px; transform:rotate(-6deg); animation:stampIn .38s cubic-bezier(.2,1.4,.4,1) both; }
.stamp.rejected{ border-color:var(--red); color:var(--red); }
@keyframes stampIn{ 0%{ opacity:0; transform:rotate(-24deg) scale(2.4);} 100%{ opacity:1; transform:rotate(-6deg) scale(1);} }

.timeline{ position:relative; padding-left:18px; }
.tl-item{ position:relative; padding-bottom:16px; display:flex; gap:12px; }
.tl-item:not(:last-child)::before{ content:""; position:absolute; left:-13px; top:14px; bottom:-2px; width:2px; background:var(--border); }
.tl-dot{ position:absolute; left:-18px; top:3px; width:10px; height:10px; border-radius:50%; background:var(--orange); }

.stage-label{ font-size:.74rem; font-weight:700; text-transform:uppercase; color:var(--muted); margin-bottom:6px; }
.photo-grid{ display:grid; grid-template-columns:repeat(2,1fr); gap:6px; }
.photo-grid img{ width:100%; aspect-ratio:1; object-fit:cover; border-radius:8px; border:1px solid var(--border); cursor:zoom-in; }
.empty-stage{ font-size:.78rem; color:var(--muted); background:var(--paper); border-radius:8px; padding:14px; text-align:center; }

.reject-box{ margin-top:12px; padding:12px; background:var(--paper); border-radius:10px; }
.reject-box textarea{ width:100%; border:1.5px solid var(--border); border-radius:8px; padding:8px 10px; font-family:inherit; font-size:.85rem; }
.versions-list{ margin-top:14px; border-top:1px dashed var(--border); padding-top:10px; }
.version-row{ display:flex; justify-content:space-between; padding:6px 0; font-size:.82rem; }
.version-row.clickable{ cursor:pointer; }
.version-detail{ background:var(--paper); border-radius:8px; padding:10px 12px; margin:2px 0 8px; }
.version-line{ display:flex; justify-content:space-between; font-size:.82rem; padding:3px 0; }

.chat-box{ max-height:320px; overflow-y:auto; display:flex; flex-direction:column; padding-right:4px; }
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
.chat-form input:focus{ outline:none; border-color:var(--orange); }
</style>
