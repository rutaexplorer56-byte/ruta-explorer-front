export const METODOS_PAGO = ['bold', 'transferencia', 'efectivo', 'transferencia_sin', 'efectivo_sin'];
export function metodosPermitidos(valor) {
  if (valor == null) return ['bold', 'transferencia', 'efectivo'];
  if (typeof valor === 'string') {
    try { valor = JSON.parse(valor); } catch { return []; }
  }
  if (!Array.isArray(valor) || valor.some(m => !METODOS_PAGO.includes(m))) return [];
  return METODOS_PAGO.filter(m => valor.includes(m));
}

export function cotizarPago(totalAntesDescuento, metodoPago = 'bold') {
  const porcentajeDescuento = ['transferencia', 'efectivo'].includes(metodoPago) ? 7 : 0;
  const valorDescuento = Math.round(totalAntesDescuento * porcentajeDescuento / 100);
  return { totalAntesDescuento, porcentajeDescuento, valorDescuento, valorTotal: totalAntesDescuento - valorDescuento };
}
