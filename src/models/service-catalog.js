/** Catálogo público de servicios. Las tarjetas y la vista de consulta se generan desde aquí. */
export const SERVICE_CATALOG = Object.freeze([
    {
        id: 'automatizacion-whatsapp', slug: 'automatizacion-whatsapp', name: 'Automatización de WhatsApp', group: 'featured',
        description: 'Bots inteligentes, atención automática y registro de información.',
        image: './resource/service/automatizacion-whatsapp.webp', imageAlt: 'Ilustración para automatización de WhatsApp', icon: 'fa-brands fa-whatsapp',
        detailInfo: 'Cotiza según tu necesidad.', pricing: null, pricingLabel: 'Cotiza según tu necesidad',
        message: 'Hola, quiero información sobre Automatización de WhatsApp para mi negocio.',
        relatedIds: ['automatizacion-procesos', 'integraciones']
    },
    {
        id: 'desarrollo-web', slug: 'desarrollo-web', name: 'Desarrollo Web', group: 'featured',
        description: 'Páginas corporativas, landing pages y catálogos digitales.',
        image: './resource/service/desarrollo-web.webp', imageAlt: 'Ilustración para servicios de desarrollo web', icon: 'fa-solid fa-globe',
        detailInfo: 'Consulta con ForgeLock sobre páginas corporativas, landing pages y catálogos digitales.', pricing: null, pricingLabel: 'Consulta las opciones de páginas web y catálogos.',
        message: 'Hola, quiero información sobre Desarrollo Web para mi negocio.',
        relatedIds: ['landing', 'catalogos']
    },
    {
        id: 'sistemas-empresariales', slug: 'sistemas-empresariales', name: 'Sistemas Empresariales', group: 'featured',
        description: 'Paneles de control adaptados a los flujos de cada empresa.',
        image: './resource/service/sistemas-empresariales.webp', imageAlt: 'Ilustración para sistemas empresariales', icon: 'fa-solid fa-building',
        detailInfo: 'Cotiza según tu necesidad.', pricing: null, pricingLabel: 'Cotiza según tu necesidad',
        message: 'Hola, quiero información sobre Sistemas Empresariales para mi negocio.',
        relatedIds: ['automatizacion-procesos', 'integraciones']
    },
    {
        id: 'automatizacion-procesos', slug: 'automatizacion-procesos', name: 'Automatización de Procesos', group: 'featured',
        description: 'Reducimos tareas repetitivas conectando tus herramientas.',
        image: './resource/service/automatizacion-procesos.webp', imageAlt: 'Ilustración para automatización de procesos', icon: 'fa-solid fa-gears',
        detailInfo: 'Cotiza según tu necesidad.', pricing: null, pricingLabel: 'Cotiza según tu necesidad',
        message: 'Hola, quiero información sobre Automatización de Procesos para mi negocio.',
        relatedIds: ['automatizacion-whatsapp', 'integraciones']
    },
    {
        id: 'integraciones', slug: 'integraciones', name: 'Integraciones', group: 'featured',
        description: 'Conectamos plataformas, pasarelas de pago, CRMs y herramientas.',
        image: './resource/service/integraciones.webp', imageAlt: 'Ilustración para integración de plataformas y herramientas', icon: 'fa-solid fa-plug',
        detailInfo: 'Cotiza según tu necesidad.', pricing: null, pricingLabel: 'Cotiza según tu necesidad',
        message: 'Hola, quiero información sobre Integraciones para mi negocio.',
        relatedIds: ['sistemas-empresariales', 'automatizacion-procesos']
    },
    {
        id: 'soluciones-personalizadas', slug: 'soluciones-personalizadas', name: 'Soluciones Personalizadas', group: 'featured',
        description: 'Diseñamos la respuesta para tu reto tecnológico único.', cardNote: 'Cotiza según tu necesidad',
        image: './resource/service/soluciones-personalizadas.webp', imageAlt: 'Ilustración para soluciones tecnológicas personalizadas', icon: 'fa-solid fa-code',
        detailInfo: 'Cotiza según tu necesidad.', pricing: null, pricingLabel: 'Cotiza según tu necesidad',
        message: 'Hola, quiero cotizar Soluciones Personalizadas para mi necesidad.',
        relatedIds: ['sistemas-empresariales', 'desarrollo-web']
    },
    {
        id: 'landing', slug: 'landing-pages', name: 'Landing pages', detailTitle: 'Landing pages para presentar tu negocio', group: 'digital',
        description: 'Una página clara y adaptable para presentar tu negocio, servicios o productos y facilitar el contacto.',
        image: './resource/service/landing-pages.webp', imageAlt: 'Ilustración para una landing page de negocio', icon: 'fa-solid fa-window-maximize',
        pricing: [
            { name: 'Landing Básica', price: 249000, currency: 'COP', delivery: '3 a 5 días hábiles', features: ['Una página con diseño personalizado', 'Adaptación a celular y computador', 'Presentación del negocio, servicios o productos', 'WhatsApp, redes sociales y formulario de contacto', 'Integración con dominio del cliente y publicación', 'Una ronda de cambios'], message: 'Hola, quiero contratar la Landing Básica de ForgeLock por $249.000 COP. ¿Me cuentan los pasos?' },
            { name: 'Landing Profesional', price: 449000, currency: 'COP', delivery: '5 a 7 días hábiles', features: ['Hasta 6 secciones', 'Galería, testimonios y preguntas frecuentes', 'Botones de contacto, WhatsApp, redes sociales y formulario', 'Adaptación a móvil y computador', 'Dominio del cliente y publicación', 'SEO básico, Google Search Console, Google Analytics y Google Tag', 'Dos rondas de cambios'], message: 'Hola, quiero contratar la Landing Profesional de ForgeLock por $449.000 COP. ¿Me cuentan los pasos?' }
        ],
        pricingLabel: 'Opciones con precios y tiempos publicados',
        message: 'Hola, quiero información sobre Landing pages para mi negocio.',
        relatedIds: ['catalogos', 'branding'],
        homepageFeature: { title: 'Una landing clara para tu negocio', tag: 'Landing pages', tone: 'blue', highlights: ['Diseño personalizado', 'WhatsApp y formulario de contacto', 'Opciones Básica y Profesional'] }
    },
    {
        id: 'catalogos', slug: 'catalogos-digitales', name: 'Catálogos digitales', group: 'digital',
        description: 'Un catálogo digital organiza productos o servicios para que las personas puedan consultarlos fácilmente.',
        image: './resource/service/catalogos-digitales.webp', imageAlt: 'Ilustración para un catálogo digital de productos o servicios', icon: 'fa-solid fa-book-open',
        detailInfo: 'No hay precio, alcance ni plazo publicados; se confirman en la cotización.', pricing: null, pricingLabel: 'El precio, alcance y plazo se confirman en la cotización.',
        message: 'Hola, quiero solicitar información y una cotización para Catálogos digitales.',
        relatedIds: ['landing', 'desarrollo-web'],
        homepageFeature: { title: 'Catálogos digitales', tag: 'Productos organizados', tone: 'emerald', highlights: ['Información comercial por confirmar'] }
    },
    {
        id: 'branding', slug: 'branding-diseno-digital', name: 'Branding y diseño digital', group: 'digital',
        description: 'Diseñamos la identidad visual y las piezas digitales de tu negocio para que se presente de forma coherente y profesional. Conversamos tu necesidad y definimos el alcance antes de comenzar.',
        image: './resource/service/branding-diseno-digital.webp', imageAlt: 'Ilustración para branding e identidad visual digital', icon: 'fa-solid fa-pen-nib',
        detailInfo: 'No hay precio ni entregables publicados; el alcance se define antes de comenzar.', pricing: null, pricingLabel: 'No hay precio ni entregables publicados; el alcance se define antes de comenzar.',
        message: 'Hola, quiero consultar sobre Branding y diseño digital para mi negocio.',
        relatedIds: ['landing', 'desarrollo-web'],
        homepageFeature: { title: 'Branding y diseño digital', tag: 'Identidad visual', tone: 'purple', highlights: ['Consulta por WhatsApp', 'Alcance definido según tu necesidad'] }
    }
]);

export const SERVICE_BY_ID = Object.freeze(Object.fromEntries(SERVICE_CATALOG.map((service) => [service.id, service])));
export const SERVICE_WHATSAPP_NUMBER = '573043402589';

export function serviceQueryUrl(service) {
    return `./servicios.html?servicio=${encodeURIComponent(service.id)}#detalle-servicio`;
}
