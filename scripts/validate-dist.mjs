// Comprueba que dist/ contiene una variante SEO coherente antes de publicarla.
import { readFile, readdir, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, resolve, relative, isAbsolute } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { JSDOM } from 'jsdom';
import {
  comparePublicHtmlFiles,
  discoverPublicHtmlFiles,
  getCanonicalUrls,
  getGoogleVerificationValues,
  getSitemapRobotsBlockers,
  isNoindex,
  isValidLastmod,
  parseXmlDocument,
  SITEMAP_NAMESPACE,
  validateSitemapUrlChildren
} from './seo-helpers.mjs';
import { getDistDirectory, getPageUrl, getSeoConfig } from './seo-helpers.mjs';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const dist = getDistDirectory(root);
let config;
try {
  config = getSeoConfig();
} catch (error) {
  console.error(`Configuración SEO inválida: ${error.message}`);
  process.exit(1);
}
const { target, baseUrl, canonicalBaseUrl, canonicalTarget, indexable } = config;
const errors = [];
const serviceCatalogPath = join(root, 'src', 'models', 'service-catalog.js');
const SERVICE_CATALOG = existsSync(serviceCatalogPath)
  ? (await import(pathToFileURL(serviceCatalogPath).href)).SERVICE_CATALOG
  : [];
const serviceFichePaths = SERVICE_CATALOG.map((service) => service.fichePath);
const expectedPages = ['index.html', 'servicios.html', ...serviceFichePaths];
const legalPages = ['aviso-legal.html', 'politica-privacidad.html', 'politica-cookies.html'];
const sourceVerificationValues = getGoogleVerificationValues(await readFile(join(root, 'index.html'), 'utf8'));
const verificationToken = sourceVerificationValues[0];
const requiredFiles = [
  ...expectedPages, 'robots.txt', 'sitemap.xml', 'site.webmanifest',
  '_headers', '_redirects', 'favicon.ico', 'Apple-touch-icon.png', 'Icon-192.png'
];

function fail(message) { errors.push(message); }

async function listFiles(dir, prefix = '') {
  const files = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const relativePath = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.isDirectory()) files.push(...await listFiles(join(dir, entry.name), relativePath));
    else files.push(relativePath);
  }
  return files;
}

async function pngDimensions(path) {
  const buffer = await readFile(path);
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  if (buffer.length < 24 || !buffer.subarray(0, 8).equals(signature)) throw new Error('no es un PNG válido');
  return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
}

function metaValues(html, attribute, value) {
  const escapedAttribute = attribute.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const escapedValue = value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return [...html.matchAll(new RegExp(`<meta\\b(?=[^>]*\\b${escapedAttribute}=["']${escapedValue}["'])[^>]*>`, 'gi'))];
}

function checkLocalAsset(urlValue, sourceFile) {
  let url;
  try { url = new URL(urlValue, baseUrl); }
  catch { fail(`URL de activo inválida en dist/${sourceFile}: ${urlValue}`); return; }
  const assetBase = [baseUrl, canonicalBaseUrl].find((base) => url.origin === base.origin && url.pathname.startsWith(base.pathname));
  if (!assetBase) return;
  const local = decodeURIComponent(url.pathname.slice(assetBase.pathname.length));
  const path = resolve(dist, local);
  if (isAbsolute(relative(dist, path)) || relative(dist, path).startsWith('..')) fail(`Activo fuera de dist/ en dist/${sourceFile}: ${urlValue}`);
  else if (!existsSync(path)) fail(`Activo SEO no encontrado en dist/${sourceFile}: ${urlValue}`);
}

if (!existsSync(dist)) {
  console.error('Validación fallida: no existe dist/. Ejecuta npm run build:dist.');
  process.exit(1);
}

const artifactFiles = await listFiles(dist);
let sourceHtmlFiles = [];
let distHtmlFiles = [];
try {
  sourceHtmlFiles = await discoverPublicHtmlFiles(root);
  distHtmlFiles = await discoverPublicHtmlFiles(dist);
} catch (error) {
  fail(error.message);
}
const pageInventory = comparePublicHtmlFiles([...sourceHtmlFiles, ...serviceFichePaths], distHtmlFiles);
for (const file of pageInventory.missing) fail(`Página pública del origen ausente en dist/: ${file}`);
for (const file of pageInventory.unexpected) fail(`Página HTML en dist/ sin página pública correspondiente en origen: ${file}`);
for (const file of artifactFiles) {
  if (/(^|\/)\.env(?:\.|$)/i.test(file) || /(^|\/)supabase-config\.js$/i.test(file)) fail(`Archivo de configuración privada incluido en dist/: ${file}`);
  if (/(^|\/)internal-data(\/|$)/i.test(file) || /(^|\/)pending-offers\.json$/i.test(file)) fail(`Datos internos incluidos en dist/: ${file}`);
}
for (const file of requiredFiles) {
  const path = join(dist, file);
  if (!existsSync(path)) { fail(`Falta dist/${file}`); continue; }
  const info = await stat(path);
  if (!info.isFile() || info.size === 0) fail(`dist/${file} está vacío o no es un archivo`);
}

let manifest;
try { manifest = JSON.parse(await readFile(join(dist, 'site.webmanifest'), 'utf8')); }
catch (error) { fail(`No se pudo leer site.webmanifest: ${error.message}`); }
if (manifest) {
  if (manifest.name !== 'ForgeLock') fail('El nombre del manifiesto debe ser exactamente ForgeLock.');
  if (manifest.start_url !== './' || manifest.scope !== './') fail('start_url y scope deben permanecer relativos para conservar compatibilidad con GitHub Pages.');
  for (const expected of [{ src: './Icon-192.png', width: 192, height: 192 }, { src: './Apple-touch-icon.png', width: 180, height: 180 }]) {
    const icon = manifest.icons?.find((entry) => entry.src === expected.src);
    if (!icon) { fail(`El manifiesto no declara el icono ${expected.src}`); continue; }
    if (icon.sizes !== `${expected.width}x${expected.height}`) fail(`${expected.src}: sizes del manifiesto debe ser ${expected.width}x${expected.height}`);
    try {
      const dimensions = await pngDimensions(join(dist, icon.src.replace(/^\.\//, '')));
      if (dimensions.width !== expected.width || dimensions.height !== expected.height) fail(`${expected.src}: dimensiones reales incorrectas.`);
    } catch (error) { fail(`${expected.src}: ${error.message}`); }
  }
}

let verificationCount = 0;
for (const file of artifactFiles.filter((entry) => entry.endsWith('.html'))) {
  const html = await readFile(join(dist, file), 'utf8');
  if (/Nota de revisión|Antes de publicar|deben verificarse/i.test(html)) fail(`Nota editorial sin retirar en dist/${file}.`);
  const canonical = [...html.matchAll(/<link\b(?=[^>]*\brel=["']canonical["'])[^>]*\bhref=["']([^"']+)["'][^>]*>/gi)];
  if (!indexable && !/<meta\s+name=["']robots["'][^>]*\bnoindex\b/i.test(html)) fail(`dist/${file} debe llevar noindex cuando INDEXABLE=false.`);
  if (expectedPages.includes(file)) {
    const expectedCanonical = getPageUrl(file, canonicalBaseUrl, canonicalTarget);
    if (canonical.length !== 1) fail(`dist/${file} debe tener exactamente un canonical; encontrados: ${canonical.length}.`);
    else if (canonical[0][1] !== expectedCanonical) fail(`Canonical incorrecto en dist/${file}: ${canonical[0][1]}; esperado ${expectedCanonical}.`);
    const serviceFiche = SERVICE_CATALOG.find((service) => service.fichePath === file);
    const shareImage = serviceFiche
      ? new URL(serviceFiche.image.slice(2), canonicalBaseUrl).href
      : `${canonicalBaseUrl.href}resource/forgelock-social-preview.png`;
    const expectedMeta = [
      ['property', 'og:url', expectedCanonical],
      ['property', 'og:image', shareImage],
      ['name', 'twitter:image', shareImage]
    ];
    for (const [attribute, value, expected] of expectedMeta) {
      const tags = metaValues(html, attribute, value);
      if (tags.length !== 1) fail(`dist/${file} debe tener exactamente un meta ${value}.`);
      else if (tags[0][0].match(/\bcontent=["']([^"']+)["']/i)?.[1] !== expected) fail(`El meta ${value} de dist/${file} no coincide con ${target}.`);
    }
    if (!html.includes(`content="${expectedCanonical}"`) || !html.includes(`content="${shareImage}"`)) {
      fail(`Metadatos Open Graph/Twitter no coinciden con el destino ${target} en dist/${file}.`);
    }
    for (const attribute of ['property', 'name']) {
      for (const match of metaValues(html, attribute, attribute === 'property' ? 'og:image' : 'twitter:image')) {
        const content = match[0].match(/\bcontent=["']([^"']+)["']/i)?.[1];
        if (content) checkLocalAsset(content, file);
      }
    }
    checkLocalAsset(`${canonicalBaseUrl.href}resource/Logo.png`, file);
  }
  if (legalPages.includes(file)) {
    if (!/<meta\s+name=["']robots["']\s+content=["'][^"']*noindex/i.test(html)) fail(`dist/${file} debe conservar la política noindex.`);
    const expectedCanonical = getPageUrl(file, canonicalBaseUrl, canonicalTarget);
    if (canonical.length !== 1 || canonical[0][1] !== expectedCanonical) fail(`Canonical de la página legal dist/${file} incorrecto para ${target}.`);
  }

  if (/<meta\s+name=["']google-site-verification["']/i.test(html)) {
    const tokens = [...html.matchAll(/<meta\s+name=["']google-site-verification["']\s+content=["']([^"']+)["']/gi)];
    verificationCount += tokens.length;
    if (tokens.some((match) => match[1] !== verificationToken)) fail(`Token de verificación de Google cambiado en dist/${file}.`);
    if (tokens.length !== 1) fail(`dist/${file} debe contener una sola etiqueta de verificación de Google.`);
  }

  for (const match of html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      const json = JSON.parse(match[1]);
      if (!JSON.stringify(json).includes(canonicalBaseUrl.href)) fail(`JSON-LD de dist/${file} no incluye la URL canónica de ${target}.`);
    } catch (error) { fail(`JSON-LD inválido en dist/${file}: ${error.message}`); }
  }
  const otherProductionBase = target === 'cloudflare'
    ? 'https://forgelock-solution.github.io/ForgeLock/'
    : 'https://forgelock.forge-look19.workers.dev/';
  if (html.includes(otherProductionBase)) fail(`dist/${file} contiene señales SEO del destino distinto de ${target}.`);

  for (const match of html.matchAll(/\b(?:href|src)\s*=\s*["']([^"']+)["']/gi)) {
    const value = match[1].trim();
    if (!value || value.startsWith('#') || value.startsWith('//')) continue;
    let pathname;
    try {
      const resolvedUrl = new URL(value, new URL(file, baseUrl));
      if (/^[a-z][a-z\d+.-]*:/i.test(value) && resolvedUrl.origin !== baseUrl.origin) continue;
      if (resolvedUrl.origin !== baseUrl.origin || !resolvedUrl.pathname.startsWith(baseUrl.pathname)) continue;
      pathname = decodeURIComponent(resolvedUrl.pathname.slice(baseUrl.pathname.length));
    }
    catch { fail(`URL local no válida en dist/${file}: ${value}`); continue; }
    let localPath = resolve(dist, pathname);
    if (target === 'cloudflare' && !existsSync(localPath) && existsSync(`${localPath}.html`)) localPath = `${localPath}.html`;
    if (isAbsolute(relative(dist, localPath)) || relative(dist, localPath).startsWith('..')) fail(`Ruta local fuera de dist/ en dist/${file}: ${value}`);
    else if (!existsSync(localPath)) fail(`Recurso local no encontrado en dist/${file}: ${value}`);
  }
}
if (verificationCount !== 1) fail(`La distribución debe conservar exactamente una etiqueta de verificación de Google; encontradas: ${verificationCount}.`);

try {
  const robots = await readFile(join(dist, 'robots.txt'), 'utf8');
  const expectedSitemap = new URL('sitemap.xml', canonicalBaseUrl).href;
  const sitemapDirectives = robots.split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => /^Sitemap:/i.test(line));
  if (indexable && (sitemapDirectives.length !== 1 || sitemapDirectives[0] !== `Sitemap: ${expectedSitemap}`)) {
    fail(`robots.txt debe contener una única directiva Sitemap: ${expectedSitemap}`);
  }
  if (!indexable && sitemapDirectives.length) fail('robots.txt no debe publicar un sitemap cuando INDEXABLE=false.');
  if (!/^User-agent:\s*\*\s*$/m.test(robots) || !/^Allow:\s*\/\s*$/m.test(robots)) {
    fail('robots.txt debe permitir el rastreo general sin bloquear recursos.');
  }

  const sitemap = await readFile(join(dist, 'sitemap.xml'), 'utf8');
  let xmlDocument;
  try {
    xmlDocument = parseXmlDocument(sitemap);
  } catch (error) {
    fail(`sitemap.xml no es XML bien formado: ${error.message}`);
  }
  const rootElement = xmlDocument?.documentElement;
  if (!rootElement || rootElement.localName !== 'urlset' || rootElement.namespaceURI !== SITEMAP_NAMESPACE) {
    fail('sitemap.xml debe usar urlset y el namespace oficial de sitemaps.');
  }

  const sitemapUrls = new Set();
  if (rootElement?.localName === 'urlset' && rootElement.namespaceURI === SITEMAP_NAMESPACE) {
    for (const child of [...rootElement.children]) {
      if (child.localName !== 'url' || child.namespaceURI !== SITEMAP_NAMESPACE) {
        fail('sitemap.xml solo debe contener elementos url del namespace oficial.');
        continue;
      }
      const locations = [...child.children].filter((element) => element.localName === 'loc');
      const lastmods = [...child.children].filter((element) => element.localName === 'lastmod');
      if ([...child.children].some((element) => element.namespaceURI !== SITEMAP_NAMESPACE || !['loc', 'lastmod'].includes(element.localName))) {
        fail('Los elementos de url deben contener únicamente loc y lastmod del namespace oficial.');
      }
      if (!validateSitemapUrlChildren(child.children) || locations.length !== 1 || lastmods.length > 1) {
        fail('Cada elemento url debe contener un loc y, opcionalmente, un lastmod, en ese orden y sin duplicados.');
        continue;
      }
      const location = locations[0].textContent.trim();
      let parsedLocation;
      try {
        parsedLocation = new URL(location);
      } catch {
        fail(`URL loc no absoluta o inválida en sitemap.xml: ${location}`);
        continue;
      }
      if (!['http:', 'https:'].includes(parsedLocation.protocol) || parsedLocation.username || parsedLocation.password || parsedLocation.search || parsedLocation.hash) {
        fail(`URL loc no válida para indexación: ${location}`);
      }
      if (parsedLocation.origin !== baseUrl.origin || !parsedLocation.pathname.startsWith(baseUrl.pathname)) {
        fail(`URL loc fuera de BASE_URL (${baseUrl.href}): ${location}`);
      }
      // Check the generic group, Googlebot, and all agents declared in robots.txt.
      for (const agent of getSitemapRobotsBlockers(robots, parsedLocation.pathname)) {
        fail(`robots.txt bloquea la URL del sitemap para el agente validado "${agent}": ${location}`);
      }
      if (sitemapUrls.has(parsedLocation.href)) fail(`URL duplicada en sitemap.xml: ${location}`);
      sitemapUrls.add(parsedLocation.href);
      if (lastmods.length === 1 && !isValidLastmod(lastmods[0].textContent.trim())) {
        fail(`lastmod no usa una fecha válida YYYY-MM-DD para ${location}`);
      }

      let route = '';
      if (parsedLocation.origin === baseUrl.origin && parsedLocation.pathname.startsWith(baseUrl.pathname)) {
        try {
          route = decodeURIComponent(parsedLocation.pathname.slice(baseUrl.pathname.length));
        } catch {
          fail(`Ruta loc no válida en sitemap.xml: ${location}`);
          continue;
        }
      }
      if (!route || route.endsWith('/')) route = `${route}index.html`;
      if (target === 'cloudflare' && !route.endsWith('.html')) route = `${route}.html`;
      const htmlPath = resolve(dist, `.${route.startsWith('/') ? route : `/${route}`}`);
      if (isAbsolute(relative(dist, htmlPath)) || relative(dist, htmlPath).startsWith('..') || !existsSync(htmlPath)) {
        fail(`La URL del sitemap no corresponde a una página del artefacto: ${location}`);
        continue;
      }
      const html = await readFile(htmlPath, 'utf8');
      if (isNoindex(html)) fail(`El sitemap incluye una página noindex: ${location}`);
      const canonicals = getCanonicalUrls(html);
      if (canonicals.length !== 1 || canonicals[0] !== parsedLocation.href) {
        fail(`Canonical y sitemap no coinciden para ${location}`);
      }
    }
  }

  if (indexable && sitemapUrls.size === 0) fail('sitemap.xml debe contener al menos una URL indexable.');
  if (!indexable && sitemapUrls.size) fail('sitemap.xml no debe contener URLs cuando INDEXABLE=false.');
  if (!indexable) {
    for (const file of artifactFiles.filter((entry) => entry.endsWith('.html'))) {
      const html = await readFile(join(dist, file), 'utf8');
      if (!isNoindex(html)) {
        fail(`dist/${file} debe llevar noindex cuando INDEXABLE=false.`);
      }
    }
  }

  if (indexable) {
    for (const file of artifactFiles.filter((entry) => entry.endsWith('.html'))) {
      const html = await readFile(join(dist, file), 'utf8');
      if (isNoindex(html)) continue;
      const expectedUrl = getPageUrl(file, canonicalBaseUrl, canonicalTarget);
      const canonicals = getCanonicalUrls(html);
      if (canonicals.length !== 1 || canonicals[0] !== expectedUrl) {
        fail(`dist/${file} debe tener una única canonical propia: ${expectedUrl}`);
      }
      if (!sitemapUrls.has(expectedUrl)) {
        fail(`Falta en sitemap.xml la página pública canónica dist/${file}: ${expectedUrl}`);
      }
    }
  }
} catch (error) {
  fail(`No se pudieron validar robots.txt/sitemap.xml: ${error.message}`);
}

try {
  const sourceHtml = await readFile(join(root, 'index.html'), 'utf8');
  const artifactHtml = await readFile(join(dist, 'index.html'), 'utf8');
  const sourceValues = getGoogleVerificationValues(sourceHtml);
  const artifactValues = getGoogleVerificationValues(artifactHtml);
  if (sourceValues.length !== 1 || sourceValues.some((value) => !value)) {
    fail('index.html fuente debe conservar la etiqueta google-site-verification con contenido.');
  } else if (JSON.stringify(sourceValues) !== JSON.stringify(artifactValues)) {
    fail('dist/index.html no conserva la etiqueta google-site-verification del archivo fuente.');
  }
} catch (error) {
  fail(`No se pudo comprobar google-site-verification: ${error.message}`);
}

if (errors.length) {
  console.error('Validación de dist/ fallida:');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}
console.log(`Validación de dist/ correcta. Destino=${target}; BASE_URL=${baseUrl.href}; sitemap, metadatos, JSON-LD, verificación, manifiesto e iconos comprobados.`);
