// Datos simulados — no hay backend real, todo vive en memoria (Pinia) durante la sesión.
// Sirven como semilla inicial para cada store. Se pobló con suficiente variedad para que
// cada pantalla del sistema tenga contenido representativo desde el primer arranque.

export const seedUsers = [
  { id: 'u-cliente-1', name: 'Carlos Vargas', email: 'carlos.vargas@gmail.com', phone: '8888-1234', password: 'taller2026', role: 'cliente', active: true },
  { id: 'u-cliente-2', name: 'Laura Méndez', email: 'laura.mendez@gmail.com', phone: '8888-5678', password: 'taller2026', role: 'cliente', active: true },
  { id: 'u-cliente-3', name: 'José Fallas', email: 'jose.fallas@gmail.com', phone: '8777-2211', password: 'taller2026', role: 'cliente', active: true },
  { id: 'u-cliente-4', name: 'Ana Rojas', email: 'ana.rojas@gmail.com', phone: '8666-4433', password: 'taller2026', role: 'cliente', active: true },
  { id: 'u-cliente-5', name: 'Marco Solano', email: 'marco.solano@gmail.com', phone: '8555-9087', password: 'taller2026', role: 'cliente', active: true },
  { id: 'u-admin-1', name: 'María Rojas', email: 'maria.rojas@tallerccm.com', phone: '8888-0001', password: 'taller2026', role: 'admin', active: true },
  { id: 'u-mec-1', name: 'Esteban Salas', email: 'esteban.salas@tallerccm.com', phone: '8888-0002', password: 'taller2026', role: 'mecanico', active: true },
  { id: 'u-mec-2', name: 'Diego Chaves', email: 'diego.chaves@tallerccm.com', phone: '8888-0003', password: 'taller2026', role: 'mecanico', active: true },
  { id: 'u-mec-3', name: 'Kevin Araya', email: 'kevin.araya@tallerccm.com', phone: '8888-0004', password: 'taller2026', role: 'mecanico', active: false },
]

export const seedVehicles = [
  { id: 'v-1', ownerId: 'u-cliente-1', brand: 'Toyota', model: 'Corolla', year: 2019, plate: 'BCD-123', color: 'Gris', km: 45200 },
  { id: 'v-2', ownerId: 'u-cliente-1', brand: 'Hyundai', model: 'Tucson', year: 2021, plate: 'CKL-045', color: 'Blanco', km: 18900 },
  { id: 'v-3', ownerId: 'u-cliente-2', brand: 'Toyota', model: 'Yaris', year: 2020, plate: 'GLK-882', color: 'Rojo', km: 32100 },
  { id: 'v-4', ownerId: 'u-cliente-2', brand: 'Suzuki', model: 'Alto', year: 2017, plate: 'BPP-556', color: 'Azul', km: 68400 },
  { id: 'v-5', ownerId: 'u-cliente-3', brand: 'Toyota', model: 'Hilux', year: 2018, plate: 'SJC-410', color: 'Negro', km: 91500 },
  { id: 'v-6', ownerId: 'u-cliente-4', brand: 'Kia', model: 'Sportage', year: 2022, plate: 'VLD-720', color: 'Gris oscuro', km: 12300 },
  { id: 'v-7', ownerId: 'u-cliente-5', brand: 'Nissan', model: 'Sentra', year: 2016, plate: 'BTR-338', color: 'Plateado', km: 102800 },
  { id: 'v-8', ownerId: 'u-cliente-5', brand: 'Honda', model: 'CR-V', year: 2020, plate: 'MNP-190', color: 'Blanco perla', km: 41200 },
]

export const seedCatalog = [
  { id: 'sv-1', name: 'Cambio de aceite y filtro', description: 'Sustitución de aceite de motor y filtro correspondiente.', rate: 28000 },
  { id: 'sv-2', name: 'Frenos delanteros', description: 'Cambio de pastillas y/o discos delanteros.', rate: 95000 },
  { id: 'sv-3', name: 'Alineado y balanceo', description: 'Alineación de dirección y balanceo de las 4 ruedas.', rate: 22000 },
  { id: 'sv-4', name: 'Revisión pre-vacaciones (RTV)', description: 'Chequeo general antes de un viaje largo.', rate: 15000 },
  { id: 'sv-5', name: 'Diagnóstico general', description: 'Revisión completa para identificar fallas.', rate: 12000 },
  { id: 'sv-6', name: 'Cambio de embrague', description: 'Sustitución de kit de embrague completo.', rate: 165000 },
  { id: 'sv-7', name: 'Suspensión delantera', description: 'Revisión y cambio de amortiguadores delanteros.', rate: 110000 },
  { id: 'sv-8', name: 'Batería y carga', description: 'Diagnóstico del sistema eléctrico y cambio de batería si aplica.', rate: 45000 },
]

export const seedInventory = [
  { id: 'p-1', code: 'FRN-001', name: 'Pastillas de freno delanteras (juego)', category: 'Frenos', provider: 'Autopartes San Carlos', price: 38000, stock: 9, min: 4 },
  { id: 'p-2', code: 'FRN-002', name: 'Discos de freno delanteros (par)', category: 'Frenos', provider: 'Autopartes San Carlos', price: 42000, stock: 5, min: 3 },
  { id: 'p-3', code: 'MOT-010', name: 'Aceite de motor 5W-30 (litro)', category: 'Motor', provider: 'Lubricantes CR', price: 6500, stock: 34, min: 10 },
  { id: 'p-4', code: 'MOT-011', name: 'Filtro de aceite', category: 'Motor', provider: 'Lubricantes CR', price: 5200, stock: 14, min: 6 },
  { id: 'p-5', code: 'EMB-020', name: 'Kit de embrague', category: 'Transmisión', provider: 'Repuestos Zona Norte', price: 145000, stock: 1, min: 2 },
  { id: 'p-6', code: 'SUS-030', name: 'Amortiguador delantero', category: 'Suspensión', provider: 'Repuestos Zona Norte', price: 54000, stock: 2, min: 3 },
  { id: 'p-7', code: 'BAT-040', name: 'Batería 12V 650A', category: 'Eléctrico', provider: 'Electro Repuestos CR', price: 68000, stock: 6, min: 2 },
  { id: 'p-8', code: 'FIL-050', name: 'Filtro de aire', category: 'Motor', provider: 'Lubricantes CR', price: 8500, stock: 20, min: 5 },
  { id: 'p-9', code: 'ALN-060', name: 'Kit de rótulas y terminales', category: 'Suspensión', provider: 'Repuestos Zona Norte', price: 32000, stock: 7, min: 3 },
  { id: 'p-10', code: 'NEU-070', name: 'Llanta 195/65 R15', category: 'Llantas', provider: 'Llantera San Carlos', price: 58000, stock: 8, min: 4 },
]

export const seedChecklistPoints = [
  'Frenos', 'Luces', 'Niveles de fluidos', 'Batería', 'Llantas', 'Suspensión', 'Correa/Distribución', 'Filtros',
]

// Estructura de una orden (order) — el objeto "vivo" del sistema:
// {
//   id, requestId, clientId, vehicleId, mechanicId, serviceType, description,
//   photosRequest: [], status: 'diagnostico'|'presupuesto'|'espera'|'aprobado'|'rechazado'|'proceso'|'listo'|'entregado',
//   statusHistory: [{status, at, comment}],
//   diagnostic: { notes, laborEstimate, checklist: {point: 'ok'|'warn'|'fail'} } | null,
//   budgets: [ { version, items:[{label,qty,price}], taxRate, createdAt, status:'pendiente'|'aprobado'|'rechazado', clientComment } ],
//   photos: { antes: [], durante: [], despues: [] },
//   rating: { stars, comment } | null,
// }

export const seedOrders = [
  // #0512 — esperando aprobación del cliente (Alcance 2 en vivo)
  {
    id: '#0512', requestId: null, clientId: 'u-cliente-1', vehicleId: 'v-1', mechanicId: 'u-mec-1',
    serviceType: 'Reparación', description: 'Ruido metálico al frenar, sobre todo en bajadas.',
    photosRequest: [],
    status: 'espera',
    statusHistory: [
      { status: 'diagnostico', at: '19 ago', comment: '' },
      { status: 'presupuesto', at: '19 ago', comment: '' },
      { status: 'espera', at: '19 ago', comment: '' },
    ],
    diagnostic: {
      notes: 'Se confirma desgaste avanzado en pastillas y discos delanteros. Se recomienda cambio completo.',
      laborEstimate: 15000,
      checklist: { Frenos: 'fail', Luces: 'ok', 'Niveles de fluidos': 'ok', Batería: 'ok', Llantas: 'warn', Suspensión: 'ok', 'Correa/Distribución': 'ok', Filtros: 'ok' },
    },
    budgets: [
      {
        version: 1,
        items: [
          { label: 'Pastillas de freno delanteras (juego)', qty: 1, price: 38000 },
          { label: 'Discos de freno delanteros (par)', qty: 1, price: 42000 },
          { label: 'Mano de obra', qty: 1, price: 15000 },
        ],
        taxRate: 0.13, createdAt: '19 ago', status: 'pendiente', clientComment: '',
      },
    ],
    photos: { antes: [{ name: 'recepcion1.jpg', url: 'https://picsum.photos/seed/ccm-antes-1/400/400' }], durante: [], despues: [] },
    rating: null,
  },
  // #0513 — recién en diagnóstico, sin presupuesto todavía
  {
    id: '#0513', requestId: null, clientId: 'u-cliente-2', vehicleId: 'v-3', mechanicId: 'u-mec-2',
    serviceType: 'Diagnóstico general', description: 'El vehículo vibra al frenar en carretera.',
    photosRequest: [],
    status: 'diagnostico',
    statusHistory: [{ status: 'diagnostico', at: '20 ago', comment: '' }],
    diagnostic: null,
    budgets: [],
    photos: { antes: [], durante: [], despues: [] },
    rating: null,
  },
  // #0498 — entregada y calificada (historial + Alcance 9)
  {
    id: '#0498', requestId: null, clientId: 'u-cliente-1', vehicleId: 'v-2', mechanicId: 'u-mec-1',
    serviceType: 'Mantenimiento preventivo', description: 'Cambio de aceite programado.',
    photosRequest: [],
    status: 'entregado',
    statusHistory: [
      { status: 'diagnostico', at: '02 jul', comment: '' },
      { status: 'presupuesto', at: '02 jul', comment: '' },
      { status: 'espera', at: '02 jul', comment: '' },
      { status: 'aprobado', at: '02 jul', comment: '' },
      { status: 'proceso', at: '02 jul', comment: 'Iniciamos el cambio de aceite y filtro.' },
      { status: 'listo', at: '02 jul', comment: 'Trabajo terminado, listo para retirar.' },
      { status: 'entregado', at: '02 jul', comment: '' },
    ],
    diagnostic: { notes: 'Mantenimiento de rutina, sin hallazgos adicionales.', laborEstimate: 5000, checklist: { Frenos: 'ok', Luces: 'ok', 'Niveles de fluidos': 'ok', Batería: 'ok', Llantas: 'ok', Suspensión: 'ok', 'Correa/Distribución': 'ok', Filtros: 'warn' } },
    budgets: [
      { version: 1, items: [{ label: 'Cambio de aceite y filtro', qty: 1, price: 23000 }, { label: 'Mano de obra', qty: 1, price: 5000 }], taxRate: 0.13, createdAt: '02 jul', status: 'aprobado', clientComment: '' },
    ],
    photos: {
      antes: [{ name: 'antes.jpg', url: 'https://picsum.photos/seed/ccm-0498-antes/400/400' }],
      durante: [{ name: 'durante.jpg', url: 'https://picsum.photos/seed/ccm-0498-durante/400/400' }],
      despues: [{ name: 'despues.jpg', url: 'https://picsum.photos/seed/ccm-0498-despues/400/400' }],
    },
    rating: { stars: 5, comment: 'Rápido y sin sorpresas en el precio.' },
  },
  // #0499 — rechazada por el cliente (rama alterna de Alcance 2)
  {
    id: '#0499', requestId: null, clientId: 'u-cliente-3', vehicleId: 'v-5', mechanicId: 'u-mec-2',
    serviceType: 'Suspensión delantera', description: 'Ruido tipo "clonc" al pasar por baches.',
    photosRequest: [],
    status: 'rechazado',
    statusHistory: [
      { status: 'diagnostico', at: '30 jul', comment: '' },
      { status: 'presupuesto', at: '30 jul', comment: '' },
      { status: 'espera', at: '30 jul', comment: '' },
      { status: 'rechazado', at: '31 jul', comment: '' },
    ],
    diagnostic: { notes: 'Rótulas y amortiguadores delanteros con desgaste visible.', laborEstimate: 20000, checklist: { Frenos: 'ok', Luces: 'ok', 'Niveles de fluidos': 'ok', Batería: 'ok', Llantas: 'ok', Suspensión: 'fail', 'Correa/Distribución': 'ok', Filtros: 'ok' } },
    budgets: [
      { version: 1, items: [{ label: 'Amortiguador delantero', qty: 2, price: 54000 }, { label: 'Kit de rótulas y terminales', qty: 1, price: 32000 }, { label: 'Mano de obra', qty: 1, price: 20000 }], taxRate: 0.13, createdAt: '30 jul', status: 'rechazado', clientComment: 'Muy alto por ahora, voy a esperar al próximo mes.' },
    ],
    photos: { antes: [], durante: [], despues: [] },
    rating: null,
  },
  // #0500 — presupuesto reenviado tras el rechazo anterior (RF-08 en vivo, versión 2 ya aprobada)
  {
    id: '#0500', requestId: null, clientId: 'u-cliente-3', vehicleId: 'v-5', mechanicId: 'u-mec-2',
    serviceType: 'Suspensión delantera', description: 'Seguimiento del caso de suspensión — el cliente pidió una opción más económica.',
    photosRequest: [],
    status: 'proceso',
    statusHistory: [
      { status: 'diagnostico', at: '02 ago', comment: '' },
      { status: 'presupuesto', at: '02 ago', comment: '' },
      { status: 'espera', at: '02 ago', comment: '' },
      { status: 'presupuesto', at: '03 ago', comment: '' },
      { status: 'aprobado', at: '03 ago', comment: '' },
      { status: 'proceso', at: '04 ago', comment: 'Instalando amortiguadores nuevos, avance 60%.' },
    ],
    diagnostic: { notes: 'Confirmado: solo amortiguadores, las rótulas están en buen estado.', laborEstimate: 18000, checklist: { Frenos: 'ok', Luces: 'ok', 'Niveles de fluidos': 'ok', Batería: 'ok', Llantas: 'ok', Suspensión: 'fail', 'Correa/Distribución': 'ok', Filtros: 'ok' } },
    budgets: [
      { version: 1, items: [{ label: 'Amortiguador delantero', qty: 2, price: 54000 }, { label: 'Kit de rótulas y terminales', qty: 1, price: 32000 }, { label: 'Mano de obra', qty: 1, price: 20000 }], taxRate: 0.13, createdAt: '02 ago', status: 'rechazado', clientComment: 'Prefiero dejar las rótulas para después.' },
      { version: 2, items: [{ label: 'Amortiguador delantero', qty: 2, price: 54000 }, { label: 'Mano de obra', qty: 1, price: 18000 }], taxRate: 0.13, createdAt: '03 ago', status: 'aprobado', clientComment: '' },
    ],
    photos: { antes: [{ name: 'susp-antes.jpg', url: 'https://picsum.photos/seed/ccm-0500-antes/400/400' }], durante: [{ name: 'susp-durante.jpg', url: 'https://picsum.photos/seed/ccm-0500-durante/400/400' }], despues: [] },
    rating: null,
  },
  // #0501 — lista para retirar, evidencia completa (Alcance 4)
  {
    id: '#0501', requestId: null, clientId: 'u-cliente-4', vehicleId: 'v-6', mechanicId: 'u-mec-1',
    serviceType: 'Batería y carga', description: 'El vehículo no encendía en las mañanas frías.',
    photosRequest: [],
    status: 'listo',
    statusHistory: [
      { status: 'diagnostico', at: '10 ago', comment: '' },
      { status: 'presupuesto', at: '10 ago', comment: '' },
      { status: 'espera', at: '10 ago', comment: '' },
      { status: 'aprobado', at: '10 ago', comment: '' },
      { status: 'proceso', at: '11 ago', comment: 'Cambiando batería y probando el alternador.' },
      { status: 'listo', at: '11 ago', comment: 'Batería nueva instalada, sistema de carga funcionando bien.' },
    ],
    diagnostic: { notes: 'Batería agotada por edad (4 años), alternador en buen estado.', laborEstimate: 8000, checklist: { Frenos: 'ok', Luces: 'ok', 'Niveles de fluidos': 'ok', Batería: 'fail', Llantas: 'ok', Suspensión: 'ok', 'Correa/Distribución': 'ok', Filtros: 'ok' } },
    budgets: [
      { version: 1, items: [{ label: 'Batería 12V 650A', qty: 1, price: 68000 }, { label: 'Mano de obra', qty: 1, price: 8000 }], taxRate: 0.13, createdAt: '10 ago', status: 'aprobado', clientComment: '' },
    ],
    photos: {
      antes: [{ name: 'bat-antes.jpg', url: 'https://picsum.photos/seed/ccm-0501-antes/400/400' }],
      durante: [{ name: 'bat-durante.jpg', url: 'https://picsum.photos/seed/ccm-0501-durante/400/400' }],
      despues: [{ name: 'bat-despues.jpg', url: 'https://picsum.photos/seed/ccm-0501-despues/400/400' }],
    },
    rating: null,
  },
  // #0502 — entregada, calificada distinto (para promedios/filtros en Calificaciones)
  {
    id: '#0502', requestId: null, clientId: 'u-cliente-5', vehicleId: 'v-7', mechanicId: 'u-mec-2',
    serviceType: 'Alineado y balanceo', description: 'El carro jala hacia la derecha en carretera.',
    photosRequest: [],
    status: 'entregado',
    statusHistory: [
      { status: 'diagnostico', at: '05 jul', comment: '' },
      { status: 'presupuesto', at: '05 jul', comment: '' },
      { status: 'espera', at: '05 jul', comment: '' },
      { status: 'aprobado', at: '05 jul', comment: '' },
      { status: 'proceso', at: '05 jul', comment: '' },
      { status: 'listo', at: '05 jul', comment: '' },
      { status: 'entregado', at: '06 jul', comment: '' },
    ],
    diagnostic: { notes: 'Desalineación confirmada en tren delantero.', laborEstimate: 0, checklist: { Frenos: 'ok', Luces: 'ok', 'Niveles de fluidos': 'ok', Batería: 'ok', Llantas: 'warn', Suspensión: 'ok', 'Correa/Distribución': 'ok', Filtros: 'ok' } },
    budgets: [
      { version: 1, items: [{ label: 'Alineado y balanceo', qty: 1, price: 22000 }], taxRate: 0.13, createdAt: '05 jul', status: 'aprobado', clientComment: '' },
    ],
    photos: { antes: [], durante: [], despues: [] },
    rating: { stars: 4, comment: 'Buen trabajo, aunque tardaron un poco más de lo esperado.' },
  },
  // #0503 — entregada, tercer mecánico y otro tipo de servicio (para reportes/dashboard)
  {
    id: '#0503', requestId: null, clientId: 'u-cliente-5', vehicleId: 'v-8', mechanicId: 'u-mec-1',
    serviceType: 'Cambio de embrague', description: 'El embrague patina al subir cuestas.',
    photosRequest: [],
    status: 'entregado',
    statusHistory: [
      { status: 'diagnostico', at: '12 jul', comment: '' },
      { status: 'presupuesto', at: '12 jul', comment: '' },
      { status: 'espera', at: '13 jul', comment: '' },
      { status: 'aprobado', at: '13 jul', comment: '' },
      { status: 'proceso', at: '14 jul', comment: '' },
      { status: 'listo', at: '15 jul', comment: '' },
      { status: 'entregado', at: '15 jul', comment: '' },
    ],
    diagnostic: { notes: 'Disco de embrague totalmente desgastado.', laborEstimate: 25000, checklist: { Frenos: 'ok', Luces: 'ok', 'Niveles de fluidos': 'ok', Batería: 'ok', Llantas: 'ok', Suspensión: 'ok', 'Correa/Distribución': 'ok', Filtros: 'ok' } },
    budgets: [
      { version: 1, items: [{ label: 'Kit de embrague', qty: 1, price: 145000 }, { label: 'Mano de obra', qty: 1, price: 25000 }], taxRate: 0.13, createdAt: '12 jul', status: 'aprobado', clientComment: '' },
    ],
    photos: { antes: [], durante: [], despues: [] },
    rating: { stars: 5, comment: 'Excelente atención, muy claros con el diagnóstico.' },
  },
]

// RF-01/02/03: solicitudes entrantes que el Administrador aún no ha convertido en orden de trabajo
export const seedRequests = [
  {
    id: 'sol-1', clientId: 'u-cliente-1', vehicleId: 'v-1',
    serviceType: 'Diagnóstico general',
    description: 'Se enciende la luz de check engine de forma intermitente desde hace unos días.',
    photos: [{ name: 'check-engine.jpg', url: 'https://picsum.photos/seed/ccm-sol1/300/300' }],
    createdAt: '21 ago', status: 'pendiente',
  },
  {
    id: 'sol-2', clientId: 'u-cliente-4', vehicleId: 'v-6',
    serviceType: 'Revisión pre-vacaciones (RTV)',
    description: 'Vamos a viajar a Guanacaste el próximo mes, quiero una revisión general antes.',
    photos: [],
    createdAt: '22 ago', status: 'pendiente',
  },
  {
    id: 'sol-3', clientId: 'u-cliente-2', vehicleId: 'v-4',
    serviceType: 'Reparación',
    description: 'El aire acondicionado ya no enfría y hace un ruido raro al encenderlo.',
    photos: [{ name: 'ac.jpg', url: 'https://picsum.photos/seed/ccm-sol3a/300/300' }, { name: 'ac2.jpg', url: 'https://picsum.photos/seed/ccm-sol3b/300/300' }],
    createdAt: '22 ago', status: 'pendiente',
  },
  {
    id: 'sol-4', clientId: 'u-cliente-3', vehicleId: 'v-5',
    serviceType: 'Mantenimiento preventivo',
    description: 'Ya casi llega a los 95,000 km, quiero el mantenimiento correspondiente.',
    photos: [],
    createdAt: '23 ago', status: 'pendiente',
  },
]

export const seedAppointments = [
  { id: 'a-1', clientId: 'u-cliente-1', vehicleId: 'v-1', requestId: null, day: 'Lunes 24', time: '2:00pm', mechanicId: 'u-mec-1', status: 'confirmada' },
  { id: 'a-2', clientId: 'u-cliente-2', vehicleId: 'v-3', requestId: null, day: 'Martes 25', time: '9:00am', mechanicId: 'u-mec-2', status: 'confirmada' },
  { id: 'a-3', clientId: 'u-cliente-2', vehicleId: 'v-4', requestId: 'sol-3', day: 'Martes 25', time: '1:30pm', mechanicId: 'u-mec-1', status: 'confirmada' },
  { id: 'a-4', clientId: 'u-cliente-1', vehicleId: 'v-2', requestId: null, day: 'Jueves 27', time: '10:30am', mechanicId: 'u-mec-2', status: 'confirmada' },
  { id: 'a-5', clientId: 'u-cliente-4', vehicleId: 'v-6', requestId: 'sol-2', day: 'Lunes 24', time: '9:00am', mechanicId: 'u-mec-2', status: 'confirmada' },
  { id: 'a-6', clientId: 'u-cliente-3', vehicleId: 'v-5', requestId: 'sol-4', day: 'Miércoles 26', time: '8:00am', mechanicId: 'u-mec-1', status: 'confirmada' },
  { id: 'a-7', clientId: 'u-cliente-5', vehicleId: 'v-7', requestId: null, day: 'Viernes 28', time: '3:30pm', mechanicId: 'u-mec-2', status: 'confirmada' },
  { id: 'a-8', clientId: 'u-cliente-5', vehicleId: 'v-8', requestId: null, day: 'Miércoles 26', time: '1:30pm', mechanicId: 'u-mec-1', status: 'cancelada' },
]

export const seedMessages = {
  '#0512': [
    { from: 'admin', authorName: 'Taller CCM', text: 'Buenas, revisamos el vehículo. Confirmamos desgaste en pastillas y discos delanteros.', at: '19 ago, 2:02pm' },
    { from: 'cliente', authorName: 'Carlos Vargas', text: 'Perfecto, ¿cuánto tiempo toma el cambio?', at: '19 ago, 2:10pm' },
    { from: 'admin', authorName: 'Taller CCM', text: 'Aproximadamente 2 horas una vez aprobado el presupuesto.', at: '19 ago, 2:12pm' },
  ],
  '#0500': [
    { from: 'cliente', authorName: 'José Fallas', text: '¿Podrían darme una opción sin las rótulas por ahora? El presupuesto se me sale del presupuesto real jaja.', at: '02 ago, 4:20pm' },
    { from: 'admin', authorName: 'Taller CCM', text: 'Claro, le mando una versión ajustada solo con los amortiguadores.', at: '02 ago, 4:35pm' },
    { from: 'cliente', authorName: 'José Fallas', text: 'Esa sí me sirve, dale para adelante.', at: '03 ago, 8:05am' },
  ],
  '#0501': [
    { from: 'admin', authorName: 'Taller CCM', text: 'Ya instalamos la batería nueva, todo probado y funcionando.', at: '11 ago, 3:40pm' },
    { from: 'cliente', authorName: 'Ana Rojas', text: 'Excelente, paso mañana a retirarlo. ¡Gracias!', at: '11 ago, 4:00pm' },
  ],
  '#0513': [
    { from: 'cliente', authorName: 'Laura Méndez', text: 'Hola, ¿ya tienen algún avance del diagnóstico?', at: '21 ago, 10:00am' },
  ],
}

export const seedNotifications = [
  { id: 'n-1', userId: 'u-cliente-1', text: 'Tu presupuesto para la orden #0512 está listo para revisión.', read: false, at: '19 ago, 2:05pm', orderId: '#0512' },
  { id: 'n-2', userId: 'u-cliente-4', text: 'Tu orden #0501 cambió de estado a "Listo".', read: false, at: '11 ago, 3:15pm', orderId: '#0501' },
  { id: 'n-3', userId: 'u-cliente-2', text: 'Se registró el diagnóstico de tu orden #0513.', read: true, at: '20 ago, 9:15am', orderId: '#0513' },
  { id: 'n-4', userId: 'u-admin-1', text: 'Nueva solicitud de servicio de Ana Rojas.', read: false, at: '22 ago, 8:00am', orderId: null },
  { id: 'n-5', userId: 'u-admin-1', text: 'Nueva solicitud de servicio de Laura Méndez.', read: false, at: '22 ago, 11:20am', orderId: null },
  { id: 'n-6', userId: 'u-cliente-3', text: 'El taller te respondió en tu orden #0500.', read: true, at: '02 ago, 4:36pm', orderId: '#0500' },
]

export const maintenanceRules = [
  { service: 'Cambio de aceite y filtro', everyKm: 5000 },
  { service: 'Alineado y balanceo', everyKm: 10000 },
  { service: 'Revisión pre-vacaciones (RTV)', everyKm: null },
]

// RF-27/HU-53/HU-50: bitácora de movimientos de inventario ya existente (salidas por órdenes pasadas + un reabastecimiento)
export const seedMovements = [
  { id: 'mov-seed-1', partId: 'p-5', type: 'salida', qty: -1, at: '12 jul, 9:00am', orderId: '#0503' },
  { id: 'mov-seed-2', partId: 'p-7', type: 'salida', qty: -1, at: '10 ago, 3:30pm', orderId: '#0501' },
  { id: 'mov-seed-3', partId: 'p-6', type: 'salida', qty: -2, at: '03 ago, 8:15am', orderId: '#0500' },
  { id: 'mov-seed-4', partId: 'p-3', type: 'ajuste', qty: 20, at: '01 ago, 7:00am', orderId: null },
  { id: 'mov-seed-5', partId: 'p-1', type: 'ajuste', qty: -6, at: '15 jul, 8:00am', orderId: null },
]
