<script setup>
import { ref, reactive } from 'vue'
import { useCatalogStore } from '../../stores/catalog'
import { useUiStore } from '../../stores/ui'
import BaseModal from '../../components/ui/BaseModal.vue'

const catalog = useCatalogStore()
const ui = useUiStore()

const modalOpen = ref(false)
const editingId = ref(null)
const form = reactive({ name: '', description: '', rate: 0 })
function openNew() { editingId.value = null; Object.assign(form, { name: '', description: '', rate: 0 }); modalOpen.value = true }
function openEdit(s) { editingId.value = s.id; Object.assign(form, s); modalOpen.value = true }
function save() {
  if (!form.name) { ui.showToast('El nombre del servicio es obligatorio.', 'error'); return }
  if (editingId.value) catalog.updateService(editingId.value, { ...form, rate: Number(form.rate) })
  else catalog.addService(form)
  modalOpen.value = false
  ui.showToast('Catálogo actualizado ✔')
}
function remove(s) {
  if (!confirm(`¿Eliminar "${s.name}" del catálogo?`)) return
  catalog.removeService(s.id)
  ui.showToast('Servicio eliminado')
}
</script>

<template>
  <div class="card">
    <div class="card-body">
      <div class="flex-between" style="margin-bottom:18px;">
        <h4 class="mt-0 mb-0">Catálogo de servicios</h4>
        <button class="btn btn-primary btn-sm" @click="openNew"><i class="bi bi-plus-lg"></i> Nuevo servicio</button>
      </div>
      <table>
        <thead><tr><th>Servicio</th><th>Descripción</th><th class="text-right">Tarifa</th><th></th></tr></thead>
        <tbody>
          <tr v-for="s in catalog.services" :key="s.id">
            <td>{{ s.name }}</td>
            <td class="text-muted">{{ s.description }}</td>
            <td class="mono text-right">₡{{ s.rate.toLocaleString('es-CR') }}</td>
            <td class="text-right">
              <button class="btn btn-ghost btn-sm" @click="openEdit(s)"><i class="bi bi-pencil"></i></button>
              <button class="btn btn-danger-ghost btn-sm" @click="remove(s)"><i class="bi bi-trash"></i></button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  <BaseModal v-if="modalOpen" :title="editingId ? 'Editar servicio' : 'Nuevo servicio'" @close="modalOpen = false">
    <div class="form-stack">
      <div class="field"><label>Nombre</label><input v-model="form.name" type="text"></div>
      <div class="field"><label>Descripción</label><textarea rows="3" v-model="form.description"></textarea></div>
      <div class="field"><label>Tarifa referencial</label><input v-model.number="form.rate" type="number"></div>
    </div>
    <template #footer><button class="btn btn-primary btn-block" @click="save">Guardar</button></template>
  </BaseModal>
</template>
