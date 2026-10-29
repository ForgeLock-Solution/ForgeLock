// Comprueba que dist/ contiene una variante SEO coherente antes de publicarla.
import { readFile, readdir, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, resolve, relative, isAbsolute } from 'node:path';
import { fileURLToPath } from 'node:url';
import { JSDOM } from 'jsdom';
import { getDistDirectory, getSeoConfig, getPageUrl } from './seo-helpers.mjs';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const dist = getDistDirectory(root);
const errors = [];
let config;
try { config = getSeoConfig(); }
catch (error) {
  console.error(`Configuración SEO inválida: ${error.message}`);
  process.exit(1);
}
const { target, transition, baseUrl, canonicalBaseUrl, canonicalTarget, indexable } = config;
const expectedPages = ['index.html', 'servicios.html'];
const legalPages = ['aviso-legal.html', 'politica-privacidad.html', 'politica-cookies.html'];
const verificationToken = 'peYxRjV0Snt4fmiTcjCgkCfvDrTBws3qGUMy8vJVwjQ';
const requiredFiles = [
  ...expectedPages, ...legalPages, 'robots.txt', 'sitemap.xml', 'site.webmanifest',
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
  if (url.origin !== baseUrl.origin || !url.pathname.startsWith(baseUrl.pathname)) return;
  const local = decodeURIComponent(url.pathname.slice(new URL(baseUrl).pathname.length));
  const path = resolve(dist, local);
  if (isAbsolute(relative(dist, path)) || relative(dist, path).startsWith('..')) fail(`Activo fuera de dist/ en dist/${sourceFile}: ${urlValue}`);
  else if (!existsSync(path)) fail(`Activo SEO no encontrado en dist/${sourceFile}: ${urlValue}`);
}

if (!existsSync(dist)) {
  console.error('Validación fallida: no existe dist/. Ejecuta npm run build:dist.');
  process.exit(1);
}

const artifactFiles = await listFiles(dist);
for (const file of artifactFiles) {
  if (/(^|\/)\.env(?:\.|$)/i.test(file) || /(^|\/)supabase-config\.js$/i.test(file)) fail(`Archivo de configuración privada incluido en dist/: ${file}`);
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
  const canonical = [...html.matchAll(/<link\b(?=[^>]*\brel=["']canonical["'])[^>]*\bhref=["']([^"']+)["'][^>]*>/gi)];
  if (!indexable && !/<meta\s+name=["']robots["'][^>]*\bnoindex\b/i.test(html)) fail(`dist/${file} debe llevar noindex cuando INDEXABLE=false.`);
  if (expectedPages.includes(file)) {
    const expectedCanonical = getPageUrl(file, canonicalBaseUrl, canonicalTarget);
    if (canonical.length !== 1) fail(`dist/${file} debe tener exactamente un canonical; encontrados: ${canonical.length}.`);
    else if (canonical[0][1] !== expectedCanonical) fail(`Canonical incorrecto en dist/${file}: ${canonical[0][1]}; esperado ${expectedCanonical}.`);
    const expectedMeta = [
      ['property', 'og:url', expectedCanonical],
      ['property', 'og:image', `${baseUrl.href}resource/forgelock-social-preview.png`],
      ['name', 'twitter:image', `${baseUrl.href}resource/forgelock-social-preview.png`]
    ];
    for (const [attribute, value, expected] of expectedMeta) {
      const tags = metaValues(html, attribute, value);
      if (tags.length !== 1) fail(`dist/${file} debe tener exactamente un meta ${value}.`);
      else if (tags[0][0].match(/\bcontent=["']([^"']+)["']/i)?.[1] !== expected) fail(`El meta ${value} de dist/${file} no coincide con ${target}.`);
    }
    if (!html.includes(`content="${expectedCanonical}"`) || !html.includes(`content="${baseUrl.href}resource/forgelock-social-preview.png"`)) {
      fail(`Metadatos Open Graph/Twitter no coinciden con el destino ${target} en dist/${file}.`);
    }
    for (const attribute of ['property', 'name']) {
      for (const match of metaValues(html, attribute, attribute === 'property' ? 'og:image' : 'twitter:image')) {
        const content = match[0].match(/\bcontent=["']([^"']+)["']/i)?.[1];
        if (content) checkLocalAsset(content, file);
      }
    }
    checkLocalAsset(`${baseUrl.href}resource/Logo.png`, file);
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
      if (!JSON.stringify(json).includes(baseUrl.origin)) fail(`JSON-LD de dist/${file} no incluye la base SEO de ${target}.`);
    } catch (error) { fail(`JSON-LD inválido en dist/${file}: ${error.message}`); }
  }
  if (target === 'cloudflare' && html.includes('forgelock-solution.github.io')) fail(`Referencia de GitHub Pages residual en dist/${file}.`);
  if (target === 'github-pages' && !transition && html.includes('forgelock.forge-look19.workers.dev')) fail(`Referencia de Cloudflare residual en dist/${file}.`);

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
  const expectedSitemap = new URL('sitemap.xml', transition ? canonicalBaseUrl : baseUrl).href;
  const sitemapDirectives = [...robots.matchAll(/^Sitemap:\s*(\S+)\s*$/gim)];
  if (indexable && (sitemapDirectives.length !== 1 || sitemapDirectives[0][1] !== expectedSitemap)) fail(`robots.txt no apunta únicamente al sitemap esperado: ${expectedSitemap}`);
  if (!indexable && sitemapDirectives.length) fail('robots.txt no debe publicar un sitemap cuando INDEXABLE=false.');
  if (!/^User-agent:\s*\*\s*$/m.test(robots) || !/^Allow:\s*\/\s*$/m.test(robots)) fail('robots.txt debe permitir el rastreo general sin bloquear recursos.');

  const sitemap = await readFile(join(dist, 'sitemap.xml'), 'utf8');
  let xml;
  try { xml = new JSDOM(sitemap, { contentType: 'application/xml' }).window.document; }
  catch (error) { fail(`sitemap.xml no es XML válido: ${error.message}`); }
  const locations = xml ? [...xml.getElementsByTagNameNS('*', 'loc')].map((node) => node.textContent.trim()) : [];
  const expectedLocations = indexable && !transition ? [baseUrl.href, getPageUrl('servicios.html', baseUrl, target)] : [];
  if (locations.length !== expectedLocations.length || new Set(locations).size !== locations.length) fail(`sitemap.xml debe contener ${expectedLocations.length} URL únicas; encontradas: ${locations.length}.`);
  for (const location of locations) {
    try { if (new URL(location).href !== location || !location.startsWith(baseUrl.href)) fail(`URL de sitemap inválida o fuera del destino ${target}: ${location}`); }
    catch { fail(`URL no absoluta en sitemap.xml: ${location}`); }
  }
  if (locations.some((location, index) => location !== expectedLocations[index])) fail(`sitemap.xml no contiene las páginas indexables esperadas de ${target}.`);
  if (target === 'cloudflare' && (robots.includes('forgelock-solution.github.io') || sitemap.includes('forgelock-solution.github.io'))) fail('robots.txt/sitemap.xml mezclan dominios de GitHub Pages y Cloudflare.');
  if (target === 'github-pages' && !transition && (robots.includes('forgelock.forge-look19.workers.dev') || sitemap.includes('forgelock.forge-look19.workers.dev'))) fail('robots.txt/sitemap.xml mezclan dominios de GitHub Pages y Cloudflare.');
  if (transition && sitemap.includes('forgelock-solution.github.io')) fail('El sitemap de transición no debe recomendar URLs de Pages.');
} catch (error) { fail(`No se pudieron validar robots.txt/sitemap.xml: ${error.message}`); }

if (errors.length) {
  console.error('Validación de dist/ fallida:');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}
console.log(`Validación de dist/ correcta. Destino=${target}; BASE_URL=${baseUrl.href}; sitemap, metadatos, JSON-LD, verificación, manifiesto e iconos comprobados.`);
