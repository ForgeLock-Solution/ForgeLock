import { SERVICE_CATALOG, SERVICE_WHATSAPP_NUMBER, serviceQueryUrl } from '../models/service-catalog.js';
import { escapeHtml } from './html-helpers.js';

const whatsappUrl = (service) => `https://wa.me/${SERVICE_WHATSAPP_NUMBER}?text=${encodeURIComponent(service.message)}`;

export function renderServiceCard(service, selectedId = null) {
    const name = escapeHtml(service.name);
    const image = escapeHtml(service.image);
    const imageAlt = escapeHtml(service.imageAlt);
    const icon = escapeHtml(service.icon);
    const description = escapeHtml(service.description);
    const cardNote = service.cardNote ? `<p class="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700">${escapeHtml(service.cardNote)}</p>` : '';
    const whatsappHref = escapeHtml(whatsappUrl(service));
    const detailsHref = escapeHtml(serviceQueryUrl(service));
    const selected = selectedId === service.id;

    return `<article class="service-card flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-lg" data-service-card="${escapeHtml(service.id)}">
      <img class="aspect-[3/2] w-full object-cover" src="${image}" alt="${imageAlt}" width="1200" height="800" loading="lazy" decoding="async">
      <div class="flex flex-1 flex-col p-5 sm:p-6">
        <i class="${icon} text-2xl text-brand-700" aria-hidden="true"></i>
        <h3 class="mt-4 text-xl font-bold text-slate-900">${name}</h3>
        <p class="mt-3 flex-1 text-sm leading-relaxed text-slate-600">${description}</p>
        ${cardNote}
        <div class="mt-5 flex flex-col gap-3">
          <a href="${whatsappHref}" target="_blank" rel="noopener noreferrer" aria-label="Consultar por WhatsApp sobre ${name}" class="whatsapp-button inline-flex items-center justify-center gap-2 rounded-xl bg-brand-500 px-4 py-3 text-center text-sm font-bold text-slate-950 hover:bg-brand-600 focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-emerald-700">Consultar por WhatsApp <i class="fa-brands fa-whatsapp" aria-hidden="true"></i></a>
          <a href="${detailsHref}"${selected ? ' aria-current="page"' : ''} class="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-300 px-4 py-3 text-center text-sm font-semibold text-slate-800 underline decoration-brand-500 underline-offset-4 hover:border-brand-600 hover:text-brand-700 focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-emerald-700">Conocer ${name}</a>
        </div>
      </div>
    </article>`;
}

export function renderServiceCatalogSections(selectedId = null) {
    const featured = SERVICE_CATALOG.filter((service) => service.group === 'featured');
    const digital = SERVICE_CATALOG.filter((service) => service.group === 'digital');
    return `<div class="space-y-14" aria-label="Catálogo de servicios ForgeLock">
      <section aria-labelledby="servicios-principales-titulo">
        <h3 id="servicios-principales-titulo" class="mb-6 text-2xl font-bold text-slate-900">Servicios principales</h3>
        <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">${featured.map((service) => renderServiceCard(service, selectedId)).join('')}</div>
      </section>
      <section id="presencia-digital" aria-labelledby="servicios-digitales-titulo" class="scroll-mt-24">
        <h3 id="servicios-digitales-titulo" class="mb-6 text-2xl font-bold text-slate-900">Presencia digital</h3>
        <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">${digital.map((service) => renderServiceCard(service, selectedId)).join('')}</div>
      </section>
    </div>`;
}
