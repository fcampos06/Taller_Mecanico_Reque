<script setup>

import {
  ref,
  computed
} from 'vue'

import {
  useRouter
} from 'vue-router'

import {
  useOrdersStore
} from '../../stores/orders'

import {
  useAuthStore
} from '../../stores/auth'

import {
  useVehiclesStore
} from '../../stores/vehicles'

import {
  useUiStore
} from '../../stores/ui'

import BaseModal
  from '../../components/ui/BaseModal.vue'

import {
  toRouteId,
  parseEsDate
} from '../../utils/format'


const orders =
  useOrdersStore()

const auth =
  useAuthStore()

const vehiclesStore =
  useVehiclesStore()

const ui =
  useUiStore()

const router =
  useRouter()


function clientName(id) {

  return (
    auth.userById(id)?.name ||
    '—'
  )

}


function vehicleLabel(id) {

  const v =
    vehiclesStore.byId(id)

  return v
    ? `${v.brand} ${v.model} — ${v.plate}`
    : '—'

}


// ============================================================
// FILTROS
// ============================================================

const filterStatus =
  ref('pendiente')

const filterService =
  ref('Todos')

const filterClient =
  ref('Todos')


const serviceTypes =
  computed(
    () => [

      'Todos',

      ...new Set(
        orders.requests.map(
          r => r.serviceType
        )
      )

    ]
  )


const clientNames =
  computed(
    () => [

      'Todos',

      ...new Set(
        orders.requests.map(
          r =>
            clientName(
              r.clientId
            )
        )
      )

    ]
  )


const list =
  computed(
    () => {

      let items =
        orders.requests


      if (
        filterStatus.value !==
        'Todos'
      ) {

        items =
          items.filter(
            r =>
              r.status ===
              filterStatus.value
          )

      }


      if (
        filterService.value !==
        'Todos'
      ) {

        items =
          items.filter(
            r =>
              r.serviceType ===
              filterService.value
          )

      }


      if (
        filterClient.value !==
        'Todos'
      ) {

        items =
          items.filter(
            r =>
              clientName(
                r.clientId
              ) ===
              filterClient.value
          )

      }


      return [
        ...items
      ].sort(
        (a, b) => {

          const ad =
            parseEsDate(
              a.createdAt
            )?.getTime() || 0

          const bd =
            parseEsDate(
              b.createdAt
            )?.getTime() || 0

          return bd - ad

        }
      )

    }
  )


// ============================================================
// CONVERTIR EN ORDEN
// ============================================================

const modalOpen =
  ref(false)

const selected =
  ref(null)

const mechanicId =
  ref('')


function openConvert(req) {

  selected.value =
    req

  mechanicId.value =
    auth.activeMechanics[0]?.id ||
    ''

  modalOpen.value =
    true

}


function confirmConvert() {

  if (
    !mechanicId.value
  ) {

    ui.showToast(
      'No hay mecánicos activos para asignar la orden.',
      'error'
    )

    return

  }


  const order =
    orders.convertToOrder(
      selected.value.id,
      mechanicId.value
    )


  if (!order) {

    ui.showToast(
      'No se pudo convertir la solicitud.',
      'error'
    )

    return

  }


  modalOpen.value =
    false


  ui.showToast(
    `Orden ${order.id} creada ✔`
  )


  router.push(
    '/admin/orden/' +
    toRouteId(
      order.id
    )
  )

}


// ============================================================
// RECHAZAR SOLICITUD
// ============================================================

const rejectModalOpen =
  ref(false)

const requestToReject =
  ref(null)

const rejectReason =
  ref('')


function openReject(req) {

  requestToReject.value =
    req

  rejectReason.value =
    ''

  rejectModalOpen.value =
    true

}


function closeReject() {

  rejectModalOpen.value =
    false

  requestToReject.value =
    null

  rejectReason.value =
    ''

}


function confirmReject() {

  if (
    !requestToReject.value
  ) {
    return
  }


  if (
    !rejectReason.value.trim()
  ) {

    ui.showToast(
      'Indicá el motivo del rechazo.',
      'error'
    )

    return

  }


  const result =
    orders.rejectRequest(
      requestToReject.value.id,
      rejectReason.value
    )


  if (!result.ok) {

    ui.showToast(
      result.message,
      'error'
    )

    return

  }


  closeReject()


  ui.showToast(
    'Solicitud rechazada correctamente.'
  )

}


// ============================================================
// ESTADOS
// ============================================================

function statusLabel(status) {

  const labels = {

    pendiente:
      'Pendiente',

    convertida:
      'Convertida',

    rechazada:
      'Rechazada',

    cancelada:
      'Cancelada',

  }

  return (
    labels[status] ||
    status
  )

}


function statusClass(status) {

  const classes = {

    pendiente:
      'b-espera',

    convertida:
      'b-listo',

    rechazada:
      'b-rechazado',

    cancelada:
      'b-diag',

  }

  return (
    classes[status] ||
    'b-diag'
  )

}

</script>


<template>

  <div class="card">

    <div class="card-body">


      <!-- ====================================================== -->
      <!-- CABECERA Y FILTROS                                     -->
      <!-- ====================================================== -->

      <div
        class="flex-between"
        style="
          margin-bottom:16px;
          flex-wrap:wrap;
          gap:10px;
        "
      >

        <h4
          class="mt-0 mb-0"
        >
          Solicitudes
          ({{ list.length }})
        </h4>


        <select
          v-model="filterStatus"
          style="
            border:1.5px solid var(--border);
            border-radius:10px;
            padding:8px 12px;
          "
        >

          <option value="pendiente">
            Pendientes
          </option>

          <option value="convertida">
            Convertidas
          </option>

          <option value="rechazada">
            Rechazadas
          </option>

          <option value="cancelada">
            Canceladas por cliente
          </option>

          <option value="Todos">
            Todos los estados
          </option>

        </select>


        <select
          v-model="filterService"
          style="
            border:1.5px solid var(--border);
            border-radius:10px;
            padding:8px 12px;
          "
        >

          <option
            v-for="t in serviceTypes"
            :key="t"
          >
            {{ t }}
          </option>

        </select>


        <select
          v-model="filterClient"
          style="
            border:1.5px solid var(--border);
            border-radius:10px;
            padding:8px 12px;
          "
        >

          <option
            v-for="c in clientNames"
            :key="c"
          >
            {{ c }}
          </option>

        </select>

      </div>


      <!-- ====================================================== -->
      <!-- TABLA                                                  -->
      <!-- ====================================================== -->

      <div class="table-wrap">

        <table>

          <thead>

            <tr>

              <th>
                Fecha
              </th>

              <th>
                Cliente
              </th>

              <th>
                Vehículo
              </th>

              <th>
                Tipo
              </th>

              <th>
                Estado
              </th>

              <th>
                Fotos
              </th>

              <th
                class="text-right"
              >
                Acción
              </th>

            </tr>

          </thead>


          <tbody>

            <tr
              v-for="r in list"
              :key="r.id"
            >

              <td
                class="mono"
              >
                {{ r.createdAt }}
              </td>


              <td>
                {{ clientName(r.clientId) }}
              </td>


              <td>
                {{ vehicleLabel(r.vehicleId) }}
              </td>


              <td>

                <span
                  class="badge b-solicitud"
                >
                  {{ r.serviceType }}
                </span>

              </td>


              <td>

                <span
                  class="badge"
                  :class="statusClass(r.status)"
                >
                  {{ statusLabel(r.status) }}
                </span>

                <div
                  v-if="
                    r.status === 'rechazada' &&
                    r.rejectionReason
                  "
                  class="reject-reason"
                >
                  {{ r.rejectionReason }}
                </div>

              </td>


              <td>

                <div
                  v-if="
                    r.photos &&
                    r.photos.length
                  "
                  class="photo-thumbs"
                >

                  <img
                    v-for="(p, i) in r.photos"
                    :key="i"
                    :src="p.url"
                    :title="p.name"
                    @click="
                      ui.openLightbox(
                        p.url
                      )
                    "
                  >

                </div>


                <span
                  v-else
                  class="text-muted"
                >
                  —
                </span>

              </td>


              <td
                class="text-right"
              >

                <div
                  v-if="
                    r.status === 'pendiente'
                  "
                  class="actions"
                >

                  <button
                    class="btn btn-primary btn-sm"
                    @click="
                      openConvert(r)
                    "
                  >

                    <i
                      class="bi bi-wrench-adjustable"
                    ></i>

                    Convertir

                  </button>


                  <button
                    class="btn btn-danger-ghost btn-sm"
                    @click="
                      openReject(r)
                    "
                  >

                    <i
                      class="bi bi-x-circle"
                    ></i>

                    Rechazar

                  </button>

                </div>


                <span
                  v-else-if="
                    r.status === 'convertida'
                  "
                  class="text-muted"
                >
                  Convertida en orden
                </span>


                <span
                  v-else-if="
                    r.status === 'rechazada'
                  "
                  class="text-muted"
                >
                  Rechazada
                </span>


                <span
                  v-else-if="
                    r.status === 'cancelada'
                  "
                  class="text-muted"
                >
                  Cancelada por cliente
                </span>

              </td>

            </tr>


            <tr
              v-if="
                !list.length
              "
            >

              <td
                colspan="7"
                style="
                  text-align:center;
                  color:var(--muted);
                  padding:26px;
                "
              >
                No hay solicitudes que coincidan con los filtros.
              </td>

            </tr>

          </tbody>

        </table>

      </div>

    </div>

  </div>


  <!-- ========================================================== -->
  <!-- MODAL CONVERTIR EN ORDEN                                   -->
  <!-- ========================================================== -->

  <BaseModal
    v-if="
      modalOpen &&
      selected
    "
    title="Convertir en orden de trabajo"
    @close="
      modalOpen = false
    "
  >

    <div
      class="form-stack"
    >

      <p
        style="
          font-size:.88rem;
          color:var(--muted);
        "
      >
        {{ selected.description }}
      </p>


      <div
        v-if="
          selected.photos &&
          selected.photos.length
        "
        class="photo-grid-modal"
      >

        <img
          v-for="(p, i) in selected.photos"
          :key="i"
          :src="p.url"
          @click="
            ui.openLightbox(
              p.url
            )
          "
        >

      </div>


      <div
        class="field"
      >

        <label>
          Asignar a mecánico activo
        </label>


        <select
          v-model="mechanicId"
        >

          <option
            v-for="m in auth.activeMechanics"
            :key="m.id"
            :value="m.id"
          >

            {{ m.name }}
            ({{ orders.workloadByMechanic(m.id) }} activas)

          </option>

        </select>

      </div>

    </div>


    <template #footer>

      <button
        class="btn btn-primary btn-block"
        :disabled="
          !mechanicId
        "
        @click="
          confirmConvert
        "
      >
        Crear orden de trabajo
      </button>

    </template>

  </BaseModal>


  <!-- ========================================================== -->
  <!-- MODAL RECHAZAR SOLICITUD                                   -->
  <!-- ========================================================== -->

  <BaseModal
    v-if="
      rejectModalOpen &&
      requestToReject
    "
    title="Rechazar solicitud"
    @close="
      closeReject
    "
  >

    <div
      class="form-stack"
    >

      <div
        class="reject-info"
      >

        <div>
          <b>
            {{ clientName(requestToReject.clientId) }}
          </b>
        </div>

        <div
          class="text-muted"
        >
          {{ vehicleLabel(requestToReject.vehicleId) }}
        </div>

        <div
          class="text-muted"
          style="
            margin-top:6px;
          "
        >
          {{ requestToReject.description }}
        </div>

      </div>


      <div
        class="field"
      >

        <label>
          Motivo del rechazo
        </label>

        <textarea
          v-model="rejectReason"
          rows="4"
          placeholder="Ej: actualmente no contamos con el equipo necesario para realizar este servicio."
        ></textarea>

        <p
          class="field-hint"
        >
          Este motivo será visible para el cliente.
        </p>

      </div>

    </div>


    <template #footer>

      <div
        class="modal-actions"
      >

        <button
          class="btn btn-ghost"
          @click="
            closeReject
          "
        >
          Cancelar
        </button>


        <button
          class="btn btn-danger-ghost"
          @click="
            confirmReject
          "
        >

          <i
            class="bi bi-x-circle"
          ></i>

          Confirmar rechazo

        </button>

      </div>

    </template>

  </BaseModal>

</template>


<style scoped>

.table-wrap {
  overflow-x: auto;
}


.photo-thumbs {
  display: flex;
  gap: 4px;
}


.photo-thumbs img {

  width: 32px;

  height: 32px;

  object-fit: cover;

  border-radius: 6px;

  border:
    1px solid
    var(--border);

  cursor: zoom-in;

}


.photo-grid-modal {

  display: grid;

  grid-template-columns:
    repeat(
      3,
      1fr
    );

  gap: 8px;

}


.photo-grid-modal img {

  width: 100%;

  aspect-ratio: 1;

  object-fit: cover;

  border-radius: 10px;

  border:
    1px solid
    var(--border);

  cursor: zoom-in;

}


.actions {

  display: flex;

  justify-content: flex-end;

  flex-wrap: wrap;

  gap: 7px;

}


.reject-reason {

  max-width: 180px;

  margin-top: 5px;

  font-size: .72rem;

  color: var(--muted);

  line-height: 1.3;

}


.reject-info {

  padding: 12px 14px;

  border:
    1px solid
    var(--border);

  border-radius: 10px;

  background:
    var(--paper);

  font-size: .88rem;

}


.modal-actions {

  width: 100%;

  display: flex;

  justify-content: flex-end;

  gap: 8px;

}


@media (max-width: 760px) {

  .actions {

    flex-direction: column;

  }


  .modal-actions {

    flex-direction: column;

  }


  .modal-actions .btn {

    width: 100%;

  }

}

</style>