import { SERVICE_BY_ID } from '../models/service-catalog.js';
import { ServicePageView } from '../views/service-page-view.js';

export const ServicePageController = {
    init() {
        const requestedService = new URLSearchParams(window.location.search).get('servicio');
        const initialService = SERVICE_BY_ID[requestedService] ? requestedService : 'landing';
        ServicePageView.renderCatalog(initialService);
        ServicePageView.update(initialService);
    }
};

document.addEventListener('DOMContentLoaded', () => ServicePageController.init());
