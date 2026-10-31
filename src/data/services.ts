import { Service } from '../types';

export const WHATSAPP_NUMBER = '573043402589';

export const SERVICE_CATALOG: Service[] = [
  {
    id: 'automatizacion-whatsapp',
    slug: 'automatizacion-whatsapp',
    name: 'Automatización de WhatsApp',
    group: 'featured',
    description: 'Bots para atención automática y registro de información.',
    heroText: 'Bots para atención automática y registro de información.',
    fichePath: 'servicio-automatizacion-whatsapp.html',
    ficheTitle: 'Automatización de WhatsApp para negocios | ForgeLock',
    ficheMetaDescription: 'Bots para atención automática y registro de información.',
    ficheLongDescription: 'Una solución para atender conversaciones por WhatsApp de forma automática y registrar la información que comparten las personas. El alcance se define según las necesidades de atención de cada negocio.',
    image: './resource/service/automatizacion-whatsapp.webp',
    imageAlt: 'Dos personas conversan en un taller con un teléfono sobre la mesa.',
    icon: 'fa-brands fa-whatsapp',
    detailInfo: 'Cotiza según tu necesidad.',
    pricing: null,
    pricingLabel: 'Cotiza según tu necesidad',
    message: 'Hola, quiero información sobre Automatización de WhatsApp para mi negocio.',
    relatedIds: ['automatizacion-procesos', 'integraciones'],
    homepageFeature: {
      title: 'Automatiza tu WhatsApp Business',
      tag: 'Solución Estelar',
      tone: 'emerald',
      highlights: ['Bots para atención automática', 'Registro de información']
    }
  },
  {
    id: 'desarrollo-web',
    slug: 'desarrollo-web',
    name: 'Desarrollo Web',
    group: 'featured',
    description: 'Páginas corporativas, landing pages y catálogos digitales.',
    heroText: 'Páginas corporativas, landing pages y catálogos digitales.',
    fichePath: 'servicio-desarrollo-web.html',
    ficheTitle: 'Desarrollo Web | ForgeLock',
    ficheMetaDescription: 'Páginas corporativas, landing pages y catálogos digitales.',
    image: './resource/service/desarrollo-web.webp',
    imageAlt: 'Mujer de espaldas diseñando una página en su portátil junto a un cuaderno de bocetos.',
    icon: 'fa-solid fa-globe',
    detailInfo: 'Consulta con ForgeLock sobre páginas corporativas, landing pages y catálogos digitales.',
    pricing: null,
    pricingLabel: 'Consulta las opciones de páginas web y catálogos.',
    message: 'Hola, quiero información sobre Desarrollo Web para mi negocio.',
    relatedIds: ['landing', 'catalogos'],
    homepageFeature: {
      title: 'Crea una presencia web profesional',
      tag: 'Desarrollo Web',
      tone: 'blue',
      highlights: ['Páginas corporativas a la medida', 'Estructura adaptable y moderna']
    }
  },
  {
    id: 'sistemas-empresariales',
    slug: 'sistemas-empresariales',
    name: 'Sistemas Empresariales',
    group: 'featured',
    description: 'Paneles de control adaptados a los flujos de cada empresa.',
    heroText: 'Paneles de control adaptados a los flujos de cada empresa.',
    fichePath: 'servicio-sistemas-empresariales.html',
    ficheTitle: 'Sistemas Empresariales | ForgeLock',
    ficheMetaDescription: 'Paneles de control adaptados a los flujos de cada empresa.',
    image: './resource/service/sistemas-empresariales.webp',
    imageAlt: 'Hombre revisando gráficas en un monitor desde su oficina.',
    icon: 'fa-solid fa-building',
    detailInfo: 'Cotiza según tu necesidad.',
    pricing: null,
    pricingLabel: 'Cotiza según tu necesidad',
    message: 'Hola, quiero información sobre Sistemas Empresariales para mi negocio.',
    relatedIds: ['automatizacion-procesos', 'integraciones'],
    homepageFeature: {
      title: 'Un sistema hecho para tu negocio',
      tag: 'Sistemas Empresariales',
      tone: 'purple',
      highlights: ['Paneles de control personalizados', 'Manejo eficiente de información']
    }
  },
  {
    id: 'automatizacion-procesos',
    slug: 'automatizacion-procesos',
    name: 'Automatización de Procesos',
    group: 'featured',
    description: 'Conectamos tus herramientas para apoyar las tareas repetitivas.',
    heroText: 'Conectamos tus herramientas para apoyar las tareas repetitivas.',
    fichePath: 'servicio-automatizacion-procesos.html',
    ficheTitle: 'Automatización de Procesos | ForgeLock',
    ficheMetaDescription: 'Conectamos tus herramientas para apoyar las tareas repetitivas.',
    image: './resource/service/automatizacion-procesos.webp',
    imageAlt: 'Mujer empacando una caja junto a una tableta con una lista de tareas.',
    icon: 'fa-solid fa-gears',
    detailInfo: 'Cotiza según tu necesidad.',
    pricing: null,
    pricingLabel: 'Cotiza según tu necesidad',
    message: 'Hola, quiero información sobre Automatización de Procesos para mi negocio.',
    relatedIds: ['automatizacion-whatsapp', 'integraciones'],
    homepageFeature: {
      title: 'Apoya las tareas repetitivas con tecnología.',
      tag: 'Automatización de Procesos',
      tone: 'amber',
      highlights: ['Integración entre apps de uso diario', 'Ahorro de tiempo en tareas manuales']
    }
  },
  {
    id: 'integraciones',
    slug: 'integraciones',
    name: 'Integraciones',
    group: 'featured',
    description: 'Conectamos plataformas, pasarelas de pago, CRMs y herramientas.',
    heroText: 'Conectamos plataformas, pasarelas de pago, CRMs y herramientas.',
    fichePath: 'servicio-integraciones.html',
    ficheTitle: 'Integraciones | ForgeLock',
    ficheMetaDescription: 'Conectamos plataformas, pasarelas de pago, CRMs y herramientas.',
    image: './resource/service/integraciones.webp',
    imageAlt: 'Barista cobrando en un mostrador con portátil, celular y datáfono.',
    icon: 'fa-solid fa-plug',
    detailInfo: 'Cotiza según tu necesidad.',
    pricing: null,
    pricingLabel: 'Cotiza según tu necesidad',
    message: 'Hola, quiero información sobre Integraciones para mi negocio.',
    relatedIds: ['sistemas-empresariales', 'automatizacion-procesos']
  },
  {
    id: 'soluciones-personalizadas',
    slug: 'soluciones-personalizadas',
    name: 'Soluciones Personalizadas',
    group: 'featured',
    description: 'Diseñamos la respuesta para tu reto tecnológico único.',
    cardNote: 'Cotiza según tu necesidad',
    heroText: 'Diseñamos la respuesta para tu reto tecnológico único.',
    fichePath: 'servicio-soluciones-personalizadas.html',
    ficheTitle: 'Soluciones Personalizadas | ForgeLock',
    ficheMetaDescription: 'Diseñamos la respuesta para tu reto tecnológico único.',
    image: './resource/service/soluciones-personalizadas.webp',
    imageAlt: 'Dos personas conversan frente a bocetos y muestras de color sobre una mesa.',
    icon: 'fa-solid fa-code',
    detailInfo: 'Cotiza según tu necesidad.',
    pricing: null,
    pricingLabel: 'Cotiza según tu necesidad',
    message: 'Hola, quiero cotizar Soluciones Personalizadas para mi necesidad.',
    relatedIds: ['sistemas-empresariales', 'desarrollo-web']
  },
  {
    id: 'landing',
    slug: 'landing-pages',
    name: 'Landing pages',
    detailTitle: 'Landing pages para presentar tu negocio',
    group: 'digital',
    description: 'Una página clara y adaptable para presentar tu negocio, servicios o productos y facilitar el contacto.',
    heroText: 'Una página clara y adaptable para presentar tu negocio, servicios o productos y facilitar el contacto.',
    fichePath: 'servicio-landing-pages.html',
    ficheTitle: 'Landing pages | ForgeLock',
    ficheMetaDescription: 'Una página clara y adaptable para presentar tu negocio, servicios o productos y facilitar el contacto.',
    image: './resource/service/landing-pages.webp',
    imageAlt: 'Una mano sostiene un celular con una página web, con una laptop al fondo.',
    icon: 'fa-solid fa-window-maximize',
    detailInfo: 'Planes publicados: Landing Básica ($249.000 COP) y Landing Profesional ($449.000 COP).',
    pricing: [
      {
        name: 'Landing Básica',
        price: 249000,
        currency: 'COP',
        delivery: '3 a 5 días hábiles',
        features: [
          'Una página con diseño personalizado',
          'Adaptación a celular y computador',
          'Presentación del negocio, servicios o productos',
          'WhatsApp, redes sociales y formulario de contacto',
          'Integración con dominio del cliente y publicación',
          'Una ronda de cambios'
        ],
        message: 'Hola, quiero contratar la Landing Básica de ForgeLock por $249.000 COP. ¿Me cuentan los pasos?'
      },
      {
        name: 'Landing Profesional',
        price: 449000,
        currency: 'COP',
        delivery: '5 a 7 días hábiles',
        features: [
          'Hasta 6 secciones',
          'Galería, testimonios y preguntas frecuentes',
          'Botones de contacto, WhatsApp, redes sociales y formulario',
          'Adaptación a móvil y computador',
          'Dominio del cliente y publicación',
          'SEO básico, Google Search Console, Google Analytics y Google Tag',
          'Dos rondas de cambios'
        ],
        message: 'Hola, quiero contratar la Landing Profesional de ForgeLock por $449.000 COP. ¿Me cuentan los pasos?'
      }
    ],
    pricingLabel: 'Opciones con precios y tiempos publicados',
    message: 'Hola, quiero información sobre Landing pages para mi negocio.',
    relatedIds: ['catalogos', 'branding']
  },
  {
    id: 'catalogos',
    slug: 'catalogos-digitales',
    name: 'Catálogos digitales',
    group: 'digital',
    description: 'Un catálogo digital organiza productos o servicios para que las personas puedan consultarlos fácilmente.',
    heroText: 'Un catálogo digital organiza productos o servicios para que las personas puedan consultarlos fácilmente.',
    fichePath: 'servicio-catalogos-digitales.html',
    ficheTitle: 'Catálogos digitales | ForgeLock',
    ficheMetaDescription: 'Un catálogo digital organiza productos o servicios para que las personas puedan consultarlos fácilmente.',
    image: './resource/service/catalogos-digitales.webp',
    imageAlt: 'Tableta con una cuadrícula de productos artesanales sobre un mostrador.',
    icon: 'fa-solid fa-book-open',
    detailInfo: 'No hay precio, alcance ni plazo publicados; se confirman en la cotización.',
    pricing: null,
    pricingLabel: 'El precio, alcance y plazo se confirman en la cotización.',
    message: 'Hola, quiero solicitar información y una cotización para Catálogos digitales.',
    relatedIds: ['landing', 'desarrollo-web']
  },
  {
    id: 'branding',
    slug: 'branding-diseno-digital',
    name: 'Branding y diseño digital',
    group: 'digital',
    description: 'Diseñamos la identidad visual y las piezas digitales de tu negocio para que se presente de forma coherente y profesional. Conversamos tu necesidad y definimos el alcance antes de comenzar.',
    heroText: 'Diseñamos la identidad visual y las piezas digitales de tu negocio para que se presente de forma coherente y profesional. Conversamos tu necesidad y definimos el alcance antes de comenzar.',
    fichePath: 'servicio-branding-diseno-digital.html',
    ficheTitle: 'Branding y diseño digital | ForgeLock',
    ficheMetaDescription: 'Diseñamos la identidad visual y las piezas digitales de tu negocio para que se presente de forma coherente y profesional.',
    image: './resource/service/branding-diseno-digital.webp',
    imageAlt: 'Escritorio con muestras de color y una tableta gráfica que muestra un boceto geométrico de isotipo.',
    icon: 'fa-solid fa-pen-nib',
    detailInfo: 'No hay precio ni entregables publicados; el alcance se define antes de comenzar.',
    pricing: null,
    pricingLabel: 'No hay precio ni entregables publicados; el alcance se define antes de comenzar.',
    message: 'Hola, quiero consultar sobre Branding y diseño digital para mi negocio.',
    relatedIds: ['landing', 'desarrollo-web']
  }
];

export const SERVICE_BY_ID = Object.freeze(
  Object.fromEntries(SERVICE_CATALOG.map((s) => [s.id, s]))
);

export const NAV_LINKS = [
  { name: 'Inicio', href: '#inicio' },
  { name: 'Soluciones', href: '#soluciones' },
  { name: 'Servicios', href: '#servicios' },
  { name: '¿Cómo trabajamos?', href: '#proceso' },
  { name: 'Contacto', href: '#contacto' }
];

export const SOCIAL_LINKS = [
  { name: 'Facebook', href: 'https://www.facebook.com/profile.php?id=61594009876448', icon: 'fa-brands fa-facebook-f' },
  { name: 'Instagram', href: 'https://www.instagram.com/forgelock/', icon: 'fa-brands fa-instagram' },
  { name: 'TikTok', href: 'https://www.tiktok.com/@forge.lock', icon: 'fa-brands fa-tiktok' }
];

export const WORKFLOW_STEPS = [
  { step: '01', title: 'Cuéntanos', desc: 'Nos explicas qué necesitas o qué problema te quita tiempo.' },
  { step: '02', title: 'Analizamos', desc: 'Analizamos qué solución tecnológica puede ajustarse a tu caso.' },
  { step: '03', title: 'Proponemos', desc: 'Presentamos alcance, tiempos estimados y costos transparentes.' },
  { step: '04', title: 'Desarrollamos', desc: 'Construimos, probamos y entregamos una solución lista.' }
];

export function getWhatsAppUrl(text: string, number: string = WHATSAPP_NUMBER): string {
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
}

export function formatPrice(price: number): string {
  return `$${new Intl.NumberFormat('es-CO').format(price)} COP`;
}
