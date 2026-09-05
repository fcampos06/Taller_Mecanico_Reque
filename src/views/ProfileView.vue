<script setup>
import { computed, reactive } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useUiStore } from '../stores/ui'
import { useVehiclesStore } from '../stores/vehicles'

const auth = useAuthStore()
const ui = useUiStore()
const vehiclesStore = useVehiclesStore()

const form = reactive({
  name: auth.currentUser.name,
  phone: auth.currentUser.phone,
  email: auth.currentUser.email,
})

// RF-20: el usuario edita sus propios datos de contacto (no el rol)
function save() {
  Object.assign(auth.currentUser, { name: form.name, phone: form.phone, email: form.email })
  ui.showToast('Datos de perfil actualizados ✔')
}

const roleLabel = { cliente: 'Cliente', admin: 'Administrador', mecanico: 'Mecánico' }[auth.currentUser.role]

// RF-24/HU-48: listado de recordatorios pendientes de todos los vehículos, accesible desde el perfil
const reminders = computed(() => {
  if (auth.currentUser.role !== 'cliente') return []
  return vehiclesStore.byOwner(auth.currentUser.id).flatMap(v => vehiclesStore.remindersFor(v.id))
})
</script>

<template>
  <div style="max-width:560px;">
    <div class="card">
      <div class="card-body form-stack">
        <div class="flex-between" style="margin-bottom:6px;">
          <h4 class="mt-0 mb-0">Mis datos</h4>
          <span class="badge b-diag">{{ roleLabel }}</span>
        </div>
        <p class="field-hint" style="margin-bottom:18px;">Tu rol no puede modificarse desde esta pantalla.</p>
        <div class="field"><label>Nombre completo</label><input v-model="form.name" type="text"></div>
        <div class="field"><label>Correo electrónico</label><input v-model="form.email" type="text"></div>
        <div class="field"><label>Teléfono</label><input v-model="form.phone" type="text"></div>
        <button class="btn btn-primary" @click="save"><i class="bi bi-check2"></i> Guardar cambios</button>
      </div>
    </div>

    <div class="card" style="margin-top:18px;" v-if="auth.currentUser.role === 'cliente'">
      <div class="card-body">
        <div class="eyebrow" style="margin-bottom:10px;">Recordatorios de mantenimiento</div>
        <div v-if="reminders.length" v-for="(r,i) in reminders" :key="i" class="reminder-row">
          <i class="bi bi-bell-fill"></i> {{ r.message }}
        </div>
        <p v-else class="text-muted" style="font-size:.86rem;">No tenés recordatorios pendientes por ahora.</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.reminder-row{ display:flex; gap:10px; align-items:flex-start; padding:8px 0; border-bottom:1px solid var(--border); font-size:.86rem; }
.reminder-row:last-child{ border-bottom:none; }
.reminder-row i{ color:var(--orange-dark); margin-top:2px; }
</style>
