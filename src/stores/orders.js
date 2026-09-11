import { defineStore } from 'pinia'
import {
  seedOrders,
  seedRequests,
  seedChecklistPoints
} from '../data/seed'

import { useNotificationsStore } from './notifications'
import { useInventoryStore } from './inventory'

export const CHECKLIST_POINTS = seedChecklistPoints

export const STATUS_LABEL = {
  solicitud: 'Solicitud enviada',
  diagnostico: 'Diagnóstico',
  presupuesto: 'Presupuesto generado',
  espera: 'Esperando aprobación',
  aprobado: 'Aprobado',
  rechazado: 'Rechazado',
  proceso: 'En proceso',
  listo: 'Listo',
  entregado: 'Entregado',
}

export const STATUS_BADGE = {
  solicitud: 'b-solicitud',
  diagnostico: 'b-diag',
  presupuesto: 'b-diag',
  espera: 'b-espera',
  aprobado: 'b-proceso',
  proceso: 'b-proceso',
  listo: 'b-listo',
  entregado: 'b-listo',
  rechazado: 'b-rechazado',
}


function nextOrderId(orders) {

  const maxId = orders.reduce(
    (max, order) => {

      const n = Number.parseInt(
        String(order.id || '').replace(/\D/g, ''),
        10
      )

      return Number.isFinite(n)
        ? Math.max(max, n)
        : max

    },
    514
  )

  return `#${String(maxId + 1).padStart(4, '0')}`
}


function nowStr() {

  const d = new Date()

  return d.toLocaleString(
    'es-CR',
    {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    }
  )

}


export const useOrdersStore = defineStore(
  'orders',
  {

    state: () => ({

      requests: JSON.parse(
        JSON.stringify(seedRequests)
      ),

      orders: JSON.parse(
        JSON.stringify(seedOrders)
      ),

    }),


    getters: {

      ordersForClient:
        (state) =>
          (clientId) =>
            state.orders.filter(
              o => o.clientId === clientId
            ),


      ordersForMechanic:
        (state) =>
          (mechanicId) =>
            state.orders.filter(
              o => o.mechanicId === mechanicId
            ),


      orderById:
        (state) =>
          (id) =>
            state.orders.find(
              o => o.id === id
            ) || null,


      pendingRequests:
        (state) =>
          state.requests.filter(
            r => r.status === 'pendiente'
          ),


      activeCount:
        (state) =>
          state.orders.filter(
            o =>
              ![
                'entregado',
                'rechazado'
              ].includes(o.status)
          ).length,


      waitingApprovalCount:
        (state) =>
          state.orders.filter(
            o => o.status === 'espera'
          ).length,


      completedCount:
        (state) =>
          state.orders.filter(
            o => o.status === 'entregado'
          ).length,


      currentBudget:
        () =>
          (order) =>
            order.budgets[
              order.budgets.length - 1
            ] || null,


      workloadByMechanic:
        (state) =>
          (mechanicId) =>
            state.orders.filter(
              o =>
                o.mechanicId === mechanicId &&
                ![
                  'entregado',
                  'rechazado'
                ].includes(o.status)
            ).length,


      vehicleHasActiveOrders:
        (state) =>
          (vehicleId) =>
            state.orders.some(
              o =>
                o.vehicleId === vehicleId &&
                ![
                  'entregado',
                  'rechazado'
                ].includes(o.status)
            ),

    },


    actions: {

      // ============================================================
      // CREAR SOLICITUD
      // ============================================================

      createRequest(
        clientId,
        {
          vehicleId,
          serviceType,
          description,
          photos
        }
      ) {

        const req = {

          id: 'sol-' + Date.now(),

          clientId,

          vehicleId,

          serviceType,

          description,

          photos: photos || [],

          createdAt: nowStr(),

          status: 'pendiente',

          rejectionReason: '',

          decidedAt: null,

          cancelledAt: null,

        }

        this.requests.unshift(req)

        const notif =
          useNotificationsStore()

        notif.push(
          'u-admin-1',
          `Nueva solicitud de servicio recibida (${serviceType}).`
        )

        return req

      },


      // ============================================================
      // ADMINISTRADOR RECHAZA SOLICITUD
      // ============================================================

      rejectRequest(
        requestId,
        reason = ''
      ) {

        const req =
          this.requests.find(
            r => r.id === requestId
          )

        if (!req) {

          return {
            ok: false,
            message:
              'Solicitud no encontrada.'
          }

        }

        if (
          req.status !== 'pendiente'
        ) {

          return {
            ok: false,
            message:
              'Solo se pueden rechazar solicitudes pendientes.'
          }

        }

        const cleanReason =
          String(reason || '').trim()

        if (!cleanReason) {

          return {
            ok: false,
            message:
              'Indicá el motivo del rechazo.'
          }

        }

        req.status =
          'rechazada'

        req.rejectionReason =
          cleanReason

        req.decidedAt =
          nowStr()

        const notif =
          useNotificationsStore()

        notif.push(
          req.clientId,
          `Tu solicitud de servicio fue rechazada: ${cleanReason}`
        )

        return {
          ok: true
        }

      },


      // ============================================================
      // CLIENTE CANCELA SU SOLICITUD
      // ============================================================

      cancelRequest(
        requestId,
        clientId
      ) {

        const req =
          this.requests.find(
            r => r.id === requestId
          )

        if (!req) {

          return {
            ok: false,
            message:
              'Solicitud no encontrada.'
          }

        }

        if (
          req.clientId !== clientId
        ) {

          return {
            ok: false,
            message:
              'No podés cancelar una solicitud que no te pertenece.'
          }

        }

        if (
          req.status !== 'pendiente'
        ) {

          return {
            ok: false,
            message:
              'Solo se pueden cancelar solicitudes pendientes.'
          }

        }

        req.status =
          'cancelada'

        req.cancelledAt =
          nowStr()

        const notif =
          useNotificationsStore()

        notif.push(
          'u-admin-1',
          `El cliente canceló la solicitud ${req.id}.`
        )

        return {
          ok: true
        }

      },


      // ============================================================
      // CONVERTIR SOLICITUD EN ORDEN
      // ============================================================

      convertToOrder(
        requestId,
        mechanicId
      ) {

        const req =
          this.requests.find(
            r => r.id === requestId
          )

        if (
          !req ||
          req.status !== 'pendiente'
        ) {
          return null
        }

        req.status =
          'convertida'

        req.decidedAt =
          nowStr()

        const order = {

          id:
            nextOrderId(
              this.orders
            ),

          requestId:
            req.id,

          clientId:
            req.clientId,

          vehicleId:
            req.vehicleId,

          mechanicId,

          assignmentHistory: [
            {
              mechanicId,
              at: nowStr()
            }
          ],

          serviceType:
            req.serviceType,

          description:
            req.description,

          photosRequest:
            req.photos,

          status:
            'diagnostico',

          statusHistory: [

            {
              status:
                'solicitud',

              at:
                req.createdAt
            },

            {
              status:
                'diagnostico',

              at:
                nowStr()
            }

          ],

          diagnostic:
            null,

          budgets:
            [],

          photos: {
            antes: [],
            durante: [],
            despues: []
          },

          rating:
            null,

        }

        this.orders.unshift(
          order
        )

        const notif =
          useNotificationsStore()

        notif.push(
          req.clientId,
          `Se creó la orden ${order.id} a partir de tu solicitud.`,
          order.id
        )

        return order

      },


      // ============================================================
      // DIAGNÓSTICO
      // ============================================================

      saveDiagnostic(
        orderId,
        {
          notes,
          laborEstimate,
          checklist
        }
      ) {

        const o =
          this.orderById(
            orderId
          )

        if (!o) return

        o.diagnostic = {

          notes,

          laborEstimate:
            Number(
              laborEstimate
            ) || 0,

          checklist

        }

        this._pushStatus(
          o,
          'diagnostico'
        )

        const notif =
          useNotificationsStore()

        notif.push(
          o.clientId,
          `Se registró el diagnóstico de tu orden ${o.id}.`,
          o.id
        )

      },


      // ============================================================
      // CREAR PRESUPUESTO
      // ============================================================

      createBudget(
        orderId,
        {
          items,
          taxRate
        }
      ) {

        const o =
          this.orderById(
            orderId
          )

        if (!o) return

        const version =
          o.budgets.length + 1

        o.budgets.push({

          version,

          items,

          taxRate:
            Number(
              taxRate
            ),

          createdAt:
            nowStr(),

          status:
            'pendiente',

          clientComment:
            '',

          decidedAt:
            null

        })

        this._pushStatus(
          o,
          'presupuesto'
        )

      },


      // ============================================================
      // ENVIAR PRESUPUESTO
      // ============================================================

      sendBudget(
        orderId
      ) {

        const o =
          this.orderById(
            orderId
          )

        if (!o) return

        this._pushStatus(
          o,
          'espera'
        )

        const notif =
          useNotificationsStore()

        notif.push(
          o.clientId,
          `Tu presupuesto para la orden ${o.id} está listo para revisión.`,
          o.id
        )

      },


      // ============================================================
      // CLIENTE APRUEBA PRESUPUESTO
      // ============================================================

      approveBudget(
        orderId
      ) {

        const o =
          this.orderById(
            orderId
          )

        if (!o) return

        const b =
          this.currentBudget(
            o
          )

        if (!b) {

          return {
            ok: false,
            message:
              'No hay un presupuesto para aprobar.'
          }

        }

        if (
          b.status === 'aprobado'
        ) {

          return {
            ok: true
          }

        }

        const inv =
          useInventoryStore()


        const stockItems =
          b.items
            .map(
              it => ({

                item: it,

                part:
                  it.partId
                    ? inv.byId(
                        it.partId
                      )
                    : inv.parts.find(
                        p =>
                          p.name
                            .toLowerCase() ===
                          String(
                            it.label
                          ).toLowerCase()
                      )

              })
            )
            .filter(
              x => x.part
            )


        const shortage =
          stockItems.find(
            x =>
              Number(
                x.item.qty
              ) >
              x.part.stock
          )


        if (shortage) {

          return {

            ok: false,

            message:
              `No hay suficiente stock de "${shortage.part.name}". Disponible: ${shortage.part.stock}.`

          }

        }


        b.status =
          'aprobado'

        b.decidedAt =
          nowStr()


        stockItems.forEach(
          ({
            item,
            part
          }) => {

            inv.deduct(
              part.id,
              Number(
                item.qty
              ) || 0,
              o.id
            )

          }
        )


        this._pushStatus(
          o,
          'aprobado'
        )


        const notif =
          useNotificationsStore()


        notif.push(
          'u-admin-1',
          `El cliente aprobó el presupuesto de la orden ${o.id}.`,
          o.id
        )


        return {
          ok: true
        }

      },


      // ============================================================
      // CLIENTE RECHAZA PRESUPUESTO
      // ============================================================

      rejectBudget(
        orderId,
        comment
      ) {

        const o =
          this.orderById(
            orderId
          )

        if (!o) return


        const b =
          this.currentBudget(
            o
          )


        if (b) {

          b.status =
            'rechazado'

          b.clientComment =
            comment || ''

          b.decidedAt =
            nowStr()

        }


        this._pushStatus(
          o,
          'rechazado'
        )


        const notif =
          useNotificationsStore()


        notif.push(
          'u-admin-1',
          `El cliente rechazó el presupuesto de la orden ${o.id}${
            comment
              ? ': "' + comment + '"'
              : '.'
          }`,
          o.id
        )

      },


      // ============================================================
      // REVISAR PRESUPUESTO
      // ============================================================

      reviseBudget(
        orderId,
        {
          items,
          taxRate
        }
      ) {

        const o =
          this.orderById(
            orderId
          )

        if (!o) return


        const version =
          o.budgets.length + 1


        o.budgets.push({

          version,

          items,

          taxRate:
            Number(
              taxRate
            ),

          createdAt:
            nowStr(),

          status:
            'pendiente',

          clientComment:
            '',

          decidedAt:
            null

        })


        this._pushStatus(
          o,
          'presupuesto'
        )

      },


      // ============================================================
      // ACTUALIZAR ESTADO DE ORDEN
      // ============================================================

      setStatus(
        orderId,
        status,
        comment = ''
      ) {

        const o =
          this.orderById(
            orderId
          )

        if (!o) return


        this._pushStatus(
          o,
          status,
          comment
        )


        const notif =
          useNotificationsStore()


        notif.push(
          o.clientId,
          `Tu orden ${o.id} cambió de estado a "${STATUS_LABEL[status]}".`,
          o.id
        )

      },


      // ============================================================
      // AGREGAR FOTOS
      // ============================================================

      addPhoto(
        orderId,
        stage,
        photo
      ) {

        const o =
          this.orderById(
            orderId
          )

        if (!o) return


        o.photos[
          stage
        ].push({

          ...photo,

          at:
            nowStr()

        })

      },


      // ============================================================
      // ASIGNAR MECÁNICO
      // ============================================================

      assignMechanic(
        orderId,
        mechanicId
      ) {

        const o =
          this.orderById(
            orderId
          )


        if (
          !o ||
          o.mechanicId === mechanicId
        ) {
          return
        }


        o.mechanicId =
          mechanicId


        if (
          !o.assignmentHistory
        ) {

          o.assignmentHistory =
            []

        }


        o.assignmentHistory.push({

          mechanicId,

          at:
            nowStr()

        })

      },


      // ============================================================
      // CALIFICAR ORDEN
      // ============================================================

      rateOrder(
        orderId,
        {
          stars,
          comment
        }
      ) {

        const o =
          this.orderById(
            orderId
          )


        if (
          !o ||
          o.rating
        ) {
          return
        }


        o.rating = {

          stars,

          comment,

          at:
            nowStr()

        }

      },


      // ============================================================
      // HISTORIAL DE ESTADOS
      // ============================================================

      _pushStatus(
        order,
        status,
        comment = ''
      ) {

        order.status =
          status


        order.statusHistory.push({

          status,

          at:
            nowStr(),

          comment

        })

      },

    }

  }
)