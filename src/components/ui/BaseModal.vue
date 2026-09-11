<script setup>
defineProps({
  title: String
})

const emit = defineEmits(['close'])
</script>

<template>
  <div class="overlay" @click.self="emit('close')">
    <div class="modal-box">

      <!-- Encabezado -->
      <div class="modal-head">
        <h4>{{ title }}</h4>

        <button
          class="modal-close"
          type="button"
          aria-label="Cerrar"
          @click="emit('close')"
        >
          <i class="bi bi-x-lg"></i>
        </button>
      </div>

      <!-- Contenido con scroll -->
      <div class="modal-body">
        <slot />
      </div>

      <!-- Botones siempre visibles -->
      <div
        v-if="$slots.footer"
        class="modal-foot"
      >
        <slot name="footer" />
      </div>

    </div>
  </div>
</template>

<style scoped>
/* Fondo del modal */
.overlay {
  position: fixed;
  inset: 0;

  display: flex;
  align-items: center;
  justify-content: center;

  padding: 20px;

  background: rgba(15, 17, 20, 0.5);
  backdrop-filter: blur(2px);

  z-index: 200;

  /* Evita problemas con pantallas pequeñas */
  overflow: hidden;
}

/* Contenedor principal */
.modal-box {
  width: 100%;
  max-width: 560px;

  /* Nunca será más alto que la pantalla */
  max-height: calc(100dvh - 40px);

  background: #fff;
  border-radius: 16px;

  box-shadow: 0 30px 70px rgba(0, 0, 0, 0.35);

  display: flex;
  flex-direction: column;

  /* El scroll lo manejará únicamente el body */
  overflow: hidden;

  animation: modalIn 0.18s ease-out;
}

/* Animación */
@keyframes modalIn {
  from {
    opacity: 0;
    transform: translateY(10px) scale(0.98);
  }

  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Cabecera */
.modal-head {
  flex-shrink: 0;

  padding: 18px 24px;

  border-bottom: 1px solid var(--border);

  display: flex;
  justify-content: space-between;
  align-items: center;

  background: #fff;
}

.modal-head h4 {
  margin: 0;

  font-size: 1.2rem;
  line-height: 1.25;
}

/* Botón cerrar */
.modal-close {
  width: 36px;
  height: 36px;

  flex-shrink: 0;

  display: flex;
  align-items: center;
  justify-content: center;

  padding: 0;

  border: none;
  border-radius: 8px;

  background: transparent;
  color: var(--muted);

  font-size: 1.15rem;

  transition:
    background 0.15s ease,
    color 0.15s ease;
}

.modal-close:hover {
  background: var(--paper);
  color: var(--ink);
}

/* Parte que puede desplazarse */
.modal-body {
  flex: 1;

  min-height: 0;

  padding: 22px 24px;

  overflow-y: auto;
  overflow-x: hidden;

  overscroll-behavior: contain;
}

/* Scroll más limpio */
.modal-body::-webkit-scrollbar {
  width: 7px;
}

.modal-body::-webkit-scrollbar-track {
  background: transparent;
}

.modal-body::-webkit-scrollbar-thumb {
  background: var(--border);
  border-radius: 10px;
}

/* Footer siempre abajo */
.modal-foot {
  flex-shrink: 0;

  padding: 16px 24px 20px;

  border-top: 1px solid var(--border);

  background: #fff;
}

/* -----------------------------
   TABLET Y TELÉFONOS
------------------------------ */
@media (max-width: 600px) {
  .overlay {
    padding: 10px;

    /*
      Si el teclado del teléfono aparece,
      permite que el modal aproveche mejor
      el espacio disponible.
    */
    align-items: flex-start;
  }

  .modal-box {
    max-width: 100%;

    max-height: calc(100dvh - 20px);

    margin-top: 0;

    border-radius: 14px;
  }

  .modal-head {
    padding: 16px 18px;
  }

  .modal-head h4 {
    font-size: 1.1rem;
  }

  .modal-body {
    padding: 18px;
  }

  .modal-foot {
    padding: 14px 18px 18px;
  }
}

/* Pantallas especialmente bajas */
@media (max-height: 600px) {
  .overlay {
    align-items: flex-start;
    padding-top: 10px;
    padding-bottom: 10px;
  }

  .modal-box {
    max-height: calc(100dvh - 20px);
  }

  .modal-head {
    padding-top: 13px;
    padding-bottom: 13px;
  }

  .modal-body {
    padding-top: 16px;
    padding-bottom: 16px;
  }

  .modal-foot {
    padding-top: 12px;
    padding-bottom: 14px;
  }
}
</style>