import { SERVICE_BY_ID, SERVICE_CATALOG, SERVICE_WHATSAPP_NUMBER } from '../models/service-catalog.js';
import { escapeHtml } from './html-helpers.js';
import { renderServiceCatalogSections } from './service-cards-view.js';

const formatPrice = (price) => `$${new Intl.NumberFormat('es-CO').format(price)} COP`;

function pricingSummary(service) {
    if (!service.pricing?.length) return service.detailInfo;
    return `Planes documentados: ${service.pricing.map((plan) => `${plan.name}: ${formatPrice(plan.price)}, entrega de ${plan.delivery}`).join('; ')}.`;
}

export const ServicePageView = {
    renderStructuredData() {
        const script = document.querySelector('script[type="application/ld+json"]');
        if (!script) return;
        try {
            const data = JSON.parse(script.textContent);
            const itemList = data['@graph']?.find((item) => item['@type'] === 'ItemList');
            if (!itemList) return;
            itemList.numberOfItems = SERVICE_CATALOG.length;
            itemList.itemListElement = SERVICE_CATALOG.map((service, index) => {
                const item = {
                    '@type': 'ListItem',
                    position: index + 1,
                    item: {
                        '@type': 'Service',
                        name: service.name,
                        description: service.description,
                        image: `https://forgelock.forge-look19.workers.dev/${service.image.slice(2)}`,
                        provider: { '@id': 'https://forgelock.forge-look19.workers.dev/#organization' }
                    }
                };
                if (service.pricing?.length) {
                    item.item.offers = service.pricing.map((plan) => ({
                        '@type': 'Offer', name: plan.name, price: String(plan.price), priceCurrency: plan.currency
                    }));
                }
                return item;
            });
            script.textContent = JSON.stringify(data).replaceAll('<', '\\u003c');
        } catch {
            // No se reemplaza JSON-LD mal formado desde la vista.
        }
    },

    renderCatalog(selectedId = null) {
        const container = document.querySelector('#services-catalogue-container');
        if (container) container.innerHTML = renderServiceCatalogSections(selectedId);
        this.renderStructuredData();
    },

    renderLandingPricing() {
        const container = document.querySelector('#landing-pricing-container');
        if (!container) return;
        const landing = SERVICE_BY_ID.landing;
        container.innerHTML = `<div class="max-w-3xl mx-auto text-center"><span class="text-brand-700 text-xs font-bold uppercase tracking-[.2em]">Precios y alcance</span><h2 id="planes-titulo" class="mt-3 text-3xl font-black sm:text-4xl">Elige tu landing page</h2><p class="mt-4 text-slate-600">Estos son los precios, tiempos y elementos incluidos en cada opción.</p></div><div class="mt-10 grid gap-7 lg:grid-cols-2">${landing.pricing.map((plan, index) => `<article class="rounded-2xl border ${index ? 'border-2 border-emerald-500' : 'border-slate-200'} bg-white p-6 sm:p-8"><h3 class="text-2xl font-bold">${escapeHtml(plan.name)}</h3><p class="mt-3 text-4xl font-black">${escapeHtml(formatPrice(plan.price))}</p><p class="mt-2 text-slate-600">Entrega de ${escapeHtml(plan.delivery)}.</p><h4 class="mt-6 font-bold">Incluye</h4><ul class="mt-3 space-y-2 text-sm text-slate-700">${plan.features.map((feature) => `<li>${escapeHtml(feature)}.</li>`).join('')}</ul><a class="mt-7 whatsapp-button" href="https://wa.me/${SERVICE_WHATSAPP_NUMBER}?text=${encodeURIComponent(plan.message)}" target="_blank" rel="noopener noreferrer" aria-label="Consultar por WhatsApp sobre ${escapeHtml(plan.name)}">Consultar por WhatsApp</a></article>`).join('')}</div>`;
    },

    update(serviceId) {
        const service = SERVICE_BY_ID[serviceId];
        if (!service) return false;

        this.renderCatalog(serviceId);
        this.renderLandingPricing();
        const panel = document.querySelector('#detalle-servicio');
        panel.setAttribute('aria-labelledby', 'detalle-titulo');
        panel.dataset.service = service.id;
        document.querySelector('#detalle-etiqueta').textContent = service.name;
        document.querySelector('#detalle-titulo').textContent = service.detailTitle || service.name;
        document.querySelector('#detalle-descripcion').textContent = service.description;
        document.querySelector('#detalle-informacion').textContent = pricingSummary(service);

        const detailsLink = document.querySelector('#detalle-enlace');
        const hasDetailsLink = Boolean(service.pricing?.length);
        detailsLink.hidden = !hasDetailsLink;
        detailsLink.classList.toggle('hidden', !hasDetailsLink);
        detailsLink.classList.toggle('inline-flex', hasDetailsLink);
        detailsLink.href = hasDetailsLink ? '#planes-landing' : '#detalle-servicio';
        detailsLink.textContent = hasDetailsLink ? 'Ver precios y alcance' : '';

        const action = document.querySelector('#detalle-cta');
        action.href = `https://wa.me/${SERVICE_WHATSAPP_NUMBER}?text=${encodeURIComponent(service.message)}`;
        action.textContent = service.id === 'soluciones-personalizadas' ? 'Cotiza según tu necesidad · WhatsApp' : 'Consultar por WhatsApp';
        action.setAttribute('aria-label', `Consultar por WhatsApp sobre ${service.name}`);

        document.querySelectorAll('[data-landing-content]').forEach((section) => {
            section.hidden = service.id !== 'landing';
        });
        document.body.dataset.activeService = service.id;
        return true;
    }
};
