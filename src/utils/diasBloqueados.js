// Conserva el formato existente: 0 = domingo, 6 = sábado; lista separada por comas.
export function diasBloqueados(valor) {
  const texto = Array.isArray(valor) ? valor.join(',') : String(valor ?? '');
  return [...new Set(texto.replace(/["'[\]]/g, '').split(',')
    .map(dia => dia.trim()).filter(dia => /^[0-6]$/.test(dia)))].sort();
}
