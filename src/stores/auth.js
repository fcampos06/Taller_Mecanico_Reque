import { defineStore } from 'pinia'
import { seedUsers } from '../data/seed'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    users: JSON.parse(JSON.stringify(seedUsers)),
    currentUserId: null,
    // simulación de token de recuperación de contraseña (RF-29)
    resetToken: null,
    resetTokenExpiresAt: null,
  }),
  getters: {
    currentUser: (state) => state.users.find(u => u.id === state.currentUserId) || null,
    isLoggedIn: (state) => !!state.currentUserId,
    mechanics: (state) => state.users.filter(u => u.role === 'mecanico'),
    clients: (state) => state.users.filter(u => u.role === 'cliente'),
  },
  actions: {
    // HU-55: iniciar sesión validando credenciales
    login(email, password) {
      const user = this.users.find(u => u.email.toLowerCase() === email.trim().toLowerCase())
      if (!user) return { ok: false, message: 'No existe una cuenta con ese correo.' }
      if (!user.active) return { ok: false, message: 'Esta cuenta fue desactivada. Contactá al taller.' }
      if (user.password !== password) return { ok: false, message: 'Contraseña incorrecta.' }
      this.currentUserId = user.id
      return { ok: true, user }
    },
    logout() {
      this.currentUserId = null
    },
    // RF-27: registro de nuevo cliente
    register({ name, email, phone, password }) {
      const exists = this.users.some(u => u.email.toLowerCase() === email.trim().toLowerCase())
      if (exists) return { ok: false, message: 'Ese correo ya está registrado.' }
      const user = { id: 'u-' + Date.now(), name, email: email.trim(), phone, password, role: 'cliente', active: true }
      this.users.push(user)
      this.currentUserId = user.id
      return { ok: true, user }
    },
    // RF-29: recuperación de contraseña (simulada)
    requestPasswordReset(email) {
      const user = this.users.find(u => u.email.toLowerCase() === email.trim().toLowerCase())
      if (!user) return { ok: false, message: 'No existe una cuenta con ese correo.' }
      this.resetToken = Math.random().toString(36).slice(2, 8).toUpperCase()
      this.resetTokenExpiresAt = Date.now() + 15 * 60 * 1000 // 15 min de vigencia
      return { ok: true, token: this.resetToken, userId: user.id }
    },
    resetPassword(userId, token, newPassword) {
      if (token !== this.resetToken) return { ok: false, message: 'Código inválido.' }
      if (Date.now() > this.resetTokenExpiresAt) return { ok: false, message: 'El código ya venció, solicitá uno nuevo.' }
      const user = this.users.find(u => u.id === userId)
      if (!user) return { ok: false, message: 'Usuario no encontrado.' }
      user.password = newPassword
      this.resetToken = null
      return { ok: true }
    },
    // RF-30: administrador crea/gestiona cuentas de mecánicos
    createMechanic({ name, email, phone }) {
      const exists = this.users.some(u => u.email.toLowerCase() === email.trim().toLowerCase())
      if (exists) return { ok: false, message: 'Ese correo ya está en uso.' }
      const user = { id: 'u-mec-' + Date.now(), name, email: email.trim(), phone, password: 'taller2026', role: 'mecanico', active: true }
      this.users.push(user)
      return { ok: true, user }
    },
    toggleMechanicActive(userId) {
      const user = this.users.find(u => u.id === userId)
      if (user) user.active = !user.active
    },
    userById(id) {
      return this.users.find(u => u.id === id) || null
    },
  },
})
