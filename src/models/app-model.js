/**
 * MODELO: única fuente de datos de la landing.
 * No debe consultar el DOM ni registrar eventos; solo conserva estado y contenido.
 */
export const AppModel = {
    // Estado que cambia como resultado de las acciones del usuario.
    state: {
        whatsappNumber: '573043402589',
        activeBannerIndex: 0,
        userNeedInput: '',
        isMenuOpen: false
    },
    // Datos estáticos que la Vista transforma en enlaces, tarjetas y pasos.
    navLinks: [
        { name: 'Inicio', href: '#inicio' },
        { name: 'Soluciones', href: '#soluciones' },
        { name: '¿Cómo trabajamos?', href: '#proceso' },
        { name: 'Servicios', href: '#servicios' },
        { name: 'Contacto', href: '#contacto' }
    ],
    socialLinks: [
        { name: 'Facebook', href: 'https://www.facebook.com/profile.php?id=61594009876448', icon: 'fa-brands fa-facebook-f' },
        { name: 'Instagram', href: 'https://www.instagram.com/forgelock/', icon: 'fa-brands fa-instagram' },
        { name: 'X', href: 'https://x.com/forgelock', icon: 'fa-brands fa-x-twitter' },
        { name: 'TikTok', href: 'https://www.tiktok.com/@forge.lock', icon: 'fa-brands fa-tiktok' }
    ],
    featuredSolutions: [
        { id: 'whatsapp', title: 'Automatiza tu WhatsApp Business', tag: 'Solución Estelar', icon: 'fa-brands fa-whatsapp', tone: 'emerald', description: 'Convierte WhatsApp en una herramienta para atender clientes, registrar información y automatizar procesos sin perder el toque humano.', highlights: ['Atención 24/7 automática', 'Registro automático de clientes', 'Filtros y derivación de solicitudes'], whatsappText: 'Hola, estoy interesado en automatizar WhatsApp Business.' },
        { id: 'web', title: 'Crea una presencia web profesional', tag: 'Imagen Digital', icon: 'fa-solid fa-globe', tone: 'blue', description: 'Diseñamos páginas web adaptadas a tu negocio para ayudarte a tener una presencia digital profesional que genere confianza y ventas.', highlights: ['Diseño adaptable a celulares', 'Optimizado para Google', 'Enfoque en captar clientes'], whatsappText: 'Hola, estoy interesado en crear una página web para mi negocio.' },
        { id: 'systems', title: 'Un sistema hecho para tu negocio', tag: 'A Medida', icon: 'fa-solid fa-laptop-code', tone: 'purple', description: 'Desarrollamos sistemas personalizados para organizar información, clientes, ventas, inventarios y operaciones de forma centralizada.', highlights: ['Adiós a archivos desordenados', 'Reportes en tiempo real', 'Acceso seguro desde cualquier lugar'], whatsappText: 'Hola, estoy interesado en desarrollar un sistema personalizado.' },
        { id: 'automation', title: 'Deja que la tecnología haga el trabajo repetitivo', tag: 'Eficiencia Total', icon: 'fa-solid fa-gears', tone: 'amber', description: 'Automatizamos tareas y procesos internos para reducir trabajo manual, errores humanos y pérdida de tiempo operativo.', highlights: ['Sincronización entre aplicaciones', 'Alertas automáticas', 'Mayor productividad diaria'], whatsappText: 'Hola, quiero conocer qué procesos de mi negocio se pueden automatizar.' }
    ],
    services: [
        ['Automatización de WhatsApp', 'Bots inteligentes, atención automática y registro de información.', 'fa-brands fa-whatsapp'],
        ['Desarrollo Web', 'Páginas corporativas, landing pages y catálogos digitales.', 'fa-solid fa-code'],
        ['Sistemas Empresariales', 'Paneles de control adaptados a los flujos de cada empresa.', 'fa-solid fa-server'],
        ['Automatización de Procesos', 'Reducimos tareas repetitivas conectando tus herramientas.', 'fa-solid fa-bolt'],
        ['Integraciones', 'Conectamos plataformas, pasarelas de pago, CRMs y herramientas.', 'fa-solid fa-puzzle-piece'],
        ['Soluciones Personalizadas', 'Diseñamos la respuesta para tu reto tecnológico único.', 'fa-solid fa-lightbulb']
    ],
    workflow: [
        ['01', 'Cuéntanos', 'Nos explicas qué necesitas o qué problema te quita tiempo.'],
        ['02', 'Analizamos', 'Buscamos la solución tecnológica más adecuada para tu caso.'],
        ['03', 'Proponemos', 'Presentamos alcance, tiempos estimados y costos transparentes.'],
        ['04', 'Desarrollamos', 'Construimos, probamos y entregamos una solución lista.']
    ]
};
