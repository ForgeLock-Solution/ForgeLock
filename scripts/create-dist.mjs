// Genera un paquete estático autocontenido, apto para GitHub Pages y Supabase Storage.
// Versión multiplataforma (Node.js) del antiguo create-dist.ps1.
import { existsSync } from 'node:fs';
import { cp, mkdir, rm } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const output = join(root, 'dist');

if (existsSync(output)) {
    await rm(output, { recursive: true, force: true });
}
await mkdir(output, { recursive: true });

await cp(join(root, 'index.html'), join(output, 'index.html'));
await cp(join(root, 'robots.txt'), join(output, 'robots.txt'));
await cp(join(root, 'sitemap.xml'), join(output, 'sitemap.xml'));
await cp(join(root, '404.html'), join(output, '404.html'));
await cp(join(root, 'aviso-legal.html'), join(output, 'aviso-legal.html'));
await cp(join(root, 'politica-privacidad.html'), join(output, 'politica-privacidad.html'));
await cp(join(root, 'politica-cookies.html'), join(output, 'politica-cookies.html'));
await cp(join(root, 'resource'), join(output, 'resource'), { recursive: true });

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
for (const file of ['app.css', 'tailwind.css']) {
    await cp(join(sourceRoot, 'styles', file), join(outputStyles, file));
}

console.log('dist/ generado correctamente.');
