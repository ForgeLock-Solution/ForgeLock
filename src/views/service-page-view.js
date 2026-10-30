import { ServicePageModel } from '../models/service-page-model.js';

const activeClasses = ['border-brand-600', 'bg-emerald-50', 'text-slate-900'];
const inactiveClasses = ['border-slate-200', 'bg-white', 'text-slate-700'];

export const ServicePageView = {
    update(serviceId) {
        const service = ServicePageModel.services[serviceId];
        if (!service) return;

        const tab = document.querySelector(`[data-service="${serviceId}"]`);
        document.querySelectorAll('[role="tab"][data-service]').forEach((button) => {
            const selected = button === tab;
            button.setAttribute('aria-selected', String(selected));
            button.tabIndex = selected ? 0 : -1;
            button.classList.remove(...(selected ? inactiveClasses : activeClasses));
            button.classList.add(...(selected ? activeClasses : inactiveClasses));
        });

        const panel = document.querySelector('#detalle-servicio');
        panel.setAttribute('aria-labelledby', tab.id);
        document.querySelector('#detalle-etiqueta').textContent = service.label;
        document.querySelector('#detalle-titulo').textContent = service.title;
        document.querySelector('#detalle-descripcion').textContent = service.description;
        document.querySelector('#detalle-informacion').textContent = service.information;

        const detailsLink = document.querySelector('#detalle-enlace');
        detailsLink.hidden = !service.detailsHref;
        detailsLink.classList.toggle('hidden', !service.detailsHref);
        detailsLink.classList.toggle('inline-flex', Boolean(service.detailsHref));
        detailsLink.href = service.detailsHref || '#servicios';
        detailsLink.textContent = service.detailsLabel;

        const action = document.querySelector('#detalle-cta');
        action.href = `https://wa.me/${ServicePageModel.whatsappNumber}?text=${encodeURIComponent(service.message)}`;
        action.textContent = service.action;

        document.querySelectorAll('[data-landing-content]').forEach((section) => {
            section.hidden = serviceId !== 'landing';
        });
        document.body.dataset.activeService = serviceId;
    }
};
