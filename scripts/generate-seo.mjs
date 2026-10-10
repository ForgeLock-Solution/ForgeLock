// Genera robots.txt y sitemap.xml para el sitio estático de ForgeLock.
import { existsSync } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const baseUrl = (process.env.BASE_URL || 'https://forgelock-solution.github.io/ForgeLock/').replace(/\/+$/, '') + '/';
const candidates = ['index.html', 'servicios.html'];

function lastModified(file) {
  try {
    return execFileSync('git', ['log', '-1', '--format=%cs', '--', file], {
      cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore']
    }).trim();
  } catch {
    return '';
  }
}

const urls = [];
for (const file of candidates) {
  const path = join(root, file);
  if (!existsSync(path)) continue;
  const html = await readFile(path, 'utf8');
  if (/<meta\s+name=["']robots["']\s+content=["'][^"']*noindex/i.test(html)) continue;
  const loc = file === 'index.html' ? baseUrl : new URL(file, baseUrl).href;
  const date = lastModified(file);
  urls.push(`  <url>\n    <loc>${loc}</loc>${date ? `\n    <lastmod>${date}</lastmod>` : ''}\n  </url>`);
}
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`;
const robots = `User-agent: *\nAllow: /\n\nSitemap: ${new URL('sitemap.xml', baseUrl).href}\n`;
await writeFile(join(root, 'sitemap.xml'), sitemap);
await writeFile(join(root, 'robots.txt'), robots);
const dist = join(root, 'dist');
if (existsSync(dist)) {
  await writeFile(join(dist, 'sitemap.xml'), sitemap);
  await writeFile(join(dist, 'robots.txt'), robots);
}
console.log(`SEO generado: ${urls.length} URLs indexables; BASE_URL=${baseUrl}`);
