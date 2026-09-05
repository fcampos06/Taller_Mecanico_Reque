import { defineStore } from 'pinia'
import { seedAppointments } from '../data/seed'
import { useNotificationsStore } from './notifications'

// Semana "activa" del prototipo: es la única con datos reales sembrados.
// El resto de semanas son navegables (RF-10/HU-19) pero se muestran vacías,
// ya que este prototipo no simula un calendario perpetuo con fechas reales.
export const WEEK_DAYS = ['Lunes 24', 'Martes 25', 'Miércoles 26', 'Jueves 27', 'Viernes 28']
export const DAY_SLOTS = ['8:00am', '9:00am', '10:30am', '1:30pm', '2:00pm', '3:30pm']
const DAY_NAMES = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes']

// RF-10/HU-19: etiquetas de días para una semana relativa a la actual (offset 0 = semana activa)
export function weekLabelsFor(offset) {
  if (offset === 0) return WEEK_DAYS
  const sign = offset > 0 ? '+' : ''
  return DAY_NAMES.map(d => `${d} (semana ${sign}${offset})`)
}

export const useAppointmentsStore = defineStore('appointments', {
  state: () => ({
    appointments: JSON.parse(JSON.stringify(seedAppointments)),
  }),
  getters: {
    byDay: (state) => {
      const map = {}
      WEEK_DAYS.forEach(d => { map[d] = [] })
      state.appointments.filter(a => a.status !== 'cancelada').forEach(a => { (map[a.day] ||= []).push(a) })
      return map
    },
    // RF-10/HU-19: agenda agrupada por día para una semana relativa (navegación)
    byDayForOffset: (state) => (offset) => {
      const labels = weekLabelsFor(offset)
      const map = {}
      labels.forEach(d => { map[d] = [] })
      if (offset === 0) {
        state.appointments.filter(a => a.status !== 'cancelada').forEach(a => { (map[a.day] ||= []).push(a) })
      }
      return map
    },
    forClient: (state) => (clientId) => state.appointments.filter(a => a.clientId === clientId),
    forMechanic: (state) => (mechanicId) => state.appointments.filter(a => a.mechanicId === mechanicId && a.status !== 'cancelada'),
    // RF-14: horarios disponibles según el día (oculta los ya ocupados)
    availableSlots: (state) => (day, mechanicId = null) => {
      const taken = state.appointments
        .filter(a => a.day === day && a.status !== 'cancelada' && (!mechanicId || a.mechanicId === mechanicId))
        .map(a => a.time)
      return DAY_SLOTS.filter(s => !taken.includes(s))
    },
  },
  actions: {
    // RF-09: agendar cita
    book({ clientId, vehicleId, day, time, mechanicId, requestId = null }) {
      const appt = { id: 'a-' + Date.now(), clientId, vehicleId, requestId, day, time, mechanicId, status: 'confirmada' }
      this.appointments.push(appt)
      return appt
    },
    // RF-12: reprogramar
    reschedule(id, { day, time }) {
      const a = this.appointments.find(a => a.id === id)
      if (a) { a.day = day; a.time = time }
    },
    // RF-12: cancelar
    cancel(id) {
      const a = this.appointments.find(a => a.id === id)
      if (a) {
        a.status = 'cancelada'
        useNotificationsStore().push('u-admin-1', `Se canceló la cita del ${a.day} a las ${a.time}.`)
      }
    },
  },
})
