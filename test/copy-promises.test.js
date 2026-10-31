import assert from 'node:assert/strict';
import test from 'node:test';
import { mkdtemp, readdir, readFile, rm } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = fileURLToPath(new URL('../', import.meta.url));
const forbiddenPublicCopy = [/24\s*\/\s*7/i, /en segundos/i, /garantizado/i];

async function listFiles(directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await listFiles(path));
    else files.push(path);
  }
  return files;
}

test('los artefactos públicos no contienen promesas de disponibilidad, rapidez o garantía no aprobadas', async () => {
  const buildRoot = await mkdtemp(join(tmpdir(), 'forgelock-copy-promises-'));
  try {
    for (const target of ['github-pages', 'cloudflare']) {
      const output = join(buildRoot, target);
      const build = spawnSync(process.execPath, ['./scripts/build-dist.mjs', target], {
        cwd: projectRoot,
        encoding: 'utf8',
        env: { ...process.env, DIST_DIR: output }
      });
      assert.equal(build.status, 0, `No se pudo generar ${target}:\n${build.stdout}\n${build.stderr}`);

      for (const file of await listFiles(output)) {
        const contents = await readFile(file);
        if (contents.includes(0)) continue;
        const text = contents.toString('utf8');
        for (const expression of forbiddenPublicCopy) {
          assert.doesNotMatch(text, expression, `${expression} reapareció en ${file}`);
        }
      }
    }
  } finally {
    await rm(buildRoot, { recursive: true, force: true });
  }
});
