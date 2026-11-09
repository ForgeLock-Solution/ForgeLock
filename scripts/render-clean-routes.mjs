// Genera rutas limpias y puentes heredados sobre el artefacto compilado por Vite.
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { JSDOM } from 'jsdom';
import { SERVICE_BY_ID, SERVICE_CATALOG, WHATSAPP_NUMBER, formatPrice, getWhatsAppUrl } from '../src/data/services.ts';
import { getDistDirectory, getSeoConfig, SITE_URL } from './seo-helpers.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const PUBLIC_SERVICES = SERVICE_CATALOG.filter((service) => service.fichePath && service.legacyFichePath);

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[character]);
}

function setMeta(document, selector, value) {
  const element = document.querySelector(selector);
  if (element) element.setAttribute('content', value);
}

function normalizeHomeLinks(document, assetBase) {
  for (const anchor of document.querySelectorAll('a[href]')) {
    const value = anchor.getAttribute('href');
    if (value === `${assetBase}index.html`) anchor.setAttribute('href', assetBase);
    else if (value?.startsWith(`${assetBase}index.html#`)) anchor.setAttribute('href', `${assetBase}${value.slice(`${assetBase}index.html`.length)}`);
  }
}

function cleanServicesHtml(html, assetBase) {
  const dom = new JSDOM(html);
  try {
    const { document } = dom.window;
    const canonical = `${SITE_URL}servicios/`;
    document.querySelector('link[rel="canonical"]')?.setAttribute('href', canonical);
    setMeta(document, 'meta[property="og:url"]', canonical);
    for (const script of document.querySelectorAll('script[type="application/ld+json"]')) {
      script.textContent = script.textContent.replaceAll(`${SITE_URL}servicios.html`, canonical);
    }
    normalizeHomeLinks(document, assetBase);
    return dom.serialize();
  } finally {
    dom.window.close();
  }
}

function pricingMarkup(service) {
  if (!service.pricing?.length) {
    return `<section class="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-6"><h2 class="text-xl font-bold text-slate-900">Precio y alcance</h2><p class="mt-3 text-slate-700">${escapeHtml(service.pricingLabel)}</p></section>`;
  }
  return `<section class="mt-10"><h2 class="text-2xl font-bold text-slate-900">Planes publicados</h2><div class="mt-5 grid gap-6 lg:grid-cols-2">${service.pricing.map((plan) => `
    <article class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 class="text-xl font-bold text-slate-900">${escapeHtml(plan.name)}</h3>
      <p class="mt-2 text-2xl font-black text-slate-900">${escapeHtml(formatPrice(plan.price))}</p>
      <p class="mt-2 text-sm text-slate-600">Entrega estimada: ${escapeHtml(plan.delivery)}.</p>
      <ul class="mt-4 space-y-2 text-sm text-slate-700">${plan.features.map((feature) => `<li>✓ ${escapeHtml(feature)}</li>`).join('')}</ul>
      <a class="mt-6 inline-flex rounded-xl bg-emerald-600 px-5 py-3 font-bold text-white" href="${escapeHtml(getWhatsAppUrl(plan.message, WHATSAPP_NUMBER))}" target="_blank" rel="noopener noreferrer">Consultar ${escapeHtml(plan.name)} por WhatsApp</a>
    </article>`).join('')}</div></section>`;
}

function serviceJsonLd(service, canonical) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    '@id': `${canonical}#service`,
    name: service.name,
    description: service.ficheMetaDescription,
    url: canonical,
    provider: { '@type': 'Organization', '@id': `${SITE_URL}#organization`, name: 'ForgeLock', url: SITE_URL }
  };
  if (service.pricing?.length) {
    data.offers = service.pricing.map((plan) => ({
      '@type': 'Offer', name: plan.name, price: plan.price, priceCurrency: plan.currency, url: canonical
    }));
  }
  return JSON.stringify(data).replaceAll('<', '\\u003c');
}

function servicePage(service, { assetBase, stylesheetLinks }) {
  const canonical = `${SITE_URL}${service.fichePath}`;
  const description = service.ficheMetaDescription;
  const image = `${assetBase}${service.image.replace(/^\.\//, '')}`;
  const related = service.relatedIds.map((id) => SERVICE_BY_ID[id]).filter(Boolean);
  const relatedMarkup = related.length ? `<section class="mt-10 border-t border-slate-200 pt-8"><h2 class="text-xl font-bold text-slate-900">Servicios relacionados</h2><div class="mt-4 flex flex-wrap gap-3">${related.map((item) => {
    const href = item.fichePath ? `${assetBase}${item.fichePath}` : `${assetBase}servicios/`;
    return `<a class="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 font-semibold text-emerald-800" href="${escapeHtml(href)}">${escapeHtml(item.name)}</a>`;
  }).join('')}</div></section>` : '';
  return `<!doctype html>
<html lang="es-CO">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="theme-color" content="#0b1120">
  <title>${escapeHtml(service.ficheTitle)}</title>
  <meta name="description" content="${escapeHtml(description)}">
  <meta name="robots" content="index,follow,max-image-preview:large">
  <link rel="canonical" href="${canonical}">
  <meta property="og:site_name" content="ForgeLock">
  <meta property="og:type" content="website">
  <meta property="og:title" content="${escapeHtml(service.ficheTitle)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:url" content="${canonical}">
  <meta property="og:image" content="${SITE_URL}resource/forgelock-social-preview.png">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(service.ficheTitle)}">
  <meta name="twitter:description" content="${escapeHtml(description)}">
  <meta name="twitter:image" content="${SITE_URL}resource/forgelock-social-preview.png">
  <link rel="manifest" href="${assetBase}site.webmanifest">
  <link rel="icon" href="${assetBase}favicon.ico" sizes="any">
  <link rel="apple-touch-icon" href="${assetBase}Apple-touch-icon.png">
  ${stylesheetLinks}
  <script type="application/ld+json">${serviceJsonLd(service, canonical)}</script>
</head>
<body class="min-h-screen bg-slate-50 text-slate-800 font-sans">
  <header class="border-b border-slate-200 bg-white"><div class="mx-auto flex max-w-6xl items-center justify-between px-6 py-5"><a class="flex items-center gap-3 font-bold text-slate-900" href="${assetBase}" aria-label="ForgeLock, inicio"><img src="${assetBase}resource/isotipo.png" alt="" width="36" height="36"><span class="text-xl">ForgeLock</span></a><a class="text-sm font-semibold text-emerald-800 underline" href="${assetBase}servicios/">Todos los servicios</a></div></header>
  <main class="mx-auto max-w-6xl px-6 py-12 sm:py-16">
    <nav aria-label="Migas de pan" class="text-sm text-slate-600"><a class="underline" href="${assetBase}">Inicio</a> · <a class="underline" href="${assetBase}servicios/">Servicios</a> · <span aria-current="page">${escapeHtml(service.name)}</span></nav>
    <article class="mt-8 grid gap-10 lg:grid-cols-2 lg:items-start">
      <div><p class="text-sm font-bold uppercase tracking-widest text-emerald-800">Servicio ForgeLock</p><h1 class="mt-3 text-4xl font-black text-slate-950 sm:text-5xl">${escapeHtml(service.name)}</h1><p class="mt-5 text-lg leading-relaxed text-slate-700">${escapeHtml(service.ficheLongDescription || service.description)}</p>${pricingMarkup(service)}<a class="mt-8 inline-flex rounded-xl bg-emerald-600 px-6 py-3 font-bold text-white" href="${escapeHtml(getWhatsAppUrl(service.message, WHATSAPP_NUMBER))}" target="_blank" rel="noopener noreferrer">Consultar por WhatsApp</a></div>
      <figure class="overflow-hidden rounded-3xl border border-slate-200 bg-white p-4 shadow-sm"><img class="aspect-[3/2] w-full rounded-2xl object-cover" src="${escapeHtml(image)}" alt="${escapeHtml(service.imageAlt)}" width="1200" height="800"><figcaption class="mt-3 text-center text-sm text-slate-500">${escapeHtml(service.name)}</figcaption></figure>
    </article>
    ${relatedMarkup}
  </main>
  <footer class="border-t border-slate-200 bg-white px-6 py-8 text-center text-sm text-slate-500">© ForgeLock · <a class="underline" href="${assetBase}politica-privacidad.html">Privacidad</a> · <a class="underline" href="${assetBase}politica-cookies.html">Cookies</a></footer>
</body>
</html>\n`;
}

function legacyBridge({ title, description, canonicalPath, destination }) {
  const canonical = `${SITE_URL}${canonicalPath}`;
  return `<!doctype html>
<html lang="es-CO">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)} | ForgeLock</title>
  <meta name="description" content="${escapeHtml(description)}">
  <meta name="robots" content="noindex,follow">
  <link rel="canonical" href="${canonical}">
  <meta property="og:url" content="${canonical}">
  <meta property="og:image" content="${SITE_URL}resource/forgelock-social-preview.png">
  <meta name="twitter:image" content="${SITE_URL}resource/forgelock-social-preview.png">
  <meta http-equiv="refresh" content="0; url=${escapeHtml(destination)}">
</head>
<body><main><h1>${escapeHtml(title)}</h1><p>Esta página cambió de dirección.</p><p><a href="${escapeHtml(destination)}">Continuar a la página actual</a></p></main></body>
</html>\n`;
}

export async function renderCleanRoutes({ output = getDistDirectory(root), env = process.env } = {}) {
  const { baseUrl } = getSeoConfig(env);
  const assetBase = baseUrl.pathname;
  const servicesSource = join(output, 'servicios.html');
  const servicesHtml = await readFile(servicesSource, 'utf8');
  const servicesDestination = join(output, 'servicios', 'index.html');
  await mkdir(dirname(servicesDestination), { recursive: true });
  await writeFile(servicesDestination, cleanServicesHtml(servicesHtml, assetBase), 'utf8');

  const servicesDom = new JSDOM(servicesHtml);
  const stylesheetLinks = [...servicesDom.window.document.querySelectorAll('link[rel="stylesheet"]')].map((link) => link.outerHTML).join('\n  ');
  servicesDom.window.close();

  for (const service of PUBLIC_SERVICES) {
    const destination = join(output, service.fichePath, 'index.html');
    await mkdir(dirname(destination), { recursive: true });
    await writeFile(destination, servicePage(service, { assetBase, stylesheetLinks }), 'utf8');
    await writeFile(join(output, service.legacyFichePath), legacyBridge({
      title: service.name,
      description: service.ficheMetaDescription,
      canonicalPath: service.fichePath,
      destination: `./${service.fichePath}`
    }), 'utf8');
  }

  await writeFile(servicesSource, legacyBridge({
    title: 'Servicios digitales para negocios',
    description: 'Consulta el catálogo de servicios digitales de ForgeLock.',
    canonicalPath: 'servicios/',
    destination: './servicios/'
  }), 'utf8');
  return { pageCount: PUBLIC_SERVICES.length + 2, bridgeCount: PUBLIC_SERVICES.length + 1 };
}

if (process.argv[1] && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))) {
  const result = await renderCleanRoutes({ env: process.env });
  console.log(`Rutas limpias generadas: ${result.pageCount}; puentes heredados: ${result.bridgeCount}.`);
}
