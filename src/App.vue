<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from './stores/auth'
import AppShell from './components/layout/AppShell.vue'
import ToastHost from './components/layout/ToastHost.vue'
import Lightbox from './components/layout/Lightbox.vue'

const route = useRoute()
const auth = useAuthStore()

// Las vistas públicas no usan el shell con sidebar.
const isPublic = computed(() => Boolean(route.meta.public) || !auth.isLoggedIn)
</script>

<template>
  <!--
    IMPORTANTE:
    No usamos <Transition> directamente alrededor del componente de la ruta.
    Varias vistas del proyecto tienen más de un nodo raíz (contenido + modal),
    por lo que una Transition de Vue podía dejar el componente en un estado
    visual inconsistente después de salir y volver a entrar a la misma página.

    El contenedor .route-page siempre es un único elemento DOM y se recrea
    para cada ruta. Así Vue desmonta/monta la vista de forma predecible.
  -->
  <router-view v-slot="{ Component, route: viewRoute }">
    <component
      v-if="isPublic"
      :is="Component"
      :key="viewRoute.fullPath"
    />

    <AppShell v-else>
      <div class="route-page" :key="viewRoute.fullPath">
        <component :is="Component" />
      </div>
    </AppShell>
  </router-view>

  <ToastHost />
  <Lightbox />
</template>

<style scoped>
/* Animación CSS simple sobre un elemento DOM real; no interfiere con el
   ciclo de vida de las vistas ni con componentes que renderizan fragments. */
.route-page {
  animation: routePageIn .18s ease both;
}

@keyframes routePageIn {
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
