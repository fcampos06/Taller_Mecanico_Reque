<script setup>
import { ref, reactive } from 'vue'
import { useAuthStore } from '../../stores/auth'
import { useOrdersStore } from '../../stores/orders'
import { useUiStore } from '../../stores/ui'
import BaseModal from '../../components/ui/BaseModal.vue'

const auth = useAuthStore()
const orders = useOrdersStore()
const ui = useUiStore()

const modalOpen = ref(false)
const form = reactive({ name: '', email: '', phone: '' })
function openNew() { Object.assign(form, { name: '', email: '', phone: '' }); modalOpen.value = true }
function save() {
  if (!form.name || !form.email) { ui.showToast('Nombre y correo son obligatorios.', 'error'); return }
  const res = auth.createMechanic(form)
  if (!res.ok) { ui.showToast(res.message, 'error'); return }
  modalOpen.value = false
  ui.showToast(`Cuenta creada para ${res.user.name} ✔ (contraseña temporal: taller2026)`)
}
function toggle(m) {
  auth.toggleMechanicActive(m.id)
  ui.showToast(m.active ? 'Mecánico desactivado' : 'Mecánico reactivado')
}
</script>

<template>
  <div class="card">
    <div class="card-body">
      <div class="flex-between" style="margin-bottom:18px;">
        <h4 class="mt-0 mb-0">Cuentas de mecánicos</h4>
        <button class="btn btn-primary btn-sm" @click="openNew"><i class="bi bi-person-plus-fill"></i> Nueva cuenta</button>
      </div>
      <table>
        <thead><tr><th>Nombre</th><th>Correo</th><th>Teléfono</th><th>Carga activa</th><th>Estado</th><th></th></tr></thead>
        <tbody>
          <tr v-for="m in auth.mechanics" :key="m.id">
            <td>{{ m.name }}</td>
            <td class="mono">{{ m.email }}</td>
            <td>{{ m.phone }}</td>
            <td>{{ orders.workloadByMechanic(m.id) }} órdenes</td>
            <td><span class="badge" :class="m.active ? 'b-proceso' : 'b-rechazado'">{{ m.active ? 'Activo' : 'Desactivado' }}</span></td>
            <td class="text-right"><button class="btn btn-ghost btn-sm" @click="toggle(m)">{{ m.active ? 'Desactivar' : 'Reactivar' }}</button></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  <BaseModal v-if="modalOpen" title="Nueva cuenta de mecánico" @close="modalOpen = false">
    <div class="form-stack">
      <div class="field"><label>Nombre completo</label><input v-model="form.name" type="text"></div>
      <div class="field"><label>Correo (@tallerccm.com)</label><input v-model="form.email" type="text"></div>
      <div class="field"><label>Teléfono</label><input v-model="form.phone" type="text"></div>
      <p class="field-hint">La contraseña temporal será "taller2026"; el mecánico podrá cambiarla luego desde su perfil.</p>
    </div>
    <template #footer><button class="btn btn-primary btn-block" @click="save">Crear cuenta</button></template>
  </BaseModal>
</template>
