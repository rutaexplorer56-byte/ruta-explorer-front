import { useState, useEffect } from 'react';
import '../styles/modal_tours.css';
import axios from "../axiosConfig";
import { toast } from 'react-toastify';
import { useNavigate } from "react-router-dom";

/* eslint-disable react/prop-types */
const ModalAgregarTour = ({ isOpen, onClose, id, actualizarToursPadre }) => {
   const [imagenes, setImagenes] = useState([]);
   const [actualizarImagenes, setActualizarImagenes] = useState([]);
   const [tour, setTour] = useState(null);
   const [activo, setActivo] = useState("a");
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
    descripcion: '',
    idioma: '',
    incluido: '',
    recomendaciones: '',
    salida: '',
    categoria: '',
    salidas: '',
    tiempo: '',
    precio: '',
    cantidadMaxima: '',
    toursPorDia: '',
    cantidadMinima: 1,
    tipo: 'compartido', // 'compartido' | 'privado'
    precios: [],// [{ personas, precioPorPersona }]
    horaLimite: '',            // ej: "18:00"
    itinerario: '',            // texto largo
    reservaUltimaHora: false,
    extras: [{ nombre: "", valor: "", maxCantidad: 1 }],
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
    extras: [...prev.extras, { nombre: "", valor: "", maxCantidad: 1 }]
  }));
};

const handleExtraChange = (i, field, value) => {
  const nuevos = [...formData.extras];
  nuevos[i][field] = value;
  setFormData(prev => ({ ...prev, extras: nuevos }));
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
    if (key === "precios") {
      data.append("precios", JSON.stringify(payload.precios));
    } else if (key === "extras") {
      continue;
    } else if (key === "fechaNoDisponibleTemp") {
      continue;
    } else {
      data.append(key, payload[key]);
    }
  }

  data.append("extras", JSON.stringify(formData.extras));

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
    if (key === "precios") {
      data.append("precios", JSON.stringify(payload.precios));
    } else if (key === "extras") {
      data.append("extras", JSON.stringify(payload.extras));
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
      descripcion: '',
      idioma: '',
      incluido: '',
      recomendaciones: '',
      salida: '',
      categoria: '',
      salidas: '',
      tiempo: '',
      precio: '',
      cantidadMaxima: '',
      toursPorDia: '',
      cantidadMinima: 1,
      tipo: 'compartido',
      precios: [],
      
    // ✅ NUEVOS
    horaLimite: '',
    itinerario: '',
    reservaUltimaHora: false,
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
          const res = await axios.get(`/api/tours/${id}`);
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
        descripcion: tour.descripcion || '',
        idioma: tour.idioma || '',
        incluido: tour.incluido || '',
        recomendaciones: tour.recomendaciones || '',
        salida: tour.salida || '',
        categoria: tour.categoria || '',
        salidas: tour.salidas || '',
        tiempo: tour.tiempo || '',
        precio: tour.precio || '',
        cantidadMaxima: tour.cantidadMaxima?.toString?.() || '',
        toursPorDia: tour.toursPorDia?.toString?.() || '',
        cantidadMinima: tour.cantidadMinima ?? 1,
        tipo: tour.tipo || 'compartido',
        horaLimite: tour.horaLimite || '',
        itinerario: tour.itinerario || '',
        reservaUltimaHora: !!tour.reservaUltimaHora,
        diasNoDisponibles: tour.diasNoDisponibles,
        fechasNoDisponibles: tour.fechasNoDisponibles ? tour.fechasNoDisponibles.split(",") : [],
        extras: Array.isArray(tour.extras)
      ? tour.extras
      : [{ nombre: "", valor: "", maxCantidad: 1 }],
    
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
    
      <div className="modal-content">
        <h2>{id ? "Editar Tour" : "Agregar Tour"}</h2>


        <form className="formulario" onSubmit={handleSubmit}>
          <div className='menu'>
              <button type="button" className="btn-volver " onClick={onClose}> <i className="bi bi-arrow-left"></i>  Volver a Tours</button> 
            <ul>
              <li className={activo==="a"? "activo":""}onClick={()=>setActivo("a")}>Información General</li>
              <li className={activo==="b"? "activo":""}onClick={()=>setActivo("b")}>Precios</li>
              <li className={activo==="c"? "activo":""}onClick={()=>setActivo("c")}>Extras</li>
              <li className={activo==="d"? "activo":""}onClick={()=>setActivo("d")}>Imágenes</li>
              <li className={activo==="e"? "activo":""}onClick={()=>setActivo("e")}>Itinerario</li>
              <li className={activo==="f"? "activo":""}onClick={()=>setActivo("f")}>Horario limite</li>
            </ul>
          </div>
          <div className='contenedor'>
            {activo === "a" && 
              <div>
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
                  </select>
                  </div>
                  <div className="campo">
                    <label>Idioma</label>
                    <input
                      type="text"
                      name="idioma"
                      value={formData.idioma}
                      onChange={handleChange}
                      placeholder="Ej: Español/Inglés"
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
                <div className="campo full">
                  <label>Descripción</label>
                  <textarea
                    name="descripcion"
                    rows="4"
                    value={formData.descripcion}
                    onChange={handleChange}
                    placeholder="Describe el tour..."
                    required
                  />
                </div>
              
              </div>
              
              }
            {activo === "b" && 
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
                    placeholder="Personas"
                    
                    value={p.personas}
                    onChange={(e) => handleEscalonChange(i, "personas", e.target.value)}
                  />
                  <input
                    type="number"
                    placeholder="Precio por persona"
                    
                    value={p.precioPorPersona}
                    onChange={(e) => handleEscalonChange(i, "precioPorPersona", e.target.value)}
                  />
                  <button type="button" onClick={() => eliminarEscalon(i)}>✖</button>
                </div>
              ))}

              <button type="button" className="btn azul" onClick={agregarEscalon}>
                ➕ Agregar Campo
              </button>
            </div>
          )}

                  
              
              
              </div>}
            {activo === "c" && 
              <div>
                <div className="campo full">
              <label>Agregar Servicios Extras al Tour</label>
               {(formData.extras || []).map((ex, i) => (
                <div key={i} className="fila escalon">
                  <input
                    type="text"
                    placeholder="Nombre del servicio + descripción"
                    value={ex.nombre}
                    onChange={(e) => handleExtraChange(i, "nombre", e.target.value)}
                  />

                  <input
                    type="number"
                    placeholder="Precio del Servicio"
                    value={ex.valor}
                    onChange={(e) => handleExtraChange(i, "valor", e.target.value)}
                  />

                  <input
                    type="number"
                    placeholder="Cantidad máxima"
                    min={1}
                    value={ex.maxCantidad}
                    onChange={(e) => handleExtraChange(i, "maxCantidad", e.target.value)}
                  />

                  <button type="button" onClick={() => eliminarExtra(i)}>✖</button>
                </div>
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
                <div className='fila'>
                  <div className="campo">
                  <label>Itinerario</label>
                  <textarea
                    type="text"
                    name="itinerario"
                    value={formData.itinerario}
                    onChange={handleChange}
                    placeholder="Ej: Salida Parque Principal - Visita al café - Almuerzo - Regreso parque principal"
                    required
                    rows={3}
                  />
                </div>
                </div>

              

              </div>}
            {activo === "f" && 
            <div>
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
                  <label className="label">Deshabilitar los tours por Dias (opcional)</label>
                  <select
                    name="diasNoDisponibles"
                    value={formData.diasNoDisponibles}
                    onChange={handleChange}
                  >
                    <option value="">Ningún día bloqueado</option>
                    <option value="0">Domingo</option>
                    <option value="1">Lunes</option>
                    <option value="2">Martes</option>
                    <option value="3">Miércoles</option>
                    <option value="4">Jueves</option>
                    <option value="5">Viernes</option>
                    <option value="6">Sábado</option>
                  </select>
                  
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
