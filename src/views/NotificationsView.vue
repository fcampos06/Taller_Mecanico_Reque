<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useNotificationsStore } from '../stores/notifications'
import { toRouteId } from '../utils/format'

const auth = useAuthStore()
const notif = useNotificationsStore()
const router = useRouter()

const myNotifications = computed(() => notif.forUser(auth.currentUser.id))

// RF-30/HU-59/HU-60: acceder directo a la orden desde la notificación, sea cliente, admin o mecánico
function open(n) {
  notif.markRead(n.id)
  if (!n.orderId) return
  const base = { cliente: '/cliente/orden/', admin: '/admin/orden/', mecanico: '/mecanico/orden/' }[auth.currentUser.role]
  router.push(base + toRouteId(n.orderId))
}
</script>

<template>
  <div class="card">
    <div class="card-body">
      <div class="flex-between" style="margin-bottom:14px;">
        <h4 class="mt-0 mb-0">Notificaciones</h4>
        <button class="btn btn-ghost btn-sm" @click="notif.markAllRead(auth.currentUser.id)">Marcar todas como leídas</button>
      </div>
      <div class="notif-row" v-for="n in myNotifications" :key="n.id" :class="{ unread: !n.read }" @click="open(n)">
        <i class="bi" :class="n.read ? 'bi-bell' : 'bi-bell-fill'"></i>
        <div style="flex:1;">
          <div style="font-size:.88rem;">{{ n.text }}</div>
          <div class="text-muted" style="font-size:.76rem;margin-top:2px;">{{ n.at }}</div>
        </div>
        <span v-if="!n.read" class="dot"></span>
      </div>
      <p v-if="!myNotifications.length" class="text-muted">No tenés notificaciones todavía.</p>
    </div>
  </div>
</template>

<style scoped>
.notif-row{ display:flex; align-items:center; gap:12px; padding:12px 6px; border-bottom:1px solid var(--border); cursor:pointer; border-radius:8px; }
.notif-row:hover{ background:var(--paper); }
.notif-row i{ color:var(--muted); font-size:1.1rem; }
.notif-row.unread i{ color:var(--orange); }
.notif-row .dot{ width:8px; height:8px; border-radius:50%; background:var(--orange); flex-shrink:0; }
</style>
