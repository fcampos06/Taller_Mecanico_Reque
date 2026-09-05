<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from './stores/auth'
import AppShell from './components/layout/AppShell.vue'
import ToastHost from './components/layout/ToastHost.vue'
import Lightbox from './components/layout/Lightbox.vue'

const route = useRoute()
const auth = useAuthStore()

// Una ruta solamente es pública si está marcada como pública
// en el router.
//
// IMPORTANTE:
// No ponemos "!auth.isLoggedIn" aquí.
//
// Cuando cerramos sesión, currentUser pasa a null antes de que
// el router termine de ir hacia /login.
//
// Si durante ese instante intentamos renderizar Vehículos,
// Citas, Historial, etc., esas vistas intentan acceder a:
//
// auth.currentUser.id
//
// y como currentUser es null, Vue genera un error y puede
// quedar la pantalla completamente blanca.
const isPublic = computed(() => Boolean(route.meta.public))
</script>

<template>
  <router-view v-slot="{ Component, route: viewRoute }">

    <!-- ========================================= -->
    <!-- PÁGINAS PÚBLICAS                         -->
    <!-- Login, registro y recuperar contraseña   -->
    <!-- ========================================= -->

    <component
      v-if="isPublic"
      :is="Component"
      :key="viewRoute.fullPath"
    />


    <!-- ========================================= -->
    <!-- PÁGINAS PRIVADAS                         -->
    <!-- ========================================= -->

    <!--
      Solo mostramos una página privada cuando
      realmente existe una sesión iniciada.

      Al cerrar sesión auth.isLoggedIn se vuelve
      false inmediatamente, por lo que Vue deja
      de renderizar la página privada ANTES de que
      currentUser = null pueda provocar errores.
    -->

    <AppShell v-else-if="auth.isLoggedIn">
      <div
        class="route-page"
        :key="viewRoute.fullPath"
      >
        <component :is="Component" />
      </div>
    </AppShell>


    <!-- ========================================= -->
    <!-- TRANSICIÓN AL CERRAR SESIÓN              -->
    <!-- ========================================= -->

    <!--
      Este elemento solamente puede aparecer durante
      unos milisegundos mientras el router cambia de
      la página privada hacia /login.

      Lo importante es que NO renderizamos nuevamente
      Vehículos, Citas, Historial, etc. sin usuario.
    -->

    <div
      v-else
      class="session-exit"
      aria-hidden="true"
    ></div>

  </router-view>


  <!-- Elementos globales de la aplicación -->
  <ToastHost />
  <Lightbox />
</template>


<style scoped>

/* Animación al cambiar de página */
.route-page {
  animation: routePageIn .18s ease both;
}


/*
  Pantalla temporal utilizada únicamente mientras
  se termina de cerrar la sesión.
*/
.session-exit {
  min-height: 100vh;
  background: var(--paper);
}


/* Animación de entrada de las páginas */
@keyframes routePageIn {

  from {
    opacity: 0;
    transform: translateY(6px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }

}

</style>