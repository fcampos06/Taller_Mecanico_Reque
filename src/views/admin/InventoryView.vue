<script setup>
import { ref, computed, reactive } from 'vue'
import { useInventoryStore } from '../../stores/inventory'
import { useUiStore } from '../../stores/ui'
import BaseModal from '../../components/ui/BaseModal.vue'
import { formatCRC } from '../../utils/format'

const inv = useInventoryStore()
const ui = useUiStore()

// RF-28: buscar por nombre/categoría, filtrar por nivel de stock y por categoría
const search = ref('')
const stockFilter = ref('todos') // todos | bajo | normal
const categoryFilter = ref('todas')
const categories = computed(() => ['todas', ...inv.categories])

const filtered = computed(() => inv.parts.filter(p => {
  const q = search.value.trim().toLowerCase()
  const matchQ = !q || (p.name + p.code + p.category).toLowerCase().includes(q)
  const isLow = p.stock <= p.min
  const matchStock = stockFilter.value === 'todos' || (stockFilter.value === 'bajo' ? isLow : !isLow)
  const matchCategory = categoryFilter.value === 'todas' || p.category === categoryFilter.value
  return matchQ && matchStock && matchCategory
}))

const modalOpen = ref(false)
const editingId = ref(null)
const form = reactive({ code: '', name: '', category: '', provider: '', price: 0, stock: 0, min: 1 })
function openNew() { editingId.value = null; Object.assign(form, { code: '', name: '', category: '', provider: '', price: 0, stock: 0, min: 1 }); modalOpen.value = true }
function openEdit(p) { editingId.value = p.id; Object.assign(form, p); modalOpen.value = true }
function save() {
  if (!form.name || !form.code) { ui.showToast('Nombre y código son obligatorios.', 'error'); return }
  if (editingId.value) inv.updatePart(editingId.value, { ...form, price: Number(form.price), stock: Number(form.stock), min: Number(form.min) })
  else inv.addPart(form)
  modalOpen.value = false
  ui.showToast('Inventario actualizado ✔')
}

// RF-27/HU-53/HU-50: bitácora de movimientos por repuesto (salidas por orden + ajustes manuales)
const expandedId = ref(null)
function toggleMovements(p) { expandedId.value = expandedId.value === p.id ? null : p.id }
</script>

<template>
  <div class="grid grid-2" style="margin-bottom:16px;" v-if="inv.lowStock.length">
    <div class="card" style="grid-column:1/-1;border-color:#F3DDA9;background:#FFF9EF;">
      <div class="card-body flex" style="gap:12px;align-items:flex-start;">
        <i class="bi bi-exclamation-triangle-fill" style="color:var(--orange-dark);font-size:1.2rem;"></i>
        <div>
          <b style="font-size:.9rem;">{{ inv.lowStock.length }} repuesto(s) con stock bajo</b>
          <div class="text-muted" style="font-size:.83rem;margin-top:2px;">{{ inv.lowStock.map(p => p.name).join(', ') }}</div>
        </div>
      </div>
    </div>
  </div>

  <div class="card">
    <div class="card-body">
      <div class="flex-between" style="margin-bottom:18px;flex-wrap:wrap;gap:10px;">
        <h4 class="mt-0 mb-0">Inventario de repuestos</h4>
        <div class="flex gap-8" style="flex-wrap:wrap;">
          <div class="search-box"><i class="bi bi-search"></i><input v-model="search" placeholder="Buscar por nombre o categoría..."></div>
          <select v-model="categoryFilter" style="border:1.5px solid var(--border);border-radius:10px;padding:8px 12px;">
            <option v-for="c in categories" :key="c" :value="c">{{ c === 'todas' ? 'Todas las categorías' : c }}</option>
          </select>
          <select v-model="stockFilter" style="border:1.5px solid var(--border);border-radius:10px;padding:8px 12px;">
            <option value="todos">Todo el stock</option>
            <option value="bajo">Stock bajo</option>
            <option value="normal">Stock normal</option>
          </select>
          <button class="btn btn-primary btn-sm" @click="openNew"><i class="bi bi-plus-lg"></i> Nuevo repuesto</button>
        </div>
      </div>
      <table>
        <thead><tr><th>Código</th><th>Nombre</th><th>Categoría</th><th>Proveedor</th><th class="text-right">Precio</th><th class="text-right">Stock</th><th></th></tr></thead>
        <tbody>
          <template v-for="p in filtered" :key="p.id">
            <tr>
              <td class="mono">{{ p.code }}</td>
              <td>{{ p.name }}</td>
              <td>{{ p.category }}</td>
              <td class="text-muted">{{ p.provider || '—' }}</td>
              <td class="mono text-right">{{ formatCRC(p.price) }}</td>
              <td class="text-right"><span class="badge" :class="p.stock <= p.min ? 'b-alerta' : 'b-proceso'">{{ p.stock }} u.</span></td>
              <td class="text-right">
                <button class="btn btn-ghost btn-sm" @click="toggleMovements(p)"><i class="bi bi-clock-history"></i></button>
                <button class="btn btn-ghost btn-sm" @click="openEdit(p)"><i class="bi bi-pencil"></i></button>
              </td>
            </tr>
            <tr v-if="expandedId === p.id">
              <td colspan="7" style="background:var(--paper);">
                <div v-if="inv.movementsFor(p.id).length" class="movements-list">
                  <div v-for="m in inv.movementsFor(p.id)" :key="m.id" class="movement-row">
                    <span>{{ m.type === 'salida' ? 'Salida por orden ' + m.orderId : 'Ajuste manual' }}</span>
                    <span class="mono" :class="m.qty < 0 ? 'text-red' : 'text-green'">{{ m.qty > 0 ? '+' : '' }}{{ m.qty }}</span>
                    <span class="text-muted mono" style="font-size:.76rem;">{{ m.at }}</span>
                  </div>
                </div>
                <p v-else class="text-muted" style="font-size:.82rem;padding:6px 0;">Sin movimientos registrados todavía.</p>
              </td>
            </tr>
          </template>
          <tr v-if="!filtered.length"><td colspan="7" style="text-align:center;color:var(--muted);padding:24px;">No se encontraron repuestos con esos filtros.</td></tr>
        </tbody>
      </table>
    </div>
  </div>

  <BaseModal v-if="modalOpen" :title="editingId ? 'Editar repuesto' : 'Nuevo repuesto'" @close="modalOpen = false">
    <div class="form-stack">
      <div class="grid grid-2">
        <div class="field"><label>Código</label><input v-model="form.code" type="text"></div>
        <div class="field"><label>Categoría</label><input v-model="form.category" type="text"></div>
      </div>
      <div class="field"><label>Nombre</label><input v-model="form.name" type="text"></div>
      <div class="field"><label>Proveedor</label><input v-model="form.provider" type="text"></div>
      <div class="grid grid-3">
        <div class="field"><label>Precio</label><input v-model.number="form.price" type="number"></div>
        <div class="field"><label>Stock</label><input v-model.number="form.stock" type="number"></div>
        <div class="field"><label>Mínimo</label><input v-model.number="form.min" type="number"></div>
      </div>
    </div>
    <template #footer><button class="btn btn-primary btn-block" @click="save">Guardar</button></template>
  </BaseModal>
</template>

<style scoped>
.movements-list{ padding:8px 4px; }
.movement-row{ display:flex; justify-content:space-between; gap:12px; padding:6px 8px; font-size:.83rem; border-bottom:1px solid var(--border); }
.movement-row:last-child{ border-bottom:none; }
.text-red{ color:var(--red); }
.text-green{ color:var(--green); }
</style>
