# ForgeLock Web Starter v1.0

Plantilla local para sitios web de clientes. **No modifica el sitio corporativo de ForgeLock.**

## Requisitos
Node.js LTS y npm. Para la vista previa basta un navegador; el comando de servidor utiliza Python 3 si está disponible.

## Inicio rápido
1. Copia esta carpeta a `C:\ForgeLock\Clientes\Nombre-Cliente` (no trabajes directamente sobre la maestra).
2. Abre la carpeta nueva con Codex o VS Code.
3. Completa `client/brief.md`, `client/company.md`, `client/brand.md` y coloca los archivos reales en `client/assets/`.
4. Indica: «Lee AGENTS.md, desarrolla el sitio de este cliente según su brief y valida el resultado; no publiques».
5. Ejecuta `npm run check` y `npm run dev`.
6. Para generar salida estática: `npm run build` (crea `dist/`).

## Nota importante
La página inicial es una **demostración neutral**, no una web comercial terminada. Antes de entregar un cliente, reemplaza textos de ejemplo, ajusta el diseño y valida los datos. El formulario de ejemplo no envía datos a ningún servidor.

## Archivos guía
- `AGENTS.md`: reglas de Codex.
- `docs/`: arquitectura, estilo, SEO, accesibilidad y entrega.
- `client/`: ficha y activos del cliente.
- `src/`: código fuente modular.
- `scripts/`: build y controles.
- `tests/`: validaciones automáticas básicas.

## Publicación
No hay workflow de despliegue. La publicación es un proceso separado, manual y autorizado.

## Paso 4 — Comité de planificación
Para un nuevo cliente, completa los archivos `client/` con lo disponible y pega a Codex el contenido de `PROMPT-COMITE.md`. El comité consulta preguntas faltantes, debate opciones y documenta decisiones en `project/`. Ninguna publicación está autorizada por defecto.
