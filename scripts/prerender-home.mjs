import React from 'react';
import { renderToString } from 'react-dom/server';
import { readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';

const scriptPath = fileURLToPath(import.meta.url);
const projectRoot = resolve(dirname(scriptPath), '..');
const dist = resolve(projectRoot, process.env.DIST_DIR || 'dist');

const vite = await createServer({
  configFile: resolve(projectRoot, 'vite.config.ts'),
  root: projectRoot,
  server: { middlewareMode: true },
  appType: 'custom',
  logLevel: 'error'
});

try {
  const { default: App } = await vite.ssrLoadModule('/src/App.tsx');
  const markup = renderToString(React.createElement(App));
  const indexPath = resolve(dist, 'index.html');
  const html = await readFile(indexPath, 'utf8');
  const emptyRoot = '<div id="root"></div>';
  if (html.split(emptyRoot).length !== 2) {
    throw new Error('dist/index.html debe contener un único root vacío para prerenderizar.');
  }
  await writeFile(indexPath, html.replace(emptyRoot, `<div id="root">${markup}</div>`), 'utf8');
  console.log(`Portada prerenderizada: ${markup.length} caracteres de HTML reutilizando src/App.tsx.`);
} finally {
  await vite.close();
}
