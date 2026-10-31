import { SERVICE_BY_ID } from '../models/service-catalog.js';
import { ServicePageView } from '../views/service-page-view.js';

export const ServicePageController = {
    eventsDocument: null,
    init() {
        const requestedService = new URLSearchParams(window.location.search).get('servicio');
        const initialService = SERVICE_BY_ID[requestedService] ? requestedService : null;
        ServicePageView.renderCatalog(initialService);
        if (initialService) ServicePageView.update(initialService);
        this.setupServiceNavigation();
    },

    setupServiceNavigation() {
        if (this.eventsDocument === document) return;
        this.eventsDocument = document;

        document.addEventListener('click', (event) => {
            const link = event.target?.closest?.('#services-catalogue-container a[href*="?servicio="]');
            if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

            const destination = new URL(link.href, window.location.href);
            if (destination.origin !== window.location.origin || destination.pathname !== window.location.pathname) return;
            const serviceId = destination.searchParams.get('servicio');
            if (!SERVICE_BY_ID[serviceId]) return;

            event.preventDefault();
            const scrollX = window.scrollX;
            const scrollY = window.scrollY;
            const root = document.documentElement;
            const previousScrollBehavior = root.style.scrollBehavior;
            root.style.scrollBehavior = 'auto';
            window.history.pushState({ serviceId }, '', `${destination.pathname}${destination.search}${destination.hash}`);
            ServicePageView.update(serviceId);
            window.scrollTo(scrollX, scrollY);
            root.style.scrollBehavior = previousScrollBehavior;
        });

        window.addEventListener('popstate', () => {
            const serviceId = new URLSearchParams(window.location.search).get('servicio');
            if (SERVICE_BY_ID[serviceId]) ServicePageView.update(serviceId);
        });
    }
};

if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => ServicePageController.init());
}
