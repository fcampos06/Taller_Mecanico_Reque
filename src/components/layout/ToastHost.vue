<script setup>
import { useUiStore } from '../../stores/ui'
const ui = useUiStore()
</script>

<template>
  <div class="toast-wrap">
    <transition-group name="toast-t">
      <div class="toast" v-for="t in ui.toasts" :key="t.id">
        <i :class="t.tone === 'error' ? 'bi bi-x-circle-fill' : 'bi bi-check-circle-fill'"></i> {{ t.message }}
      </div>
    </transition-group>
  </div>
</template>
