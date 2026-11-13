export const SEO_LANGUAGES = ['es', 'en', 'fr'];
export const OG_LOCALES = { es: 'es_CO', en: 'en_US', fr: 'fr_FR' };
export const seoLanguage = value => SEO_LANGUAGES.includes(value) ? value : 'es';

export function localizedSeoUrls(path, origin, language) {
  const base = new URL(path, origin);
  base.search = '';
  base.hash = '';
  const alternates = Object.fromEntries(SEO_LANGUAGES.map(lang => {
    const url = new URL(base);
    url.searchParams.set('lang', lang);
    return [lang, url.href];
  }));
  return { canonical: alternates[seoLanguage(language)], alternates, defaultUrl: alternates.es };
}

export function tourSeoDescription(description, name, language) {
  const fallback = {
    es: `Descubre ${name} con Ruta Xplorer.`,
    en: `Discover ${name} with Ruta Xplorer.`,
    fr: `Découvrez ${name} avec Ruta Xplorer.`,
  };
  return (String(description || '').replace(/\s+/g, ' ').trim() || fallback[seoLanguage(language)]).slice(0, 160);
}
