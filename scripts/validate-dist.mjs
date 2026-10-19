// Comprueba el artefacto estático antes de usarlo en una vista previa o despliegue.
import { readFile, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, resolve, relative, isAbsolute } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const dist = join(root, 'dist');
const baseUrl = new URL(
  (process.env.BASE_URL || 'https://forgelock-solution.github.io/ForgeLock/').replace(/\/?$/, '/')
);
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
  if (!robots.includes(`Sitemap: ${expectedSitemap}`)) {
    fail(`robots.txt no apunta al sitemap esperado: ${expectedSitemap}`);
  }

  const sitemap = await readFile(join(dist, 'sitemap.xml'), 'utf8');
  if (!sitemap.includes('<urlset') || !sitemap.includes('</urlset>')) {
    fail('sitemap.xml no contiene una estructura urlset válida.');
  }
  for (const match of sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)) {
    if (!match[1].startsWith(baseUrl.href)) {
      fail(`URL de sitemap fuera de BASE_URL (${baseUrl.href}): ${match[1]}`);
    }
  }
} catch (error) {
  fail(`No se pudieron validar robots.txt/sitemap.xml: ${error.message}`);
}

if (errors.length) {
  console.error('Validación de dist/ fallida:');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Validación de dist/ correcta. BASE_URL=${baseUrl.href}; manifiesto e iconos comprobados.`);
