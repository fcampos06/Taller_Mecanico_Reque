<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useUiStore } from '../../stores/ui'

defineProps({ title: String, subtitle: String })
const ui = useUiStore()
const route = useRoute()
</script>

<template>
  <div class="topbar">
    <div class="flex gap-12" style="align-items:center;">
      <button class="hamburger" @click="ui.mobileNavOpen = !ui.mobileNavOpen"><i class="bi bi-list"></i></button>
      <div>
        <h1>{{ title }}</h1>
        <div class="sub">{{ subtitle }}</div>
      </div>
    </div>
    <span class="env-chip"><span class="dot"></span> Prototipo — Vue 3 · Datos simulados</span>
  </div>
</template>

<style scoped>
.topbar{
  background:#fff; border-bottom:1px solid var(--border); padding:20px 34px; display:flex; align-items:center; justify-content:space-between; gap:16px;
  position:sticky; top:0; z-index:20;
}
.topbar h1{ font-size:1.5rem; font-weight:600; margin:0; letter-spacing:.005em; }
.sub{ color:var(--muted); font-size:.84rem; margin-top:2px; }
.env-chip{ font-size:.7rem; font-weight:600; color:var(--muted); background:var(--paper); border:1px solid var(--border);
  padding:5px 12px; border-radius:20px; white-space:nowrap; display:flex; align-items:center; gap:6px; }
.env-chip .dot{ width:6px; height:6px; border-radius:50%; background:var(--green); }
.hamburger{ display:none; background:none; border:none; font-size:1.3rem; color:var(--ink); }
@media (max-width:900px){ .hamburger{ display:block; } .topbar{ padding:16px 18px; } }
</style>
