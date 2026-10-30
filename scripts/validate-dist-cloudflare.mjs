// Valida dist/ como la variante del Worker sin depender de sintaxis del shell.
import { spawnSync } from 'node:child_process';

const result = spawnSync(process.execPath, ['./scripts/validate-dist.mjs'], {
  stdio: 'inherit',
  env: { ...process.env, SEO_TARGET: 'cloudflare' }
});
if (result.error) throw result.error;
process.exit(result.status ?? 1);
