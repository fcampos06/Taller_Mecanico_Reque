<script setup>
defineProps({ title: String })
const emit = defineEmits(['close'])
</script>

<template>
  <div class="overlay" @click.self="emit('close')">
    <div class="modal-box">
      <div class="modal-head">
        <h4>{{ title }}</h4>
        <button class="modal-close" @click="emit('close')"><i class="bi bi-x-lg"></i></button>
      </div>
      <div class="modal-body"><slot /></div>
      <div class="modal-foot" v-if="$slots.footer"><slot name="footer" /></div>
    </div>
  </div>
</template>
