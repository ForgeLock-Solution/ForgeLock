import { copyFile } from 'node:fs/promises';
import { resolve } from 'node:path';

// Mantiene los archivos raíz alineados con el build público de GitHub Pages.
// Un destino secundario no debe reemplazar esas fuentes SEO del repositorio.
export async function copyGeneratedSeoToRoot({ target, output, root }) {
  if (target !== 'github-pages') return false;

  await Promise.all(['robots.txt', 'sitemap.xml'].map((file) =>
    copyFile(resolve(output, file), resolve(root, file))
  ));
  return true;
}
