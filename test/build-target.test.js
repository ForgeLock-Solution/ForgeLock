import assert from 'node:assert/strict';
import test from 'node:test';
import { resolveBuildTarget } from '../scripts/build-dist.mjs';

test('el build compartido selecciona Pages por defecto y Cloudflare dentro de Workers Builds', () => {
  assert.equal(resolveBuildTarget([], {}), 'github-pages');
  assert.equal(resolveBuildTarget([], { WORKERS_CI: '1' }), 'cloudflare');
  assert.equal(resolveBuildTarget([], { SEO_TARGET: 'cloudflare' }), 'cloudflare');
  assert.equal(resolveBuildTarget(['github-pages'], { WORKERS_CI: '1' }), 'github-pages');
});
