import { getStore } from '@netlify/blobs'

const ALLOWED_STORES = new Set([
  'auth',
  'vehicles',
  'orders',
  'appointments',
  'inventory',
  'catalog',
  'messages',
  'notifications',
])

const json = (data, status = 200) => new Response(JSON.stringify(data), {
  status,
  headers: {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store, max-age=0',
  },
})

export default async (req) => {
  try {
    const url = new URL(req.url)
    const storeName = url.searchParams.get('store')

    if (!storeName || !ALLOWED_STORES.has(storeName)) {
      return json({ ok: false, error: 'Store inválido.' }, 400)
    }

    const database = getStore('taller-ccm-shared-state')

    if (req.method === 'GET') {
      const data = await database.get(storeName, {
        type: 'json',
        consistency: 'strong',
      })

      return json({ ok: true, data: data ?? null })
    }

    if (req.method === 'PUT') {
      const body = await req.json()

      if (!body || typeof body !== 'object' || Array.isArray(body)) {
        return json({ ok: false, error: 'Datos inválidos.' }, 400)
      }

      await database.setJSON(storeName, body)

      return json({ ok: true })
    }

    return json({
      ok: false,
      error: 'Método no permitido.',
    }, 405)

  } catch (error) {
    console.error('state function error:', error)

    return json({
      ok: false,
      error: 'No se pudo acceder al estado compartido.',
    }, 500)
  }
}