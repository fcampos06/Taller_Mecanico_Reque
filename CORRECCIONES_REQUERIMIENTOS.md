# Correcciones aplicadas contra los requerimientos

Esta versión conserva el prototipo Vue/Pinia sin backend y refuerza los criterios funcionales del documento del proyecto.

## Cambios principales

- Las solicitudes del cliente quedan consultables y muestran detalle/fotografías.
- Las fotos iniciales de una solicitud se muestran al administrador y al mecánico asignado.
- Las rutas de órdenes validan además del rol que la orden pertenezca al cliente o esté asignada al mecánico.
- Los presupuestos distinguen servicio, repuesto y mano de obra; registran fecha de decisión y validan stock antes de aprobar.
- El descuento de inventario usa el ID del repuesto cuando está disponible y registra el movimiento.
- Las citas admiten motivo, reprogramación y cancelación con motivo opcional visible en el historial.
- Solo los mecánicos activos aparecen para nuevas asignaciones.
- El historial del vehículo muestra diagnósticos anteriores para dar contexto técnico.
- Los recordatorios de mantenimiento se calculan desde el último servicio entregado y pueden marcarse como atendidos.
- El chat por orden acepta texto e imágenes JPG/PNG de hasta 5 MB.
- Las calificaciones incluyen fecha y el promedio aparece en el dashboard.
- El dashboard usa datos del prototipo para ingresos, tiempos y carga; ya no usa una serie fija de ingresos.
- El reporte financiero por periodo separa servicios, repuestos y mano de obra.
- Se mantiene la protección que evita pantalla blanca al cerrar sesión y la navegación por hash para hosting estático.

## Validación incluida

Ejecutar:

```bash
npm install
npm run check:data
npm run dev
```

`npm run check:data` revisa que las relaciones principales entre usuarios, vehículos, solicitudes, órdenes, citas e inventario sean válidas.

> Nota: al ser un prototipo sin backend, los cambios realizados durante una sesión vuelven a los datos de `src/data/seed.js` al recargar completamente la aplicación.
