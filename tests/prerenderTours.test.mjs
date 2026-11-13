import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, writeFile, readFile, readdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { seleccionarTours, crearHtmlTour, prerenderTours } from '../scripts/prerender-tours.mjs';
import { localizedSeoUrls, OG_LOCALES } from '../src/utils/seoLanguages.js';

const template = '<!doctype html><html lang="es"><head><title>Genérico</title><meta name="description" content="General"><meta property="og:title" content="Anterior"><link rel="canonical" href="https://old.test/"><script type="module" src="/app/assets/app.js"></script></head><body><div id="root"></div></body></html>';
const tour = { id: 1, activo: true, slug: 'cocora-cabalgata', nombre: 'Cocora & cabalgata', descripcion: 'Una experiencia en el valle.', fotos: ['https://images.test/cocora.jpg'] };

test('HTML inicial contiene metadatos únicos y conserva React y assets', () => {
  const html = crearHtmlTour(template, tour);
  assert.match(html, /<title>Cocora &amp; cabalgata \| Ruta Xplorer<\/title>/);
  for (const field of ['title', 'description', 'image', 'url', 'type', 'locale']) assert.equal((html.match(new RegExp(`property="og:${field}"`, 'g')) || []).length, 1);
  for (const field of ['card', 'title', 'description', 'image']) assert.match(html, new RegExp(`name="twitter:${field}"`));
  assert.equal((html.match(/rel="canonical"/g) || []).length, 1);
  assert.equal((html.match(/name="description"/g) || []).length, 1);
  assert.match(html, /href="https:\/\/rutaxplorer.com\/app\/tour\/cocora-cabalgata\?lang=es"/);
  assert.match(html, /content="https:\/\/images.test\/cocora.jpg"/);
  assert.match(html, /src="\/app\/assets\/app.js"/);
  assert.match(html, /<div id="root"><\/div>/);
  assert.doesNotMatch(html, /Genérico|Anterior|old.test|\?ref=/);
});

test('escapa contenido, limpia etiquetas y utiliza imagen genérica segura', () => {
  const html = crearHtmlTour(template, { ...tour, nombre: '" </title><script>alert(1)</script> Café', descripcion: '<p>Texto "especial" & seguro</p>', fotos: ['javascript:alert(1)'] });
  assert.doesNotMatch(html, /alert\(1\)|javascript:/);
  assert.match(html, /&quot;.*Café/);
  assert.match(html, /Texto &quot;especial&quot; &amp; seguro/);
  assert.match(html, /https:\/\/rutaxplorer.com\/app\/foto-principal-rutaxplorer.jpeg/);
  assert.match(crearHtmlTour(template, { ...tour, fotos: [] }), /foto-principal-rutaxplorer.jpeg/);
});

test('solo activos y slugs válidos, sin colisiones ni rutas de escape', () => {
  assert.deepEqual(seleccionarTours([tour, { ...tour, id: 2, activo: false, slug: 'retirado' }]).map(t => t.slug), [tour.slug]);
  assert.equal(seleccionarTours([{ ...tour, fotos: JSON.stringify(tour.fotos) }])[0].fotos[0], tour.fotos[0]);
  for (const slug of ['undefined', '../escape', 'a?ref=x', 'x'.repeat(256)]) assert.throws(() => seleccionarTours([{ ...tour, slug }]));
  assert.throws(() => seleccionarTours([tour, { ...tour, id: 2 }]));
  assert.throws(() => seleccionarTours([tour, { ...tour, activo: null }]));
  assert.throws(() => seleccionarTours({ tours: [tour] }));
  assert.throws(() => seleccionarTours([]));
});

test('genera archivos desde la API y un fallo impide completar el prerender', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'rx-prerender-'));
  try {
    await writeFile(join(dir, 'index.html'), template);
    const cantidad = await prerenderTours({ apiUrl: 'https://api.test', outDir: dir, fetchImpl: async (url, options) => {
      assert.match(url, /^https:\/\/api.test\/api\/tours\?lang=(es|en|fr)$/); assert.ok(options.signal);
      const lang = new URL(url).searchParams.get('lang');
      return { ok: true, status: 200, json: async () => [{ ...tour, nombre: `Tour ${lang}`, descripcion: `Texto ${lang}` }, { ...tour, id: 2, activo: false }] };
    } });
    assert.equal(cantidad, 3);
    assert.deepEqual(await readdir(join(dir, 'tour')), ['cocora-cabalgata.en.html', 'cocora-cabalgata.es.html', 'cocora-cabalgata.fr.html']);
    assert.match(await readFile(join(dir, 'tour/cocora-cabalgata.es.html'), 'utf8'), /og:title/);
    for (const lang of ['es', 'en', 'fr']) {
      const html = await readFile(join(dir, `tour/cocora-cabalgata.${lang}.html`), 'utf8');
      assert.ok(html.includes(`content="Texto ${lang}"`));
      assert.ok(html.includes(`<title>Tour ${lang} | Ruta Xplorer</title>`));
    }
    assert.equal(await readFile(join(dir, 'index.html'), 'utf8'), template);
    for (const status of [206, 404, 500]) await assert.rejects(prerenderTours({ apiUrl: 'https://api.test', outDir: dir, fetchImpl: async () => ({ ok: status === 206, status }) }));
    await assert.rejects(prerenderTours({ apiUrl: 'https://api.test', outDir: dir, fetchImpl: async () => { throw new Error('timeout'); } }), /timeout/);
  } finally {
    assert.ok(dir.startsWith(join(tmpdir(), 'rx-prerender-')));
    await rm(dir, { recursive: true, force: true });
  }
});

test('ES/EN/FR: idioma, canonical y alternates recíprocos, sin ref y x-default español', () => {
  for (const lang of ['es', 'en', 'fr']) {
    const urls = localizedSeoUrls('/app/tour/cocora-cabalgata?ref=hotel1&lang=fr#reserva', 'https://rutaxplorer.com', lang);
    assert.equal(urls.canonical, `https://rutaxplorer.com/app/tour/cocora-cabalgata?lang=${lang}`);
    assert.equal(urls.defaultUrl, urls.alternates.es);
    const html = crearHtmlTour(template, { ...tour, nombre: `Nombre ${lang}`, descripcion: `Descripción ${lang}` }, 'https://rutaxplorer.com', lang);
    assert.match(html, new RegExp(`<html lang="${lang}">`));
    assert.match(html, new RegExp(`property="og:locale" content="${OG_LOCALES[lang]}"`));
    assert.match(html, new RegExp(`name="twitter:title" content="Nombre ${lang}`));
    for (const alternate of ['es', 'en', 'fr', 'x-default']) {
      const target = alternate === 'x-default' ? 'es' : alternate;
      assert.ok(html.includes(`hreflang="${alternate}" href="https://rutaxplorer.com/app/tour/cocora-cabalgata?lang=${target}"`));
    }
    assert.doesNotMatch(html, /[?&]ref=/);
  }
});
