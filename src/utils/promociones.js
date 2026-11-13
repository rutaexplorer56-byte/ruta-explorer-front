export function fechaColombia(ahora = new Date()) {
  const partes = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Bogota', year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(ahora);
  const campo = tipo => partes.find(parte => parte.type === tipo).value;
  return `${campo('year')}-${campo('month')}-${campo('day')}`;
}

const activa = valor => valor === true || valor === 1 || valor === 'true' || valor === '1';
const precioValido = valor => (typeof valor === 'number' || typeof valor === 'string') &&
  Number.isInteger(Number(valor)) && Number(valor) > 0 && Number(valor) <= 2147483647;
function fechaValida(fecha) {
  if (typeof fecha !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(fecha)) return false;
  const date = new Date(`${fecha}T00:00:00Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === fecha;
}

// Una sola regla para cards, filtros, detalle y cálculo en el navegador.
// El backend vuelve a verificar estas condiciones antes de guardar la reserva.
export function promocionVigente(tour, hoy = fechaColombia()) {
  return !!tour && activa(tour.promocionActiva) && precioValido(tour.precioPromocion) &&
    fechaValida(tour.fechaInicioPromocion) && fechaValida(tour.fechaFinPromocion) &&
    tour.fechaInicioPromocion <= hoy && hoy <= tour.fechaFinPromocion;
}

export function aplicaPromocion(tour, personas, hoy = fechaColombia()) {
  const cantidad = Number(personas);
  return promocionVigente(tour, hoy) && Number.isInteger(cantidad) && cantidad >= 1 &&
    cantidad >= Number(tour.cantidadMinima ?? 1) && cantidad <= Number(tour.cantidadMaxima ?? Infinity) &&
    (tour.tipo === 'privado' || tour.tipo === 'compartido');
}

export function promocionVisible(tour, hoy = fechaColombia()) {
  return aplicaPromocion(tour, Number(tour?.cantidadMinima ?? 1), hoy);
}

export function precioAplicableTour(tour, personas, precioNormal, hoy = fechaColombia()) {
  return aplicaPromocion(tour, personas, hoy) ? Number(tour.precioPromocion) : Number(precioNormal);
}

export function validarPromocionFormulario(datos) {
  const { precioPromocion, fechaInicioPromocion, fechaFinPromocion } = datos;
  if (datos.promocionActiva) {
    if (!precioValido(precioPromocion)) throw new Error('Ingresa un precio promocional entero mayor a cero.');
    if (!fechaValida(fechaInicioPromocion) || !fechaValida(fechaFinPromocion)) {
      throw new Error('Selecciona las fechas de inicio y finalización de la promoción.');
    }
  }
  if (fechaInicioPromocion && fechaFinPromocion && fechaFinPromocion < fechaInicioPromocion) {
    throw new Error('La fecha final de la promoción no puede ser anterior a la inicial.');
  }
}
