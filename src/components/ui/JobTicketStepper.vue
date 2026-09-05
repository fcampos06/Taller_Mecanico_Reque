<script setup>
import { computed } from 'vue'

// Línea de tiempo de estados de una orden (RF-13/RF-15): pasos fijos "felices" del proceso.
const STEPS = ['diagnostico', 'presupuesto', 'aprobado', 'proceso', 'listo', 'entregado']
const STEP_LABELS = { diagnostico: 'Diagnóstico', presupuesto: 'Presupuesto', aprobado: 'Aprobado', proceso: 'En proceso', listo: 'Listo', entregado: 'Entregado' }

const props = defineProps({ status: { type: String, required: true } })

const currentIndex = computed(() => {
  if (props.status === 'rechazado' || props.status === 'espera') return STEPS.indexOf('presupuesto')
  const i = STEPS.indexOf(props.status)
  return i === -1 ? 0 : i
})
const fillWidth = computed(() => {
  const n = STEPS.length - 1
  const pct = (currentIndex.value / n) * 100
  return `calc(${pct}% - ${(pct / 100) * 32}px)`
})
</script>

<template>
  <div class="stepper">
    <div class="fill" :style="{ width: fillWidth }"></div>
    <div
      class="step" v-for="(s, i) in STEPS" :key="s"
      :class="{ done: i < currentIndex, current: i === currentIndex }"
    >
      <div class="dot"><i class="bi bi-check-lg" v-if="i < currentIndex"></i><template v-else>{{ i + 1 }}</template></div>
      <div class="step-label">{{ STEP_LABELS[s] }}</div>
    </div>
  </div>
</template>

<style scoped>
.stepper{ display:flex; justify-content:space-between; margin:26px 0 4px; position:relative; }
.stepper::before{ content:""; position:absolute; top:16px; left:16px; right:16px; height:3px; background:var(--border); z-index:0; border-radius:3px; }
.fill{ position:absolute; top:16px; left:16px; height:3px; background:linear-gradient(90deg,var(--orange),var(--yellow)); z-index:0; border-radius:3px; transition:width .5s cubic-bezier(.3,.8,.3,1); }
.step{ position:relative; z-index:1; text-align:center; flex:1; }
.step .dot{ width:34px; height:34px; border-radius:50%; background:#fff; border:3px solid var(--border); margin:0 auto 8px;
  display:flex; align-items:center; justify-content:center; color:var(--muted); font-size:.85rem; font-weight:700; font-family:'Oswald',sans-serif; }
.step.done .dot{ background:var(--orange); border-color:var(--orange); color:#fff; }
.step.current .dot{ background:var(--asphalt); border-color:var(--asphalt); color:#fff; box-shadow:0 0 0 5px rgba(20,23,27,.1); animation:pulse 1.8s infinite; }
@keyframes pulse{ 0%{box-shadow:0 0 0 0 rgba(20,23,27,.18);} 70%{box-shadow:0 0 0 8px rgba(20,23,27,0);} 100%{box-shadow:0 0 0 0 rgba(20,23,27,0);} }
.step-label{ font-size:.72rem; color:var(--muted); font-weight:600; text-transform:uppercase; letter-spacing:.03em; }
.step.done .step-label, .step.current .step-label{ color:var(--ink); }
</style>
