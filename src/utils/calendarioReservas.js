export function fechaCalendario(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function leerConteosMes(data, anio, mes) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Conteos de calendario inválidos.');
  const prefijo = `${anio}-${String(mes).padStart(2, '0')}-`;
  const ultimoDia = new Date(anio, mes, 0).getDate();
  return Object.fromEntries(Object.entries(data).filter(([fecha, cantidad]) =>
    fecha.startsWith(prefijo) && /^\d{4}-\d{2}-\d{2}$/.test(fecha) && Number(fecha.slice(8)) >= 1 && Number(fecha.slice(8)) <= ultimoDia &&
    Number.isSafeInteger(cantidad) && cantidad > 0
  ));
}
