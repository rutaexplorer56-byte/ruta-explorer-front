import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { pathToFileURL } from 'node:url';
import process from 'node:process';
import { loadEnv } from 'vite';
import { normalizarTour } from '../src/utils/datosApi.js';
import { getTourPublicPath } from '../src/utils/tourUrls.js';
import { SEO_LANGUAGES, OG_LOCALES, seoLanguage, localizedSeoUrls, tourSeoDescription } from '../src/utils/seoLanguages.js';

const root = resolve(import.meta.dirname, '..');
const escapeHtml = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');
const textoPlano = value => String(value || '')
  .replace(/<script\b[^>]*>[\s\S]*?<\/script\s*>/gi, '')
  .replace(/<style\b[^>]*>[\s\S]*?<\/style\s*>/gi, '')
  .replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

function origenPublico(value) {
  const url = new URL(value);
  if (url.protocol !== 'https:' || url.username || url.password || url.search || url.hash || url.pathname !== '/') {
    throw new Error('Configura los orígenes públicos HTTPS, sin rutas, credenciales ni parámetros.');
  }
  return url.origin;
}

export function seleccionarTours(catalogo) {
  if (!Array.isArray(catalogo) || !catalogo.length) throw new Error('Catálogo de tours vacío o inválido.');
  const ids = new Set(), slugs = new Set(), activos = [];
  for (const registro of catalogo) {
    const tour = normalizarTour(registro);
    if (!tour || ids.has(tour.id) || ![true, false, 0, 1, '0', '1', 'true', 'false'].includes(registro.activo)) {
      throw new Error('El catálogo contiene registros inválidos, repetidos o sin estado conocido.');
    }
    ids.add(tour.id);
    if (!tour.activo) continue;
    if (!getTourPublicPath(tour.slug) || tour.slug.length > 255 || slugs.has(tour.slug) || !textoPlano(tour.nombre)) {
      throw new Error(`Tour activo ${tour.id}: nombre o slug inválido/duplicado.`);
    }
    slugs.add(tour.slug); activos.push(tour);
  }
  return activos;
}

export function crearHtmlTour(template, tour, siteUrl = 'https://rutaxplorer.com', requestedLanguage = 'es') {
  const origin = origenPublico(siteUrl);
  const language = seoLanguage(requestedLanguage);
  const { canonical, alternates, defaultUrl } = localizedSeoUrls(getTourPublicPath(tour.slug), origin, language);
  const title = `${textoPlano(tour.nombre)} | Ruta Xplorer`;
  const description = tourSeoDescription(textoPlano(tour.descripcion), textoPlano(tour.nombre), language);
  let image = `${origin}/app/foto-principal-rutaxplorer.jpeg`;
  if (tour.fotos?.[0]) {
    try {
      const candidate = new URL(tour.fotos[0], `${origin}/app/`);
      if (['https:', 'http:'].includes(candidate.protocol) && !candidate.username && !candidate.password) image = candidate.href;
    } catch { /* Imagen genérica si la URL no es válida. */ }
  }
  const meta = (attribute, name, value) => `<meta ${attribute}="${name}" content="${escapeHtml(value)}" />`;
  const tags = [
    `<title>${escapeHtml(title)}</title>`,
    meta('name', 'description', description),
    `<link rel="canonical" href="${escapeHtml(canonical)}" />`,
    ...Object.entries({ ...alternates, 'x-default': defaultUrl }).map(([lang, url]) => `<link rel="alternate" hreflang="${lang}" href="${escapeHtml(url)}" />`),
    ...Object.entries({ title, description, image, url: canonical, type: 'product', locale: OG_LOCALES[language] })
      .map(([name, value]) => meta('property', `og:${name}`, value)),
    ...Object.entries({ card: 'summary_large_image', title, description, image })
      .map(([name, value]) => meta('name', `twitter:${name}`, value)),
  ].join('\n    ');
  if (!/<head\b[^>]*>[\s\S]*?<\/head>/i.test(template)) throw new Error('El build no contiene un head HTML válido.');
  return template.replace(/<html\b([^>]*)>/i, (_, attrs) => `<html${attrs.replace(/\s+lang\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '')} lang="${language}">`)
    .replace(/(<head\b[^>]*>)([\s\S]*?)(<\/head>)/i, (_, start, head, end) => {
    const clean = head.replace(/<title\b[^>]*>[\s\S]*?<\/title>/gi, '')
      .replace(/<meta\b[^>]*>/gi, tag => /\b(?:name|property)\s*=\s*["'](?:description|og:[^"']*|twitter:[^"']*)["']/i.test(tag) ? '' : tag)
      .replace(/<link\b[^>]*>/gi, tag => /\brel\s*=\s*["']canonical["']/i.test(tag) || /\bhreflang\s*=/i.test(tag) ? '' : tag);
    return `${start}${clean}\n    ${tags}\n  ${end}`;
  });
}

export async function prerenderTours({ apiUrl, siteUrl = 'https://rutaxplorer.com', outDir = resolve(root, 'dist'), fetchImpl = fetch, timeoutMs = 10000 }) {
  const api = origenPublico(apiUrl);
  origenPublico(siteUrl);
  const catalogs = await Promise.all(SEO_LANGUAGES.map(async language => {
    const response = await fetchImpl(`${api}/api/tours?lang=${language}`, { signal: AbortSignal.timeout(timeoutMs) });
    if (!response.ok || response.status === 206) throw new Error(`La API (${language}) respondió ${response.status}.`);
    return seleccionarTours(await response.json());
  }));
  const identity = tours => tours.map(t => `${t.id}:${t.slug}`).sort().join('|');
  if (catalogs.some(tours => identity(tours) !== identity(catalogs[0]))) throw new Error('Los catálogos por idioma no coinciden. Reintenta el build.');
  const template = await readFile(join(outDir, 'index.html'), 'utf8');
  // Preparar todos los documentos antes de escribir; Vite limpia dist en cada build.
  const paginas = catalogs.flatMap((tours, index) => tours.map(tour => ({
    slug: `${tour.slug}.${SEO_LANGUAGES[index]}`, html: crearHtmlTour(template, tour, siteUrl, SEO_LANGUAGES[index]),
  })));
  await mkdir(join(outDir, 'tour'), { recursive: true });
  for (const pagina of paginas) await writeFile(join(outDir, 'tour', `${pagina.slug}.html`), pagina.html, 'utf8');
  return paginas.length;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try {
    const env = loadEnv('production', root, 'VITE_');
    const cantidad = await prerenderTours({
      apiUrl: (process.env.VITE_API_URL || env.VITE_API_URL || '').trim(),
      siteUrl: (process.env.VITE_SITE_URL || env.VITE_SITE_URL || 'https://rutaxplorer.com').trim(),
    });
    console.log(`Metadatos iniciales generados: ${cantidad} documentos ES/EN/FR en dist/tour/.`);
  } catch (error) {
    console.error(`No se completó el prerender: ${error.message} No publiques este build.`);
    process.exitCode = 1;
  }
}
