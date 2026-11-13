/* eslint-disable no-control-regex -- Reject control characters in public referral metadata. */
export const DEFAULT_REF = 'RutaExplorer';
export const APP_BASE = '/app';

export function normalizeRef(value) {
  if (typeof value !== 'string') return DEFAULT_REF;
  const ref = value.trim();
  return !ref || /^(undefined|null)$/i.test(ref) || ref.length > 255 || /[\u0000-\u001f\u007f<>]/.test(ref)
    ? DEFAULT_REF : ref;
}

export function validTourSlug(slug) {
  return typeof slug === 'string' && /^[a-z0-9]+(?:-[a-z0-9-]+)*$/.test(slug)
    && !['undefined', 'null'].includes(slug);
}

// Router paths omit /app; public/SEO paths add it exactly once.
export function getTourUrl(slug, ref, search = '') {
  if (!validTourSlug(slug)) return null;
  return withReferral(`/tour/${slug}`, ref, search);
}

export function withReferral(path, ref, search = '') {
  const params = new URLSearchParams(search);
  const origin = normalizeRef(ref ?? params.get('ref'));
  params.delete('ref');
  if (origin !== DEFAULT_REF) params.set('ref', origin);
  const query = params.toString();
  return path + (query ? `?${query}` : '');
}

export function getTourPublicPath(slug) {
  const path = getTourUrl(slug);
  return path ? `${APP_BASE}${path}` : null;
}

export function getReservationHotel(ref, receptionist = '') {
  const origin = normalizeRef(ref);
  const name = typeof receptionist === 'string' ? receptionist.trim().replace(/[\u0000-\u001f\u007f<>]/g, '') : '';
  // Preserve the historical suffix used by the admin and hotel emails.
  return name ? `${origin} - ${name}`.slice(0, 255) : origin;
}
