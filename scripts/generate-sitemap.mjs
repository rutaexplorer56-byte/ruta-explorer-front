import { writeFile, mkdir, rename, unlink } from "node:fs/promises";
import { randomUUID } from 'node:crypto';
import { pathToFileURL } from 'node:url';
import { loadEnv } from 'vite';
import { normalizarTour } from '../src/utils/datosApi.js';
import { getTourPublicPath } from '../src/utils/tourUrls.js';
import { SEO_LANGUAGES, localizedSeoUrls } from '../src/utils/seoLanguages.js';
import { resolve, dirname } from "node:path";

const root = resolve(import.meta.dirname, "..");
const siteUrl = "https://rutaxplorer.com";

const escapeXml = (value) => String(value)
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&apos;");

async function productionApiUrl() {
  const env = loadEnv('production', root, 'VITE_');
  return (process.env.VITE_API_URL || env.VITE_API_URL || '').trim().replace(/\/+$/, '');
}

export function validarCatalogo(catalogo) {
  // Este endpoint devuelve el catálogo completo, no una página ni un objeto envoltorio.
  // Una respuesta vacía se considera sospechosa: requiere revisión antes de retirar todas las URLs.
  if (!Array.isArray(catalogo) || catalogo.length === 0) {
    throw new Error('La API no devolvió un catálogo completo no vacío.');
  }
  const ids = new Set();
  const tours = catalogo.map(registro => {
    const tour = normalizarTour(registro);
    if (!tour || ids.has(tour.id) || ![true, false, 0, 1, '0', '1', 'true', 'false'].includes(registro.activo)) {
      throw new Error('El catálogo contiene registros inválidos, repetidos o sin estado activo conocido.');
    }
    ids.add(tour.id);
    return tour;
  });
  const activos = tours.filter(tour => tour.activo);
  const validos = activos.filter(tour => getTourPublicPath(tour.slug));
  if (activos.length && !validos.length) {
    throw new Error('Ningún tour activo tiene un slug válido. Se conserva el sitemap anterior.');
  }
  return { tours: validos, omitidos: activos.length - validos.length };
}

export function crearSitemap(tours) {
const urls = [
  ...SEO_LANGUAGES.map(lang => ({ loc: localizedSeoUrls('/app/tours', siteUrl, lang).canonical, priority: "1.0", changefreq: "weekly" })),
  ...[...new Map(tours.map(tour => [tour.slug, tour])).values()].flatMap(tour => SEO_LANGUAGES.map(lang => ({
    loc: localizedSeoUrls(getTourPublicPath(tour.slug), siteUrl, lang).canonical,
    priority: "0.8",
    changefreq: "weekly",
    image: tour.fotos?.[0],
    title: tour.nombre,
  }))),
];

const entries = urls.map(({ loc, priority, changefreq, image, title }) => `  <url>
    <loc>${escapeXml(loc)}</loc>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>${image ? `
    <image:image>
      <image:loc>${escapeXml(image)}</image:loc>
      <image:title>${escapeXml(title)}</image:title>
    </image:image>` : ""}
  </url>`).join("\n");

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${entries}
</urlset>
`;
  return { sitemap, cantidad: urls.length };
}

export async function generarSitemap({ apiUrl, outputFile = resolve(root, 'public', 'sitemap.xml'), fetchImpl = fetch, timeoutMs = 10000 }) {
  if (!apiUrl) throw new Error('VITE_API_URL no está configurada.');
  const response = await fetchImpl(`${apiUrl.replace(/\/+$/, '')}/api/tours?lang=es`, {
    signal: AbortSignal.timeout(timeoutMs),
  });
  if (!response.ok || response.status === 206) throw new Error(`La API respondió ${response.status}.`);
  const { tours, omitidos } = validarCatalogo(await response.json());
  const { sitemap, cantidad } = crearSitemap(tours);

  // Escribir en el mismo directorio y renombrar solo al completar el archivo.
  // Un fallo de consulta, validación o escritura no trunca el sitemap existente.
  const temporal = `${outputFile}.${randomUUID()}.tmp`;
  await mkdir(dirname(outputFile), { recursive: true });
  try {
    await writeFile(temporal, sitemap, { encoding: 'utf8', flag: 'wx' });
    await rename(temporal, outputFile);
  } finally {
    await unlink(temporal).catch(error => { if (error.code !== 'ENOENT') throw error; });
  }
  return { cantidad, omitidos };
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try {
    const { cantidad, omitidos } = await generarSitemap({ apiUrl: await productionApiUrl() });
    console.log(`Sitemap generado con ${cantidad} URL(s). Slugs activos inválidos omitidos: ${omitidos}.`);
  } catch (error) {
    console.error(`No se actualizó el sitemap: ${error.message} El archivo anterior se conserva; se detiene el build.`);
    process.exitCode = 1;
  }
}
