// Build determinista de un destino aislado; no reescribe src/vendor ni estilos fuente.
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { getDistDirectory, getSeoConfig } from './seo-helpers.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const requestedTarget = process.argv[2];
const target = requestedTarget || process.env.SEO_TARGET || 'github-pages';
const env = { ...process.env, SEO_TARGET: target };
if (!env.DIST_DIR && !env.SEO_TRANSITION) env.DIST_DIR = target === 'cloudflare' ? 'dist-cloudflare' : 'dist';
const { baseUrl } = getSeoConfig(env);
const dist = getDistDirectory(root, env);
env.TAILWIND_OUTPUT_FILE = resolve(dist, 'src', 'styles', 'tailwind.css');

function run(script, label) {
  const result = spawnSync(process.execPath, [script], { cwd: root, stdio: 'inherit', env });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`${label} falló; se detiene el build de ${target}.`);
}

console.log(`Build destino=${target}; BASE_URL=${baseUrl.href}; salida=${dist}`);
run('./scripts/create-dist.mjs', 'Creación de distribución');
run('./scripts/build-styles.mjs', 'Build de estilos');
run('./scripts/generate-seo.mjs', 'Generación SEO');
run('./scripts/validate-dist.mjs', 'Validación de distribución');
