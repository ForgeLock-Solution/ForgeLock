"# ForgeLock"
"# forge_lock" 
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

Usa `SUPABASE_URL` para la URL pública del proyecto Supabase; usa `SUPABASE_BUCKET` para el bucket de almacenamiento y guarda la clave de despliegue en GitHub Actions Secrets o en un entorno seguro de Node/CI.

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

La base ya incluye la tabla `public.leads` y políticas mínimas con Row Level Security. Por defecto, la landing sigue abriendo WhatsApp y no guarda leads desde el navegador. Si se activa la escritura del formulario desde el frontend, solo se usará la URL pública y la anon key con RLS correctamente configurado, nunca una clave privada.

## Deployment

Este proyecto está pensado para publicar el contenido generado en `dist/` en un hosting estático. El despliegue puede hacerse desde GitHub Actions o desde un entorno seguro que ejecute:

```bash
npm run build:dist
npm run deploy:supabase
```

## Seguridad

- La clave privada no se usa en el navegador.
- La configuración pública queda separada del entorno de despliegue seguro.
- El sitio no debe publicar secretos ni credenciales reales en HTML, CSS, JS ni `dist/`.
- Si se decide guardar leads desde la landing, la activación debe hacerse de forma explícita y validada.
