// Copia las dependencias visuales al proyecto para que el navegador no consulte CDN.
// Versión multiplataforma (Node.js) del antiguo copy-local-assets.ps1, para poder
// compilar en Linux/macOS y en GitHub Actions, no solo en Windows.
import { existsSync } from 'node:fs';
import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const destination = join(root, 'src', 'vendor');

async function copyFontAwesome() {
    const faDestination = join(destination, 'fontawesome');
    if (existsSync(faDestination)) {
        await rm(faDestination, { recursive: true, force: true });
    }
    await mkdir(join(faDestination, 'css'), { recursive: true });

    const faSource = join(root, 'node_modules', '@fortawesome', 'fontawesome-free');
    await cp(join(faSource, 'css'), join(faDestination, 'css'), { recursive: true });
    await cp(join(faSource, 'webfonts'), join(faDestination, 'webfonts'), { recursive: true });
}

async function copyInter() {
    const interDestination = join(destination, 'inter');
    await mkdir(join(interDestination, 'files'), { recursive: true });

    const interSource = join(root, 'node_modules', '@fontsource', 'inter');
    const regular = await readFile(join(interSource, 'latin-400.css'), 'utf8');
    const bold = await readFile(join(interSource, 'latin-700.css'), 'utf8');
    await writeFile(join(interDestination, 'inter.css'), `${regular}\n${bold}`, 'utf8');

    await cp(
        join(interSource, 'files', 'inter-latin-400-normal.woff2'),
        join(interDestination, 'files', 'inter-latin-400-normal.woff2')
    );
    await cp(
        join(interSource, 'files', 'inter-latin-700-normal.woff2'),
        join(interDestination, 'files', 'inter-latin-700-normal.woff2')
    );
    for (const weight of [400, 700]) {
        const file = `inter-latin-${weight}-normal.woff`;
        await cp(join(interSource, 'files', file), join(interDestination, 'files', file));
    }
}

await mkdir(destination, { recursive: true });
await copyFontAwesome();
await copyInter();
console.log('Assets locales (Font Awesome, Inter) copiados a src/vendor.');
