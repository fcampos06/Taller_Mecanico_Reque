<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'

const router = useRouter()
const auth = useAuthStore()
const form = reactive({ email: 'carlos.vargas@gmail.com', password: 'taller2026' })
const error = ref('')

const HOME = { cliente: '/cliente/vehiculos', admin: '/admin/dashboard', mecanico: '/mecanico/ordenes' }

function submit() {
  error.value = ''
  const res = auth.login(form.email, form.password)
  if (!res.ok) { error.value = res.message; return }
  router.push(HOME[res.user.role])
}
</script>

<template>
  <div class="login-wrap">
    <div class="login-card">
      <div class="login-side">
        <div>
          <div class="brand"><i class="bi bi-wrench-adjustable-circle-fill"></i> Taller CCM</div>
          <p class="tag">Gestioná reparaciones, presupuestos y la operación del taller — todo en un solo lugar, sin llamadas ni papeles perdidos.</p>
          <ul class="login-points">
            <li><i class="bi bi-check2"></i> Aprobá presupuestos en un clic, desde el celular</li>
            <li><i class="bi bi-check2"></i> Seguimiento de tu reparación en tiempo real</li>
            <li><i class="bi bi-check2"></i> Panel operativo y financiero para el taller</li>
          </ul>
        </div>
        <div class="login-foot">Taller CCM · Plataforma de gestión de reparaciones — Prototipo académico, Grupo 50.</div>
      </div>

      <div class="login-form">
        <h2>Bienvenido de nuevo</h2>
        <div class="sub">Iniciá sesión para continuar. Tu perfil se reconoce automáticamente.</div>

        <form @submit.prevent="submit">
          <div class="field">
            <label>Correo electrónico</label>
            <input v-model="form.email" type="text" autocomplete="username">
          </div>
          <div class="field">
            <label>Contraseña</label>
            <input v-model="form.password" type="password" autocomplete="current-password">
          </div>
          <p v-if="error" style="color:var(--red);font-size:.85rem;margin-bottom:14px;">{{ error }}</p>
          <div class="field-row">
            <label class="field-check"><input type="checkbox" checked> Recordarme</label>
            <router-link to="/recuperar">¿Olvidaste tu contraseña?</router-link>
          </div>
          <button type="submit" class="btn btn-primary btn-block">Iniciar sesión <i class="bi bi-arrow-right"></i></button>
        </form>
        <div style="text-align:center;font-size:.85rem;color:var(--muted);margin-top:18px;">
          ¿No tenés cuenta? <router-link to="/registro">Registrate como cliente</router-link>
        </div>

        <div class="role-preview">
          Prototipo de demostración — el correo determina el perfil de acceso:<br>
          <span class="chip">carlos.vargas@gmail.com</span> → <b>Cliente</b> ·
          <span class="chip">maria.rojas@tallerccm.com</span> → <b>Administrador</b> ·
          <span class="chip">esteban.salas@tallerccm.com</span> → <b>Mecánico</b><br>
          Contraseña para todos: <span class="chip">taller2026</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-wrap{
  min-height:100vh; display:flex; align-items:center; justify-content:center; padding:24px;
  background: radial-gradient(circle at 85% 15%, rgba(255,90,31,.14), transparent 45%), linear-gradient(180deg, #191D23 0%, #14171B 100%);
}
.login-card{ width:100%; max-width:960px; background:var(--card); border-radius:20px; overflow:hidden; box-shadow:0 30px 70px rgba(0,0,0,.35); display:flex; min-height:580px; }
.login-side{
  flex:1; color:#fff; padding:52px 44px; display:flex; flex-direction:column; justify-content:space-between; position:relative;
  background: repeating-linear-gradient(-45deg, rgba(255,255,255,.035) 0 14px, transparent 14px 28px), linear-gradient(165deg, var(--asphalt) 0%, #0F1216 100%);
}
.login-side .brand{ font-family:'Oswald',sans-serif; font-size:1.8rem; font-weight:700; display:flex; align-items:center; gap:10px; }
.login-side .brand i{ color:var(--orange); font-size:1.6rem; }
.login-side .tag{ margin-top:16px; color:#B9C0C7; font-size:.95rem; max-width:320px; line-height:1.55; }
.login-points{ list-style:none; margin:28px 0 0; padding:0; position:relative; z-index:1; }
.login-points li{ display:flex; gap:12px; align-items:flex-start; padding:10px 0; font-size:.92rem; color:#E4E8EB; }
.login-points li i{ color:var(--orange); font-size:1.1rem; margin-top:1px; }
.login-foot{ font-size:.8rem; color:#8A929A; border-top:1px solid rgba(255,255,255,.12); padding-top:16px; position:relative; z-index:1; }
.login-form{ flex:1; padding:56px 50px; display:flex; flex-direction:column; justify-content:center; }
.login-form h2{ font-size:1.7rem; margin:0 0 4px; }
.login-form .sub{ color:var(--muted); font-size:.9rem; margin-bottom:28px; }
.field-row{ display:flex; justify-content:space-between; align-items:center; margin-bottom:22px; font-size:.85rem; }
.role-preview{ margin-top:26px; padding:14px 16px; border-radius:12px; background:var(--paper); border:1px dashed #C9CCC5; font-size:.78rem; color:var(--muted); line-height:1.8; }
.role-preview .chip{ background:#fff; border:1px solid var(--border); border-radius:5px; padding:1px 6px; font-family:'IBM Plex Mono',monospace; }
@media (max-width:840px){ .login-side{ display:none; } .login-card{ min-height:0; } }
</style>
