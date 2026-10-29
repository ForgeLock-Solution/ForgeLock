import { isAbsolute, relative, resolve, sep } from 'node:path';
import { tmpdir } from 'node:os';

export const SEO_TARGETS = Object.freeze({
  'github-pages': 'https://forgelock-solution.github.io/ForgeLock/',
  cloudflare: 'https://forgelock.forge-look19.workers.dev/'
});

export const LEGACY_GITHUB_PAGES_BASE = SEO_TARGETS['github-pages'];

export function getDistDirectory(root, env = process.env) {
  const target = env.SEO_TARGET || 'github-pages';
  const defaultDir = target === 'cloudflare' ? 'dist-cloudflare' : 'dist';
  const output = resolve(root, env.DIST_DIR || defaultDir);
  if (env.DIST_DIR) {
    const workspaceRelative = relative(resolve(root), output);
    const tempRelative = relative(resolve(tmpdir()), output);
    const inWorkspace = workspaceRelative && workspaceRelative !== '..' && !workspaceRelative.startsWith(`..${sep}`) && !isAbsolute(workspaceRelative);
    const inTemp = tempRelative && tempRelative !== '..' && !tempRelative.startsWith(`..${sep}`) && !isAbsolute(tempRelative);
    const reservedOutput = output === resolve(root, 'dist') || output === resolve(root, 'dist-cloudflare');
    if (!inTemp && !(inWorkspace && reservedOutput)) {
      throw new Error('DIST_DIR debe ser dist/, dist-cloudflare/ o un directorio temporal aislado.');
    }
  }
  return output;
}

export function getPageUrl(file, baseUrl, target) {
  if (file === 'index.html') return new URL('./', baseUrl).href;
  const route = target === 'cloudflare' && file.endsWith('.html') ? file.slice(0, -5) : file;
  return new URL(route, baseUrl).href;
}

export function getSeoTransition(env = process.env) {
  const transition = env.SEO_TRANSITION || '';
  if (transition && transition !== 'cloudflare') {
    throw new Error('SEO_TRANSITION solo admite "cloudflare".');
  }
  if (transition && (env.SEO_TARGET || 'github-pages') !== 'github-pages') {
    throw new Error('La transición canónica a Cloudflare solo se genera desde la variante GitHub Pages.');
  }
  if (transition && !env.DIST_DIR) {
    throw new Error('La variante de transición requiere DIST_DIR temporal explícito para no reemplazar dist/.');
  }
  if (transition) {
    const output = resolve(env.DIST_DIR);
    const temporaryRelative = relative(resolve(tmpdir()), output);
    if (!temporaryRelative || temporaryRelative === '..' || temporaryRelative.startsWith(`..${sep}`) || isAbsolute(temporaryRelative)) {
      throw new Error('La variante de transición solo puede escribirse en un directorio temporal aislado.');
    }
  }
  return transition;
}

export function getSeoConfig(env = process.env) {
  const target = env.SEO_TARGET || 'github-pages';
  if (!Object.hasOwn(SEO_TARGETS, target)) {
    throw new Error(`SEO_TARGET inválido: "${target}". Usa "github-pages" o "cloudflare".`);
  }

  const expectedBaseUrl = SEO_TARGETS[target];
  if (env.BASE_URL) {
    let configured;
    try {
      configured = new URL(env.BASE_URL);
    } catch {
      throw new Error('BASE_URL debe ser una URL HTTP(S) absoluta válida.');
    }
    if (!['http:', 'https:'].includes(configured.protocol) || configured.search || configured.hash || configured.href !== expectedBaseUrl) {
      throw new Error(`BASE_URL no coincide con el destino SEO "${target}". URL esperada: ${expectedBaseUrl}`);
    }
  }

  const transition = getSeoTransition(env);
  return {
    target,
    transition,
    baseUrl: new URL(expectedBaseUrl),
    canonicalBaseUrl: new URL(transition ? SEO_TARGETS.cloudflare : expectedBaseUrl),
    canonicalTarget: transition || target,
    indexable: env.INDEXABLE !== 'false'
  };
}

