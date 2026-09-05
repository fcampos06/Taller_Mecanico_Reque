// Formato de moneda (colones) y helpers para usar el # de orden como parámetro de ruta
// (el carácter "#" no es válido dentro de un path de Vue Router, así que se omite en la URL).
export function formatCRC(n) {
  return '₡' + Number(n || 0).toLocaleString('es-CR')
}
export function toRouteId(orderId) {
  return orderId.replace('#', '')
}
export function toOrderId(routeId) {
  return '#' + String(routeId).replace('#', '')
}

// Parser de fechas en formato "DD mes" en español (ej. "19 ago"). Date() nativo de JS
// solo reconoce abreviaciones en inglés, y varias como "ago" (agosto) no coinciden con
// ninguna en inglés, así que se resuelven a mano en vez de dejarlo en manos de new Date().
const ES_MONTHS = { ene: 0, feb: 1, mar: 2, abr: 3, may: 4, jun: 5, jul: 6, ago: 7, sep: 8, oct: 9, nov: 10, dic: 11 }
export function parseEsDate(str, year = 2026) {
  const match = String(str).match(/(\d{1,2})\s+([a-zA-Zé]{3})/)
  if (!match) return null
  const day = Number(match[1])
  const month = ES_MONTHS[match[2].toLowerCase()]
  if (month === undefined) return null
  return new Date(year, month, day)
}
