<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import { useUiStore } from '../../stores/ui'

const router = useRouter()
const auth = useAuthStore()
const ui = useUiStore()

// RF-19: solicitud y restablecimiento de contraseña (simulado: el "código" se muestra en pantalla)
const step = ref(1)
const email = ref('')
const code = ref('')
const newPassword = ref('')
const error = ref('')
const generatedToken = ref('')
const pendingUserId = ref('')

function requestReset() {
  error.value = ''
  const res = auth.requestPasswordReset(email.value)
  if (!res.ok) { error.value = res.message; return }
  generatedToken.value = res.token
  pendingUserId.value = res.userId
  step.value = 2
}
function confirmReset() {
  error.value = ''
  const res = auth.resetPassword(pendingUserId.value, code.value, newPassword.value)
  if (!res.ok) { error.value = res.message; return }
  ui.showToast('Contraseña actualizada. Ya podés iniciar sesión.')
  router.push('/login')
}
</script>

<template>
  <div class="login-wrap">
    <div class="login-card">
      <div class="login-form" style="padding:52px 46px;">
        <h2>Recuperar acceso</h2>

        <template v-if="step === 1">
          <div class="sub">Ingresá tu correo registrado y te enviaremos un código de verificación.</div>
          <form @submit.prevent="requestReset" class="form-stack">
            <div class="field"><label>Correo electrónico</label><input v-model="email" type="text"></div>
            <p v-if="error" style="color:var(--red);font-size:.85rem;">{{ error }}</p>
            <button type="submit" class="btn btn-primary btn-block">Enviar código</button>
          </form>
        </template>

        <template v-else>
          <div class="sub">
            Te enviamos un código a <b>{{ email }}</b>. Válido por 15 minutos.
            <div class="role-preview" style="margin-top:14px;">Simulación de correo — tu código es: <span class="chip">{{ generatedToken }}</span></div>
          </div>
          <form @submit.prevent="confirmReset" class="form-stack" style="margin-top:18px;">
            <div class="field"><label>Código de verificación</label><input v-model="code" type="text"></div>
            <div class="field"><label>Nueva contraseña</label><input v-model="newPassword" type="password"></div>
            <p v-if="error" style="color:var(--red);font-size:.85rem;">{{ error }}</p>
            <button type="submit" class="btn btn-primary btn-block">Restablecer contraseña</button>
          </form>
        </template>

        <div style="text-align:center;font-size:.85rem;color:var(--muted);margin-top:18px;">
          <router-link to="/login">Volver a iniciar sesión</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-wrap{ min-height:100vh; display:flex; align-items:center; justify-content:center; padding:24px;
  background: radial-gradient(circle at 85% 15%, rgba(255,90,31,.14), transparent 45%), linear-gradient(180deg, #191D23 0%, #14171B 100%); }
.login-card{ width:100%; max-width:520px; background:var(--card); border-radius:20px; overflow:hidden; box-shadow:0 30px 70px rgba(0,0,0,.35); }
.login-form h2{ font-size:1.7rem; margin:0 0 4px; }
.sub{ color:var(--muted); font-size:.9rem; margin-bottom:20px; line-height:1.6; }
.role-preview{ padding:12px 14px; border-radius:10px; background:var(--paper); border:1px dashed #C9CCC5; font-size:.8rem; }
.chip{ background:#fff; border:1px solid var(--border); border-radius:5px; padding:1px 6px; font-family:'IBM Plex Mono',monospace; }
</style>
