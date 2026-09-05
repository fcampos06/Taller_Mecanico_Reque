<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'

const router = useRouter()
const auth = useAuthStore()
const form = reactive({ name: '', email: '', phone: '', password: '' })
const error = ref('')

// RF-17: registro de nuevo usuario, validando que el correo no exista
function submit() {
  error.value = ''
  if (!form.name || !form.email || !form.password) { error.value = 'Completá todos los campos obligatorios.'; return }
  const res = auth.register(form)
  if (!res.ok) { error.value = res.message; return }
  router.push('/cliente/vehiculos')
}
</script>

<template>
  <div class="login-wrap">
    <div class="login-card" style="max-width:520px;">
      <div class="login-form" style="padding:52px 46px;">
        <h2>Creá tu cuenta</h2>
        <div class="sub">Registrate como cliente para solicitar servicios al taller.</div>
        <form @submit.prevent="submit" class="form-stack">
          <div class="field"><label>Nombre completo</label><input v-model="form.name" type="text"></div>
          <div class="field"><label>Correo electrónico</label><input v-model="form.email" type="text"></div>
          <div class="field"><label>Teléfono</label><input v-model="form.phone" type="text" placeholder="8888-0000"></div>
          <div class="field"><label>Contraseña</label><input v-model="form.password" type="password"></div>
          <p v-if="error" style="color:var(--red);font-size:.85rem;">{{ error }}</p>
          <button type="submit" class="btn btn-primary btn-block">Crear cuenta <i class="bi bi-arrow-right"></i></button>
        </form>
        <div style="text-align:center;font-size:.85rem;color:var(--muted);margin-top:18px;">
          ¿Ya tenés cuenta? <router-link to="/login">Iniciá sesión</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-wrap{ min-height:100vh; display:flex; align-items:center; justify-content:center; padding:24px;
  background: radial-gradient(circle at 85% 15%, rgba(255,90,31,.14), transparent 45%), linear-gradient(180deg, #191D23 0%, #14171B 100%); }
.login-card{ width:100%; background:var(--card); border-radius:20px; overflow:hidden; box-shadow:0 30px 70px rgba(0,0,0,.35); }
.login-form h2{ font-size:1.7rem; margin:0 0 4px; }
.sub{ color:var(--muted); font-size:.9rem; margin-bottom:28px; }
</style>
