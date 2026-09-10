// Read-only HTTP regression check. Run against a local production server or the deployed site.
import assert from 'node:assert/strict';
import http from 'node:http';
import https from 'node:https';
const base = process.env.BASE_URL ?? 'http://localhost:3000';
const origin = 'https://codescope.dev';
const paths = ['/', '/tourscope', '/pricing', '/services', '/about', '/contact', '/get-started', '/jobs'];
const decode = text => text.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#x27;|&#39;/g, "'");
function tags(html, tag) {
  return [...html.matchAll(new RegExp(`<${tag}\\b[^>]*>`, 'gi'))].map(match =>
    Object.fromEntries([...match[0].matchAll(/([\w:-]+)="([^"]*)"/g)].map(([, key, value]) => [key.toLowerCase(), decode(value)])));
}
async function read(path, options = {}) {
  const response = await fetch(new URL(path, base), { signal: AbortSignal.timeout(20000), ...options });
  return { response, html: await response.text() };
}
const titles = new Set();
for (const locale of ['en', 'ar']) for (const path of paths) {
  const localized = locale === 'ar' ? `/ar${path === '/' ? '' : path}` : path;
  const { response, html } = await read(localized, { headers: { Cookie: `NEXT_LOCALE=${locale === 'ar' ? 'en' : 'ar'}` } });
  assert.equal(response.status, 200, localized);
  assert.equal(tags(html, 'html')[0].lang, locale);
  const links = tags(html, 'link'); const meta = tags(html, 'meta');
  const canonical = links.filter(link => link.rel === 'canonical');
  assert.equal(canonical.length, 1, localized);
  assert.equal(new URL(canonical[0].href).href, new URL(origin + localized).href);
  for (const [language, url] of Object.entries({ en: origin + path, ar: origin + '/ar' + (path === '/' ? '' : path), 'x-default': origin + path })) {
    assert.equal(new URL(links.find(link => link.hreflang === language)?.href).href, new URL(url).href);
  }
  const title = decode(html.match(/<title[^>]*>(.*?)<\/title>/s)?.[1] ?? '');
  assert.ok(title && !titles.has(title), `Missing/duplicate title: ${localized}`); titles.add(title);
  assert.ok(meta.find(item => item.name === 'description')?.content);
  assert.ok(meta.find(item => item.property === 'og:image')?.content);
  assert.ok(meta.find(item => item.name === 'twitter:card')?.content);
  assert.ok(!meta.some(item => item.name === 'robots' && item.content.includes('noindex')));
  const schemas = [...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)].map(match => JSON.parse(match[1]));
  assert.ok(schemas.some(item => item['@type'] === 'Organization'));
  if (path !== '/') assert.ok(schemas.some(item => item['@type'] === 'BreadcrumbList'));
}
for (const path of ['/en', '/en/tourscope?source=seo-check']) {
  const { response } = await read(path, { redirect: 'manual' });
  assert.equal(response.status, 308);
  const destination = new URL(response.headers.get('location'), base);
  assert.equal(destination.pathname, new URL(path.replace(/^\/en/, '') || '/', base).pathname);
  assert.equal(destination.search, new URL(path, base).search);
}
for (const path of ['/dashboard', '/ar/dashboard']) {
  const { response } = await read(path, { redirect: 'manual' });
  assert.equal(response.status, 307); assert.equal(new URL(response.headers.get('location'), base).pathname, '/');
}
// Node's fetch may discard Host overrides; use the native client for this host-routing assertion.
const www = await new Promise((resolve, reject) => {
  const url = new URL('/en/tourscope?source=seo-check', base);
  const request = (url.protocol === 'https:' ? https : http).get(url, { headers: { Host: 'www.codescope.dev' } }, response => {
    response.resume();
    resolve({ status: response.statusCode, location: response.headers.location });
  });
  request.setTimeout(20000, () => request.destroy(new Error('Host redirect check timed out')));
  request.on('error', reject);
});
assert.equal(www.status, 308);
assert.equal(www.location, origin + '/tourscope?source=seo-check');
const api = await read('/api/jobs');
assert.ok(api.response.headers.get('x-robots-tag')?.includes('noindex'));
const login = await read('/login');
assert.ok(tags(login.html, 'meta').some(item => item.name === 'robots' && item.content.includes('noindex')));
const robots = await read('/robots.txt');
assert.ok(robots.response.headers.get('content-type')?.includes('text/plain'));
assert.ok(robots.html.includes(`Sitemap: ${origin}/sitemap.xml`));
const sitemap = await read('/sitemap.xml');
assert.ok(sitemap.response.headers.get('content-type')?.includes('xml'));
const urls = [...sitemap.html.matchAll(/<loc>(.*?)<\/loc>/g)].map(match => decode(match[1]));
assert.ok(urls.length >= 16); assert.equal(urls.length, new Set(urls).size);
for (const url of urls) {
  const parsed = new URL(url); assert.equal(parsed.origin, origin); assert.equal(parsed.search, '');
  const path = parsed.pathname.replace(/^\/ar(?=\/|$)/, '') || '/';
  assert.ok(paths.includes(path) || /^\/jobs\/[1-9]\d*$/.test(path), `Non-public sitemap entry: ${url}`);
}
for (const path of ['/missing-seo-file.txt', '/fr', '/jobs/invalid']) assert.equal((await read(path)).response.status, 404, path);
console.log(`Public SEO checks passed: ${titles.size} localized pages, ${urls.length} sitemap entries, redirects, schemas and indexing rules (${base}).`);
