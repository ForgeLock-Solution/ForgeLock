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
        { name: 'Servicios', href: '#servicios' },
        { name: '¿Cómo trabajamos?', href: '#proceso' },
        { name: 'Contacto', href: '#contacto' }
    ],
    socialLinks: [
        { name: 'Facebook', href: 'https://www.facebook.com/profile.php?id=61594009876448', icon: 'fa-brands fa-facebook-f' },
        { name: 'Instagram', href: 'https://www.instagram.com/forgelock/', icon: 'fa-brands fa-instagram' },
        { name: 'TikTok', href: 'https://www.tiktok.com/@forge.lock', icon: 'fa-brands fa-tiktok' }
    ],
    featuredSolutions: [
        { id: 'web', title: 'Una landing clara para tu negocio', tag: 'Landing pages', icon: 'fa-solid fa-globe', tone: 'blue', description: 'Presenta tu negocio, tus productos o servicios y facilita el contacto desde una página diseñada para celular y computador.', highlights: ['Diseño personalizado', 'WhatsApp y formulario de contacto', 'Opciones Básica y Profesional'], whatsappText: 'Hola, quiero información sobre una landing page para mi negocio.' },
        { id: 'catalog', title: 'Catálogos digitales', tag: 'Productos organizados', icon: 'fa-solid fa-book-open', tone: 'emerald', description: 'Consulta por un catálogo digital para presentar tus productos o servicios.', highlights: ['Referencia desde $500.000 COP', 'Cotización según tu catálogo'], whatsappText: 'Hola, quiero cotizar un catálogo digital para mi negocio.' },
        { id: 'branding', title: 'Branding y diseño digital', tag: 'Identidad visual', icon: 'fa-solid fa-pen-nib', tone: 'purple', description: 'Conversemos sobre branding y diseño digital para tu negocio.', highlights: ['Consulta por WhatsApp', 'Alcance según cotización'], whatsappText: 'Hola, quiero información sobre branding y diseño digital.' }
    ],
    services: [
        ['Landing pages', 'Páginas para presentar tu negocio, servicios o productos y facilitar el contacto.', 'fa-solid fa-window-maximize', 'landing'],
        ['Catálogos digitales', 'Consulta por una cotización según tu catálogo.', 'fa-solid fa-book-open', 'catalogos'],
        ['Branding y diseño digital', 'Consulta por WhatsApp sobre branding y diseño digital.', 'fa-solid fa-pen-nib', 'branding']
    ],
    workflow: [
        ['01', 'Cuéntanos', 'Nos explicas qué necesitas o qué problema te quita tiempo.'],
        ['02', 'Analizamos', 'Buscamos la solución tecnológica más adecuada para tu caso.'],
        ['03', 'Proponemos', 'Presentamos alcance, tiempos estimados y costos transparentes.'],
        ['04', 'Desarrollamos', 'Construimos, probamos y entregamos una solución lista.']
    ]
};

