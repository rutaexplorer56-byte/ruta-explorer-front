import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { getTourUrl, getTourPublicPath, getReservationHotel, normalizeRef, withReferral } from '../src/utils/tourUrls.js';
import { localizedSeoUrls, SEO_LANGUAGES } from '../src/utils/seoLanguages.js';

test('one product path, optional referral and one public basename', () => {
  assert.equal(getTourUrl('cocora-cabalgata'), '/tour/cocora-cabalgata');
  assert.equal(getTourUrl('cocora-cabalgata', 'RutaExplorer'), '/tour/cocora-cabalgata');
  assert.equal(getTourUrl('cocora-cabalgata', 'salentoReal'), '/tour/cocora-cabalgata?ref=salentoReal');
  assert.equal(getTourPublicPath('cocora-cabalgata'), '/app/tour/cocora-cabalgata');
});

test('absent or invalid slugs never create a link', () => {
  for (const slug of [undefined, null, '', 'undefined', 'null', 'a/b', '../a', 'a?ref=x', 'a#x']) {
    assert.equal(getTourUrl(slug, 'hotel1'), null);
    assert.equal(getTourPublicPath(slug), null);
  }
  assert.ok(getTourUrl('tour-salento---valle-del-cocora-finca-cafetera'));
});

test('ref and lang survive navigation and are encoded as query values', () => {
  const url = getTourUrl('cocora', undefined, '?ref=hotel1&lang=en');
  const parsed = new URL(url, 'https://rutaxplorer.com');
  assert.equal(parsed.searchParams.get('ref'), 'hotel1');
  assert.equal(parsed.searchParams.get('lang'), 'en');
  assert.equal(withReferral('/tours', undefined, parsed.search), '/tours?lang=en&ref=hotel1');
  const special = new URL(getTourUrl('cocora', 'Hotel Café & Spa + 1'), parsed);
  assert.equal(special.searchParams.get('ref'), 'Hotel Café & Spa + 1');
  assert.equal([...special.searchParams].length, 1);
});

test('legacy origin takes precedence and preserves language', () => {
  const hotel = new URL(getTourUrl('cocora', 'hotel1', '?ref=hotel2&lang=fr'), 'https://rutaxplorer.com');
  assert.equal(hotel.searchParams.get('ref'), 'hotel1');
  assert.equal(hotel.searchParams.getAll('ref').length, 1);
  assert.equal(hotel.searchParams.get('lang'), 'fr');
  assert.equal(getTourUrl('cocora', 'RutaExplorer', '?lang=en'), '/tour/cocora?lang=en');
});

test('reservation attribution defaults without stale storage and preserves receptionist', () => {
  for (const ref of [null, undefined, '', ' ', 'undefined', 'null', '<script>', 'x\ny', 'x'.repeat(256)]) {
    assert.equal(normalizeRef(ref), 'RutaExplorer');
    assert.equal(getReservationHotel(ref), 'RutaExplorer');
  }
  assert.equal(getReservationHotel(' salentoReal '), 'salentoReal');
  assert.equal(getReservationHotel('salentoReal', ' Ana '), 'salentoReal - Ana');
  assert.equal(getReservationHotel(null, 'Recepcion'), 'RutaExplorer - Recepcion');
});

test('checked-in sitemap contains only official tour URLs', async () => {
  const sitemap = await readFile(new URL('../public/sitemap.xml', import.meta.url), 'utf8');
  const locations = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(match => match[1]);
  assert.ok(locations.length > 1);
  for (const loc of locations.filter(loc => loc.includes('/tour/'))) {
    const url = new URL(loc);
    const slug = url.pathname.split('/').at(-1);
    assert.equal(url.pathname, getTourPublicPath(slug));
    assert.ok(SEO_LANGUAGES.includes(url.searchParams.get('lang')));
    assert.equal(loc, localizedSeoUrls(url.pathname, url.origin, url.searchParams.get('lang')).canonical);
  }
});
