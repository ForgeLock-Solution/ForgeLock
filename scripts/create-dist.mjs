// Genera un paquete estático autocontenido, apto para GitHub Pages y Supabase Storage.
// Versión multiplataforma (Node.js) del antiguo create-dist.ps1.
import { existsSync } from 'node:fs';
import { cp, mkdir, readdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { getDistDirectory, discoverPublicHtmlFiles } from './seo-helpers.mjs';
import { renderHome } from './render-home.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const output = getDistDirectory(root);
// Every root-level HTML file is a public page. Nested HTML in public content
// directories is rejected by the shared discovery rule; tooling directories
// (scripts, src, test) are explicitly not routes.
const publicHtmlFiles = await discoverPublicHtmlFiles(root);

if (existsSync(output)) {
    const existingEntries = await readdir(output);
    if (existingEntries.length > 0) {
        throw new Error(`No se reemplaza una distribución existente: ${output}. Usa un directorio temporal vacío o conserva/mueve primero los artefactos existentes.`);
    }
}
await mkdir(output, { recursive: true });

for (const file of publicHtmlFiles) {
    const destination = join(output, file);
    await mkdir(dirname(destination), { recursive: true });
    await cp(join(root, file), destination);
}
await cp(join(root, 'robots.txt'), join(output, 'robots.txt'));
await cp(join(root, 'sitemap.xml'), join(output, 'sitemap.xml'));
await cp(join(root, '404.html'), join(output, '404.html'));

// Configuración de activos estáticos de Cloudflare y manifiesto: van en la raíz de dist.
for (const file of ['site.webmanifest', '_headers', '_redirects']) {
    if (existsSync(join(root, file))) await cp(join(root, file), join(output, file));
}

// Los iconos ubicados en la raíz deben acompañar al artefacto publicado.
for (const file of ['favicon.ico', 'Apple-touch-icon.png', 'Icon-192.png']) {
    if (existsSync(join(root, file))) await cp(join(root, file), join(output, file));
}
await cp(join(root, 'resource'), join(output, 'resource'), { recursive: true });
// Conceptual previews are served as standalone noindex assets, outside the sitemap.
if (existsSync(join(root, 'ejemplos'))) await cp(join(root, 'ejemplos'), join(output, 'ejemplos'), { recursive: true });

// Copia solo los módulos y recursos que utiliza el navegador; no se filtran
// herramientas de desarrollo ni el archivo fuente de compilación de Tailwind.
const sourceRoot = join(root, 'src');
const outputSource = join(output, 'src');
await mkdir(outputSource, { recursive: true });

for (const folder of ['controllers', 'models', 'services', 'views', 'vendor']) {
    await cp(join(sourceRoot, folder), join(outputSource, folder), { recursive: true });
}

const outputStyles = join(outputSource, 'styles');
await mkdir(outputStyles, { recursive: true });
for (const file of ['app.css', 'tailwind.css', 'legal.css']) {
    await cp(join(sourceRoot, 'styles', file), join(outputStyles, file));
}

await renderHome(join(output, 'index.html'));

console.log('dist/ generado correctamente.');
