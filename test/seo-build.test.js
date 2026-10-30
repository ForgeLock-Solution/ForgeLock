import assert from 'node:assert/strict';
import test, { after } from 'node:test';
import { createHash } from 'node:crypto';
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdir, mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { JSDOM } from 'jsdom';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { existsSync } from 'node:fs';

const root = new URL('../', import.meta.url);
const bases = {
  'github-pages': 'https://forgelock-solution.github.io/ForgeLock/',
  cloudflare: 'https://forgelock.forge-look19.workers.dev/'
};
const buildRoot = await mkdtemp(join(tmpdir(), 'forgelock-seo-build-'));
const distDirs = {
  'github-pages': join(buildRoot, 'pages'),
  cloudflare: join(buildRoot, 'cloudflare'),
  'not-indexable-pages': join(buildRoot, 'not-indexable-pages'),
  'not-indexable-cloudflare': join(buildRoot, 'not-indexable-cloudflare')
};
const projectRoot = fileURLToPath(root);
async function snapshotTrackedFiles() {
  const files = execFileSync('git', ['ls-files', '-z'], { cwd: projectRoot, encoding: 'utf8' }).split('\0').filter(Boolean);
  return Promise.all(files.map(async (file) => [
    file,
    createHash('sha256').update(await readFile(join(projectRoot, ...file.split('/')))).digest('hex')
  ]));
}
const sourceSnapshots = await snapshotTrackedFiles();
const preservedDistPaths = ['dist', 'dist-cloudflare'].flatMap((directory) =>
  ['index.html', 'robots.txt', 'sitemap.xml'].map((file) => join(fileURLToPath(new URL(`../${directory}/`, import.meta.url)), file))
);
const distSnapshots = await Promise.all(preservedDistPaths.map(async (path) => existsSync(path) ? readFile(path) : null));
after(async () => rm(buildRoot, { recursive: true, force: true }));

async function listHtmlFiles(directory, prefix = '') {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const relativePath = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.isDirectory()) files.push(...await listHtmlFiles(join(directory, entry.name), relativePath));
    else if (entry.name.endsWith('.html')) files.push(relativePath);
  }
  return files;
}

function run(command, args, env = {}) {
  const npmInvocation = command === 'npm' && process.env.npm_execpath;
  const result = spawnSync(npmInvocation ? process.execPath : command, npmInvocation ? [process.env.npm_execpath, ...args] : args, {
    cwd: fileURLToPath(root),
    encoding: 'utf8',
    shell: !npmInvocation && command === 'npm' && process.platform === 'win32',
    env: { ...process.env, ...env }
  });
  assert.equal(result.status, 0, `${command} ${args.join(' ')} falló:\n${result.stdout}\n${result.stderr}`);
  return result.stdout;
}

async function checkVariant(target) {
  const base = bases[target];
  const canonicalBase = bases[target];
  for (const file of ['index.html', 'servicios.html']) {
    const html = await readFile(join(distDirs[target], file), 'utf8');
    const dom = new JSDOM(html);
    const document = dom.window.document;
    const pageRoute = file === 'index.html' ? './' : target === 'cloudflare' ? file.replace(/\.html$/, '') : file;
    const pageUrl = new URL(pageRoute, canonicalBase).href;
    assert.equal(document.querySelectorAll('link[rel="canonical"]').length, 1);
    assert.equal(document.querySelector('link[rel="canonical"]').href, pageUrl);
    assert.equal(document.querySelector('meta[property="og:url"]').content, pageUrl);
    assert.equal(document.querySelector('meta[property="og:image"]').content, `${canonicalBase}resource/forgelock-social-preview.png`);
    assert.equal(document.querySelector('meta[name="twitter:image"]').content, `${canonicalBase}resource/forgelock-social-preview.png`);
    const jsonLd = [...document.querySelectorAll('script[type="application/ld+json"]')].map((node) => JSON.parse(node.textContent));
    assert.ok(jsonLd.length > 0);
    assert.ok(JSON.stringify(jsonLd).includes(canonicalBase));
    const otherBase = target === 'cloudflare' ? bases['github-pages'] : bases.cloudflare;
    assert.equal(html.includes(otherBase), false);
    assert.doesNotMatch(html, /<meta\s+name=["']robots["'][^>]*\bnoindex\b/i);
  }

  const robots = await readFile(join(distDirs[target], 'robots.txt'), 'utf8');
  assert.ok(robots.includes(`Sitemap: ${canonicalBase}sitemap.xml`));
  const sitemap = new JSDOM(await readFile(join(distDirs[target], 'sitemap.xml'), 'utf8'), { contentType: 'application/xml' }).window.document;
  const urls = [...sitemap.getElementsByTagNameNS('*', 'loc')].map((node) => node.textContent.trim());
  assert.deepEqual(urls, [canonicalBase, `${canonicalBase}${target === 'cloudflare' ? 'servicios' : 'servicios.html'}`]);
  assert.equal(new Set(urls).size, urls.length);
  assert.ok(urls.every((url) => url.startsWith(base)));

  for (const file of ['aviso-legal.html', 'politica-privacidad.html', 'politica-cookies.html']) {
    const html = await readFile(join(distDirs[target], file), 'utf8');
    assert.match(html, /<meta\s+name=["']robots["']\s+content=["'][^"']*noindex/i);
    const legalCanonical = `${canonicalBase}${target === 'cloudflare' ? file.replace(/\.html$/, '') : file}`;
    assert.equal(new JSDOM(html).window.document.querySelector('link[rel="canonical"]').href, legalCanonical);
  }
  const allHtml = await Promise.all(['index.html', 'servicios.html', ...['aviso-legal.html', 'politica-privacidad.html', 'politica-cookies.html']].map((file) => readFile(join(distDirs[target], file), 'utf8')));
  const verificationTags = allHtml.join('\n').match(/<meta\s+name=["']google-site-verification["'][^>]*>/gi) ?? [];
  assert.equal(verificationTags.length, 1);
  assert.match(verificationTags[0], /content=["']ChwXmsaiRN157JtTwqIuE19hC7GzP7kRmgQkiiQTK5A["']/);
}

test('builds SEO variants independently for GitHub Pages and Cloudflare Worker', async () => {
  run('npm', ['run', 'build:dist'], { DIST_DIR: distDirs['github-pages'] });
  await checkVariant('github-pages');
  run('npm', ['run', 'build:dist:cloudflare'], { DIST_DIR: distDirs.cloudflare });
  run('npm', ['run', 'validate:dist:cloudflare'], { DIST_DIR: distDirs.cloudflare });
  await checkVariant('cloudflare');

  for (const target of ['github-pages', 'cloudflare']) {
    const css = await readFile(join(distDirs[target], 'src/styles/tailwind.css'), 'utf8');
    assert.ok(css.includes('.sm\\:h-\\[440px\\]'), 'el CSS debe incluir la altura de imagen usada solo en servicios');
    assert.ok(css.includes('.text-brand-700'), 'los textos de marca deben tener su color definido');
    const home = new JSDOM(await readFile(join(distDirs[target], 'index.html'), 'utf8')).window.document;
    assert.equal(home.querySelectorAll('#header-container nav a').length, 5);
    assert.equal(home.querySelectorAll('#services-container article').length, 3);
    assert.ok(home.querySelector('#idea-textarea'));
    assert.equal(home.querySelectorAll('h1').length, 1);
    const errorPage = new JSDOM(await readFile(join(distDirs[target], '404.html'), 'utf8'), {
      url: `https://example.test/${target === 'github-pages' ? 'ForgeLock/' : ''}carpeta/ausente`
    }).window.document;
    assert.equal(errorPage.querySelector('base').getAttribute('href'), new URL(bases[target]).pathname);
    assert.equal(new URL(errorPage.querySelector('a').href).pathname, new URL(bases[target]).pathname);
  }

  const wrongTarget = spawnSync(process.execPath, ['./scripts/validate-dist.mjs'], {
    cwd: fileURLToPath(root),
    encoding: 'utf8',
    env: { ...process.env, SEO_TARGET: 'cloudflare', DIST_DIR: distDirs['github-pages'] }
  });
  assert.notEqual(wrongTarget.status, 0);
  assert.match(`${wrongTarget.stdout}\n${wrongTarget.stderr}`, /Canonical incorrecto|destino distinto/);

  const distAfterBuild = await Promise.all(preservedDistPaths.map(async (path) => existsSync(path) ? readFile(path) : null));
  assert.deepEqual(distAfterBuild, distSnapshots, 'los builds SEO de prueba no deben reemplazar un dist/ preexistente');
  const workerView = await readFile(join(distDirs.cloudflare, 'src/views/app-view.js'), 'utf8');
  assert.match(workerView, /href="\.\/servicios"/);
  assert.doesNotMatch(workerView, /href="\.\/servicios\.html"/);
  const workerService = await readFile(join(distDirs.cloudflare, 'servicios.html'), 'utf8');
  assert.match(workerService, /href="\.\/#servicios"/);
  assert.doesNotMatch(workerService, /href="\.\/index\.html/);

  // Reject regressions in a complete preview artifact, then restore it.
  const workerHomePath = join(distDirs.cloudflare, 'index.html');
  const workerHome = await readFile(workerHomePath, 'utf8');
  const mutations = [
    [workerHome.replace(`href="${bases.cloudflare}"`, 'href="https://example.test/"'), /Canonical incorrecto/],
    [workerHome.replace(`${bases.cloudflare}resource/forgelock-social-preview.png`, 'https://example.test/preview.png'), /og:image/],
    [workerHome.replaceAll(bases.cloudflare, 'https://example.test/'), /Canonical incorrecto/]
  ];
  try {
    for (const [mutated, message] of mutations) {
      assert.notEqual(mutated, workerHome, 'la regresión de prueba debe modificar el artefacto');
      await writeFile(workerHomePath, mutated);
      const rejected = spawnSync(process.execPath, ['./scripts/validate-dist-cloudflare.mjs'], {
        cwd: projectRoot,
        encoding: 'utf8',
        env: { ...process.env, DIST_DIR: distDirs.cloudflare }
      });
      assert.notEqual(rejected.status, 0);
      assert.match(`${rejected.stdout}\n${rejected.stderr}`, message);
    }
  } finally {
    await writeFile(workerHomePath, workerHome);
  }

  for (const [target, output] of [['github-pages', distDirs['not-indexable-pages']], ['cloudflare', distDirs['not-indexable-cloudflare']]]) {
    run('npm', [target === 'cloudflare' ? 'run' : 'run', target === 'cloudflare' ? 'build:dist:cloudflare' : 'build:dist'], {
      SEO_TARGET: target,
      INDEXABLE: 'false',
      DIST_DIR: output
    });
    run('npm', ['run', target === 'cloudflare' ? 'validate:dist:cloudflare' : 'validate:dist'], {
      SEO_TARGET: target,
      INDEXABLE: 'false',
      DIST_DIR: output
    });
    for (const file of await listHtmlFiles(output)) assert.match(await readFile(join(output, file), 'utf8'), /<meta\s+name=["']robots["'][^>]*\bnoindex\b/i, `${target}/${file} debe ser noindex`);
    const noindexSitemap = new JSDOM(await readFile(join(output, 'sitemap.xml'), 'utf8'), { contentType: 'application/xml' }).window.document;
    assert.equal(noindexSitemap.getElementsByTagNameNS('*', 'loc').length, 0);
    assert.doesNotMatch(await readFile(join(output, 'robots.txt'), 'utf8'), /^Sitemap:/im);
  }

  const existingOutput = join(buildRoot, 'existing-output');
  await mkdir(existingOutput);
  await writeFile(join(existingOutput, 'preserve.txt'), 'keep this artifact');
  const protectedBuild = spawnSync(process.execPath, ['./scripts/create-dist.mjs'], {
    cwd: fileURLToPath(root),
    encoding: 'utf8',
    env: { ...process.env, SEO_TARGET: 'cloudflare', DIST_DIR: existingOutput }
  });
  assert.notEqual(protectedBuild.status, 0);
  assert.match(`${protectedBuild.stdout}\n${protectedBuild.stderr}`, /No se reemplaza una distribución existente/);
  assert.equal(await readFile(join(existingOutput, 'preserve.txt'), 'utf8'), 'keep this artifact');

  const deployConfig = await readFile(new URL('../wrangler.toml', import.meta.url), 'utf8');
  assert.match(deployConfig, /^account_id\s*=\s*["']fc854c3291faa99f884d4568138cff95["']\s*$/m,
    'wrangler debe usar el account_id confirmado');
  assert.match(deployConfig, /^name\s*=\s*["']forgelock["']\s*$/m);
  assert.match(deployConfig, /^compatibility_date\s*=\s*["']2026-10-19["']\s*$/m);
  assert.match(deployConfig, /^directory\s*=\s*["']\.\/dist-cloudflare["']\s*$/m);
  const outputSnapshotBeforePreflight = await Promise.all(preservedDistPaths.map(async (path) => existsSync(path) ? readFile(path) : null));
  const preflightEnv = { ...process.env };
  delete preflightEnv.FORGELOCK_DEPLOY_CONFIRMATION;
  const preflight = spawnSync(process.execPath, ['./scripts/deploy-cloudflare.mjs'], {
    cwd: fileURLToPath(root),
    encoding: 'utf8',
    env: preflightEnv
  });
  assert.equal(preflight.status, 0, `${preflight.stdout}\n${preflight.stderr}`);
  assert.match(`${preflight.stdout}\n${preflight.stderr}`, /Preflight correcto[\s\S]*no se desplegó/i);
  const outputSnapshotAfterPreflight = await Promise.all(preservedDistPaths.map(async (path) => existsSync(path) ? readFile(path) : null));
  assert.deepEqual(outputSnapshotAfterPreflight, outputSnapshotBeforePreflight, 'el preflight no debe crear ni reemplazar distribuciones existentes');
  assert.deepEqual(await snapshotTrackedFiles(), sourceSnapshots, 'los builds y pruebas no deben modificar archivos versionados');
  const finalDistSnapshot = await Promise.all(preservedDistPaths.map(async (path) => existsSync(path) ? readFile(path) : null));
  assert.deepEqual(finalDistSnapshot, distSnapshots, 'los builds y pruebas no deben reemplazar distribuciones preexistentes');
});

test('fails clearly for invalid SEO target configuration', () => {
  const result = spawnSync(process.execPath, ['scripts/generate-seo.mjs'], {
    cwd: fileURLToPath(root),
    encoding: 'utf8',
    env: { ...process.env, SEO_TARGET: 'invalid-target' }
  });
  assert.notEqual(result.status, 0);
  assert.match(`${result.stdout}\n${result.stderr}`, /SEO_TARGET inválido.*github-pages.*cloudflare/s);
});

test('blocks legacy transition flags and a mismatched destination before creating output', () => {
  const output = join(buildRoot, 'blocked-output');
  for (const env of [
    { SEO_TARGET: 'cloudflare', BASE_URL: bases['github-pages'] },
    { SEO_TARGET: 'github-pages', SEO_TRANSITION: 'cloudflare' }
  ]) {
    const result = spawnSync(process.execPath, ['scripts/build-dist.mjs'], {
      cwd: projectRoot,
      encoding: 'utf8',
      env: { ...process.env, ...env, DIST_DIR: output }
    });
    assert.notEqual(result.status, 0);
    assert.match(`${result.stdout}\n${result.stderr}`, /BASE_URL no coincide|Migración canónica deshabilitada/);
    assert.equal(existsSync(output), false, 'una configuración rechazada no debe crear un artefacto');
  }
  const legacy = spawnSync(process.execPath, ['scripts/build-pages-transition.mjs'], {
    cwd: projectRoot,
    encoding: 'utf8',
    env: { ...process.env, DIST_DIR: output }
  });
  assert.notEqual(legacy.status, 0);
  assert.match(`${legacy.stdout}\n${legacy.stderr}`, /Migración canónica deshabilitada/);
  assert.equal(existsSync(output), false);
});
