# ForgeLock

Sitio web de ForgeLock para emprendedores y pequeños negocios en Colombia.

## Descripción

ForgeLock presenta soluciones de landing pages, catálogos digitales, branding y diseño digital, automatización de WhatsApp, desarrollo web y sistemas empresariales. 

El sitio está construido con React 19, TypeScript, Vite y Tailwind CSS. Incluye un catálogo de servicios, cotizaciones contextuales por WhatsApp, un brief digital con generador heurístico de ideas, modales de fichas y páginas independientes para servicios y políticas legales.

## Tecnologías

- **React 19** con componentes funcionales y TypeScript
- **Vite** para desarrollo y empaquetado rápido
- **Tailwind CSS** y fuentes optimizadas (Inter)
- **FontAwesome** para iconografía de servicios y redes
- Integración contextual con WhatsApp para cotizaciones comerciales y soporte

## Características principales

1. **Navegación fluida y adaptativa**: Encabezado responsive con isotipo oficial, navegación por anclas y menú móvil.
2. **Carrusel de Soluciones Destacadas**: Pestañas interactivas para WhatsApp Business, Presencia Web, Sistemas Empresariales y Automatización de Procesos.
3. **Generador de Propuestas / Brief Digital**:
   - Detección en vivo de necesidades y análisis heurístico por sector comercial.
   - Generación de estructura recomendada, funcionalidades, estilo visual, paleta sugerida y puntos clave.
   - Enlace directo a WhatsApp con mensaje enriquecido con los datos del negocio.
4. **Catálogo Completo de Servicios**:
   - Clasificación en *Servicios principales* y *Presencia digital*.
   - Detalle interactivo de alcance y precios.
   - Planes publicados para Landing Pages: **Landing Básica** ($249.000 COP) y **Landing Profesional** ($449.000 COP).
5. **Fichas de Servicios**: Modales con información oficial, precio, imagen y enlaces a servicios relacionados.
6. **Flujo de Trabajo**: Los 4 pasos de desarrollo (Cuéntanos, Analizamos, Proponemos, Desarrollamos).
7. **Políticas y Cumplimiento**: Páginas independientes para aviso legal, privacidad y cookies, además de un banner de consentimiento persistente en `forgelock_cookie_consent`.
8. **SEO por destino**: GitHub Pages usa `/ForgeLock/`; el build secundario de Cloudflare se sirve desde `/` y mantiene `noindex`.

## Desarrollo

```bash
npm install
npm run dev
```

La aplicación se ejecuta en `http://localhost:3000/`.

## Compilación de producción

```bash
npm run build:dist       # GitHub Pages: salida dist/
npm run build:cloudflare # Cloudflare: salida dist-cloudflare/
npm test                 # TypeScript y pruebas de catálogo, WhatsApp, SEO, consentimiento y Worker
```

Ambos builds generan y validan los metadatos SEO, el sitemap y `robots.txt`. El build de Cloudflare incorpora `_headers` y conserva la política `noindex`. No se realizan despliegues con estos comandos.
