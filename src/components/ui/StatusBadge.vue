<script setup>
import { STATUS_LABEL, STATUS_BADGE } from '../../stores/orders'
const props = defineProps({ status: { type: String, required: true } })
</script>

<template>
  <span class="badge" :class="STATUS_BADGE[status] || 'b-diag'">{{ STATUS_LABEL[status] || status }}</span>
</template>
