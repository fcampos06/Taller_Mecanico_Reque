<script setup>
import { useUiStore } from '../../stores/ui'
const ui = useUiStore()
</script>

<template>
  <div class="lightbox-overlay" v-if="ui.lightboxUrl" @click="ui.closeLightbox()">
    <img :src="ui.lightboxUrl">
    <button class="lightbox-close" @click="ui.closeLightbox()"><i class="bi bi-x-lg"></i></button>
  </div>
</template>

<style scoped>
.lightbox-overlay{ position:fixed; inset:0; background:rgba(10,12,15,.88); z-index:400; display:flex; align-items:center; justify-content:center; padding:40px; cursor:zoom-out; }
.lightbox-overlay img{ max-width:100%; max-height:100%; border-radius:10px; box-shadow:0 20px 60px rgba(0,0,0,.5); }
.lightbox-close{ position:fixed; top:20px; right:24px; background:rgba(255,255,255,.12); border:none; color:#fff; width:40px; height:40px; border-radius:50%; font-size:1.1rem; }
</style>
