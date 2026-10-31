# ForgeLock

Plataforma digital interactiva de ForgeLock para emprendedores y pequeños negocios en Colombia.

## Descripción

ForgeLock presenta soluciones de landing pages, catálogos digitales, branding y diseño digital, automatización de WhatsApp, desarrollo web y sistemas empresariales. 

Esta versión ha sido reescrita como una aplicación React moderna con TypeScript, Vite y Tailwind CSS, preservando toda la lógica de negocio, catálogo de servicios, cotizaciones contextuales para WhatsApp, brief digital con generador heurístico de ideas, fichas públicas de servicios y gestión de cookies y políticas legales.

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
5. **Fichas Públicas de Servicios**: Modal detallado con información oficial, precio, imagen y enlaces a servicios relacionados.
6. **Flujo de Trabajo**: Los 4 pasos de desarrollo (Cuéntanos, Analizamos, Proponemos, Desarrollamos).
7. **Políticas y Cumplimiento**: Modales para Aviso Legal, Política de Privacidad y Política de Cookies con banner de consentimiento persistente en almacenamiento local.

## Desarrollo

```bash
npm install
npm run dev
```

La aplicación se ejecuta en `http://localhost:3000/`.

## Compilación de producción

```bash
npm run build
```
