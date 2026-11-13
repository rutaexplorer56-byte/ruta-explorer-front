import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, writeFile, readdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { generarSitemap } from '../scripts/generate-sitemap.mjs';
import { localizedSeoUrls, SEO_LANGUAGES } from '../src/utils/seoLanguages.js';

const registro = (id, slug, activo = true) => ({ id, slug, activo, nombre: 'Café & naturaleza', fotos: ['https://example.com/foto.jpg?a=1&b=2'] });
const respuesta = data => async () => ({ ok: true, status: 200, json: async () => data });

async function entorno(t) {
  const dir = await mkdtemp(join(tmpdir(), 'rutaxplorer-sitemap-'));
  t.after(() => rm(dir, { recursive: true, force: true }));
  return { dir, outputFile: join(dir, 'sitemap.xml'), apiUrl: 'https://api.example.com' };
}

test('reemplaza el catálogo anterior, excluye inactivos y slugs inválidos y no repite URLs', async t => {
  const options = await entorno(t);
  await writeFile(options.outputFile, '<urlset>tour-eliminado</urlset>');
  const catalogo = [
    registro(1, 'transporte-a-la-reserva-la-carbonera', false),
    registro(2, 'termales-de-santa-rosa-de-cabal-salida-desde-pereira'),
    registro(3, 'termales-de-santa-rosa-de-cabal-salida-desde-pereira'),
    ...[undefined, 'undefined', 'null', '', 'RutaExplorer/tour', 'tour?ref=hotel1'].map((slug, i) => registro(i + 4, slug)),
  ];
  const result = await generarSitemap({ ...options, fetchImpl: respuesta(catalogo) });
  const xml = await readFile(options.outputFile, 'utf8');
  assert.deepEqual(result, { cantidad: 6, omitidos: 6 });
  const urls = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map(match => match[1]);
  const paths = ['/app/tours', '/app/tour/termales-de-santa-rosa-de-cabal-salida-desde-pereira'];
  assert.deepEqual(urls, paths.flatMap(path => SEO_LANGUAGES.map(lang => localizedSeoUrls(path, 'https://rutaxplorer.com', lang).canonical)));
  for (const path of paths) {
    const { alternates, defaultUrl } = localizedSeoUrls(path, 'https://rutaxplorer.com', 'es');
    for (const url of Object.values(alternates)) assert.ok(urls.includes(url));
    assert.ok(urls.includes(defaultUrl));
  }
  assert.equal(new Set(urls).size, urls.length);
  assert.doesNotMatch(xml, /tour-eliminado|transporte-a-la-reserva|RutaExplorer|undefined|\?ref=/);
  assert.match(xml, /Café &amp; naturaleza/);
  assert.match(xml, /a=1&amp;b=2/);
  assert.deepEqual(await readdir(options.dir), ['sitemap.xml']);
});

const fallos = {
  'HTTP 500': async () => ({ ok: false, status: 500 }),
  'respuesta parcial 206': async () => ({ ok: true, status: 206 }),
  'red caída': async () => { throw new Error('fetch failed'); },
  'JSON inválido': async () => ({ ok: true, status: 200, json: async () => { throw new SyntaxError('JSON inválido'); } }),
  'objeto en vez de catálogo': respuesta({ tours: [] }),
  'catálogo vacío sospechoso': respuesta([]),
  'fila corrupta en catálogo': respuesta([registro(1, 'tour'), null]),
  'estado activo desconocido': respuesta([registro(1, 'tour', 'desconocido')]),
  'id repetido': respuesta([registro(1, 'tour'), registro(1, 'otro')]),
  'todos los slugs activos inválidos': respuesta([registro(1, 'undefined')]),
};
for (const [nombre, fetchImpl] of Object.entries(fallos)) {
  test(`conserva exactamente el archivo anterior ante ${nombre}`, async t => {
    const options = await entorno(t);
    const anterior = Buffer.from('<?xml version="1.0"?><urlset>último catálogo</urlset>\n');
    await writeFile(options.outputFile, anterior);
    await assert.rejects(generarSitemap({ ...options, fetchImpl }));
    assert.deepEqual(await readFile(options.outputFile), anterior);
    assert.deepEqual(await readdir(options.dir), ['sitemap.xml']);
  });
}

test('el timeout conserva el sitemap anterior', async t => {
  const options = await entorno(t);
  await writeFile(options.outputFile, 'anterior');
  const fetchImpl = (_url, { signal }) => new Promise((_resolve, reject) => {
    const keepAlive = setTimeout(() => reject(new Error('El timeout no abortó')), 1000);
    signal.addEventListener('abort', () => { clearTimeout(keepAlive); reject(signal.reason); }, { once: true });
  });
  await assert.rejects(generarSitemap({ ...options, fetchImpl, timeoutMs: 10 }), { name: 'TimeoutError' });
  assert.equal(await readFile(options.outputFile, 'utf8'), 'anterior');
});

test('si no hay archivo anterior, un fallo no crea un sitemap de solo listado', async t => {
  const options = await entorno(t);
  await assert.rejects(generarSitemap({ ...options, fetchImpl: fallos['red caída'] }));
  assert.deepEqual(await readdir(options.dir), []);
});

test('un catálogo completo con todos los tours inactivos permite retirar sus URLs', async t => {
  const options = await entorno(t);
  const result = await generarSitemap({ ...options, fetchImpl: respuesta([registro(1, 'tour-retirado', false)]) });
  assert.equal(result.cantidad, 3);
  assert.doesNotMatch(await readFile(options.outputFile, 'utf8'), /tour-retirado/);
});
