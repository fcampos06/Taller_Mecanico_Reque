import {
  seedUsers, seedVehicles, seedOrders, seedRequests, seedAppointments,
  seedCatalog, seedInventory, seedNotifications,
} from '../src/data/seed.js'

const errors = []
const userIds = new Set(seedUsers.map(x => x.id))
const vehicleIds = new Set(seedVehicles.map(x => x.id))
const mechanicIds = new Set(seedUsers.filter(x => x.role === 'mecanico').map(x => x.id))

for (const v of seedVehicles) {
  if (!userIds.has(v.ownerId)) errors.push(`Vehículo ${v.id}: ownerId inválido (${v.ownerId})`)
}
for (const o of seedOrders) {
  if (!userIds.has(o.clientId)) errors.push(`Orden ${o.id}: clientId inválido (${o.clientId})`)
  if (!vehicleIds.has(o.vehicleId)) errors.push(`Orden ${o.id}: vehicleId inválido (${o.vehicleId})`)
  if (o.mechanicId && !mechanicIds.has(o.mechanicId)) errors.push(`Orden ${o.id}: mechanicId inválido (${o.mechanicId})`)
}
for (const r of seedRequests) {
  if (!userIds.has(r.clientId)) errors.push(`Solicitud ${r.id}: clientId inválido (${r.clientId})`)
  if (!vehicleIds.has(r.vehicleId)) errors.push(`Solicitud ${r.id}: vehicleId inválido (${r.vehicleId})`)
}
for (const a of seedAppointments) {
  if (!userIds.has(a.clientId)) errors.push(`Cita ${a.id}: clientId inválido (${a.clientId})`)
  if (!vehicleIds.has(a.vehicleId)) errors.push(`Cita ${a.id}: vehicleId inválido (${a.vehicleId})`)
  if (a.mechanicId && !mechanicIds.has(a.mechanicId)) errors.push(`Cita ${a.id}: mechanicId inválido (${a.mechanicId})`)
}

console.log('Resumen de datos sembrados:')
console.table({
  usuarios: seedUsers.length,
  vehiculos: seedVehicles.length,
  ordenes: seedOrders.length,
  solicitudes: seedRequests.length,
  citas: seedAppointments.length,
  catalogo: seedCatalog.length,
  inventario: seedInventory.length,
  notificaciones: seedNotifications.length,
})

const demo = seedUsers.find(u => u.email === 'carlos.vargas@gmail.com')
if (demo) {
  console.log('\nCobertura del cliente demo (Carlos Vargas):')
  console.log({
    vehiculos: seedVehicles.filter(v => v.ownerId === demo.id).length,
    ordenes: seedOrders.filter(o => o.clientId === demo.id).length,
    solicitudes: seedRequests.filter(r => r.clientId === demo.id).length,
    citas: seedAppointments.filter(a => a.clientId === demo.id && a.status !== 'cancelada').length,
    notificaciones: seedNotifications.filter(n => n.userId === demo.id).length,
  })
}

if (errors.length) {
  console.error('\nErrores de integridad encontrados:')
  errors.forEach(e => console.error(' -', e))
  process.exit(1)
}

console.log('\nOK: todas las relaciones principales de los datos son válidas.')
