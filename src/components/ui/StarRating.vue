<script setup>
const props = defineProps({
  modelValue: { type: Number, default: 0 },
  readonly: { type: Boolean, default: false },
})
const emit = defineEmits(['update:modelValue'])
</script>

<template>
  <span class="stars" :class="{ clickable: !readonly }">
    <i
      v-for="n in 5" :key="n"
      class="bi" :class="n <= modelValue ? 'bi-star-fill filled' : 'bi-star'"
      @click="!readonly && emit('update:modelValue', n)"
    ></i>
  </span>
</template>
