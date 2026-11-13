import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function UrlLanguage() {
  const { search, pathname } = useLocation();
  const { i18n } = useTranslation();
  useEffect(() => {
    const requested = new URLSearchParams(search).get('lang');
    const lang = /^\/tour\//.test(pathname) && !['es', 'en', 'fr'].includes(requested) ? 'es' : requested;
    if (['es', 'en', 'fr'].includes(lang)) {
      i18n.changeLanguage(lang);
      localStorage.setItem('lang', lang);
    }
  }, [search, pathname, i18n]);
  useEffect(() => {
    document.documentElement.lang = ['es', 'en', 'fr'].includes(i18n.language) ? i18n.language : 'es';
  }, [i18n.language]);
  return null;
}
