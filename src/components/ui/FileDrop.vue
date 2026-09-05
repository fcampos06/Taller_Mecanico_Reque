<script setup>
import { ref } from 'vue'
import { useUiStore } from '../../stores/ui'
// Simula adjuntar fotografías (RF-02/RF-14): guarda nombre + preview local (URL.createObjectURL).
// No hay backend real, así que las "fotos" solo viven en memoria durante la sesión.
const MAX_SIZE_MB = 5
const props = defineProps({ label: { type: String, default: 'Arrastrá una imagen o hacé clic para adjuntar' } })
const emit = defineEmits(['add'])
const inputEl = ref(null)
const ui = useUiStore()

function onChange(e) {
  const files = Array.from(e.target.files || [])
  files.forEach(file => {
    const validFormat = ['image/jpeg', 'image/png'].includes(file.type)
    if (!validFormat) { ui.showToast(`"${file.name}" no es JPG ni PNG.`, 'error'); return }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) { ui.showToast(`"${file.name}" supera el tamaño máximo de ${MAX_SIZE_MB}MB.`, 'error'); return }
    emit('add', { name: file.name, url: URL.createObjectURL(file) })
  })
  e.target.value = ''
}
</script>

<template>
  <div class="upload-drop" @click="inputEl.click()">
    <i class="bi bi-cloud-arrow-up"></i> {{ label }}
    <div class="field-hint">Formatos aceptados: JPG, PNG · máximo {{ MAX_SIZE_MB }}MB por imagen</div>
    <input ref="inputEl" type="file" accept="image/jpeg,image/png" multiple hidden @change="onChange">
  </div>
</template>
