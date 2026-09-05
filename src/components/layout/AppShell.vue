<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import SidebarRail from './SidebarRail.vue'
import TopBar from './TopBar.vue'
import { useUiStore } from '../../stores/ui'

const route = useRoute()
const ui = useUiStore()

const META = {
  'cliente-vehiculos': ['Mis vehículos', 'Vehículos registrados en tu cuenta'],
  'cliente-solicitar': ['Solicitar servicio', 'Contanos qué le pasa a tu vehículo'],
  'cliente-citas': ['Mis citas', 'Citas agendadas en el taller'],
  'cliente-orden': ['Seguimiento de reparación', 'Detalle, presupuesto y avance de tu orden'],
  'cliente-historial': ['Historial', 'Mantenimientos y reparaciones anteriores'],
  'cliente-catalogo': ['Catálogo y tarifas', 'Servicios que ofrece el taller'],
  notificaciones: ['Notificaciones', 'Avisos y actualizaciones de tus órdenes'],
  'admin-dashboard': ['Dashboard', 'Resumen operativo y financiero del taller'],
  'admin-solicitudes': ['Solicitudes entrantes', 'Convertí solicitudes en órdenes de trabajo'],
  'admin-ordenes': ['Órdenes', 'Diagnósticos, presupuestos y estado de cada reparación'],
  'admin-orden': ['Detalle de orden', 'Diagnóstico, presupuesto, evidencia y seguimiento'],
  'admin-agenda': ['Agenda', 'Citas programadas del taller'],
  'admin-inventario': ['Inventario', 'Repuestos e insumos del taller'],
  'admin-catalogo': ['Catálogo de servicios', 'Servicios y tarifas visibles para los clientes'],
  'admin-calificaciones': ['Calificaciones', 'Opiniones de los clientes sobre el servicio'],
  'admin-mecanicos': ['Mecánicos', 'Cuentas y carga de trabajo del equipo técnico'],
  'admin-usuarios': ['Usuarios', 'Datos de contacto de clientes y mecánicos registrados'],
  'admin-reportes': ['Reportes', 'Indicadores financieros por periodo'],
  'mecanico-ordenes': ['Mis órdenes', 'Órdenes de trabajo asignadas a vos'],
  'mecanico-diagnostico': ['Diagnóstico de orden', 'Registrá hallazgos, checklist y avance'],
  perfil: ['Mi perfil', 'Tus datos de contacto'],
}

const title = computed(() => META[route.name]?.[0] || 'Taller CCM')
const subtitle = computed(() => META[route.name]?.[1] || '')
</script>

<template>
  <div class="app-shell">
    <SidebarRail />
    <div class="main">
      <TopBar :title="title" :subtitle="subtitle" />
      <div class="content">
        <slot />
      </div>
    </div>
    <div v-if="ui.mobileNavOpen" class="mobile-scrim" @click="ui.mobileNavOpen = false"></div>
  </div>
</template>

<style scoped>
.app-shell{ display:flex; min-height:100vh; }
.main{ flex:1; min-width:0; }
.content{ padding:30px 34px 70px; max-width:1280px; }
.mobile-scrim{ position:fixed; inset:0; background:rgba(0,0,0,.4); z-index:39; }
</style>
