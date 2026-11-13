import { useEffect } from "react";
import { useTranslation } from 'react-i18next';
import { localizedSeoUrls, OG_LOCALES, seoLanguage } from '../utils/seoLanguages';

const SITE_URL = (import.meta.env.VITE_SITE_URL || "https://rutaxplorer.com").replace(/\/$/, "");
const DEFAULT_IMAGE = `${SITE_URL}/app/foto-principal-rutaxplorer.jpeg`;

function setMeta(selector, attributes) {
  let element = document.head.querySelector(selector);
  if (!element) {
    element = document.createElement("meta");
    document.head.appendChild(element);
  }
  Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, value));
}

function setLink(rel, href, hreflang) {
  const selector = hreflang
    ? `link[rel="${rel}"][hreflang="${hreflang}"]`
    : `link[rel="${rel}"]:not([hreflang])`;
  let element = document.head.querySelector(selector);
  if (!element) {
    element = document.createElement("link");
    element.rel = rel;
    if (hreflang) element.hreflang = hreflang;
    document.head.appendChild(element);
  }
  element.href = href;
}

export default function Seo({
  title,
  description,
  image = DEFAULT_IMAGE,
  path,
  type = "website",
  noIndex = false,
  jsonLd,
}) {
  const { i18n } = useTranslation();
  const language = seoLanguage((i18n.resolvedLanguage || i18n.language || 'es').split('-')[0]);
  useEffect(() => {
    const { canonical, alternates, defaultUrl } = localizedSeoUrls(path || window.location.pathname, SITE_URL, language);
    const cleanDescription = String(description || "").replace(/\s+/g, " ").trim().slice(0, 160);
    document.documentElement.lang = language;

    document.title = title;
    setMeta('meta[name="description"]', { name: "description", content: cleanDescription });
    setMeta('meta[name="robots"]', {
      name: "robots",
      content: noIndex ? "noindex, nofollow" : "index, follow, max-image-preview:large",
    });
    setMeta('meta[property="og:title"]', { property: "og:title", content: title });
    setMeta('meta[property="og:description"]', { property: "og:description", content: cleanDescription });
    setMeta('meta[property="og:type"]', { property: "og:type", content: type });
    setMeta('meta[property="og:url"]', { property: "og:url", content: canonical });
    setMeta('meta[property="og:image"]', { property: "og:image", content: image || DEFAULT_IMAGE });
    setMeta('meta[property="og:locale"]', { property: "og:locale", content: OG_LOCALES[language] });
    setMeta('meta[name="twitter:card"]', { name: "twitter:card", content: "summary_large_image" });
    setMeta('meta[name="twitter:title"]', { name: "twitter:title", content: title });
    setMeta('meta[name="twitter:description"]', { name: "twitter:description", content: cleanDescription });
    setMeta('meta[name="twitter:image"]', { name: "twitter:image", content: image || DEFAULT_IMAGE });
    setLink("canonical", canonical);

    Object.entries(alternates).forEach(([lang, url]) => setLink('alternate', url, lang));
    setLink("alternate", defaultUrl, "x-default");

    let script = document.head.querySelector('#seo-json-ld');
    if (jsonLd) {
      if (!script) {
        script = document.createElement("script");
        script.id = "seo-json-ld";
        script.type = "application/ld+json";
        document.head.appendChild(script);
      }
      script.textContent = JSON.stringify(jsonLd);
    } else if (script) {
      script.remove();
    }
  }, [title, description, image, path, type, noIndex, jsonLd, language]);

  return null;
}
