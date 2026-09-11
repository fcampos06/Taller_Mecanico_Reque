<script setup>

import {
  reactive,
  ref,
  computed
} from 'vue'

import {
  useAuthStore
} from '../../stores/auth'

import {
  useVehiclesStore
} from '../../stores/vehicles'

import {
  useOrdersStore
} from '../../stores/orders'

import {
  useCatalogStore
} from '../../stores/catalog'

import {
  useUiStore
} from '../../stores/ui'

import FileDrop
  from '../../components/ui/FileDrop.vue'

import {
  parseEsDate
} from '../../utils/format'


const auth =
  useAuthStore()

const vehiclesStore =
  useVehiclesStore()

const orders =
  useOrdersStore()

const catalog =
  useCatalogStore()

const ui =
  useUiStore()


// ============================================================
// DATOS DEL CLIENTE
// ============================================================

const myVehicles =
  computed(
    () =>
      vehiclesStore.byOwner(
        auth.currentUser.id
      )
  )


const myRequests =
  computed(
    () =>
      orders.requests
        .filter(
          r =>
            r.clientId ===
            auth.currentUser.id
        )
        .sort(
          (a, b) =>
            (
              parseEsDate(
                b.createdAt
              )?.getTime() || 0
            ) -
            (
              parseEsDate(
                a.createdAt
              )?.getTime() || 0
            )
        )
  )


// ============================================================
// FORMULARIO
// ============================================================

const form =
  reactive({

    vehicleId:
      myVehicles.value[0]?.id ||
      '',

    serviceType:
      'Diagnóstico general',

    description:
      '',

    photos:
      [],

  })


const serviceTypes = [

  'Mantenimiento preventivo',

  'Reparación',

  'Revisión',

  'Diagnóstico general',

]


const sent =
  ref(false)

const lastRequest =
  ref(null)

const expandedRequestId =
  ref(null)


// ============================================================
// FOTOS
// ============================================================

function addPhoto(p) {

  form.photos.push(p)

}


function removePhoto(i) {

  form.photos.splice(
    i,
    1
  )

}


// ============================================================
// VEHÍCULO
// ============================================================

function vehicleLabel(id) {

  const v =
    vehiclesStore.byId(id)

  return v
    ? `${v.brand} ${v.model} — ${v.plate}`
    : 'Vehículo no disponible'

}


// ============================================================
// EXPANDIR SOLICITUD
// ============================================================

function toggleRequest(id) {

  expandedRequestId.value =
    expandedRequestId.value === id
      ? null
      : id

}


// ============================================================
// ENVIAR SOLICITUD
// ============================================================

function submit() {

  if (
    !form.vehicleId ||
    !form.description.trim()
  ) {

    ui.showToast(
      'Completá el vehículo y la descripción del problema.',
      'error'
    )

    return

  }


  const req =
    orders.createRequest(
      auth.currentUser.id,
      {

        vehicleId:
          form.vehicleId,

        serviceType:
          form.serviceType,

        description:
          form.description.trim(),

        photos:
          form.photos,

      }
    )


  lastRequest.value =
    req

  sent.value =
    true

  expandedRequestId.value =
    req.id


  ui.showToast(
    'Solicitud enviada al taller ✔'
  )


  form.description =
    ''

  form.photos =
    []

}


function newRequest() {

  sent.value =
    false

  lastRequest.value =
    null

}


// ============================================================
// CANCELAR SOLICITUD
// ============================================================

function cancelRequest(request) {

  if (
    request.status !==
    'pendiente'
  ) {

    ui.showToast(
      'Esta solicitud ya no se puede cancelar.',
      'error'
    )

    return

  }


  const confirmed =
    window.confirm(
      '¿Seguro que querés cancelar esta solicitud?'
    )


  if (!confirmed) {
    return
  }


  const result =
    orders.cancelRequest(
      request.id,
      auth.currentUser.id
    )


  if (!result.ok) {

    ui.showToast(
      result.message,
      'error'
    )

    return

  }


  ui.showToast(
    'Solicitud cancelada correctamente.'
  )

}


// ============================================================
// ESTADOS
// ============================================================

function statusLabel(status) {

  const labels = {

    pendiente:
      'Solicitud enviada',

    convertida:
      'Convertida en orden',

    rechazada:
      'Rechazada por el taller',

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
      'b-solicitud',

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

  <div
    style="
      max-width:760px;
    "
  >


    <!-- ======================================================== -->
    <!-- SOLICITUD ENVIADA                                       -->
    <!-- ======================================================== -->

    <div
      v-if="sent"
      class="card"
    >

      <div
        class="card-body"
        style="
          text-align:center;
          padding:40px 24px;
        "
      >

        <i
          class="bi bi-check-circle-fill"
          style="
            font-size:2.6rem;
            color:var(--green);
          "
        ></i>


        <h3
          style="
            margin:14px 0 6px;
          "
        >
          Solicitud enviada
        </h3>


        <p
          class="text-muted"
        >

          Tu solicitud

          <b
            class="mono"
          >
            {{ lastRequest.id }}
          </b>

          quedó registrada con estado

          <span
            class="badge b-solicitud"
            style="
              margin-left:4px;
            "
          >
            Solicitud enviada
          </span>.

          El taller la revisará y te avisaremos por notificación.

        </p>


        <button
          class="btn btn-primary"
          style="
            margin-top:16px;
          "
          @click="
            newRequest
          "
        >
          Enviar otra solicitud
        </button>

      </div>

    </div>


    <!-- ======================================================== -->
    <!-- NUEVA SOLICITUD                                         -->
    <!-- ======================================================== -->

    <div
      v-else
      class="card"
    >

      <div
        class="card-body form-stack"
      >

        <h4
          style="
            margin-top:0;
          "
        >
          Nueva solicitud de servicio
        </h4>


        <div
          class="field"
        >

          <label>
            Vehículo
          </label>


          <select
            v-model="
              form.vehicleId
            "
          >

            <option
              v-for="v in myVehicles"
              :key="v.id"
              :value="v.id"
            >

              {{ v.brand }}
              {{ v.model }}
              —
              {{ v.plate }}

            </option>

          </select>


          <p
            v-if="
              !myVehicles.length
            "
            class="field-hint"
          >
            No tenés vehículos registrados todavía — registrá uno primero.
          </p>

        </div>


        <div
          class="field"
        >

          <label>
            Tipo de servicio
          </label>


          <select
            v-model="
              form.serviceType
            "
          >

            <option
              v-for="t in serviceTypes"
              :key="t"
            >
              {{ t }}
            </option>

          </select>

        </div>


        <div
          class="field"
        >

          <label>
            ¿Qué le pasa al vehículo?
          </label>


          <textarea
            rows="4"
            v-model="
              form.description
            "
            placeholder="Ej: hace un ruido metálico al frenar y el pedal se siente esponjoso..."
          ></textarea>

        </div>


        <div
          class="field"
        >

          <label>
            Fotos (opcional)
          </label>


          <FileDrop
            @add="
              addPhoto
            "
          />


          <div
            v-if="
              form.photos.length
            "
            class="photo-row"
          >

            <div
              class="photo-thumb"
              v-for="(p, i) in form.photos"
              :key="i"
            >

              <img
                :src="p.url"
                :alt="p.name"
                @click="
                  ui.openLightbox(
                    p.url
                  )
                "
              >


              <button
                type="button"
                @click="
                  removePhoto(i)
                "
              >

                <i
                  class="bi bi-x"
                ></i>

              </button>

            </div>

          </div>

        </div>


        <button
          class="btn btn-primary btn-block"
          :disabled="
            !myVehicles.length
          "
          @click="
            submit
          "
        >

          <i
            class="bi bi-send-check"
          ></i>

          Enviar solicitud

        </button>


        <p
          class="field-hint"
          style="
            text-align:center;
          "
        >
          Después de que el taller revise tu solicitud, podés asociarla a una cita desde "Mis citas".
        </p>

      </div>

    </div>


    <!-- ======================================================== -->
    <!-- MIS SOLICITUDES                                         -->
    <!-- ======================================================== -->

    <div
      class="card"
      style="
        margin-top:20px;
      "
    >

      <div
        class="card-body"
      >

        <div
          class="flex-between"
          style="
            margin-bottom:12px;
          "
        >

          <div
            class="eyebrow"
          >
            Mis solicitudes
          </div>


          <span
            class="badge b-diag"
          >
            {{ myRequests.length }}
          </span>

        </div>


        <div
          v-if="
            myRequests.length
          "
          class="request-list"
        >

          <div
            v-for="r in myRequests"
            :key="r.id"
            class="request-item"
          >

            <!-- ================================================= -->
            <!-- CABECERA SOLICITUD                               -->
            <!-- ================================================= -->

            <button
              class="request-head"
              type="button"
              @click="
                toggleRequest(
                  r.id
                )
              "
            >

              <span>

                <b
                  class="mono"
                >
                  {{ r.id }}
                </b>

                <span
                  class="text-muted"
                >
                  ·
                  {{ r.createdAt }}
                  ·
                  {{ vehicleLabel(r.vehicleId) }}
                </span>

              </span>


              <span
                class="flex gap-8"
                style="
                  align-items:center;
                "
              >

                <span
                  class="badge"
                  :class="
                    statusClass(
                      r.status
                    )
                  "
                >
                  {{ statusLabel(r.status) }}
                </span>


                <i
                  class="bi"
                  :class="
                    expandedRequestId === r.id
                      ? 'bi-chevron-up'
                      : 'bi-chevron-down'
                  "
                ></i>

              </span>

            </button>


            <!-- ================================================= -->
            <!-- DETALLE                                          -->
            <!-- ================================================= -->

            <div
              v-if="
                expandedRequestId === r.id
              "
              class="request-detail"
            >

              <div>
                <b>
                  {{ r.serviceType }}
                </b>
              </div>


              <p
                class="text-muted"
              >
                {{ r.description }}
              </p>


              <!-- RECHAZADA -->

              <div
                v-if="
                  r.status === 'rechazada'
                "
                class="request-alert request-alert-danger"
              >

                <div
                  class="request-alert-title"
                >

                  <i
                    class="bi bi-x-circle-fill"
                  ></i>

                  Solicitud rechazada por el taller

                </div>


                <p
                  v-if="
                    r.rejectionReason
                  "
                >

                  <b>
                    Motivo:
                  </b>

                  {{ r.rejectionReason }}

                </p>

              </div>


              <!-- CANCELADA -->

              <div
                v-if="
                  r.status === 'cancelada'
                "
                class="request-alert"
              >

                <div
                  class="request-alert-title"
                >

                  <i
                    class="bi bi-info-circle-fill"
                  ></i>

                  Esta solicitud fue cancelada.

                </div>

              </div>


              <!-- FOTOS -->

              <div
                v-if="
                  r.photos &&
                  r.photos.length
                "
                class="request-photos"
              >

                <img
                  v-for="(p, i) in r.photos"
                  :key="i"
                  :src="p.url"
                  :alt="p.name"
                  @click="
                    ui.openLightbox(
                      p.url
                    )
                  "
                >

              </div>


              <p
                v-else
                class="field-hint"
              >
                Sin fotografías adjuntas.
              </p>


              <!-- CANCELAR -->

              <div
                v-if="
                  r.status === 'pendiente'
                "
                class="request-actions"
              >

                <button
                  class="btn btn-danger-ghost btn-sm"
                  @click="
                    cancelRequest(r)
                  "
                >

                  <i
                    class="bi bi-x-circle"
                  ></i>

                  Cancelar solicitud

                </button>

              </div>

            </div>

          </div>

        </div>


        <p
          v-else
          class="text-muted"
          style="
            font-size:.86rem;
          "
        >
          Todavía no has enviado solicitudes.
        </p>

      </div>

    </div>


    <!-- ======================================================== -->
    <!-- TARIFAS                                                 -->
    <!-- ======================================================== -->

    <div
      class="card"
      style="
        margin-top:20px;
      "
    >

      <div
        class="card-body"
      >

        <div
          class="eyebrow"
          style="
            margin-bottom:10px;
          "
        >
          Tarifas de referencia
        </div>


        <table>

          <tbody>

            <tr
              v-for="
                s in catalog.services.slice(
                  0,
                  4
                )
              "
              :key="s.id"
            >

              <td>
                {{ s.name }}
              </td>


              <td
                class="mono text-right"
              >
                desde ₡{{ s.rate.toLocaleString('es-CR') }}
              </td>

            </tr>

          </tbody>

        </table>


        <router-link
          to="/cliente/catalogo"
          class="field-hint"
          style="
            display:inline-block;
            margin-top:8px;
          "
        >

          Ver catálogo completo

          <i
            class="bi bi-arrow-right"
          ></i>

        </router-link>

      </div>

    </div>

  </div>

</template>


<style scoped>

.photo-row {

  display: flex;

  gap: 8px;

  flex-wrap: wrap;

  margin-top: 10px;

}


.photo-thumb {

  position: relative;

  width: 64px;

  height: 64px;

  border-radius: 8px;

  border:
    1px solid
    var(--border);

}


.photo-thumb img {

  width: 100%;

  height: 100%;

  object-fit: cover;

  border-radius: 8px;

  cursor: zoom-in;

}


.photo-thumb button {

  position: absolute;

  top: -5px;

  right: -5px;

  background:
    rgba(
      0,
      0,
      0,
      .78
    );

  color: #fff;

  border: none;

  border-radius: 50%;

  width: 20px;

  height: 20px;

  font-size: .7rem;

  line-height: 1;

}


.request-list {

  display: flex;

  flex-direction: column;

  gap: 8px;

}


.request-item {

  border:
    1px solid
    var(--border);

  border-radius: 10px;

  overflow: hidden;

}


.request-head {

  width: 100%;

  border: 0;

  background:
    var(--card);

  padding:
    11px 12px;

  display: flex;

  justify-content:
    space-between;

  align-items:
    center;

  gap: 12px;

  text-align: left;

  color: inherit;

}


.request-detail {

  padding: 12px;

  border-top:
    1px solid
    var(--border);

  background:
    var(--paper);

  font-size: .86rem;

}


.request-detail p {

  margin:
    6px 0 10px;

}


.request-photos {

  display: grid;

  grid-template-columns:
    repeat(
      auto-fill,
      minmax(
        80px,
        1fr
      )
    );

  gap: 8px;

}


.request-photos img {

  width: 100%;

  aspect-ratio: 1;

  object-fit: cover;

  border-radius: 8px;

  cursor: zoom-in;

  border:
    1px solid
    var(--border);

}


.request-actions {

  display: flex;

  justify-content:
    flex-end;

  margin-top: 14px;

  padding-top: 12px;

  border-top:
    1px solid
    var(--border);

}


.request-alert {

  margin:
    10px 0;

  padding:
    12px 14px;

  background:
    #E7ECF1;

  border-radius:
    10px;

  color:
    #3D5166;

}


.request-alert-danger {

  background:
    var(--red-bg);

  color:
    var(--red);

}


.request-alert-title {

  display: flex;

  align-items: center;

  gap: 7px;

  font-weight: 700;

}


.request-alert p {

  margin:
    7px 0 0;

  color: inherit;

}


@media (max-width: 680px) {

  .request-head {

    align-items:
      flex-start;

    flex-direction:
      column;

  }


  .request-actions {

    justify-content:
      stretch;

  }


  .request-actions .btn {

    width: 100%;

  }

}

</style>