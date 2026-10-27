# ForgeLock

Landing estática de servicios tecnológicos para emprendedores, negocios y pequeñas empresas.

## Descripción

ForgeLock presenta soluciones de automatización, desarrollo web, sistemas y digitalización de procesos. La app mantiene una arquitectura MVC simple en JavaScript vanilla y se despliega como sitio estático.

## Tecnologías

- HTML, CSS y JavaScript vanilla
- Tailwind CSS
- Node.js y npm para desarrollo, build y pruebas
- Supabase para almacenamiento y, opcionalmente, registro de leads
- Arquitectura MVC frontend sin backend permanente

## Requisitos

- Node.js `>=20 <25`
- npm

## Instalación

```bash
npm ci
```

## Variables de entorno

`SUPABASE_URL` identifica el proyecto y `SUPABASE_BUCKET` el destino de Storage. `SUPABASE_SERVICE_ROLE_KEY` es privada y solo puede usarse en un proceso seguro de servidor. Este repositorio no contiene actualmente un workflow de despliegue a Supabase.

Nunca publiques:

- `.env`
- `.env.*`
- `src/config/supabase-config.js`
- claves privadas, passwords o tokens

## Desarrollo local

```bash
npm run dev
```

Abre la aplicación en:

```text
http://localhost:3001/
```

No abras la app directamente con `file:///` porque los módulos ES requieren un servidor HTTP.

## Build

```bash
npm run build
npm run build:dist
```

`build` compila estilos y copia assets locales; `build:dist` genera la carpeta `dist/` lista para hosting estático.

## Tests

```bash
npm test
```

La suite valida el render de la landing y la persistencia del borrador del formulario sin romper la estructura MVC.

## Supabase

Las migraciones versionadas definen la tabla `public.leads` y políticas de inserción con Row Level Security; eso no confirma que estén aplicadas en el proyecto remoto. El frontend no usa actualmente el cliente Supabase y la landing sigue abriendo WhatsApp sin guardar leads. Si se activa esa escritura en el futuro, solo se usará la URL pública y la anon key con RLS correctamente configurado, nunca una clave privada.

## Deployment

GitHub Pages publica el sitio estático generado en `dist/`. También existe un script opcional para subir `dist/` a Supabase Storage, pero no hay un workflow de GitHub Actions que lo ejecute. El script usa `SUPABASE_SERVICE_ROLE_KEY` y puede crear un bucket público si el nombre indicado no existe; no lo ejecutes hasta verificar el proyecto y el destino desde una sesión autorizada.

```bash
npm run build:dist
npm run deploy:supabase
```

## Seguridad

- La clave privada no se usa en el navegador.
- La configuración pública queda separada del entorno de despliegue seguro.
- El sitio no debe publicar secretos ni credenciales reales en HTML, CSS, JS ni `dist/`.
- Si se decide guardar leads desde la landing, la activación debe hacerse de forma explícita y validada.


## SEO técnico

La URL base de GitHub Pages para este proyecto es `https://forgelock-solution.github.io/ForgeLock/`. El sitemap y robots.txt se generan durante `npm run build:dist`; puedes sobrescribir la base con `BASE_URL` al compilar. Revisa `docs/seo-audit.md` para el estado de la auditoría.
