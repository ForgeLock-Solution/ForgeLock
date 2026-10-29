// Compila Tailwind en la ruta indicada; los builds SEO usan dist/src/styles/tailwind.css.
import { mkdir } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const outputFile = resolve(root, process.env.TAILWIND_OUTPUT_FILE || 'src/styles/tailwind.css');
const cli = join(root, 'node_modules', 'tailwindcss', 'lib', 'cli.js');
await mkdir(dirname(outputFile), { recursive: true });

function run(args, label) {
  const result = spawnSync(process.execPath, args, { cwd: root, stdio: 'inherit', env: process.env });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`${label} falló con código ${result.status ?? 'desconocido'}.`);
}

run([cli, '--input', './src/styles/tailwind.input.css', '--output', outputFile, '--minify'], 'Tailwind');
run(['./scripts/fix-tailwind-compat.mjs'], 'Compatibilidad Tailwind');
