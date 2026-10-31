import { SERVICE_BY_ID, SERVICE_WHATSAPP_NUMBER } from './service-catalog.js';

// Compatibilidad con las vistas y pruebas del flujo de consulta; el contenido vive en service-catalog.js.
export const ServicePageModel = {
    services: SERVICE_BY_ID,
    whatsappNumber: SERVICE_WHATSAPP_NUMBER
};
