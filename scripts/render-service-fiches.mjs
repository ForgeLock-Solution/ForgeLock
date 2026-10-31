// Genera las fichas estáticas declaradas en el catálogo público de servicios.
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SERVICE_CATALOG } from '../src/models/service-catalog.js';
import { renderServiceFiche } from '../src/views/service-fiche-view.js';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

export async function renderServiceFiches(output = root) {
    for (const service of SERVICE_CATALOG.filter((item) => item.fichePath)) {
        const path = join(output, service.fichePath);
        await mkdir(dirname(path), { recursive: true });
        await writeFile(path, renderServiceFiche(service), 'utf8');
    }
}

if (process.argv[1] && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))) {
    await renderServiceFiches(process.argv[2] ? resolve(process.argv[2]) : root);
}
