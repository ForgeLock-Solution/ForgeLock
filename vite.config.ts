import { resolve } from 'node:path';
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { SITE_URL } from './scripts/seo-helpers.mjs';

const htmlPages = [
  'index.html',
  'servicios.html',
  'aviso-legal.html',
  'politica-privacidad.html',
  'politica-cookies.html'
];

function seoPlaceholders(): Plugin {
  return {
    name: 'forgelock-seo-placeholders',
    transformIndexHtml(html, context) {
      const file = context.filename.split(/[\\/]/).pop() || 'index.html';
      const pageUrl = file === 'index.html' ? SITE_URL : new URL(file, SITE_URL).href;
      const assetBase = process.env.SEO_TARGET === 'cloudflare' ? '/' : '/ForgeLock/';
      return html
        .replaceAll('%SITE_URL%', SITE_URL)
        .replaceAll('%PAGE_URL%', pageUrl)
        .replaceAll('%ASSET_BASE%', assetBase);
    }
  };
}

export default defineConfig(({ command }) => {
  const cloudflare = process.env.SEO_TARGET === 'cloudflare';
  return {
    base: command === 'build' ? (cloudflare ? '/' : '/ForgeLock/') : '/',
    plugins: [react(), seoPlaceholders()],
    build: {
      rollupOptions: {
        input: Object.fromEntries(htmlPages.map((page) => [page.replace(/\.html$/, ''), resolve(import.meta.dirname, page)]))
      }
    },
    server: {
      host: '0.0.0.0',
      port: 3000
    }
  };
});
