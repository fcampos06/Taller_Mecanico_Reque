<script setup>
import { ref, computed } from 'vue'
import { useAuthStore } from '../../stores/auth'

const auth = useAuthStore()
const search = ref('')

// HU-40: listado de usuarios con datos de contacto (nunca contraseñas), buscable
const users = computed(() => {
  const q = search.value.trim().toLowerCase()
  const list = auth.users.filter(u => u.role !== 'admin')
  if (!q) return list
  return list.filter(u => (u.name + u.email + u.phone).toLowerCase().includes(q))
})
const roleLabel = { cliente: 'Cliente', mecanico: 'Mecánico' }
</script>

<template>
  <div class="card">
    <div class="card-body">
      <div class="flex-between" style="margin-bottom:16px;flex-wrap:wrap;gap:10px;">
        <h4 class="mt-0 mb-0">Usuarios registrados</h4>
        <div class="search-box"><i class="bi bi-search"></i><input v-model="search" placeholder="Buscar por nombre, correo o teléfono..."></div>
      </div>
      <table>
        <thead><tr><th>Nombre</th><th>Correo</th><th>Teléfono</th><th>Rol</th><th>Estado</th></tr></thead>
        <tbody>
          <tr v-for="u in users" :key="u.id">
            <td>{{ u.name }}</td>
            <td class="mono">{{ u.email }}</td>
            <td>{{ u.phone }}</td>
            <td><span class="badge b-diag">{{ roleLabel[u.role] }}</span></td>
            <td><span class="badge" :class="u.active ? 'b-proceso' : 'b-rechazado'">{{ u.active ? 'Activo' : 'Desactivado' }}</span></td>
          </tr>
          <tr v-if="!users.length"><td colspan="5" style="text-align:center;color:var(--muted);padding:24px;">Sin resultados para "{{ search }}"</td></tr>
        </tbody>
      </table>
      <p class="field-hint" style="margin-top:12px;">No se muestran contraseñas ni datos sensibles. La gestión de cuentas de mecánicos está en la sección "Mecánicos".</p>
    </div>
  </div>
</template>
