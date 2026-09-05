<script setup>
import { useCatalogStore } from '../../stores/catalog'
const catalog = useCatalogStore()
</script>

<template>
  <div class="grid grid-2">
    <div class="card" v-for="s in catalog.services" :key="s.id">
      <div class="card-body">
        <div class="flex-between">
          <h4 style="margin:0;">{{ s.name }}</h4>
          <span class="badge b-diag mono">desde ₡{{ s.rate.toLocaleString('es-CR') }}</span>
        </div>
        <p class="text-muted" style="margin-top:8px;font-size:.88rem;">{{ s.description }}</p>
      </div>
    </div>
  </div>
</template>
