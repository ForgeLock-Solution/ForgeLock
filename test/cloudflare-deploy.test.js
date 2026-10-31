import assert from 'node:assert/strict';
import test from 'node:test';
import { mkdtemp, mkdir, readFile, writeFile, rm } from 'node:fs/promises';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { createDeploymentConfig, deployCloudflare } from '../scripts/deploy-cloudflare.mjs';

const sourceConfig = await readFile(new URL('../wrangler.toml', import.meta.url), 'utf8');
// A synthetic account is used only in isolated tests; never written to the project.
const confirmedConfig = sourceConfig.replace(/^account_id\s*=.*\r?\n/m, '')
  .replace(/^name\s*=.*$/m, `account_id = "${'a'.repeat(32)}"\nname = "forgelock"`);
const missingAccountConfig = confirmedConfig.replace(/^account_id\s*=.*\r?\n/m, '');
const runtimeOptions = { skip: Number(process.versions.node.split('.')[0]) < 22
  ? 'El preflight de Cloudflare requiere Node.js 22 o superior.' : false };

test('la configuración temporal conserva previews y solo cambia la ruta de activos', () => {
  const config = `${confirmedConfig}\n[observability]\nenabled = true\n`;
  const expected = (input, root = process.cwd()) => input
    .replace('"./dist-cloudflare"', '"./assets"')
    .replace(/^main\s*=.*$/m, `main = "${resolve(root, 'src/platform/cloudflare-worker.js').replaceAll('\\', '/')}"`);
  assert.equal(createDeploymentConfig(config), expected(config));
  const windowsLines = config.replaceAll('\r\n', '\n').replaceAll('\n', '\r\n');
  assert.equal(createDeploymentConfig(windowsLines), expected(windowsLines));
});

test('rechaza cuentas, Worker y activos incorrectos o ambiguos antes de construir', () => {
  assert.throws(() => createDeploymentConfig(missingAccountConfig), /account_id.*confirmado/);
  assert.throws(() => createDeploymentConfig(confirmedConfig.replace(/^account_id\s*=.*$/m, 'account_id = "not-a-valid-id"')), /account_id.*confirmado/);
  assert.throws(() => createDeploymentConfig(confirmedConfig.replace('"forgelock"', '"otro-worker"')), /Worker forgelock/);
  assert.throws(() => createDeploymentConfig(confirmedConfig.replace('src/platform/cloudflare-worker.js', 'src/platform/other.js')), /src\/platform\/cloudflare-worker\.js/);
  assert.throws(() => createDeploymentConfig(confirmedConfig.replace('"./dist-cloudflare"', '"./dist"')), /Destino rechazado/);
  assert.throws(() => createDeploymentConfig(`account_id = "${'b'.repeat(32)}"\n${confirmedConfig}`), /duplicado/);
  assert.throws(() => createDeploymentConfig(`${confirmedConfig}\n[assets]\ndirectory = "./dist-cloudflare"\n`), /Destino rechazado/);
});

async function withFixture(run) {
  const root = await mkdtemp(join(tmpdir(), 'forgelock-deploy-test-'));
  try {
    await writeFile(join(root, 'wrangler.toml'), confirmedConfig);
    await mkdir(join(root, 'src', 'platform'), { recursive: true });
    await writeFile(join(root, 'src', 'platform', 'cloudflare-worker.js'), 'export default {};');
    const cli = join(root, 'node_modules', 'wrangler', 'bin', 'wrangler.js');
    await mkdir(join(root, 'node_modules', 'wrangler', 'bin'), { recursive: true });
    await writeFile(cli, '// Test placeholder; no real Wrangler process is executed.');
    await run(root, cli);
  } finally {
    assert.ok(resolve(root).startsWith(`${resolve(tmpdir())}\\`) || resolve(root).startsWith(`${resolve(tmpdir())}/`));
    await rm(root, { recursive: true, force: true });
  }
}

test('el preflight reutiliza el build validado sin invocar publicación', runtimeOptions, async () => {
  await withFixture(async (root) => {
    const calls = [];
    let output;
    await deployCloudflare({ root, env: {}, run(command, args, options) {
      calls.push(args);
      assert.equal(command, process.execPath);
      assert.equal(options.shell, undefined);
      assert.deepEqual(args, [join(root, 'scripts', 'build-dist.mjs'), 'cloudflare']);
      assert.equal(options.env.SEO_TARGET, 'cloudflare');
      output = options.env.DIST_DIR;
      return { status: 0 };
    } });
    assert.equal(calls.length, 1, 'una única construcción con su validación incorporada');
    assert.equal(existsSync(output), false);
    assert.equal(await readFile(join(root, 'wrangler.toml'), 'utf8'), confirmedConfig);
  });
});

test('la ruta autorizada entrega el mismo artefacto al CLI local y limpia temporales', runtimeOptions, async () => {
  await withFixture(async (root, cli) => {
    let output;
    let tempConfig;
    let calls = 0;
    await deployCloudflare({ root, env: { FORGELOCK_DEPLOY_CONFIRMATION: 'deploy-forgelock' }, run(command, args, options) {
      calls++;
      assert.equal(command, process.execPath);
      if (calls === 1) {
        output = options.env.DIST_DIR;
        mkdirSync(output);
        writeFileSync(join(output, 'validated-marker'), 'original-artifact');
      } else {
        assert.deepEqual(args.slice(0, 3), [cli, 'deploy', '--config']);
        tempConfig = args[3];
        assert.equal(resolve(tempConfig, '..', 'assets'), output);
        assert.equal(readFileSync(join(output, 'validated-marker'), 'utf8'), 'original-artifact');
        assert.equal(readFileSync(tempConfig, 'utf8'), createDeploymentConfig(confirmedConfig, root));
      }
      return { status: 0 };
    } });
    assert.equal(calls, 2);
    assert.equal(existsSync(output), false);
    assert.equal(existsSync(tempConfig), false);
  });
});

test('un build fallido detiene la publicación y elimina la salida temporal', runtimeOptions, async () => {
  await withFixture(async (root) => {
    let output;
    let calls = 0;
    await assert.rejects(deployCloudflare({ root, env: { FORGELOCK_DEPLOY_CONFIRMATION: 'deploy-forgelock' }, run(_command, _args, options) {
      calls++;
      output = options.env.DIST_DIR;
      return { status: 1 };
    } }), /Build y validación Cloudflare falló/);
    assert.equal(calls, 1);
    assert.equal(existsSync(resolve(output, '..')), false);
  });
});
