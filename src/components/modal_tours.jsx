import { useState, useEffect } from 'react';
import '../styles/modal_tours.css';
import axios from "../axiosConfig";
import { toast } from 'react-toastify';
import { useNavigate } from "react-router-dom";
import { prepararExtras } from "../utils/extras";
import { validarPromocionFormulario } from "../utils/promociones";
import '../styles/promocion.css';
import ItinerarioEditor from './ItinerarioEditor';
import { prepararItinerario } from '../utils/itinerario';
import { METODOS_PAGO, metodosPermitidos } from '../utils/pagos';
import { diasBloqueados } from '../utils/diasBloqueados';

/* eslint-disable react/prop-types */
const ModalAgregarTour = ({ isOpen, onClose, id, actualizarToursPadre }) => {
   const [imagenes, setImagenes] = useState([]);
   const [actualizarImagenes, setActualizarImagenes] = useState([]);
   const [tour, setTour] = useState(null);
   const [activo, setActivo] = useState("a");
   const [errorFormulario, setErrorFormulario] = useState("");
   const [imagenesEditadas, setImagenesEditadas] = useState(false);

   const [loadingCreate, setLoadingCreate] = useState(false);

   const MAX_FILE_SIZE_MB = 20;
   const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
   const navigate = useNavigate();



// elimina una foto EXISTENTE (URL) del tour en edición
const eliminarImagenExistente = (index) => {
  setActualizarImagenes(prev => prev.filter((_, i) => i !== index));
};
  const [formData, setFormData] = useState({
    nombre: '',
      metodosPago: metodosPermitidos(null),
    descripcion: '',
    idioma: '',
    incluido: '',
    recomendaciones: '',
    salida: '',
    categoria: '',
    subCategoria: '',
    salidas: '',
    tiempo: '',
    precio: '',
    promocionActiva: false,
    precioPromocion: '',
    fechaInicioPromocion: '',
    fechaFinPromocion: '',
    cantidadMaxima: '',
    toursPorDia: '',
    cantidadMinima: 1,
    tipo: 'compartido', // 'compartido' | 'privado'
    precios: [],// [{ personas, precioPorPersona }]
    horaLimite: '',            // ej: "18:00"
    itinerario: '',            // texto largo
    itinerarioPasos: [],
    reservaUltimaHora: false,
    mostrarReservasCalendario: false,
    extras: [],
     diasNoDisponibles: '',
  fechasNoDisponibles: [],
  fechaNoDisponibleTemp: '',
    
  });

  // -----------------------
  // Handlers generales
  // -----------------------
  const handleChange = (e) => {
    const { name, type,value,checked } = e.target;
    setFormData(prev => ({ ...prev, 
      [name]: type === "checkbox" ? checked : value }));
  };
const toNumber = (v) => {
  if (v === null || v === undefined) return 0;
  const limpio = String(v)
    .replace(/[^0-9,.-]/g, "")  // Quita espacios o símbolos
    .replace(/\./g, "")         // Elimina puntos de miles
    .replace(/,/g, ".");        // Cambia coma por punto
  return Number(limpio) || 0;   // Convierte a número exacto
};
// const toNumber = (v) => Number(String(v).replace(/[^\d.-]/g, '')) || 0;
const handleImageChange = (e) => {
  const archivosNuevos = Array.from(e.target.files);

  const totalActual =
    (actualizarImagenes?.length || 0) + (imagenes?.length || 0);

  const disponibles = 7 - totalActual;

  if (disponibles <= 0) {
    toast.info("Solo puedes subir un máximo de 7 imágenes.");
    e.target.value = "";
    return;
  }

  const archivoGrande = archivosNuevos.find(
    (file) => file.size > MAX_FILE_SIZE_BYTES
  );

  if (archivoGrande) {
    toast.error(
      `La imagen "${archivoGrande.name}" supera los ${MAX_FILE_SIZE_MB}MB permitidos.`
    );
    e.target.value = "";
    return;
  }

  const archivosLimitados = archivosNuevos.slice(0, disponibles);

  const archivosConPreview = archivosLimitados.map((file) => ({
    file,
    preview: URL.createObjectURL(file),
    name: file.name,
  }));

  setImagenes((prev) => [...prev, ...archivosConPreview]);
  setImagenesEditadas(true);

  if (archivosNuevos.length > disponibles) {
    toast.info("Solo puedes subir un máximo de 7 imágenes.");
  }

  e.target.value = "";
};

  const eliminarImagen = (index) => {
    setImagenes(prev => {
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
     setImagenesEditadas(true);
  };
const moverImagen = (fromIndex, toIndex) => {
  setImagenes((prev) => {
    const copia = [...prev];
    const [movida] = copia.splice(fromIndex, 1);
    copia.splice(toIndex, 0, movida);
    return copia;
  });
};
  // -----------------------
  // Escalones (privado)
  // -----------------------
  const agregarEscalon = () => {
    setFormData(prev => ({
      ...prev,
      precios: [...prev.precios, { personas: '', precioPorPersona: '' }]
    }));
  };

  const handleEscalonChange = (i, field, value) => {
    const nuevos = [...formData.precios];
    nuevos[i][field] = value;
    setFormData(prev => ({ ...prev, precios: nuevos }));
  };

  const eliminarEscalon = (i) => {
    setFormData(prev => ({
      ...prev,
      precios: prev.precios.filter((_, idx) => idx !== i)
    }));
  };



  const agregarExtra = () => {
  setFormData(prev => ({
    ...prev,
    extras: [...(prev.extras || []), { nombre: "", valor: "", maxCantidad: 1, precios: [{ personas: 1, valor: "" }] }]
  }));
};

const handleExtraChange = (i, field, value) => {
  setFormData(prev => ({ ...prev, extras: prev.extras.map((extra, index) => index === i ? { ...extra, [field]: value } : extra) }));
};

const cambiarTarifasExtra = (i, modificar) => {
  setFormData(prev => ({
    ...prev,
    extras: prev.extras.map((extra, index) => index === i
      ? { ...extra, precios: modificar(extra.precios || []) }
      : extra),
  }));
};

const eliminarExtra = (i) => {
  setFormData(prev => ({
    ...prev,
    extras: prev.extras.filter((_, idx) => idx !== i)
  }));



};


const limpiarComillas = (valor) => {
  if (valor === null || valor === undefined) return "";

  let limpio = String(valor).trim();

  // Quita comillas externas repetidas: "\"3\"" -> "3"
  while (
    (limpio.startsWith('"') && limpio.endsWith('"')) ||
    (limpio.startsWith("'") && limpio.endsWith("'"))
  ) {
    try {
      limpio = JSON.parse(limpio);
      limpio = String(limpio).trim();
    } catch {
      limpio = limpio.slice(1, -1).trim();
    }
  }

  return limpio;
};
  // -----------------------
  // Submit (crear)
  // -----------------------
const handleSubmit = async (e) => {
  e.preventDefault();

  if (loadingCreate) return;

  if (!metodosPermitidos(formData.metodosPago).length) {
    setActivo('h'); setErrorFormulario('Selecciona al menos un método de pago.');
    toast.error('Selecciona al menos un método de pago.'); return;
  }
  try { validarPromocionFormulario(formData); }
  catch (error) { setActivo("g"); setErrorFormulario(error.message); toast.error(error.message); return; }

  let extras;
  try { extras = prepararExtras(formData.extras, tour?.extras); }
  catch (error) { setActivo("c"); setErrorFormulario(error.message); toast.error(error.message); return; }

  let itinerarioPasos;
  try { itinerarioPasos = prepararItinerario(formData.itinerarioPasos); }
  catch (error) { setActivo("e"); setErrorFormulario(error.message); toast.error(error.message); return; }

  setLoadingCreate(true);

  const data = new FormData();

  const payload = {
    ...formData,

    reservaUltimaHora: !!formData.reservaUltimaHora,

    precio:
      formData.tipo === "compartido"
        ? toNumber(formData.precio)
        : 0,

    precios:
      formData.tipo === "privado"
        ? formData.precios.map((p) => ({
            personas: toNumber(p.personas),
            precioPorPersona: toNumber(p.precioPorPersona),
          }))
        : [],

    diasNoDisponibles: limpiarComillas(formData.diasNoDisponibles),

fechasNoDisponibles: Array.isArray(formData.fechasNoDisponibles)
  ? formData.fechasNoDisponibles.map(limpiarComillas).join(",")
  : limpiarComillas(formData.fechasNoDisponibles),
  };

  for (const key in payload) {
    if (key === "itinerario") {
      continue; // El texto anterior se conserva, no lo sobrescribe este editor.
    } else if (key === "metodosPago") {
      data.append("metodosPago", JSON.stringify(formData.metodosPago));
    } else if (key === "itinerarioPasos") {
      data.append("itinerarioPasos", JSON.stringify(itinerarioPasos));
    } else if (key === "precios") {
      data.append("precios", JSON.stringify(payload.precios));
    } else if (key === "extras") {
      continue;
    } else if (key === "fechaNoDisponibleTemp") {
      continue;
    } else {
      data.append(key, payload[key]);
    }
  }

  data.append("extras", JSON.stringify(extras));

  imagenes.forEach((img) => {
    data.append("imagenes", img.file);
  });

  // console.group("FORMDATA DEBUG");
  // for (const [key, value] of data.entries()) {
  //   console.log(key, value);
  // }
  // console.groupEnd();

  try {
    const token = localStorage.getItem("token");

    const response = await axios.post("/api/tours", data, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.status === 200 || response.status === 201) {
      toast.success("Tour creado exitosamente");

      if (typeof actualizarToursPadre === "function") {
        await actualizarToursPadre();
      }

      resetForm();

      setTimeout(() => {
        onClose();
        navigate("/admin/tours");
      }, 3000);
    } else {
      toast.error("❌ Error al crear el Tour. Inténtalo de nuevo.");
    }
  } catch (error) {
    toast.warn("Ingresa todos los campos requeridos.");

    console.log("❌ Error en la petición:");
    console.log("Mensaje:", error.message);
    console.log("Response completa:", error.response);
    console.log("Status:", error?.response?.status);
    console.log("Data:", error?.response?.data);
    console.log("Headers:", error?.response?.headers);

    toast.error(error?.response?.data?.mensaje || "Error al crear el tour.");
  } finally {
    setLoadingCreate(false);
  }
};

  // -----------------------
  // Update (editar)
  // -----------------------
const update = async () => {
  if (loadingCreate) return;

  if (!metodosPermitidos(formData.metodosPago).length) {
    setActivo('h'); setErrorFormulario('Selecciona al menos un método de pago.');
    toast.error('Selecciona al menos un método de pago.'); return;
  }
  try { validarPromocionFormulario(formData); }
  catch (error) { setActivo("g"); setErrorFormulario(error.message); toast.error(error.message); return; }

  let extras;
  try { extras = prepararExtras(formData.extras, tour?.extras); }
  catch (error) { setActivo("c"); setErrorFormulario(error.message); toast.error(error.message); return; }

  let itinerarioPasos;
  try { itinerarioPasos = prepararItinerario(formData.itinerarioPasos); }
  catch (error) { setActivo("e"); setErrorFormulario(error.message); toast.error(error.message); return; }

  setLoadingCreate(true);

  const data = new FormData();

  const payload = {
    ...formData,

    reservaUltimaHora: !!formData.reservaUltimaHora,

    precio:
      formData.tipo === "compartido"
        ? toNumber(formData.precio)
        : 0,

    precios:
      formData.tipo === "privado"
        ? formData.precios.map((p) => ({
            personas: toNumber(p.personas),
            precioPorPersona: toNumber(p.precioPorPersona),
          }))
        : [],

    diasNoDisponibles: limpiarComillas(formData.diasNoDisponibles),

    fechasNoDisponibles: Array.isArray(formData.fechasNoDisponibles)
      ? formData.fechasNoDisponibles.map(limpiarComillas).join(",")
      : limpiarComillas(formData.fechasNoDisponibles),
  };

  for (const key in payload) {
    if (key === "itinerario") {
      continue;
    } else if (key === "metodosPago") {
      data.append("metodosPago", JSON.stringify(formData.metodosPago));
    } else if (key === "itinerarioPasos") {
      data.append("itinerarioPasos", JSON.stringify(itinerarioPasos));
    } else if (key === "precios") {
      data.append("precios", JSON.stringify(payload.precios));
    } else if (key === "extras") {
      data.append("extras", JSON.stringify(extras));
    } else if (key === "fechaNoDisponibleTemp") {
      continue;
    } else {
      data.append(key, payload[key]);
    }
  }

  data.append(
    "fotosExistentes",
    JSON.stringify([...(new Set(actualizarImagenes || []))])
  );

  (imagenes || []).forEach((img) => {
    const file = img?.file || img;

    if (file instanceof File) {
      data.append("imagenes", file);
    }
  });

  console.group("FORMDATA UPDATE DEBUG");
  for (const [key, value] of data.entries()) {
    console.log(key, value);
  }
  console.groupEnd();

  try {
    const token = localStorage.getItem("token");

    const response = await axios.patch(`/api/tours/${id}`, data, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.status === 200) {
      toast.success("Tour actualizado exitosamente");

      if (typeof actualizarToursPadre === "function") {
        await actualizarToursPadre();
      }

      resetForm();

      setTimeout(() => {
        onClose();
      }, 3000);
    } else {
      toast.error("Error al actualizar el Tour.");
    }
  } catch (error) {
    console.log("❌ Error actualizando tour:", error?.response?.data || error);
    toast.error(error?.response?.data?.mensaje || "Error al actualizar el Tour.");
  } finally {
    setLoadingCreate(false);
  }
};

  const resetForm = () => {
    setFormData({
      nombre: '',
      metodosPago: metodosPermitidos(null),
      descripcion: '',
      idioma: '',
      incluido: '',
      recomendaciones: '',
      salida: '',
      categoria: '',
      subCategoria: '',
      salidas: '',
      tiempo: '',
      precio: '',
      promocionActiva: false,
      precioPromocion: '',
      fechaInicioPromocion: '',
      fechaFinPromocion: '',
      cantidadMaxima: '',
      toursPorDia: '',
      cantidadMinima: 1,
      tipo: 'compartido',
      precios: [],
      extras: [],
      
    // ✅ NUEVOS
    horaLimite: '',
    itinerario: '',
    itinerarioPasos: [],
    reservaUltimaHora: false,
    mostrarReservasCalendario: false,
     diasNoDisponibles: '',
    fechasNoDisponibles: [],
    fechaNoDisponibleTemp: '',
      
    });
    setImagenes([]);
    setActualizarImagenes([]);
    setTour(null);
  };

  // -----------------------
  // Cargar tour si hay id
  // -----------------------
  useEffect(() => {
    if (id) {
      const obtenerTour = async () => {
        try {
          const res = await axios.get(`/api/tours/${id}`, { params: { lang: 'es' } });
          setTour(res.data);
        } catch (err) {
          console.error('Error al obtener tour:', err);
        }
      };
      obtenerTour();
    }
  }, [id]);

  // Popular form cuando abrimos modal y ya tenemos tour
  useEffect(() => {
    if (isOpen && tour) {
      setFormData({
        nombre: tour.nombre || '',
        metodosPago: metodosPermitidos(tour.metodosPago),
        descripcion: tour.descripcion || '',
        idioma: tour.idioma || '',
        incluido: tour.incluido || '',
        recomendaciones: tour.recomendaciones || '',
        salida: tour.salida || '',
        categoria: tour.categoria || '',
        salidas: tour.salidas || '',
        tiempo: tour.tiempo || '',
        precio: tour.precio || '',
        promocionActiva: !!tour.promocionActiva,
        precioPromocion: tour.precioPromocion ?? '',
        fechaInicioPromocion: tour.fechaInicioPromocion || '',
        fechaFinPromocion: tour.fechaFinPromocion || '',
        cantidadMaxima: tour.cantidadMaxima?.toString?.() || '',
        toursPorDia: tour.toursPorDia?.toString?.() || '',
        cantidadMinima: tour.cantidadMinima ?? 1,
        tipo: tour.tipo || 'compartido',
        subCategoria: tour.subCategoria || '',
        horaLimite: tour.horaLimite || '',
        itinerario: tour.itinerario || '',
        itinerarioPasos: Array.isArray(tour.itinerarioPasos)
          ? [...tour.itinerarioPasos].sort((a, b) => a.orden - b.orden).map(paso => ({ ...paso }))
          : [],
        reservaUltimaHora: !!tour.reservaUltimaHora,
        mostrarReservasCalendario: !!tour.mostrarReservasCalendario,
        diasNoDisponibles: tour.diasNoDisponibles,
        fechasNoDisponibles: tour.fechasNoDisponibles ? tour.fechasNoDisponibles.split(",") : [],
        extras: Array.isArray(tour.extras)
      ? tour.extras.map(extra => ({ ...extra, precios: (extra.precios || []).map(precio => ({ ...precio })) }))
      : [],
    
        precios: Array.isArray(tour.precios)
          ? tour.precios.map(p => ({
              personas: p.personas?.toString?.() || '',
              precioPorPersona: p.precioPorPersona?.toString?.() || ''
            }))
          : []
      });
      setActualizarImagenes(Array.isArray(tour.fotos) ? [...new Set(tour.fotos)] : []);
       setImagenes([]); // 🔥 importante
    }

  }, [isOpen, tour]);

  // Cleanup de previews
  useEffect(() => {
    return () => {
      imagenes.forEach((img) => URL.revokeObjectURL(img.preview));
    };
  }, []);

  if (!isOpen) return null;


  // -----------------------
  // Render
  // -----------------------
  return (
    
      <div className="modal-content tour-editor-modal">
        <h2>{id ? "Editar Tour" : "Agregar Tour"}</h2>


        <form className="formulario" onSubmit={handleSubmit} onChangeCapture={() => setErrorFormulario("")}>
          <div className='menu'>
              <button type="button" className="btn-volver " onClick={onClose}> <i className="bi bi-arrow-left"></i>  Volver a Tours</button> 
            <ul aria-label="Secciones del tour">
              {[
                ['a', 'Información general'], ['b', 'Precios'], ['h', 'Métodos de pago'], ['c', 'Extras'],
                ['g', 'Promoción'], ['e', 'Itinerario'], ['d', 'Imágenes'],
                ['f', 'Configuración adicional'],
              ].map(([clave, titulo], index) => (
                <li key={clave}>
                  <button type="button" className={activo === clave ? 'activo' : ''}
                    aria-current={activo === clave ? 'step' : undefined}
                    onClick={() => setActivo(clave)}>
                    <span aria-hidden="true">{index + 1}</span>{titulo}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <div className='contenedor' key={activo}>
            <header className="tour-editor-section-heading">
              <h3>{({ a: 'Información general', b: 'Precios', h: 'Métodos de pago', c: 'Extras', g: 'Promoción', e: 'Itinerario', d: 'Imágenes', f: 'Configuración adicional' })[activo]}</h3>
              <p>{({ a: 'Presenta la experiencia y sus características.', b: 'Configura las tarifas normales del tour en pesos colombianos.', h: 'Elige cómo pueden pagar los clientes de este tour.', c: 'Organiza los servicios opcionales y sus tarifas.', g: 'Configura el precio y las fechas de la promoción.', e: 'Organiza el recorrido en el orden en que se realizará.', d: 'Revisa las fotos actuales y agrega nuevas imágenes.', f: 'Define los horarios, la disponibilidad y las condiciones de reserva.' })[activo]}</p>
            </header>
            {errorFormulario && <div className="tour-editor-error" role="alert">{errorFormulario}</div>}
            {activo === "a" && 
              <div>
                <div className="fila">
                    <div className="campo">
                      <label>Tipo de tour</label>
                      <select name="tipo" value={formData.tipo} onChange={handleChange} required>
                        <option value="compartido">Compartido</option>
                        <option value="privado">Privado</option>
                      </select>
                    </div>
                  </div>

                <p className="tour-editor-status">Estado: <strong>{tour?.activo === false || tour?.activo === 0 ? "Inactivo" : "Activo"}</strong></p>
                <div className="fila">
                 <div className="campo">
                  <label>Nombre del Tour</label>
                  <input
                    type="text"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    placeholder="Ej: Tour del café"
                    required
                  />
                 </div>
                 
                 
                </div>
                <div className="fila">
                  <div className="campo">
                    <label>Categoría</label>
                  <select
                    name="categoria"
                    value={formData.categoria}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Seleccione una categoría…</option>

                    <option value="1">1. Rutas cafeteras</option>
                    <option value="2">2. Experiencias de senderismo privadas</option>
                    <option value="3">3. Experiencias de senderismo compartidas</option>
                    <option value="4">4. Experiencias de aventura</option>
                    <option value="5">5. Parques temáticos</option>
                    <option value="6">6. Experiencias gastronómicas</option>
                    <option value="7">7. Tours con salida desde Pereira</option>
                    <option value="8">8. Tours con salida desde Filandia</option>
                    <option value="9">9. Tours a la Carbonera</option>
                    <option value="10">10.Tours desde los Hoteles del Quindío</option>
                    <option value="11">11.Cabalgatas</option>
                  </select>
                  </div>
                   <div className="campo">
                    <label>Sub Categoría</label>
                  <select
                    name="subCategoria"
                    value={formData.subCategoria}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Seleccione una Sub categoría…</option>

                    <option value="1">1. Salidas desde Salento</option>
                    <option value="2">2. Salidas desde Pereira</option>
                    <option value="3">3. Salidas desde Hoteles en el Quindío</option>
                    <option value="4">4. Termales</option>
                    
                  </select>
                  </div>
                 
                  

                </div>
                
                <div className="campo full">
                  <label htmlFor="tour-descripcion">Descripción</label>
                  <textarea
                    id="tour-descripcion"
                    name="descripcion"
                    rows="7"
                    aria-describedby="tour-descripcion-ayuda"
                    value={formData.descripcion}
                    onChange={handleChange}
                    placeholder="Describe el tour..."
                    required
                  />
                  <small id="tour-descripcion-ayuda">
                    Usa Enter para un salto de línea y dos veces Enter para separar párrafos.
                  </small>
                </div>
              
              </div>
              
              }
            {activo === "b" && 
              <div>
                  {formData.tipo === "compartido" && (
              <div className="campo">
                <label>Precio fijo</label>
                <input
                  type="number"
                  name="precio"
                  value={formData.precio}
                  onChange={handleChange}
                  placeholder="Ej: 85000"
                  required
                />
              </div>
            )}
        

      
          {formData.tipo === "privado" && (
            <div className="campo full">
              <label>Precios por número de personas</label>
              {formData.precios.map((p, i) => (
                <div key={i} className="fila escalon">
                  <input
                    type="number"
                    placeholder="Personas" aria-label="Cantidad de personas"
                    
                    value={p.personas}
                    onChange={(e) => handleEscalonChange(i, "personas", e.target.value)}
                  />
                  <input
                    type="number"
                    placeholder="Precio por persona" aria-label="Precio por persona en COP"
                    
                    value={p.precioPorPersona}
                    onChange={(e) => handleEscalonChange(i, "precioPorPersona", e.target.value)}
                  />
                  <button type="button" aria-label={`Eliminar tarifa ${i + 1}`} onClick={() => eliminarEscalon(i)}>✖</button>
                </div>
              ))}

              <button type="button" className="btn azul" onClick={agregarEscalon}>
                Agregar tarifa
              </button>
            </div>
          )}



                  
              
              
              </div>}
            {activo === 'h' && <fieldset className="tour-metodos-pago">
              <legend>Métodos habilitados para este tour</legend>
              <p>Selecciona al menos uno. El cliente solo verá los métodos que marques.</p>
              {METODOS_PAGO.map(metodo => <label key={metodo}>
                <input type="checkbox" name="metodosPago" value={metodo}
                  checked={formData.metodosPago.includes(metodo)} disabled={loadingCreate}
                  onChange={e => {
                    const checked = e.target.checked;
                    setFormData(prev => ({ ...prev, metodosPago: checked
                      ? METODOS_PAGO.filter(m => m === metodo || prev.metodosPago.includes(m))
                      : prev.metodosPago.filter(m => m !== metodo) }));
                  }} />
                <span>{({ bold: 'Pago electrónico · Bold', transferencia: 'Transferencia · 7 % de descuento', efectivo: 'Efectivo · 7 % de descuento', transferencia_sin: 'Transferencia', efectivo_sin: 'Efectivo' })[metodo]}
                  <small>{['transferencia', 'efectivo'].includes(metodo) ? '7 % de descuento sobre el total, incluidos los extras.' : 'Pago del total de la reserva.'}</small>
                </span>
              </label>)}
              {!formData.metodosPago.length && <p role="alert">Selecciona al menos un método de pago para guardar.</p>}
            </fieldset>}
            {activo === "g" && <div>
          <fieldset className="promocion-formulario">
            <legend>Promoción</legend>
            <label className="promocion-activar">
              <input type="checkbox" name="promocionActiva" checked={formData.promocionActiva} onChange={handleChange} />
              Activar promoción
            </label>
            {formData.promocionActiva && <>
            <p>Durante la promoción, el total del tour se calcula multiplicando el precio promocional por la cantidad de personas, para cualquier cantidad permitida.</p>
            <div className="fila">
              <div className="campo">
                <label htmlFor="precio-promocion">Precio promocional por persona (COP)</label>
                <input id="precio-promocion" name="precioPromocion" type="number" min={1} max={2147483647} step={1}
                  value={formData.precioPromocion} onChange={handleChange} disabled={!formData.promocionActiva} />
              </div>
              <div className="campo">
                <label htmlFor="inicio-promocion">Fecha de inicio</label>
                <input id="inicio-promocion" name="fechaInicioPromocion" type="date"
                  value={formData.fechaInicioPromocion} onChange={handleChange} disabled={!formData.promocionActiva} />
              </div>
              <div className="campo">
                <label htmlFor="fin-promocion">Fecha de finalización</label>
                <input id="fin-promocion" name="fechaFinPromocion" type="date" min={formData.fechaInicioPromocion || undefined}
                  value={formData.fechaFinPromocion} onChange={handleChange} disabled={!formData.promocionActiva} />
              </div>
            </div>
            <p>Ambas fechas están incluidas, según la hora de Colombia. Los extras conservan sus propias tarifas.</p>
            </>}
          </fieldset></div>}
            {activo === "c" && 
              <div>
                <div className="campo full">
              <label>Agregar Servicios Extras al Tour</label>
               {(formData.extras || []).map((ex, i) => (
                <fieldset key={ex.id || `nuevo-${i}`} className="extra-editor">
                  <legend>Extra {i + 1}{ex.nombre ? ` · ${ex.nombre}` : ""}</legend>
                  <p className="tour-editor-status">Estado: <strong>{ex.activo === false || ex.activo === 0 ? "Inactivo" : "Activo"}</strong></p>
                  <div className="extra-editor-campos">
                    <label>Nombre del servicio
                      <input type="text" maxLength={120} value={ex.nombre}
                        onChange={(e) => handleExtraChange(i, "nombre", e.target.value)} />
                    </label>
                    <label>Cantidad máxima del extra
                      <input type="number" min={1} step={1} value={ex.maxCantidad}
                        onChange={(e) => handleExtraChange(i, "maxCantidad", e.target.value)} />
                    </label>
                  </div>
                  <p>La tarifa depende de las personas de la reserva. El subtotal se calcula con la cantidad seleccionada del extra.</p>
                  {(ex.precios || []).map((tarifa, index) => (
                    <div className="extra-tarifa" key={index}>
                      <label>Cantidad de personas
                        <input type="number" min={1} step={1} value={tarifa.personas}
                          onChange={(e) => cambiarTarifasExtra(i, filas => filas.map((fila, j) => j === index ? { ...fila, personas: e.target.value } : fila))} />
                      </label>
                      <label>Precio por persona (COP)
                        <input type="number" min={1} step={1} value={tarifa.valor}
                          onChange={(e) => cambiarTarifasExtra(i, filas => filas.map((fila, j) => j === index ? { ...fila, valor: e.target.value } : fila))} />
                      </label>
                      <button type="button" className="tour-editor-remove-rate" onClick={() => cambiarTarifasExtra(i, filas => filas.filter((_, j) => j !== index))}>Eliminar tarifa</button>
                    </div>
                  ))}
                  {!ex.precios?.length && (
                    <label>Precio fijo (COP)
                      <input type="number" min={Number(tour?.extras?.find(extra => extra.id === ex.id)?.valor) === 0 ? 0 : 1}
                        step={1} value={ex.valor ?? ""} onChange={(e) => handleExtraChange(i, "valor", e.target.value)} />
                      <small>Sin tarifas por personas, se aplica este precio a cualquier tamaño de reserva.</small>
                    </label>
                  )}
                  {!!ex.precios?.length && <p>Las cantidades de personas sin tarifa no podrán seleccionar este extra.</p>}
                  <div className="extra-editor-acciones">
                    <button type="button" className="btn azul" onClick={() => cambiarTarifasExtra(i, filas => [...filas, { personas: "", valor: "" }])}>Agregar tarifa</button>
                    <button type="button" className="tour-editor-remove" onClick={() => eliminarExtra(i)}>Eliminar extra</button>
                  </div>
                </fieldset>
              ))}

              <button type="button" className="btn azul" onClick={agregarExtra}>
              ➕ Agregar Servicio
            </button>
            </div>
              
              </div>}
            {activo === "d" && 
              <div>
                <div className="fila">
                  <div className="campo full">
                    <label>Imágenes del tour</label>
                    <input
                      type="file"
                      name="imagenes"
                      multiple
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                    <p className="info-img">SVG, PNG, JPG o GIF (máx. 7 imágenes)</p>
                    {actualizarImagenes.length > 0 && (
                      <div className="preview-imagenes">
                        <p className="preview-titulo">Imágenes existentes:</p>
                        <ol>
                          {actualizarImagenes.map((img, index) => (
                            
                            <li key={index} className="preview-item">
                              <img src={img} alt={`foto - ${index}`} />
                              <button
                                type="button"
                                onClick={() => eliminarImagenExistente(index)}
                                className="boton-eliminar"
                              >
                                ✖
                              </button>
                            </li>
                          
                            
                          ))}
                        </ol>
                       
                      </div>
                    )}
                    

                    {imagenes.length > 0 && (
                      <div className="preview-imagenes">
                        <p className="preview-titulo">Imágenes seleccionadas:</p>
                        <ol>
                          {imagenes.map((img, index) => (
                            <div key={index} className='contenedor-img'>
                            <li key={index} className="preview-item">
                              <img src={img.preview} alt={img.name} />
                              <button
                                type="button"
                                onClick={() => eliminarImagen(index)}
                                className="boton-eliminar"
                              >
                                ✖
                              </button>
                              
                            </li>
                              <button className='boton-img' type="button" onClick={() => moverImagen(index, index - 1)} disabled={index === 0}>
                              ↑
                            </button>

                            <button
                            className='boton-img'
                              type="button"
                              onClick={() => moverImagen(index, index + 1)}
                              disabled={index === imagenes.length - 1}
                            >
                              ↓
                            </button>
                            
                            </div>
                          ))}
                        </ol>
                      </div>
                    )}
                  </div>
                </div>

              </div>}
              
            {activo === "e" && 
            <div>
                <ItinerarioEditor
                  pasos={formData.itinerarioPasos}
                  itinerarioAntiguo={formData.itinerario}
                  onChange={pasos => setFormData(prev => ({ ...prev, itinerarioPasos: pasos }))}
                />

              

              </div>}
            {activo === "f" && 
            <div>
              <h4 className="tour-editor-subtitle">Capacidad y detalles de la experiencia</h4>
<div className="fila">
                  <div className="campo">
                    <label>Cantidad mínima de personas</label>
                    <input
                      type="number"
                      name="cantidadMinima"
                      value={formData.cantidadMinima}
                      onChange={handleChange}
                      placeholder="Ej: 1"
                      required
                    />
                  </div>
                  <div className="campo">
                    <label>Cantidad máxima de personas</label>
                    <input
                      type="number"
                      name="cantidadMaxima"
                      value={formData.cantidadMaxima}
                      onChange={handleChange}
                      placeholder="Ej: 8"
                      required
                    />
                  </div>

                </div>
                
<div className="fila">
                    <div className="campo">
                    <label>Recomendaciones</label>
                    <input
                      type="text"
                      name="recomendaciones"
                      value={formData.recomendaciones}
                      onChange={handleChange}
                      placeholder="Ej: llevar agua, ropa cómoda"
                      required
                    />
                  </div>
                  <div className="campo">
                    <label>Incluido</label>
                    <input
                      type="text"
                      name="incluido"
                      value={formData.incluido}
                      onChange={handleChange}
                      placeholder="Ej: almuerzo, transporte"
                      required
                    />
                  </div>
                  
                </div>
                
<div className="fila"><div className="campo">
                    <label>Idioma</label>
                    <input
                      type="text"
                      name="idioma"
                      value={formData.idioma}
                      onChange={handleChange}
                      placeholder="Ej: Español/Inglés"
                      required
                    />
                  </div></div>
<h4 className="tour-editor-subtitle">Horarios y punto de encuentro</h4>
              <div className='fila'>
                 <div className="campo">
                  <label>Tours por día</label>
                  <input
                    type="number"
                    name="toursPorDia"
                    value={formData.toursPorDia}
                    onChange={handleChange}
                    placeholder="Ej: 3"
                    required
                  />
                </div>
                <div className="campo">
                  <label>Duración del Tour</label>
                  <input
                    type="text"
                    name="tiempo"
                    value={formData.tiempo}
                    onChange={handleChange}
                    placeholder="Ej: 3.5 Horas"
                    required
                  />
                 </div>
                </div>
                <div className='fila'>
                <div className="campo">
                  <label>Horarios por día</label>
                  <input
                    type="text"
                    name="salidas"
                    value={formData.salidas}
                    onChange={handleChange}
                    placeholder="Ej: 07:30 AM / 02:00 PM"
                    required
                  />
                </div>
                <div className="campo">
                  <label>Lugar de salida</label>
                  <input
                    type="text"
                    name="salida"
                    value={formData.salida}
                    onChange={handleChange}
                    placeholder="Ej: Parque Principal"
                    required
                  />
                </div>
                </div>

              <h4 className="tour-editor-subtitle">Disponibilidad y reservas</h4>
              <div className='fila'>
                <div className="campo">
                  <label>Hora Limite de Reserva</label>
                  <select
                    name="horaLimite"
                    value={formData.horaLimite}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Seleccione una Hora Limite…</option>

                    <option value="0">0 Minutos</option>
                    <option value="5">5 Minutos</option>
                    <option value="10">10 Minutos</option>
                    <option value="15">15 Minutos</option>
                    <option value="30">30 Minutos</option>
                    <option value="60">1 Hora</option>
                    <option value="120">2 Horas</option>
                    <option value="180">3 Horas</option>
                    <option value="240">4 Horas</option>
                    <option value="300">5 Horas</option>
                    <option value="720">12 Horas</option>
                    <option value="1440">24 Horas</option>
                  </select>
                </div>
                
              </div>
              <div className="campo">
                  <label>Habilitar las reservas de ultima hora despues de la primera reserva (opcional)</label>
                  <div className='terminos-container'> 
                    <input
                    type="checkbox"
                    name="reservaUltimaHora"
                    checked={!!formData.reservaUltimaHora}
                    onChange={handleChange}
                    className='check'
                  />
                <p  className="titulo-check">
                    Una vez realizada la primera reserva para una franja horaria, se elimina la hora limite, permitiendo que se hagan más reservas hasta la hora de inicio del tour o del cierre de esa franja horaria.               </p>
                </div>
              </div>
              <div className="campo">
                  <label className="calendario-configuracion">
                    <input type="checkbox" name="mostrarReservasCalendario"
                      checked={formData.mostrarReservasCalendario} onChange={handleChange} disabled={loadingCreate} />
                    <span>Mostrar reservas por día en el calendario
                      <small>Permite mostrar a los usuarios cuántas reservas existen en cada fecha.</small>
                    </span>
                  </label>
                  <fieldset className="tour-dias-bloqueados" disabled={loadingCreate}>
                    <legend>Deshabilitar tours por días de la semana (opcional)</legend>
                    <p>Marca todos los días que quieras bloquear. Se repetirán cada semana.</p>
                    <div className="tour-dias-opciones">
                      {['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'].map((nombre, indice) => {
                        const dia = String(indice);
                        return <label key={dia}>
                          <input type="checkbox" name="diasNoDisponibles" value={dia}
                            checked={diasBloqueados(formData.diasNoDisponibles).includes(dia)}
                            onChange={e => {
                              const checked = e.target.checked;
                              setFormData(prev => ({ ...prev, diasNoDisponibles: diasBloqueados(checked
                                ? [...diasBloqueados(prev.diasNoDisponibles), dia]
                                : diasBloqueados(prev.diasNoDisponibles).filter(item => item !== dia)).join(',') }));
                            }} />
                          <span>{nombre}</span>
                        </label>;
                      })}
                    </div>
                    {diasBloqueados(formData.diasNoDisponibles).length > 0
                      ? <button type="button" onClick={() => setFormData(prev => ({ ...prev, diasNoDisponibles: '' }))}>Quitar todos los bloqueos semanales</button>
                      : <small>Ningún día de la semana bloqueado.</small>}
                  </fieldset>
                  
              </div>
              <div className="campo">
              <label className="label">Deshabilitar tours por fecha específica</label>

              <div className="fecha-bloqueo-row">
                <input
                  type="date"
                  name="fechaNoDisponibleTemp"
                  value={formData.fechaNoDisponibleTemp}
                  onChange={handleChange}
                  className="input-fecha-bloqueo"
                />

                <button
                  type="button"
                  className="btn-agregar-fecha"
                  onClick={() => {
                    if (!formData.fechaNoDisponibleTemp) return;

                    if (
                      formData.fechasNoDisponibles.includes(
                        formData.fechaNoDisponibleTemp
                      )
                    ) {
                      return;
                    }

                    setFormData((prev) => ({
                      ...prev,
                      fechasNoDisponibles: [
                        ...prev.fechasNoDisponibles,
                        prev.fechaNoDisponibleTemp,
                      ],
                      fechaNoDisponibleTemp: "",
                    }));
                  }}
                >
                  Agregar
                </button>
              </div>

              {Array.isArray(formData.fechasNoDisponibles) &&
                formData.fechasNoDisponibles.length > 0 && (
                  <div className="fechas-bloqueadas-lista">
                    {formData.fechasNoDisponibles.map((fecha) => (
                      <span key={fecha} className="fecha-bloqueada-item">
                        {fecha}

                        <button
                          type="button"
                          className="btn-eliminar-fecha"
                          onClick={() => {
                            setFormData((prev) => ({
                              ...prev,
                              fechasNoDisponibles: Array.isArray(prev.fechasNoDisponibles)
                                ? prev.fechasNoDisponibles.filter((item) => item !== fecha)
                                : [],
                            }));
                          }}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
            </div>
              <div className="acciones">
                <button type="button" className="btn cancelar" onClick={()=>onClose()}>Cancelar</button>
                {id
                  ? <button type="button" className="btn naranja" onClick={()=>update()} disabled={loadingCreate}>
                    {loadingCreate ? (
                      <>
                        <span className="btn-spinner" /> Actualizando...
                      </>
                    ) : (
                      "Actualizar Tour"
                    )}
                    
                    </button>
                  : <button type="submit" className="btn azul" disabled={loadingCreate}> 
                     {loadingCreate ? (
                      <>
                        <span className="btn-spinner" /> Guardando...
                      </>
                    ) : (
                      "Añadir Tour"
                    )}
                  
                  </button>}
              </div>
              </div>
              }
            
          </div>

        </form>
      </div>
    
  );
};

export default ModalAgregarTour;
