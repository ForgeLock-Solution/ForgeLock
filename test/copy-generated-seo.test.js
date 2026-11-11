import assert from 'node:assert/strict';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { copyGeneratedSeoToRoot } from '../scripts/copy-generated-seo.mjs';

test('la copia selectiva conserva robots y sitemap de Pages al generar Cloudflare', async () => {
  const root = await mkdtemp(join(tmpdir(), 'forgelock-seo-copy-'));
  const cloudflareOutput = join(root, 'dist-cloudflare');
  const pagesOutput = join(root, 'dist');
  const source = join(root, 'source');
  try {
    await mkdir(cloudflareOutput);
    await mkdir(pagesOutput);
    await mkdir(source);
    await writeFile(join(cloudflareOutput, 'robots.txt'), 'cloudflare robots');
    await writeFile(join(cloudflareOutput, 'sitemap.xml'), 'cloudflare sitemap');
    await writeFile(join(pagesOutput, 'robots.txt'), 'pages robots artifact');
    await writeFile(join(pagesOutput, 'sitemap.xml'), 'pages sitemap artifact');
    await writeFile(join(source, 'robots.txt'), 'pages robots');
    await writeFile(join(source, 'sitemap.xml'), 'pages sitemap');

    assert.equal(await copyGeneratedSeoToRoot({ target: 'cloudflare', output: cloudflareOutput, root: source }), false);
    assert.equal(await readFile(join(source, 'robots.txt'), 'utf8'), 'pages robots');
    assert.equal(await readFile(join(source, 'sitemap.xml'), 'utf8'), 'pages sitemap');

    assert.equal(await copyGeneratedSeoToRoot({ target: 'github-pages', output: pagesOutput, root: source }), true);
    assert.equal(await readFile(join(source, 'robots.txt'), 'utf8'), 'pages robots artifact');
    assert.equal(await readFile(join(source, 'sitemap.xml'), 'utf8'), 'pages sitemap artifact');
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
