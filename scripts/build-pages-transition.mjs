// Builds a GitHub Pages artifact whose indexing signals point to Cloudflare.
// It always uses a fresh system-temp directory, never dist/.
import { mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const output = process.env.DIST_DIR
  ? resolve(root, process.env.DIST_DIR)
  : await mkdtemp(join(tmpdir(), 'forgelock-pages-transition-'));
const env = { ...process.env, SEO_TARGET: 'github-pages', SEO_TRANSITION: 'cloudflare', DIST_DIR: output };
const result = spawnSync(process.execPath, ['./scripts/build-dist.mjs', 'github-pages'], {
  cwd: root,
  stdio: 'inherit',
  env
});
if (result.error) throw result.error;
if (result.status !== 0) process.exit(result.status ?? 1);
console.log(`Artefacto Pages de transición generado y validado en: ${output}`);
