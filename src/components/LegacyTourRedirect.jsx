import { Navigate, useLocation, useParams } from 'react-router-dom';
import { DEFAULT_REF, getTourUrl, withReferral } from '../utils/tourUrls';

// Fallback for Vite and client navigation. Apache handles HTTP 301 in production.
export default function LegacyTourRedirect() {
  const { hotel, slug } = useParams();
  const { search, hash } = useLocation();
  const referral = hotel === DEFAULT_REF ? undefined : hotel;
  const to = slug ? getTourUrl(slug, referral, search) : withReferral('/tours', referral, search);
  return <Navigate replace to={`${to || '/tours'}${hash}`} />;
}
