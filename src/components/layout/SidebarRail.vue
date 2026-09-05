<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import { useUiStore } from '../../stores/ui'
import { useNotificationsStore } from '../../stores/notifications'
import { useOrdersStore } from '../../stores/orders'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const ui = useUiStore()
const notif = useNotificationsStore()
const orders = useOrdersStore()

const expanded = ref(true)

const navByRole = {
  cliente: [
    { to: '/cliente/vehiculos', label: 'Mis vehículos', icon: 'bi-car-front-fill' },
    { to: '/cliente/solicitar', label: 'Solicitar servicio', icon: 'bi-clipboard2-plus-fill' },
    { to: '/cliente/citas', label: 'Mis citas', icon: 'bi-calendar-check-fill' },
    { to: '/cliente/historial', label: 'Historial', icon: 'bi-clock-history' },
    { to: '/cliente/catalogo', label: 'Catálogo y tarifas', icon: 'bi-journal-richtext' },
  ],
  admin: [
    { to: '/admin/dashboard', label: 'Dashboard', icon: 'bi-grid-1x2-fill' },
    { to: '/admin/solicitudes', label: 'Solicitudes', icon: 'bi-inbox-fill', badge: () => orders.pendingRequests.length },
    { to: '/admin/ordenes', label: 'Órdenes', icon: 'bi-card-checklist' },
    { to: '/admin/agenda', label: 'Agenda', icon: 'bi-calendar-week-fill' },
    { to: '/admin/inventario', label: 'Inventario', icon: 'bi-boxes' },
    { to: '/admin/catalogo', label: 'Catálogo', icon: 'bi-journal-richtext' },
    { to: '/admin/calificaciones', label: 'Calificaciones', icon: 'bi-star-fill' },
    { to: '/admin/mecanicos', label: 'Mecánicos', icon: 'bi-people-fill' },
    { to: '/admin/usuarios', label: 'Usuarios', icon: 'bi-person-lines-fill' },
    { to: '/admin/reportes', label: 'Reportes', icon: 'bi-bar-chart-fill' },
  ],
  mecanico: [
    { to: '/mecanico/ordenes', label: 'Mis órdenes', icon: 'bi-tools' },
  ],
}
// RF-30: notificaciones visibles para los 3 roles
const commonItems = [
  { to: '/notificaciones', label: 'Notificaciones', icon: 'bi-bell-fill', badge: () => notif.unreadCount(auth.currentUser?.id) },
]

const items = computed(() => [...(navByRole[auth.currentUser?.role] || []), ...commonItems])
const avatarInitial = computed(() => (auth.currentUser?.name || '').split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase())
const roleLabel = computed(() => ({ cliente: 'Cliente', admin: 'Administrador', mecanico: 'Mecánico' }[auth.currentUser?.role] || ''))

function logout() {
  auth.logout()
  router.push('/login')
}
</script>

<template>
  <aside class="rail" :class="{ expanded, 'mobile-open': ui.mobileNavOpen }">
    <button class="rail-toggle" @click="expanded = !expanded">
      <i :class="expanded ? 'bi bi-chevron-left' : 'bi bi-chevron-right'"></i>
    </button>

    <div class="rail-brand"><i class="bi bi-wrench-adjustable-circle-fill"></i> <span>Taller CCM</span></div>

    <div class="nav-label">{{ roleLabel }}</div>
    <router-link
      v-for="item in items" :key="item.to" :to="item.to"
      class="rail-link" :class="{ active: route.path.startsWith(item.to) }"
      @click="ui.mobileNavOpen = false"
    >
      <i :class="'bi ' + item.icon"></i><span>{{ item.label }}</span>
      <span v-if="item.badge && item.badge() > 0" class="rail-badge">{{ item.badge() }}</span>
    </router-link>

    <div class="rail-foot">
      <router-link to="/perfil" class="avatar-row" @click="ui.mobileNavOpen = false">
        <div class="avatar">{{ avatarInitial }}</div>
        <div class="avatar-info">
          <div class="name">{{ auth.currentUser?.name }}</div>
          <div class="role">Ver mi perfil</div>
        </div>
      </router-link>
      <button class="logout-btn" @click="logout"><i class="bi bi-box-arrow-right"></i> <span>Cerrar sesión</span></button>
    </div>
  </aside>
</template>

<style scoped>
.rail{
  width:78px; flex-shrink:0; background:var(--asphalt); color:#fff; display:flex; flex-direction:column;
  padding:20px 0; transition:width .22s cubic-bezier(.4,0,.2,1); position:relative; z-index:40; height:100vh; position:sticky; top:0;
}
.rail.expanded{ width:246px; }
.rail-brand{ display:flex; align-items:center; gap:12px; padding:0 22px 20px; border-bottom:1px solid rgba(255,255,255,.1); margin-bottom:14px; }
.rail-brand i{ color:var(--orange); font-size:1.55rem; flex-shrink:0; }
.rail-brand span{ font-family:'Oswald',sans-serif; font-weight:700; font-size:1.25rem; white-space:nowrap; opacity:0; transition:opacity .15s; }
.rail.expanded .rail-brand span{ opacity:1; }
.rail-toggle{
  position:absolute; top:22px; right:-13px; width:26px; height:26px; border-radius:50%;
  background:var(--orange); color:#fff; border:3px solid var(--paper); display:flex; align-items:center; justify-content:center;
  font-size:.7rem; box-shadow:0 2px 6px rgba(0,0,0,.25);
}
.nav-label{ font-family:'Oswald',sans-serif; font-size:.68rem; letter-spacing:.13em; text-transform:uppercase; color:#7C848D; font-weight:600;
  padding:0 22px; margin:14px 0 8px; white-space:nowrap; opacity:0; height:0; overflow:hidden; transition:opacity .15s; }
.rail.expanded .nav-label{ opacity:1; height:auto; }
.rail-link{
  display:flex; align-items:center; gap:16px; padding:12px 22px; color:#AEB6BE; text-decoration:none;
  border-left:3px solid transparent; position:relative; white-space:nowrap;
}
.rail-link i{ font-size:1.15rem; width:20px; text-align:center; flex-shrink:0; }
.rail-link span{ opacity:0; transition:opacity .12s; font-size:.9rem; font-weight:500; }
.rail.expanded .rail-link span{ opacity:1; }
.rail-link:hover{ background:rgba(255,255,255,.05); color:#fff; }
.rail-link.active{ background:rgba(255,90,31,.13); color:#fff; border-left-color:var(--orange); }
.rail-link.active i{ color:var(--orange); }
.rail-badge{ margin-left:auto; background:var(--orange); color:#fff; font-size:.68rem; font-weight:700; border-radius:20px; padding:1px 7px; opacity:1 !important; }
.rail:not(.expanded) .rail-badge{ position:absolute; top:6px; right:14px; }
.rail-foot{ margin-top:auto; padding:14px 14px 0; border-top:1px solid rgba(255,255,255,.1); }
.avatar-row{ display:flex; align-items:center; gap:10px; padding:6px 8px 14px; }
.avatar{ width:36px; height:36px; border-radius:50%; background:var(--orange); color:#fff; font-weight:700;
  display:flex; align-items:center; justify-content:center; flex-shrink:0; font-family:'Oswald',sans-serif; }
.avatar-info{ opacity:0; transition:opacity .12s; overflow:hidden; }
.rail.expanded .avatar-info{ opacity:1; }
.avatar-info .name{ font-size:.84rem; font-weight:600; white-space:nowrap; color:#fff; }
.avatar-info .role{ font-size:.7rem; color:#8A929A; white-space:nowrap; }
.logout-btn{ width:100%; background:none; border:1px solid rgba(255,255,255,.14); color:#C7CDD3; border-radius:8px;
  padding:9px; font-size:.8rem; font-weight:600; display:flex; align-items:center; justify-content:center; gap:8px; margin-top:2px;}
.logout-btn span{ opacity:0; width:0; overflow:hidden; }
.rail.expanded .logout-btn span{ opacity:1; width:auto; }
.logout-btn:hover{ border-color:var(--orange); color:#fff; }

@media (max-width:900px){
  .rail{ position:fixed; left:-260px; top:0; height:100%; width:240px !important; }
  .rail.mobile-open{ left:0; }
  .rail-toggle{ display:none; }
}
</style>
