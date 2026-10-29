// Future publication only: build, validate and deploy the same isolated artifact.
import { mkdtemp, readFile, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

function readConfigValue(config, key) {
  return config.match(new RegExp(`^${key}\\s*=\\s*["']([^"']+)["']\\s*$`, 'm'))?.[1];
}

function requireConfirmedTarget(config) {
  const accountId = readConfigValue(config, 'account_id');
  if (!accountId || !/^[a-f0-9]{32}$/i.test(accountId)) {
    throw new Error('Destino Cloudflare no confirmado: añade a wrangler.toml el account_id de 32 caracteres hexadecimales confirmado por el responsable de la cuenta.');
  }
  const name = readConfigValue(config, 'name');
  if (name !== 'forgelock') throw new Error('Destino rechazado: wrangler.toml debe declarar el Worker forgelock.');
  if (readConfigValue(config, 'directory') !== './dist-cloudflare') {
    throw new Error('Destino rechazado: wrangler.toml debe configurar ./dist-cloudflare como fuente de activos.');
  }
  if (readConfigValue(config, 'html_handling') !== 'auto-trailing-slash') {
    throw new Error('Destino rechazado: wrangler.toml debe fijar html_handling=auto-trailing-slash.');
  }
  const compatibilityDate = readConfigValue(config, 'compatibility_date');
  if (!compatibilityDate) throw new Error('wrangler.toml debe fijar compatibility_date.');
  return { accountId, name, compatibilityDate };
}

function runNpm(args, label, env) {
  const npmCli = process.env.npm_execpath;
  const result = spawnSync(npmCli ? process.execPath : 'npm', npmCli ? [npmCli, ...args] : args, {
    cwd: root,
    stdio: 'inherit',
    env,
    shell: !npmCli && process.platform === 'win32'
  });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`${label} falló; Wrangler no se invocará.`);
}

const sourceConfig = await readFile(resolve(root, 'wrangler.toml'), 'utf8');
const target = requireConfirmedTarget(sourceConfig);
const tempRoot = await mkdtemp(join(tmpdir(), 'forgelock-cloudflare-deploy-'));
const assetsDir = join(tempRoot, 'assets');
const tempConfig = join(tempRoot, 'wrangler.toml');
const env = { ...process.env, SEO_TARGET: 'cloudflare', DIST_DIR: assetsDir };

try {
  runNpm(['run', 'build:dist:cloudflare'], 'Build Cloudflare', env);
  runNpm(['run', 'validate:dist:cloudflare'], 'Validación Cloudflare', env);

  const config = [
    `name = "${target.name}"`,
    `account_id = "${target.accountId}"`,
    `compatibility_date = "${target.compatibilityDate}"`,
    '',
    '[assets]',
    'directory = "./assets"',
    'html_handling = "auto-trailing-slash"',
    ''
  ].join('\n');
  await writeFile(tempConfig, config, { flag: 'wx' });

  if (process.env.FORGELOCK_DEPLOY_CONFIRMATION !== 'deploy-forgelock') {
    console.log('Preflight correcto. El artefacto temporal validado se eliminará al terminar; no se desplegó.');
    process.exitCode = 0;
  } else {
    const result = spawnSync('wrangler', ['deploy', '--config', tempConfig], {
      cwd: root,
      stdio: 'inherit',
      env,
      shell: process.platform === 'win32'
    });
    if (result.error) throw result.error;
    if (result.status !== 0) process.exitCode = result.status ?? 1;
  }
} finally {
  await rm(tempRoot, { recursive: true, force: true });
}
