import { createRouter, createWebHashHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useOrdersStore } from '../stores/orders'
import { toOrderId } from '../utils/format'

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', name: 'login', component: () => import('../views/auth/LoginView.vue'), meta: { public: true } },
  { path: '/registro', name: 'registro', component: () => import('../views/auth/RegisterView.vue'), meta: { public: true } },
  { path: '/recuperar', name: 'recuperar', component: () => import('../views/auth/ForgotPasswordView.vue'), meta: { public: true } },

  { path: '/perfil', name: 'perfil', component: () => import('../views/ProfileView.vue') },
  { path: '/notificaciones', name: 'notificaciones', component: () => import('../views/NotificationsView.vue') },

  // ---- Cliente ----
  { path: '/cliente/vehiculos', name: 'cliente-vehiculos', component: () => import('../views/client/VehiclesView.vue'), meta: { roles: ['cliente'] } },
  { path: '/cliente/solicitar', name: 'cliente-solicitar', component: () => import('../views/client/RequestServiceView.vue'), meta: { roles: ['cliente'] } },
  { path: '/cliente/citas', name: 'cliente-citas', component: () => import('../views/client/AppointmentsView.vue'), meta: { roles: ['cliente'] } },
  { path: '/cliente/orden/:id', name: 'cliente-orden', component: () => import('../views/client/RepairTrackingView.vue'), meta: { roles: ['cliente'] }, props: true },
  { path: '/cliente/historial', name: 'cliente-historial', component: () => import('../views/client/HistoryView.vue'), meta: { roles: ['cliente'] } },
  { path: '/cliente/catalogo', name: 'cliente-catalogo', component: () => import('../views/client/CatalogView.vue'), meta: { roles: ['cliente'] } },

  // ---- Administrador ----
  { path: '/admin/dashboard', name: 'admin-dashboard', component: () => import('../views/admin/DashboardView.vue'), meta: { roles: ['admin'] } },
  { path: '/admin/solicitudes', name: 'admin-solicitudes', component: () => import('../views/admin/RequestsInboxView.vue'), meta: { roles: ['admin'] } },
  { path: '/admin/ordenes', name: 'admin-ordenes', component: () => import('../views/admin/OrdersView.vue'), meta: { roles: ['admin'] } },
  { path: '/admin/orden/:id', name: 'admin-orden', component: () => import('../views/admin/OrderDetailView.vue'), meta: { roles: ['admin'] }, props: true },
  { path: '/admin/agenda', name: 'admin-agenda', component: () => import('../views/admin/AgendaView.vue'), meta: { roles: ['admin'] } },
  { path: '/admin/inventario', name: 'admin-inventario', component: () => import('../views/admin/InventoryView.vue'), meta: { roles: ['admin'] } },
  { path: '/admin/catalogo', name: 'admin-catalogo', component: () => import('../views/admin/CatalogAdminView.vue'), meta: { roles: ['admin'] } },
  { path: '/admin/calificaciones', name: 'admin-calificaciones', component: () => import('../views/admin/RatingsView.vue'), meta: { roles: ['admin'] } },
  { path: '/admin/mecanicos', name: 'admin-mecanicos', component: () => import('../views/admin/MechanicsView.vue'), meta: { roles: ['admin'] } },
  { path: '/admin/usuarios', name: 'admin-usuarios', component: () => import('../views/admin/UsersView.vue'), meta: { roles: ['admin'] } },
  { path: '/admin/reportes', name: 'admin-reportes', component: () => import('../views/admin/ReportsView.vue'), meta: { roles: ['admin'] } },

  // ---- Mecánico ----
  { path: '/mecanico/ordenes', name: 'mecanico-ordenes', component: () => import('../views/mechanic/MyOrdersView.vue'), meta: { roles: ['mecanico'] } },
  { path: '/mecanico/orden/:id', name: 'mecanico-diagnostico', component: () => import('../views/mechanic/DiagnosticView.vue'), meta: { roles: ['mecanico'] }, props: true },

  { path: '/:pathMatch(.*)*', redirect: '/login' },
]

const router = createRouter({
  // Hash history evita rutas vacías/404 al recargar cuando el prototipo se publica en un hosting estático.
  history: createWebHashHistory(),
  routes,
  scrollBehavior() { return { top: 0 } },
})

const HOME_BY_ROLE = { cliente: '/cliente/vehiculos', admin: '/admin/dashboard', mecanico: '/mecanico/ordenes' }

router.beforeEach((to) => {
  const auth = useAuthStore()

  if (to.meta.public) {
    // si ya inició sesión, no tiene sentido volver a login/registro
    if (auth.isLoggedIn && (to.name === 'login' || to.name === 'registro')) {
      return HOME_BY_ROLE[auth.currentUser.role]
    }
    return true
  }

  if (!auth.isLoggedIn) return { name: 'login' }

  if (to.meta.roles && !to.meta.roles.includes(auth.currentUser.role)) {
    return HOME_BY_ROLE[auth.currentUser.role]
  }

  // RF-18: además del rol, proteger la propiedad/asignación de órdenes específicas.
  if (to.name === 'cliente-orden') {
    const order = useOrdersStore().orderById(toOrderId(to.params.id))
    if (!order || order.clientId !== auth.currentUser.id) return HOME_BY_ROLE.cliente
  }
  if (to.name === 'mecanico-diagnostico') {
    const order = useOrdersStore().orderById(toOrderId(to.params.id))
    if (!order || order.mechanicId !== auth.currentUser.id) return HOME_BY_ROLE.mecanico
  }

  return true
})

export default router
