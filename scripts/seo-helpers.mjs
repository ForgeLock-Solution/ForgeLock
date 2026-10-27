import { JSDOM } from 'jsdom';
import { readdir } from 'node:fs/promises';
import { join } from 'node:path';

export const DEFAULT_BASE_URL = 'https://forgelock-solution.github.io/ForgeLock/';
export const SITEMAP_NAMESPACE = 'http://www.sitemaps.org/schemas/sitemap/0.9';

// Public-page convention: every root-level *.html file is a public route.
// HTML below subdirectories (for example admin/, templates/, test/) is never
// packaged as a route; callers fail explicitly if one is present.
export async function discoverPublicHtmlFiles(root) {
  const files = await readdir(root, { withFileTypes: true });
  const nestedHtml = [];
  async function scan(directory, prefix = '') {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const relativePath = prefix ? `${prefix}/${entry.name}` : entry.name;
      if (entry.isDirectory() && !['.git', 'dist', 'node_modules', 'scripts', 'src', 'test', 'tests'].includes(entry.name.toLowerCase())) await scan(join(directory, entry.name), relativePath);
      else if (entry.isFile() && entry.name.toLowerCase().endsWith('.html')) nestedHtml.push(relativePath);
    }
  }
  for (const entry of files) {
    if (entry.isDirectory() && !['.git', 'dist', 'node_modules', 'scripts', 'src', 'test', 'tests'].includes(entry.name.toLowerCase())) await scan(join(root, entry.name), entry.name);
  }
  if (nestedHtml.length) {
    throw new Error(`No se admiten páginas HTML anidadas; muévalas a la raíz o exclúyalas del proyecto: ${nestedHtml.sort().join(', ')}`);
  }
  return files.filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith('.html'))
    .map((entry) => entry.name).sort();
}

export function comparePublicHtmlFiles(sourceFiles, artifactFiles) {
  const source = new Set(sourceFiles);
  const artifact = new Set(artifactFiles);
  return {
    missing: [...source].filter((file) => !artifact.has(file)).sort(),
    unexpected: [...artifact].filter((file) => !source.has(file)).sort()
  };
}

export function parseRobotsGroups(robots) {
  const groups = [];
  let group = null;
  for (const rawLine of robots.split(/\r?\n/)) {
    const line = rawLine.replace(/#.*$/, '').trim();
    if (!line) continue;
    const separator = line.indexOf(':');
    if (separator < 0) continue;
    const field = line.slice(0, separator).trim().toLowerCase();
    const value = line.slice(separator + 1).trim();
    if (field === 'user-agent') {
      if (!group || group.hasRules) {
        group = { agents: [], rules: [], hasRules: false };
        groups.push(group);
      }
      group.agents.push(value.toLowerCase());
    } else if ((field === 'allow' || field === 'disallow') && group?.agents.length) {
      group.hasRules = true;
      if (value) group.rules.push({ allow: field === 'allow', path: value });
    }
  }
  return groups;
}

export function isRobotsPathAllowed(robots, pathname, userAgent = '*') {
  const groups = parseRobotsGroups(robots);
  const agent = userAgent.toLowerCase();
  const exact = groups.filter((candidate) => candidate.agents.includes(agent));
  const applicable = exact.length ? exact : groups.filter((candidate) => candidate.agents.includes('*'));
  const matches = (pattern) => {
    const anchored = pattern.endsWith('$');
    const source = pattern.replace(/\$$/, '').split('*').map((part) => part.replace(/[|\\{}()[\]^$+?.]/g, '\\$&')).join('.*');
    return new RegExp(`^${source}${anchored ? '$' : ''}`).test(pathname);
  };
  const rules = applicable.flatMap((candidate) => candidate.rules)
    .filter((rule) => matches(rule.path))
    .sort((a, b) => b.path.replace(/[\*$]/g, '').length - a.path.replace(/[\*$]/g, '').length || Number(b.allow) - Number(a.allow));
  return rules.length === 0 || rules[0].allow;
}

// Validation policy: check the generic group, Googlebot, and every explicit
// User-agent token declared in this robots.txt. This covers declared agents,
// not every crawler or every crawler-specific interpretation of the standard.
export function getSitemapRobotsBlockers(robots, pathname) {
  const agents = new Set(['*', 'googlebot']);
  for (const group of parseRobotsGroups(robots)) {
    for (const agent of group.agents) agents.add(agent);
  }
  return [...agents].filter((agent) => !isRobotsPathAllowed(robots, pathname, agent));
}

export function validateSitemapUrlChildren(children) {
  const names = [...children].map((element) => element.localName);
  if (names.length < 1 || names.length > 2 || names[0] !== 'loc' || (names.length === 2 && names[1] !== 'lastmod')) {
    return false;
  }
  return [...children].every((element) => element.namespaceURI === SITEMAP_NAMESPACE);
}

export function parseXmlDocument(xml) {
  try {
    const document = new JSDOM(xml, { contentType: 'application/xml' }).window.document;
    if (document.getElementsByTagName('parsererror').length) throw new Error('XML mal formado');
    return document;
  } catch (error) {
    if (error.message === 'XML mal formado') throw error;
    throw new Error('XML mal formado', { cause: error });
  }
}

export function normalizeBaseUrl(value) {
  let url;
  try {
    url = new URL(value);
  } catch {
    throw new Error('BASE_URL debe ser una URL HTTP(S) absoluta sin query ni fragmento.');
  }
  if (!['http:', 'https:'].includes(url.protocol) || url.search || url.hash || /[?#]/.test(value) || url.username || url.password) {
    throw new Error('BASE_URL debe ser una URL HTTP(S) absoluta sin credenciales, query ni fragmento.');
  }
  url.pathname = `${url.pathname.replace(/\/+$/, '')}/`;
  return url;
}

export function parseHtml(html) {
  return new JSDOM(html).window.document;
}

export function getRobotsContent(html) {
  return [...parseHtml(html).querySelectorAll('meta[name]')]
    .filter((meta) => meta.getAttribute('name')?.trim().toLowerCase() === 'robots')
    .map((meta) => meta.getAttribute('content') ?? '');
}

export function isNoindex(html) {
  return getRobotsContent(html).some((content) => content.split(/[\s,]+/).some((directive) => directive.toLowerCase() === 'noindex'));
}

export function getCanonicalUrls(html) {
  return [...parseHtml(html).querySelectorAll('link[rel][href]')]
    .filter((link) => link.relList.contains('canonical'))
    .map((link) => link.href);
}

export function getGoogleVerificationValues(html) {
  return [...parseHtml(html).querySelectorAll('meta[name][content]')]
    .filter((meta) => meta.getAttribute('name')?.trim().toLowerCase() === 'google-site-verification')
    .map((meta) => meta.getAttribute('content'));
}

export function isValidLastmod(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isFinite(date.valueOf()) && date.toISOString().slice(0, 10) === value;
}

export function escapeXml(value) {
  return value.replace(/[<>&'\"]/g, (character) => ({
    '<': '&lt;',
    '>': '&gt;',
    '&': '&amp;',
    "'": '&apos;',
    '"': '&quot;'
  })[character]);
}

export function setNoindex(html) {
  const document = parseHtml(html);
  const tags = [...document.querySelectorAll('meta[name]')]
    .filter((meta) => meta.getAttribute('name')?.trim().toLowerCase() === 'robots');
  if (tags.length) {
    tags[0].setAttribute('content', 'noindex,follow');
    for (const duplicate of tags.slice(1)) duplicate.remove();
  } else {
    const head = document.querySelector('head');
    if (!head) throw new Error('No se puede añadir noindex: el HTML no contiene <head>.');
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex,follow';
    head.append(meta);
  }
  return `<!doctype html>\n${document.documentElement.outerHTML}\n`;
}
