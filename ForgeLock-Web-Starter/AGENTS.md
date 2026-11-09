# Instrucciones permanentes para Codex — ForgeLock Web Starter

## Misión
Crear sitios profesionales, accesibles, rápidos y mantenibles a partir de la ficha y los recursos de **cada cliente**. ForgeLock es el proveedor, no la identidad visual predeterminada de todos los clientes.

## Orden de lectura obligatorio
1. `client/brief.md`, `client/company.md`, `client/brand.md`.
2. `docs/architecture.md`, `docs/coding-standards.md`, `docs/design-system.md`.
3. Según el trabajo: `docs/seo.md`, `docs/accessibility.md`, `docs/delivery-checklist.md`.
4. Inspeccionar el código existente antes de modificarlo.

## Reglas innegociables
- No inventar nombres, servicios, precios, testimonios, certificaciones, imágenes de trabajos reales, políticas ni datos de contacto. Usar marcadores `PENDIENTE:` y reportar faltantes.
- No alterar logos originales ni crear logos alternativos sin autorización. Respetar el manual de marca del cliente.
- No copiar contenido, credenciales, analítica ni configuraciones de producción de otros proyectos.
- Mantener HTML semántico, CSS accesible, JavaScript progresivo y arquitectura modular. Usar Tailwind solo cuando esté configurado y aporte valor.
- No incorporar frameworks, paquetes o servicios externos sin justificación y aprobación.
- No usar secretos en código cliente, repositorio ni archivos de ejemplo.
- No ejecutar despliegues, pushes, merges ni cambios de DNS/hosting sin aprobación explícita.
- Trabajar en la carpeta del proyecto actual, nunca en el sitio corporativo de ForgeLock salvo autorización específica.
- Si faltan datos esenciales, formular preguntas concretas antes de implementar esas partes; continuar con lo no bloqueado.
- Mantener `BASE_URL` configurable; nunca asumir que todos los sitios viven en la raíz del dominio.
- Evitar afirmaciones de cumplimiento legal o accesibilidad total sin auditoría formal.

## Flujo de trabajo
1. Leer entradas y elaborar resumen de requisitos + faltantes.
2. Proponer plan breve y enumerar archivos a modificar.
3. Implementar por componentes reutilizables sin duplicación innecesaria.
4. Ejecutar `npm run check` y registrar resultados, incluyendo lo no verificado.
5. Entregar resumen de cambios, instrucciones de vista previa y pendientes.
6. Esperar autorización antes de publicar.

## Criterios de terminado
La página se visualiza en móvil y escritorio, enlaces y formularios tienen comportamiento definido, navegación por teclado funciona, metadatos son coherentes, no hay datos ficticios presentados como reales y los chequeos disponibles pasan.

## Fase previa obligatoria: comité de descubrimiento
- Para un proyecto nuevo, ejecutar primero el procedimiento de `agents/COMITE-AGENTES.md` y `agents/PROTOCOLO-DEBATE.md`; usar `agents/PREGUNTAS-DESCUBRIMIENTO.md` como banco adaptativo.
- Registrar acuerdos y pendientes en `project/DECISIONES.md`, `project/PENDIENTES.md` y `project/PLAN.md`.
- No afirmar que se ejecutaron agentes independientes si solo se simularon roles. No implementar hasta obtener aprobación del plan, salvo autorización explícita para prototipos locales.
