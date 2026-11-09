// Shared entry point for GitHub Pages and Cloudflare Workers Builds.
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export function resolveBuildTarget(args = process.argv.slice(2), env = process.env) {
  if (args[0]) return args[0];
  if (env.SEO_TARGET) return env.SEO_TARGET;
  return env.WORKERS_CI === '1' ? 'cloudflare' : 'github-pages';
}

if (process.argv[1] && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))) {
  process.argv[2] = resolveBuildTarget();
  await import('./build-vite.mjs');
}
