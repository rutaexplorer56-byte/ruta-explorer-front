import { Link, useLocation } from 'react-router-dom';
import { getTourUrl } from '../utils/tourUrls';

/* eslint-disable react/prop-types */
export default function TourLink({ slug, referral, children, ...props }) {
  const { search } = useLocation();
  const to = getTourUrl(slug, referral, search);
  // Solicitar el documento permite que cPanel responda 404/301 antes de cargar React.
  return to ? <Link {...props} to={to} reloadDocument>{children}</Link> : null;
}
