export function precioAplicableExtra(extra, personas) {
  if (!extra || (extra.precios != null && !Array.isArray(extra.precios))) return null;
  const precioValido = (valor, min = 0) => (typeof valor === 'number' || (typeof valor === 'string' && valor.trim() !== '')) && Number.isInteger(Number(valor)) && Number(valor) >= min && Number(valor) <= 2147483647;
  if (extra.activo === false || extra.activo === 0 || !Number.isInteger(Number(personas)) || Number(personas) < 1) return null;
  if (extra.precios?.length) {
    const tarifa = extra.precios.find((precio) => precio && Number(precio.personas) === Number(personas));
    return tarifa && precioValido(tarifa.valor, 1) ? Number(tarifa.valor) : null;
  }
  return precioValido(extra.valor) ? Number(extra.valor) : null;
}

export function detalleExtras(extras, seleccion, personas) {
  return (Array.isArray(extras) ? extras : []).filter(Boolean).flatMap((extra) => {
    const valor = precioAplicableExtra(extra, personas);
    const cantidad = Number(seleccion?.[extra.id] || 0);
    if (valor === null || cantidad <= 0) return [];
    return [{ id: extra.id, nombre: extra.nombre, cantidad, personas: Number(personas), valor, subtotal: cantidad * valor }];
  });
}

export function prepararExtras(extras, anteriores = []) {
  const nombres = new Set();
  return (extras || []).map((extra) => {
    const nombre = String(extra.nombre || '').trim();
    if (!nombre || nombre.length > 120 || nombres.has(nombre.toLowerCase())) {
      throw new Error('Cada extra debe tener un nombre único de hasta 120 caracteres.');
    }
    nombres.add(nombre.toLowerCase());
    const enteroPositivo = (v) => Number.isInteger(Number(v)) && Number(v) > 0 && Number(v) <= 2147483647;
    if (!enteroPositivo(extra.maxCantidad)) throw new Error(`Revisa la cantidad máxima de ${nombre}.`);
    const cantidades = new Set();
    const precios = (extra.precios || []).map((p) => {
      if (!enteroPositivo(p.personas) || !enteroPositivo(p.valor)) {
        throw new Error(`En ${nombre}, cada tarifa debe tener personas y precio enteros mayores a cero.`);
      }
      if (cantidades.has(Number(p.personas))) throw new Error(`Hay cantidades de personas repetidas en ${nombre}.`);
      cantidades.add(Number(p.personas));
      return { personas: Number(p.personas), valor: Number(p.valor) };
    });
    const valor = Number(extra.valor);
    const anterior = anteriores.find((ex) => ex.id === extra.id);
    const conservarGratuito = anterior && !anterior.precios?.length && Number(anterior.valor) === 0 && extra.valor !== '' && valor === 0;
    if (!precios.length && !enteroPositivo(extra.valor) && !conservarGratuito) {
      throw new Error(`Configura una tarifa o un precio fijo mayor a cero para ${nombre}.`);
    }
    return { ...extra, nombre, maxCantidad: Number(extra.maxCantidad), valor: Number.isInteger(valor) && valor >= 0 ? valor : 0, precios };
  });
}
