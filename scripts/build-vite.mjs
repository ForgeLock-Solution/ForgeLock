// Build React/Vite and apply the shared SEO generation/validation pipeline.
import { copyFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { getSeoConfig } from './seo-helpers.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const target = process.argv[2] || process.env.SEO_TARGET || 'github-pages';
const env = { ...process.env, SEO_TARGET: target };
env.DIST_DIR ||= target === 'cloudflare' ? 'dist-cloudflare' : 'dist';
const { baseUrl } = getSeoConfig(env);
const output = resolve(root, env.DIST_DIR);

function run(args, label) {
  const result = spawnSync(process.execPath, args, { cwd: root, stdio: 'inherit', env });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`${label} falló; se detiene el build para ${target}.`);
}

console.log(`Build Vite destino=${target}; BASE_URL=${baseUrl.href}; salida=${output}`);
run(['./node_modules/vite/bin/vite.js', 'build', '--outDir', env.DIST_DIR, '--emptyOutDir'], 'Vite');

if (target === 'cloudflare') {
  await copyFile(resolve(root, '_headers'), resolve(output, '_headers'));
}

run(['./scripts/generate-seo.mjs'], 'Generación SEO');
run(['./scripts/validate-vite-dist.mjs'], 'Validación SEO');
