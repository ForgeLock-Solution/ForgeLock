// Comprueba el artefacto estático antes de usarlo en una vista previa o despliegue.
import { readFile, readdir, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, resolve, relative, isAbsolute } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  DEFAULT_BASE_URL,
  comparePublicHtmlFiles,
  discoverPublicHtmlFiles,
  getSitemapRobotsBlockers,
  SITEMAP_NAMESPACE,
  getCanonicalUrls,
  getGoogleVerificationValues,
  isNoindex,
  isValidLastmod,
  normalizeBaseUrl,
  parseXmlDocument,
  validateSitemapUrlChildren
} from './seo-helpers.mjs';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const dist = join(root, 'dist');
const baseUrl = normalizeBaseUrl(process.env.BASE_URL || DEFAULT_BASE_URL);
const indexable = process.env.INDEXABLE !== 'false';
const errors = [];
const requiredFiles = [
  'index.html',
  'servicios.html',
  'robots.txt',
  'sitemap.xml',
  'site.webmanifest',
  '_headers',
  '_redirects',
  'favicon.ico',
  'Apple-touch-icon.png',
  'Icon-192.png'
];

function fail(message) {
  errors.push(message);
}

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
  if (buffer.length < 24 || !buffer.subarray(0, 8).equals(signature)) {
    throw new Error('no es un PNG válido');
  }
  return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
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
const pageInventory = comparePublicHtmlFiles(sourceHtmlFiles, distHtmlFiles);
for (const file of pageInventory.missing) fail(`Página pública del origen ausente en dist/: ${file}`);
for (const file of pageInventory.unexpected) fail(`Página HTML en dist/ sin página pública correspondiente en origen: ${file}`);
for (const file of artifactFiles) {
  if (/(^|\/)\.env(?:\.|$)/i.test(file) || /(^|\/)supabase-config\.js$/i.test(file)) {
    fail(`Archivo de configuración privada incluido en dist/: ${file}`);
  }
}

// Comprueba enlaces a archivos locales escritos en HTML. Se ignoran anclas,
// esquemas y hosts externos; las rutas absolutas se resuelven desde la raíz
// del hosting para cubrir tanto Pages como la subruta de GitHub Pages.
for (const file of artifactFiles.filter((entry) => entry.endsWith('.html'))) {
  const html = await readFile(join(dist, file), 'utf8');
  for (const match of html.matchAll(/\b(?:href|src)\s*=\s*["']([^"']+)["']/gi)) {
    const value = match[1].trim();
    if (!value || value.startsWith('#') || value.startsWith('//') || /^[a-z][a-z\d+.-]*:/i.test(value)) continue;
    let pathname;
    try {
      pathname = decodeURIComponent(new URL(value, `https://dist.invalid/${file}`).pathname);
    } catch {
      fail(`URL local no válida en dist/${file}: ${value}`);
      continue;
    }
    const localPath = resolve(dist, `.${pathname}`);
    if (isAbsolute(relative(dist, localPath)) || relative(dist, localPath).startsWith('..')) {
      fail(`Ruta local fuera de dist/ en dist/${file}: ${value}`);
    } else if (!existsSync(localPath)) {
      fail(`Recurso local no encontrado en dist/${file}: ${value}`);
    }
  }
}

for (const file of requiredFiles) {
  const path = join(dist, file);
  if (!existsSync(path)) {
    fail(`Falta dist/${file}`);
    continue;
  }
  const info = await stat(path);
  if (!info.isFile() || info.size === 0) fail(`dist/${file} está vacío o no es un archivo`);
}

let manifest;
try {
  manifest = JSON.parse(await readFile(join(dist, 'site.webmanifest'), 'utf8'));
} catch (error) {
  fail(`No se pudo leer site.webmanifest: ${error.message}`);
}

if (manifest) {
  if (manifest.name !== 'ForgeLock') fail('El nombre del manifiesto debe ser exactamente ForgeLock.');
  if (manifest.start_url !== './' || manifest.scope !== './') {
    fail('start_url y scope deben permanecer relativos para funcionar bajo /ForgeLock/ en GitHub Pages.');
  }
  for (const expected of [
    { src: './Icon-192.png', width: 192, height: 192 },
    { src: './Apple-touch-icon.png', width: 180, height: 180 }
  ]) {
    const icon = manifest.icons?.find((entry) => entry.src === expected.src);
    if (!icon) {
      fail(`El manifiesto no declara el icono ${expected.src}`);
      continue;
    }
    if (icon.sizes !== `${expected.width}x${expected.height}`) {
      fail(`${expected.src}: sizes del manifiesto debe ser ${expected.width}x${expected.height}`);
    }
    const iconPath = resolve(dist, icon.src.replace(/^\.\//, ''));
    if (isAbsolute(relative(dist, iconPath)) || relative(dist, iconPath).startsWith('..')) {
      fail(`Ruta de icono fuera de dist/: ${icon.src}`);
      continue;
    }
    try {
      const dimensions = await pngDimensions(iconPath);
      if (dimensions.width !== expected.width || dimensions.height !== expected.height) {
        fail(`${icon.src}: dimensiones reales ${dimensions.width}x${dimensions.height}; esperadas ${expected.width}x${expected.height}`);
      }
    } catch (error) {
      fail(`${icon.src}: ${error.message}`);
    }
  }
}

try {
  const robots = await readFile(join(dist, 'robots.txt'), 'utf8');
  const expectedSitemap = new URL('sitemap.xml', baseUrl).href;
  const sitemapDirectives = robots.split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => /^Sitemap:/i.test(line));
  if (indexable && (sitemapDirectives.length !== 1 || sitemapDirectives[0] !== `Sitemap: ${expectedSitemap}`)) {
    fail(`robots.txt debe contener una única directiva Sitemap: ${expectedSitemap}`);
  }
  if (!indexable && sitemapDirectives.length) fail('robots.txt no debe publicar un sitemap cuando INDEXABLE=false.');
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
      const route = file === 'index.html' ? '' : file;
      const expectedUrl = new URL(route, baseUrl).href;
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
  if (!sourceValues.length || sourceValues.some((value) => !value)) {
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

console.log(`Validación de dist/ correcta. BASE_URL=${baseUrl.href}; manifiesto e iconos comprobados.`);
