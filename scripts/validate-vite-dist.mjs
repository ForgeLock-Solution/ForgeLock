import { existsSync } from 'node:fs';
import { readFile, readdir, stat } from 'node:fs/promises';
import { isAbsolute, relative, resolve } from 'node:path';
import { getCanonicalUrls, getSeoConfig, getPageUrl, isNoindex, parseXmlDocument, SITEMAP_NAMESPACE } from './seo-helpers.mjs';

const root = resolve(import.meta.dirname, '..');
const { target, baseUrl, canonicalBaseUrl, indexable } = getSeoConfig();
const output = resolve(root, process.env.DIST_DIR || (target === 'cloudflare' ? 'dist-cloudflare' : 'dist'));
const errors = [];
const fail = (message) => errors.push(message);

async function htmlFilesIn(directory, prefix = '') {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const name = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.isDirectory()) files.push(...await htmlFilesIn(resolve(directory, entry.name), name));
    else if (entry.isFile() && entry.name.endsWith('.html')) files.push(name);
  }
  return files.sort();
}

function metaContent(html, kind, name) {
  const tags = [...html.matchAll(/<meta\b[^>]*>/gi)].map(([tag]) => tag)
    .filter((tag) => new RegExp(`\\b${kind}=["']${name}["']`, 'i').test(tag));
  return tags.length === 1 ? tags[0].match(/\bcontent=["']([^"']*)["']/i)?.[1] : null;
}

function localAssetExists(value, htmlFile) {
  let url;
  try { url = new URL(value, new URL(htmlFile, baseUrl)); }
  catch { fail(`URL local inválida en ${htmlFile}: ${value}`); return; }
  const assetBase = [baseUrl, canonicalBaseUrl].find((base) => url.origin === base.origin && url.pathname.startsWith(base.pathname));
  if (!assetBase) return;
  let path;
  try { path = resolve(output, decodeURIComponent(url.pathname.slice(assetBase.pathname.length))); }
  catch { fail(`Ruta local inválida en ${htmlFile}: ${value}`); return; }
  if (isAbsolute(relative(output, path)) || relative(output, path).startsWith('..')) fail(`Ruta fuera del build en ${htmlFile}: ${value}`);
  else if (!existsSync(path)) fail(`Recurso local no encontrado en ${htmlFile}: ${value}`);
}

if (!existsSync(output)) throw new Error(`No existe ${output}.`);
const files = await htmlFilesIn(output);
for (const file of ['index.html', 'servicios.html', 'aviso-legal.html', 'politica-privacidad.html', 'politica-cookies.html']) {
  if (!files.includes(file)) fail(`Falta ${file} en ${output}.`);
}

const canonicalByUrl = new Map();
for (const file of files) {
  const html = await readFile(resolve(output, file), 'utf8');
  const title = [...html.matchAll(/<title>([^<]+)<\/title>/gi)];
  const description = metaContent(html, 'name', 'description');
  const ogUrl = metaContent(html, 'property', 'og:url');
  const expectedCanonical = getPageUrl(file, canonicalBaseUrl, 'github-pages');
  const canonicals = getCanonicalUrls(html);
  if (title.length !== 1 || !title[0][1].trim()) fail(`${file} debe tener un title propio.`);
  if (!description?.trim()) fail(`${file} debe tener una meta description.`);
  if (canonicals.length !== 1 || canonicals[0] !== expectedCanonical) fail(`Canonical incorrecta en ${file}; esperada ${expectedCanonical}.`);
  if (ogUrl !== expectedCanonical) fail(`og:url incorrecta en ${file}; esperada ${expectedCanonical}.`);
  if (metaContent(html, 'property', 'og:image') !== `${canonicalBaseUrl.href}resource/forgelock-social-preview.png`) fail(`og:image debe ser absoluta y usar el recurso social aprobado en ${file}.`);
  for (const attribute of ['og:image', 'twitter:image']) {
    const image = metaContent(html, attribute === 'og:image' ? 'property' : 'name', attribute);
    if (image) localAssetExists(image, file);
  }
  if (!indexable && !isNoindex(html)) fail(`${file} debe ser noindex en Cloudflare.`);
  for (const match of html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      const jsonLd = JSON.parse(match[1]);
      if (!JSON.stringify(jsonLd).includes(canonicalBaseUrl.href)) fail(`JSON-LD de ${file} debe derivar la URL de SITE_URL.`);
    } catch (error) {
      fail(`JSON-LD inválido en ${file}: ${error.message}`);
    }
  }
  for (const match of html.matchAll(/\b(?:href|src)=["']([^"']+)["']/gi)) {
    const value = match[1].trim();
    if (value.startsWith('#') || value.startsWith('mailto:') || value.startsWith('tel:') || value.startsWith('javascript:')) continue;
    localAssetExists(value, file);
  }
  if (indexable && !isNoindex(html)) canonicalByUrl.set(expectedCanonical, file);
}

try {
  const manifest = JSON.parse(await readFile(resolve(output, 'site.webmanifest'), 'utf8'));
  if (manifest.start_url !== './' || manifest.scope !== './') fail('El manifiesto debe conservar start_url y scope relativos.');
  for (const icon of manifest.icons || []) localAssetExists(icon.src, 'index.html');
} catch (error) {
  fail(`site.webmanifest o sus iconos no son válidos: ${error.message}`);
}

const robots = await readFile(resolve(output, 'robots.txt'), 'utf8');
const sitemapPath = resolve(output, 'sitemap.xml');
if (!existsSync(sitemapPath)) fail('Falta sitemap.xml.');
const sitemapText = await readFile(sitemapPath, 'utf8');
const sitemapDirectives = robots.split(/\r?\n/).map((line) => line.trim()).filter((line) => /^Sitemap:/i.test(line));
if (indexable) {
  const expected = new URL('sitemap.xml', canonicalBaseUrl).href;
  if (sitemapDirectives.length !== 1 || sitemapDirectives[0] !== `Sitemap: ${expected}`) fail(`robots.txt debe apuntar una vez a ${expected}.`);
} else if (sitemapDirectives.length) fail('robots.txt de Cloudflare no debe anunciar un sitemap indexable.');

try {
  const xml = parseXmlDocument(sitemapText);
  const urlset = xml.documentElement;
  if (urlset.localName !== 'urlset' || urlset.namespaceURI !== SITEMAP_NAMESPACE) fail('sitemap.xml no usa el urlset oficial.');
  const sitemapUrls = new Set();
  for (const item of [...urlset.children]) {
    const loc = [...item.children].find((child) => child.localName === 'loc')?.textContent?.trim();
    if (!loc) { fail('Cada URL del sitemap debe tener loc.'); continue; }
    if (sitemapUrls.has(loc)) fail(`URL duplicada en sitemap: ${loc}`);
    sitemapUrls.add(loc);
    const file = canonicalByUrl.get(loc);
    if (!file) { fail(`URL de sitemap sin página 200 indexable: ${loc}`); continue; }
    const path = resolve(output, file);
    if (!existsSync(path) || !(await stat(path)).isFile()) fail(`La ruta del sitemap no responde 200 en el artefacto: ${loc}`);
  }
  if (indexable && sitemapUrls.size !== canonicalByUrl.size) fail('El sitemap no incluye exactamente las páginas indexables que existen en el build.');
  if (!indexable && sitemapUrls.size) fail('El sitemap de Cloudflare debe estar vacío.');
} catch (error) {
  fail(`sitemap.xml inválido: ${error.message}`);
}

if (target === 'cloudflare') {
  const headers = await readFile(resolve(output, '_headers'), 'utf8');
  if (!/^https:\/\/forgelock\.forge-look19\.workers\.dev\/\*\s*\r?\n\s*X-Robots-Tag:\s*noindex,\s*follow\s*$/im.test(headers)) {
    fail('El artefacto Cloudflare debe incluir _headers con X-Robots-Tag: noindex, follow para todas las rutas.');
  }
}

if (errors.length) {
  console.error(`Validación de ${output} fallida:`);
  errors.forEach((error) => console.error(`- ${error}`));
  process.exitCode = 1;
} else {
  console.log(`Validación SEO Vite correcta: ${files.length} HTML; ${canonicalByUrl.size} páginas en sitemap; destino=${target}.`);
}
