import axios from "axios";
import { normalizarTour, normalizarReserva, normalizarLista } from './utils/datosApi';

axios.defaults.baseURL = (import.meta.env.VITE_API_URL || '').trim().replace(/\/+$/, '');

// ✅ agrega lang automáticamente a TODAS las requests
axios.interceptors.request.use((config) => {
  if (!config.timeout && (config.method || 'get').toLowerCase() === 'get') config.timeout = 20000;
  const lang = (localStorage.getItem("lang") || "es").split("-")[0];

  config.params = config.params || {};
  // no pisar si ya viene lang manual
  if (!config.params.lang) {
    config.params.lang = lang;
  }

  return config;
});

axios.interceptors.response.use(response => {
  if ((response.config.method || 'get').toLowerCase() !== 'get') return response;
  const path = (response.config.url || '').split('?')[0].replace(/\/$/, '');
  if (path === '/api/tours' || path === '/api/tours/mas-reservados') {
    response.data = normalizarLista(response.data, normalizarTour);
  } else if (/^\/api\/tours\/(?:\d+|nombre\/[^/]+)$/.test(path)) {
    response.data = normalizarTour(response.data);
    if (!response.data) throw new Error('No se encontró información válida del tour.');
  } else if (path === '/api/reservas') {
    response.data = normalizarLista(response.data, normalizarReserva);
  } else if (/^\/api\/reservas\/(?:\d+|referencia\/[^/]+)$/.test(path)) {
    response.data = normalizarReserva(response.data);
    if (!response.data) throw new Error('No se encontró información válida de la reserva.');
  }
  return response;
});

export default axios;
