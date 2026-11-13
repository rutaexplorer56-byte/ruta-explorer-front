// Normaliza únicamente datos leídos; nunca convierte un precio ausente en cero.
import { metodosPermitidos } from './pagos.js';
export const esRegistro = valor => !!valor && typeof valor === 'object' && !Array.isArray(valor);
export const texto = valor => typeof valor === 'string' ? valor : '';
export const numero = valor => (typeof valor === 'number' || (typeof valor === 'string' && valor.trim())) && Number.isFinite(Number(valor)) ? Number(valor) : null;
export const booleano = valor => valor === true || valor === 1 || valor === '1' || valor === 'true';
export function lista(valor) {
  if (typeof valor === 'string') {
    try { valor = JSON.parse(valor); } catch { return []; }
  }
  return Array.isArray(valor) ? valor : [];
}
const registros = valor => lista(valor).filter(esRegistro);

export function normalizarTour(valor) {
  if (!esRegistro(valor) || !Number.isInteger(numero(valor.id)) || numero(valor.id) < 1) return null;
  const tour = { ...valor };
  tour.mostrarReservasCalendario = booleano(valor.mostrarReservasCalendario);
  tour.metodosPago = metodosPermitidos(valor.metodosPago);
  for (const campo of ['nombre', 'descripcion', 'incluido', 'recomendaciones', 'salidas', 'salida', 'idioma', 'tiempo', 'itinerario', 'slug', 'categoria', 'subCategoria']) {
    tour[campo] = typeof valor[campo] === 'number' ? String(valor[campo]) : texto(valor[campo]);
  }
  for (const campo of ['precio', 'precioPromocion', 'cantidadMinima', 'cantidadMaxima', 'toursPorDia', 'horaLimite']) tour[campo] = numero(valor[campo]);
  for (const campo of ['activo', 'promocionActiva', 'reservaUltimaHora']) tour[campo] = booleano(valor[campo]);
  for (const campo of ['diasNoDisponibles', 'fechasNoDisponibles']) tour[campo] = Array.isArray(valor[campo]) ? valor[campo].filter(v => typeof v === 'string' || typeof v === 'number').join(',') : texto(valor[campo]);
  tour.fotos = lista(valor.fotos).filter(src => typeof src === 'string' && src.trim());
  tour.precios = registros(valor.precios).map(p => ({ ...p, personas: numero(p.personas), precioPorPersona: numero(p.precioPorPersona) }));
  tour.extras = registros(valor.extras).map(extra => ({ ...extra, nombre: texto(extra.nombre), precios: registros(extra.precios), activo: (extra.precios == null || (Array.isArray(extra.precios) && extra.precios.every(esRegistro))) && (extra.activo == null ? true : booleano(extra.activo)) }));
  tour.itinerarioPasos = registros(valor.itinerarioPasos).map(p => ({ ...p, titulo: texto(p.titulo), descripcion: texto(p.descripcion), tipo: texto(p.tipo) }));
  return tour;
}

export function normalizarReserva(valor) {
  if (!esRegistro(valor) || !Number.isInteger(numero(valor.id)) || numero(valor.id) < 1) return null;
  const reserva = { ...valor, extras: registros(valor.extras).map(extra => ({ ...extra, nombre: texto(extra.nombre), valor: numero(extra.valor), subtotal: numero(extra.subtotal), cantidad: numero(extra.cantidad), personas: numero(extra.personas) })) };
  for (const campo of ['nombreTour', 'nombrePersona', 'correo', 'telefono', 'hotel', 'idioma', 'horario', 'salida', 'pais', 'hotelCliente', 'numeroDocumento']) reserva[campo] = texto(valor[campo]);
  for (const campo of ['estado', 'estadoPago', 'fecha', 'referenciaPago', 'tipoDocumento']) reserva[campo] = texto(valor[campo]);
  return reserva;
}

export function normalizarLista(entrada, normalizar) {
  if (entrada == null) return [];
  if (!Array.isArray(entrada)) throw new Error('La API no devolvió una lista válida.');
  return entrada.map(normalizar).filter(Boolean);
}

export function reservaHabilitada(tour) {
  if (!tour || !tour.activo || !['compartido', 'privado'].includes(tour.tipo)) return false;
  if (!metodosPermitidos(tour.metodosPago).length) return false;
  const min = numero(tour.cantidadMinima), max = numero(tour.cantidadMaxima);
  if (!Number.isInteger(min) || min < 1 || !Number.isInteger(max) || max < min) return false;
  if (!texto(tour.salidas).trim() || !texto(tour.idioma).trim()) return false;
  if (tour.tipo === 'compartido') return numero(tour.precio) > 0;
  return tarifasValidas(tour.precios).some(p => p.personas >= min && p.personas <= max);
}

export function tarifasValidas(precios) {
  return lista(precios).filter(p => p && Number.isInteger(numero(p.personas)) && numero(p.personas) > 0 && numero(p.precioPorPersona) > 0 && (p.activo == null || booleano(p.activo)));
}
