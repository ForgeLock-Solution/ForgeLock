// Build, validate and optionally publish the same isolated Worker artifact.
import { mkdtemp, readFile, writeFile, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');

function readConfigValue(config, key) {
  const matches = [...config.matchAll(new RegExp(`^\\s*${key}\\s*=\\s*["']([^"'\\r\\n]+)["'][ \\t]*(?:#.*)?$`, 'gm'))];
  if (matches.length > 1) throw new Error(`Configuración ambigua: ${key} está duplicado.`);
  return matches[0]?.[1];
}

export function createDeploymentConfig(sourceConfig) {
  const topLevel = sourceConfig.split(/^\s*\[/m)[0];
  const accountId = readConfigValue(topLevel, 'account_id');
  if (!accountId || !/^[a-f0-9]{32}$/i.test(accountId)) {
    throw new Error('Destino Cloudflare no confirmado: añade a wrangler.toml el account_id de 32 caracteres hexadecimales confirmado por el responsable de la cuenta.');
  }
  if (readConfigValue(topLevel, 'name') !== 'forgelock') {
    throw new Error('Destino rechazado: wrangler.toml debe declarar el Worker forgelock.');
  }
  if (!readConfigValue(topLevel, 'compatibility_date')) throw new Error('wrangler.toml debe fijar compatibility_date.');
  const assets = [...sourceConfig.matchAll(/(^\[assets\][^\S\r\n]*(?:#.*)?\r?\n)([\s\S]*?)(?=^\s*\[|(?![\s\S]))/gm)];
  if (assets.length !== 1 ||
      readConfigValue(assets[0][2], 'directory') !== './dist-cloudflare' ||
      readConfigValue(assets[0][2], 'html_handling') !== 'auto-trailing-slash') {
    throw new Error('Destino rechazado: [assets] debe fijar directory=./dist-cloudflare y html_handling=auto-trailing-slash.');
  }
  // Preserve the existing configuration; only the temporary asset path changes.
  const isolatedAssets = assets[0][0].replace(/^(\s*directory\s*=\s*)["'][^"'\r\n]+["']/m, '$1"./assets"');
  return sourceConfig.replace(assets[0][0], isolatedAssets);
}

export async function deployCloudflare({ root = projectRoot, env = process.env, run = spawnSync } = {}) {
  const sourceConfig = await readFile(join(root, 'wrangler.toml'), 'utf8');
  const isolatedConfig = createDeploymentConfig(sourceConfig);
  if (Number(process.versions.node.split('.')[0]) < 22) throw new Error('Cloudflare requiere Node.js 22 o superior.');
  const wranglerCli = join(root, 'node_modules', 'wrangler', 'bin', 'wrangler.js');
  if (!existsSync(wranglerCli)) throw new Error('Wrangler local no está instalado. Ejecuta npm ci antes del preflight.');
  const tempRoot = await mkdtemp(join(tmpdir(), 'forgelock-cloudflare-deploy-'));
  const assetsDir = join(tempRoot, 'assets');
  const tempConfig = join(tempRoot, 'wrangler.toml');
  const buildEnv = { ...env, SEO_TARGET: 'cloudflare', DIST_DIR: assetsDir };

  function runNode(args, label) {
    const result = run(process.execPath, args, { cwd: root, stdio: 'inherit', env: buildEnv });
    if (result.error) throw result.error;
    if (result.status !== 0) throw new Error(`${label} falló con código ${result.status ?? 'desconocido'}.`);
  }

  try {
    // build-dist already generates SEO and validates this exact artifact.
    runNode([join(root, 'scripts', 'build-dist.mjs'), 'cloudflare'], 'Build y validación Cloudflare');
    await writeFile(tempConfig, isolatedConfig, { flag: 'wx' });
    if (env.FORGELOCK_DEPLOY_CONFIRMATION !== 'deploy-forgelock') {
      console.log('Preflight correcto. El artefacto temporal validado se eliminará al terminar; no se desplegó.');
    } else {
      runNode([wranglerCli, 'deploy', '--config', tempConfig], 'Despliegue Cloudflare');
    }
  } finally {
    await rm(tempRoot, { recursive: true, force: true });
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await deployCloudflare();
}
