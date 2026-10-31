import { SERVICE_CATALOG, SERVICE_WHATSAPP_NUMBER, serviceQueryUrl } from '../models/service-catalog.js';
import { escapeHtml } from './html-helpers.js';

const PAGES_BASE = 'https://forgelock-solution.github.io/ForgeLock/';

export function renderServiceFiche(service) {
    if (!service?.fichePath || !service.ficheTitle || !service.ficheMetaDescription || !service.pricingLabel) {
        throw new Error('El servicio requiere una ruta, título y meta descripción aprobados para generar su ficha.');
    }
    const title = escapeHtml(service.ficheTitle);
    const description = escapeHtml(service.ficheMetaDescription);
    const name = escapeHtml(service.name);
    const body = escapeHtml(service.ficheLongDescription || service.description);
    const image = escapeHtml(service.image);
    const imageAlt = escapeHtml(service.imageAlt);
    const price = escapeHtml(service.pricingLabel);
    const canonical = escapeHtml(new URL(service.fichePath, PAGES_BASE).href);
    const related = service.relatedIds.map((id) => {
        const relatedService = getRelatedService(id);
        return `<li><a data-related-service="${escapeHtml(id)}" class="rounded-lg px-3 py-2 font-semibold text-emerald-800 underline underline-offset-4 hover:text-emerald-950 focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-emerald-700" href="${escapeHtml(serviceQueryUrl(relatedService))}">${escapeHtml(relatedService.name)}</a></li>`;
    }).join('');
    const whatsappText = encodeURIComponent(`Hola, quiero información sobre ${service.name} para mi negocio.`);

    return `<!doctype html>
<html lang="es-CO" class="scroll-smooth">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="theme-color" content="#0b1120">
  <meta name="description" content="${description}">
  <meta name="robots" content="index,follow,max-image-preview:large">
  <meta name="author" content="ForgeLock">
  <link rel="canonical" href="${canonical}">
  <link rel="alternate" hreflang="es-CO" href="${canonical}">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="ForgeLock">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  <meta property="og:url" content="${canonical}">
  <meta property="og:image" content="${escapeHtml(new URL(service.image.slice(2), PAGES_BASE).href)}">
  <meta property="og:image:alt" content="${imageAlt}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${title}">
  <meta name="twitter:description" content="${description}">
  <meta name="twitter:image" content="${escapeHtml(new URL(service.image.slice(2), PAGES_BASE).href)}">
  <meta name="twitter:image:alt" content="${imageAlt}">
  <link rel="manifest" href="./site.webmanifest">
  <link rel="icon" href="./favicon.ico" sizes="any">
  <link rel="icon" type="image/png" sizes="16x16" href="./resource/favicon-16.png">
  <link rel="icon" type="image/png" sizes="32x32" href="./resource/favicon-32.png">
  <link rel="icon" type="image/png" sizes="48x48" href="./resource/favicon-48.png">
  <link rel="apple-touch-icon" href="./Apple-touch-icon.png">
  <link rel="stylesheet" href="./src/styles/tailwind.css">
  <link rel="stylesheet" href="./src/vendor/fontawesome/css/all.min.css">
  <link rel="stylesheet" href="./src/vendor/inter/inter.css">
  <link rel="stylesheet" href="./src/styles/app.css">
  <title>${title}</title>
  <script type="application/ld+json">${JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: service.name,
      description: service.description,
      url: canonical,
      image: new URL(service.image.slice(2), PAGES_BASE).href,
      provider: { '@type': 'Organization', name: 'ForgeLock', url: PAGES_BASE }
  }).replaceAll('<', '\\u003c')}</script>
</head>
<body class="bg-slate-50 text-slate-900 font-sans antialiased">
  <a class="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-white focus:px-4 focus:py-3 focus:font-bold focus:text-slate-900 focus:shadow-lg" href="#contenido">Saltar al contenido</a>
  <header class="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
    <div class="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
      <a class="flex items-center gap-3 rounded-md focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-emerald-700" href="./index.html" aria-label="ForgeLock, inicio">
        <img src="./resource/isotipo.png" alt="" width="40" height="40"><span class="text-lg font-black">Forge<span class="text-emerald-700">Lock</span></span>
      </a>
      <nav aria-label="Navegación principal" class="flex items-center gap-4 sm:gap-7">
        <a class="font-semibold text-slate-700 underline-offset-4 hover:text-emerald-800 hover:underline focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-emerald-700" href="./index.html#servicios">Inicio</a>
        <a class="font-semibold text-slate-700 underline-offset-4 hover:text-emerald-800 hover:underline focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-emerald-700" href="./servicios.html#servicios">Servicios</a>
      </nav>
      <a class="whatsapp-button !hidden sm:!inline-flex" href="https://wa.me/${SERVICE_WHATSAPP_NUMBER}?text=${whatsappText}" target="_blank" rel="noopener noreferrer">Consultar por WhatsApp</a>
    </div>
  </header>
  <main id="contenido" class="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-2 lg:items-center lg:px-8">
    <figure class="overflow-hidden rounded-3xl border border-slate-200 bg-white p-4 shadow-lg sm:p-7 lg:col-start-2 lg:row-start-1">
      <img class="aspect-[3/2] w-full rounded-2xl object-cover" src="${image}" alt="${imageAlt}" width="1200" height="800" fetchpriority="high">
      <figcaption class="mt-4 text-center text-sm text-slate-600">${name}</figcaption>
    </figure>
    <article aria-labelledby="ficha-titulo" class="lg:col-start-1 lg:row-start-1">
      <p class="font-bold uppercase tracking-widest text-emerald-800">Servicio ForgeLock</p>
      <h1 id="ficha-titulo" class="mt-3 text-4xl font-black leading-tight sm:text-5xl">${name}</h1>
      <p class="mt-5 max-w-2xl text-lg leading-relaxed text-slate-700">${body}</p>
      <section class="mt-8" aria-labelledby="ficha-precio-titulo">
        <h2 id="ficha-precio-titulo" class="text-lg font-bold">Precio</h2>
        <p class="mt-2 text-slate-700">${price}</p>
      </section>
      <a class="whatsapp-button mt-5" href="https://wa.me/${SERVICE_WHATSAPP_NUMBER}?text=${whatsappText}" target="_blank" rel="noopener noreferrer" aria-label="Consultar por WhatsApp sobre ${name}">Consultar por WhatsApp</a>
      <section class="mt-10" aria-labelledby="servicios-relacionados-titulo">
        <h2 id="servicios-relacionados-titulo" class="text-lg font-bold">Servicios relacionados</h2>
        <ul class="mt-3 flex flex-wrap gap-2">${related}</ul>
      </section>
    </article>
  </main>
  <footer class="border-t border-slate-200 bg-white">
    <div class="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-6 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
      <p>ForgeLock · Tecnología &amp; Negocios</p>
      <a class="font-semibold text-emerald-800 underline underline-offset-4 focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-emerald-700" href="./servicios.html#servicios">Ver todos los servicios</a>
    </div>
  </footer>
</body>
</html>
`;
}

function getRelatedService(id) {
    const related = SERVICE_CATALOG.find((service) => service.id === id);
    if (!related) throw new Error(`Servicio relacionado inexistente: ${id}`);
    return related;
}
