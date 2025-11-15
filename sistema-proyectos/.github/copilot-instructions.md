## Contexto rápido

Proyecto estático Vanilla JS (no bundler). `js/app.js` define la clase central `SistemaGestionProyectos` y expone el objeto global `sistema` que usan todos los demás módulos (por ejemplo `js/auth.js`, `js/proyectos.js`, `js/revisiones.js`). La persistencia usa `localStorage`; `data/database.json` es una semilla de ejemplo, no se carga automáticamente.

## Big picture / arquitectura
- `js/app.js` — núcleo: modelo de datos, métodos CRUD, notificaciones, revisiones, gestores auxiliares (`gestorPeriodos`, `gestorAsignacion`).
- `js/*.js` (UI) — archivos por dominio que consumen la API global `sistema`: `auth.js`, `proyectos.js`, `revisiones.js`, `administracion.js`, `periodos-academicos.js`, `asignacion-revisores.js`.
- `index.html` — orquesta cargas de scripts (orden importante: `app.js` primero). UI renderizada mediante templates en cadenas (template strings) y funciones como `mostrarModal()` / `cerrarModal()`.

## Datos y flujo
- Estado principal en memoria: `sistema.usuarios`, `sistema.proyectos`, `sistema.revisiones`, `sistema.notificaciones`.
- Persistencia: `sistema.guardarDatos()` escribe a `localStorage` con claves: `usuarios`, `proyectos`, `revisiones`, `notificaciones`, `usuarioActual`.
- Seed: `inicializarUsuarios()` / `inicializarProyectos()` escriben al `localStorage` si no hay datos.

## Convenciones y patrones específicos
- Globales: El proyecto usa el espacio de nombres global (variable `sistema`). No introducir módulos sin actualizar `index.html` (scripts order matters).
- IDs generados por `array.length + 1`. Ten en cuenta colisiones si borras elementos (no es un UUID generator).
- Idioma: la base del código y strings están en español; preserva mensajes UX y claves de localStorage.
- UI binding: funciones son referenciadas desde atributos `onclick` en plantillas. Cambiar nombres de funciones requiere actualizar las plantillas.

## Integraciones y puntos de atención
- `js/asignacion-revisores.js` y `js/periodos-academicos.js` se usan por `sistema` (posible async). Si añades await en llamadas a estos gestores, marca los métodos que los llaman como `async`.
- Modal pattern central: `mostrarModal(contenido)` inyecta HTML en `#modal-body`. Reutilizar esta función para diálogos.

## Desarrollo local / debugging
- No hay build; abrir `index.html` en el navegador sirve para probar. Para servir archivos estáticos (recomendado):
  - PowerShell: `python -m http.server 8000` desde la raíz del proyecto y abrir `http://localhost:8000/index.html`.
  - O usar la extensión Live Server en VS Code.
- Depuración: usar la consola del navegador. Buscar `sistema` para explorar estado en runtime (ej.: `sistema.proyectos`, `sistema.guardarDatos()`).

## Trabajo seguro para un agente de codificación
- Cambios pequeños y aislados preferidos: agregar un método en `SistemaGestionProyectos` (archivo `js/app.js`) y exponer una función UI en el archivo correspondiente (`js/proyectos.js`, etc.).
- Mantener el orden de los <script> en `index.html` si introduces nuevos archivos. `app.js` debe cargarse antes que los demás.
- Cuando añadas async/await: asegúrate de que la función llamada devuelve una Promise; si no, no uses `await` (ver ejemplo en `app.js`).

## Ejemplos concretos (referencias)
- Crear proyecto desde consola: `sistema.crearProyecto({ titulo:'X', descripcion:'..', fechaInicio:'2024-11-01', fechaFin:'2024-12-01', presupuesto:0, prioridad:'media', responsable:'Demo', responsableId:2, equipo:[2] })` — ver implementación en `js/app.js`.
- Mostrar modal con contenido: `mostrarModal('<h3>Hola</h3>')` — funciones en `index.html`/`js/ui.js`.
- Persistencia: `sistema.guardarDatos()` actualiza `localStorage` (ver implementación en `js/app.js`).

## Qué evitar
- No eliminar o renombrar las claves de `localStorage` sin una migración clara (`usuarios`, `proyectos`, `revisiones`, `notificaciones`, `usuarioActual`).
- No convertir el proyecto a módulos ES sin actualizar `index.html` y revisar el orden de ejecución.

Si algo aquí está incompleto o quieres que extienda con ejemplos de PR (tests, linters o cambios de API), dime qué parte te interesa y actualizo este archivo.
