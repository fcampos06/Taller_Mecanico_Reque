# Taller CCM — Prototipo de plataforma para taller mecánico

Prototipo frontend en **Vue 3 + Vite + Pinia + Vue Router**, construido a partir del documento de
requerimientos de software del **Grupo 50** (TEC, Campus San Carlos). Todos los datos son
simulados en memoria (no hay backend real) — el proyecto está pensado para demostrar los
flujos funcionales descritos en los 10 alcances del documento.

## Cómo correrlo

```bash
npm install
npm run dev
```

Abrí la URL que muestra la terminal (por defecto `http://localhost:5173`).

Para generar la build de producción:

```bash
npm run build
npm run preview
```


## Si las páginas aparecen vacías

Este proyecto **no debe abrirse haciendo doble clic en `index.html` ni con Live Server**. Vue, Pinia y Vue Router se cargan mediante Vite.

Usá siempre:

```bash
npm install
npm run check:data
npm run dev
```

Después abrí la URL que muestra Vite (normalmente `http://localhost:5173`).

La navegación usa `#` para que las rutas internas también funcionen al publicar el prototipo en un hosting estático. Por ejemplo, una ruta puede verse como `/#/admin/ordenes`; eso es intencional.

Si querés comprobar que la información base existe y está relacionada correctamente, ejecutá `npm run check:data`. El comando valida usuarios, vehículos, órdenes, solicitudes, citas y mecánicos.

## Usuarios de prueba

El correo determina el perfil con el que iniciás sesión. La contraseña es la misma para todos: **`taller2026`**

| Correo                          | Rol            |
|----------------------------------|----------------|
| carlos.vargas@gmail.com          | Cliente        |
| laura.mendez@gmail.com           | Cliente        |
| maria.rojas@tallerccm.com        | Administrador  |
| esteban.salas@tallerccm.com      | Mecánico       |
| diego.chaves@tallerccm.com       | Mecánico       |

También podés crear una cuenta nueva de cliente desde "Registrate" en el login.

## Estructura del proyecto

```
src/
  assets/styles/     Tokens de diseño y estilos base compartidos
  components/
    layout/           Sidebar, topbar, shell de la app, toasts
    ui/               Componentes reutilizables (modal, badges, stepper, etc.)
  data/seed.js        Datos simulados iniciales (usuarios, vehículos, órdenes, etc.)
  router/             Rutas y protección por rol
  stores/             Un store de Pinia por dominio (auth, vehículos, órdenes, citas,
                       inventario, catálogo, mensajes, notificaciones, ui)
  views/
    auth/             Login, registro, recuperar contraseña
    client/            Pantallas del rol Cliente
    admin/             Pantallas del rol Administrador
    mechanic/          Pantallas del rol Mecánico
    ProfileView.vue    Perfil compartido por los 3 roles
```

## Cobertura de requerimientos

El prototipo cubre los 10 alcances del documento de requerimientos:

1. **Solicitudes y diagnóstico** — creación de solicitud con fotos, conversión en orden,
   diagnóstico técnico con checklist.
2. **Presupuestos** — generación desde inventario/manual, envío, aprobación/rechazo con
   comentario, historial de versiones.
3. **Agenda y carga de mecánicos** — citas con horarios disponibles, reprogramar/cancelar,
   calendario del taller filtrable por mecánico, asignación/reasignación de órdenes.
4. **Seguimiento de la reparación** — línea de tiempo de estados con comentarios, evidencia
   fotográfica antes/durante/después.
5. **Autenticación y perfiles** — registro, login, recuperación de contraseña, control de
   acceso por rol, edición de perfil.
6. **Vehículos e historial** — alta/edición/baja de vehículos (validando placa duplicada y
   bloqueando baja con órdenes activas), historial por vehículo, recordatorios preventivos.
7. **Inventario** — alta/edición de repuestos, alerta de stock bajo, descuento automático al
   aprobar un presupuesto, búsqueda y filtro.
8. **Mensajería y notificaciones** — chat por orden, notificaciones por evento relevante.
9. **Catálogo y calificaciones** — catálogo de servicios/tarifas administrable, calificación
   de 1 a 5 estrellas con comentario (una sola vez por orden).
10. **Dashboard y reportes** — indicadores operativos, carga por mecánico, reporte financiero
    por periodo desglosado en repuestos y mano de obra.

## Notas

- Es un **prototipo sin backend**: al recargar la página, los datos vuelven al estado inicial
  definido en `src/data/seed.js`.
- Las fotos adjuntas usan `URL.createObjectURL`, por lo que solo existen durante la sesión del
  navegador.
- Grupo 50 · Fabián Campos, Fernanda Arce, Jostin Calderón · TEC Campus San Carlos.
