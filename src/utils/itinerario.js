export const TIPOS_ITINERARIO = ['salida', 'transporte', 'actividad', 'llegada'];

// Mantiene los separadores del formato anterior sin volver a escribir su texto.
export function leerItinerarioAntiguo(texto = '') {
  return String(texto || '').split('-').map(item => item.trim()).filter(Boolean).map((item, index) => {
    if (!item.includes('|')) {
      return { orden: index + 1, tipo: '', titulo: item, descripcion: '' };
    }
    const [tipo, titulo, ...descripcion] = item.split('|');
    return {
      orden: index + 1,
      tipo: tipo.trim(),
      titulo: titulo?.trim() || item,
      descripcion: descripcion.join('|').trim(),
    };
  });
}

export function obtenerItinerario(tour) {
  if (Array.isArray(tour?.itinerarioPasos) && tour.itinerarioPasos.length) {
    return [...tour.itinerarioPasos].sort((a, b) => Number(a.orden) - Number(b.orden));
  }
  return leerItinerarioAntiguo(tour?.itinerario);
}

export function importarItinerarioAntiguo(texto) {
  return leerItinerarioAntiguo(texto).map(paso => ({
    ...paso,
    tipo: TIPOS_ITINERARIO.includes(paso.tipo) ? paso.tipo : 'actividad',
    claveLocal: crypto.randomUUID(),
  }));
}

export function moverPasoItinerario(pasos, desde, hacia) {
  if (desde < 0 || hacia < 0 || desde >= pasos.length || hacia >= pasos.length) return pasos;
  const nuevos = [...pasos];
  const [paso] = nuevos.splice(desde, 1);
  nuevos.splice(hacia, 0, paso);
  return nuevos;
}

export function prepararItinerario(pasos = []) {
  return (pasos ?? []).map((paso, index) => {
    const titulo = String(paso.titulo || '').trim();
    const descripcion = String(paso.descripcion || '').trim();
    if (!titulo || !descripcion) throw new Error(`Completa el título y la descripción del paso ${index + 1}.`);
    if (titulo.length > 255) throw new Error(`El título del paso ${index + 1} no puede superar 255 caracteres.`);
    if (new TextEncoder().encode(descripcion).length > 65535) throw new Error(`La descripción del paso ${index + 1} es demasiado larga.`);
    if (!TIPOS_ITINERARIO.includes(paso.tipo)) throw new Error(`Selecciona el tipo del paso ${index + 1}.`);
    return {
      ...(paso.id !== undefined ? { id: paso.id } : {}),
      orden: index + 1, tipo: paso.tipo, titulo, descripcion,
    };
  });
}
