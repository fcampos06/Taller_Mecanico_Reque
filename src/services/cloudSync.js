import { useAuthStore } from '../stores/auth'
import { useVehiclesStore } from '../stores/vehicles'
import { useOrdersStore } from '../stores/orders'
import { useAppointmentsStore } from '../stores/appointments'
import { useInventoryStore } from '../stores/inventory'
import { useCatalogStore } from '../stores/catalog'
import { useMessagesStore } from '../stores/messages'
import { useNotificationsStore } from '../stores/notifications'

const API_URL = '/api/state'

const POLL_MS = 2000
const SAVE_DELAY_MS = 180

const CONFIG = [
  {
    key: 'auth',
    useStore: useAuthStore,
    fields: ['users'],
  },

  {
    key: 'vehicles',
    useStore: useVehiclesStore,
    fields: ['vehicles', 'handledReminderKeys'],
  },

  {
    key: 'orders',
    useStore: useOrdersStore,
    fields: ['requests', 'orders'],
  },

  {
    key: 'appointments',
    useStore: useAppointmentsStore,
    fields: ['appointments'],
  },

  {
    key: 'inventory',
    useStore: useInventoryStore,
    fields: ['parts', 'movements'],
  },

  {
    key: 'catalog',
    useStore: useCatalogStore,
    fields: ['services'],
  },

  {
    key: 'messages',
    useStore: useMessagesStore,
    fields: ['byOrder'],
  },

  {
    key: 'notifications',
    useStore: useNotificationsStore,
    fields: ['items'],
  },
]

function clone(value) {
  return JSON.parse(JSON.stringify(value))
}

function snapshot(store, fields) {

  const result = {}

  for (const field of fields) {
    result[field] = clone(store[field])
  }

  return result
}

function same(a, b) {
  return JSON.stringify(a) === JSON.stringify(b)
}

async function readRemote(key) {

  const res = await fetch(
    `${API_URL}?store=${encodeURIComponent(key)}&_=${Date.now()}`,
    {
      method: 'GET',
      cache: 'no-store',
      headers: {
        accept: 'application/json',
      },
    }
  )

  if (!res.ok) {
    throw new Error(`GET ${key}: ${res.status}`)
  }

  const body = await res.json()

  return body.data ?? null
}

async function writeRemote(key, data) {

  const res = await fetch(
    `${API_URL}?store=${encodeURIComponent(key)}`,
    {
      method: 'PUT',

      cache: 'no-store',

      headers: {
        'content-type': 'application/json',
      },

      body: JSON.stringify(data),
    }
  )

  if (!res.ok) {
    throw new Error(`PUT ${key}: ${res.status}`)
  }
}

function applyRemote(store, fields, data) {

  const patch = {}

  for (const field of fields) {

    if (
      Object.prototype.hasOwnProperty.call(
        data,
        field
      )
    ) {

      patch[field] = clone(data[field])

    }

  }

  store.$patch(patch)
}

async function syncOne(pinia, config) {

  const {
    key,
    useStore,
    fields,
  } = config

  const store = useStore(pinia)

  let applyingRemote = false
  let saving = false
  let dirty = false
  let pendingSave = false

  let saveTimer = null

  let lastKnown = snapshot(
    store,
    fields
  )

  try {

    const remote =
      await readRemote(key)

    if (remote) {

      applyingRemote = true

      lastKnown =
        clone(remote)

      applyRemote(
        store,
        fields,
        remote
      )

      setTimeout(() => {
        applyingRemote = false
      }, 0)

    } else {

      const initial =
        snapshot(
          store,
          fields
        )

      await writeRemote(
        key,
        initial
      )

      lastKnown = initial
    }

  } catch (error) {

    console.warn(
      `[cloudSync] No se pudo inicializar ${key}. Se continúa en modo local.`,
      error
    )

  }

  async function saveLatest() {

    if (saving) {

      pendingSave = true
      return

    }

    saving = true
    pendingSave = false

    try {

      const local =
        snapshot(
          store,
          fields
        )

      await writeRemote(
        key,
        local
      )

      lastKnown = local
      dirty = false

    } catch (error) {

      console.warn(
        `[cloudSync] No se pudo guardar ${key}.`,
        error
      )

      dirty = true

    } finally {

      saving = false

      if (pendingSave) {

        clearTimeout(
          saveTimer
        )

        saveTimer =
          setTimeout(
            saveLatest,
            SAVE_DELAY_MS
          )

      }

    }

  }

  store.$subscribe(
    () => {

      const local =
        snapshot(
          store,
          fields
        )

      if (
        applyingRemote ||
        same(
          local,
          lastKnown
        )
      ) {
        return
      }

      dirty = true

      clearTimeout(
        saveTimer
      )

      saveTimer =
        setTimeout(
          saveLatest,
          SAVE_DELAY_MS
        )

    },
    {
      detached: true,
      deep: true,
    }
  )

  setInterval(
    async () => {

      if (
        saving ||
        dirty ||
        applyingRemote
      ) {
        return
      }

      try {

        const remote =
          await readRemote(key)

        if (
          !remote ||
          same(
            remote,
            lastKnown
          )
        ) {
          return
        }

        applyingRemote = true

        lastKnown =
          clone(remote)

        applyRemote(
          store,
          fields,
          remote
        )

        setTimeout(() => {
          applyingRemote = false
        }, 0)

      } catch (error) {

        // Si temporalmente no hay
        // Internet simplemente
        // seguimos trabajando.

      }

    },
    POLL_MS
  )
}

export async function startCloudSync(pinia) {

  await Promise.all(

    CONFIG.map(
      config =>
        syncOne(
          pinia,
          config
        )
    )

  )

}