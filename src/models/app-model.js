/**
 * MODELO: única fuente de datos de la landing.
 * No debe consultar el DOM ni registrar eventos; solo conserva estado y contenido.
 */
import { SERVICE_CATALOG, serviceQueryUrl } from './service-catalog.js';

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
    get featuredSolutions() {
        return SERVICE_CATALOG.filter((service) => service.homepageFeature).map((service) => ({
            ...service,
            ...service.homepageFeature,
            detailsUrl: serviceQueryUrl(service),
            whatsappText: service.message
        }));
    },
    get services() { return SERVICE_CATALOG; },
    workflow: [
        ['01', 'Cuéntanos', 'Nos explicas qué necesitas o qué problema te quita tiempo.'],
        ['02', 'Analizamos', 'Analizamos qué solución tecnológica puede ajustarse a tu caso.'],
        ['03', 'Proponemos', 'Presentamos alcance, tiempos estimados y costos transparentes.'],
        ['04', 'Desarrollamos', 'Construimos, probamos y entregamos una solución lista.']
    ]
};

