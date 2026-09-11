<script setup>

import { ref } from 'vue'

import {
  useUiStore
} from '../../stores/ui'

const MAX_SIZE_MB = 5

const MAX_WIDTH = 960

const JPEG_QUALITY = 0.68

const props = defineProps({

  label: {
    type: String,
    default:
      'Arrastrá una imagen o hacé clic para adjuntar',
  },

})

const emit =
  defineEmits(['add'])

const inputEl = ref(null)

const ui = useUiStore()

function readAsDataURL(file) {

  return new Promise(
    (resolve, reject) => {

      const reader =
        new FileReader()

      reader.onload =
        () =>
          resolve(
            reader.result
          )

      reader.onerror =
        reject

      reader.readAsDataURL(
        file
      )

    }
  )

}

function loadImage(src) {

  return new Promise(
    (resolve, reject) => {

      const img =
        new Image()

      img.onload =
        () =>
          resolve(img)

      img.onerror =
        reject

      img.src = src

    }
  )

}

async function compressImage(file) {

  const originalDataUrl =
    await readAsDataURL(file)

  const img =
    await loadImage(
      originalDataUrl
    )

  const scale =
    Math.min(
      1,
      MAX_WIDTH /
      img.width
    )

  const width =
    Math.max(
      1,
      Math.round(
        img.width *
        scale
      )
    )

  const height =
    Math.max(
      1,
      Math.round(
        img.height *
        scale
      )
    )

  const canvas =
    document.createElement(
      'canvas'
    )

  canvas.width =
    width

  canvas.height =
    height

  const ctx =
    canvas.getContext(
      '2d'
    )

  ctx.drawImage(
    img,
    0,
    0,
    width,
    height
  )

  return canvas.toDataURL(
    'image/jpeg',
    JPEG_QUALITY
  )

}

async function onChange(e) {

  const files =
    Array.from(
      e.target.files || []
    )

  for (
    const file
    of files
  ) {

    const validFormat =
      [
        'image/jpeg',
        'image/png',
      ].includes(
        file.type
      )

    if (!validFormat) {

      ui.showToast(
        `"${file.name}" no es JPG ni PNG.`,
        'error'
      )

      continue

    }

    if (
      file.size >
      MAX_SIZE_MB *
      1024 *
      1024
    ) {

      ui.showToast(
        `"${file.name}" supera el tamaño máximo de ${MAX_SIZE_MB}MB.`,
        'error'
      )

      continue

    }

    try {

      const url =
        await compressImage(
          file
        )

      emit(
        'add',
        {
          name:
            file.name,

          url,
        }
      )

    } catch (error) {

      ui.showToast(
        `No se pudo procesar "${file.name}".`,
        'error'
      )

    }

  }

  e.target.value = ''

}

</script>

<template>

  <div
    class="upload-drop"
    @click="inputEl.click()"
  >

    <i
      class="bi bi-cloud-arrow-up"
    ></i>

    {{ label }}

    <div
      class="field-hint"
    >

      Formatos aceptados:
      JPG, PNG · máximo
      {{ MAX_SIZE_MB }}MB
      por imagen

    </div>

    <input
      ref="inputEl"
      type="file"
      accept="image/jpeg,image/png"
      multiple
      hidden
      @change="onChange"
    >

  </div>

</template>