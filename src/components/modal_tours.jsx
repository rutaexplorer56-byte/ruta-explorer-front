import { useState, useEffect } from 'react';
import '../styles/modal_tours.css';
import axios from "../axiosConfig";
import { toast } from 'react-toastify';

/* eslint-disable react/prop-types */
const ModalAgregarTour = ({ isOpen, onClose, id, actualizarToursPadre }) => {
   const [imagenes, setImagenes] = useState([]);
   const [actualizarImagenes, setActualizarImagenes] = useState([]);
   const [tour, setTour] = useState(null);

   const MAX_FILE_SIZE_MB = 20;
   const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;



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
    salidas: '',
    tiempo: '',
    precio: '',
    cantidadMaxima: '',
    toursPorDia: '',
    cantidadMinima: 1,
    tipo: 'compartido', // 'compartido' | 'privado'
    precios: []         // [{ personas, precioPorPersona }]
  });

  // -----------------------
  // Handlers generales
  // -----------------------
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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
    const disponibles = 7 - imagenes.length;
    const archivosLimitados = archivosNuevos.slice(0, disponibles);


      // ✅ Validar tamaño máximo por archivo
      const archivoGrande = archivosNuevos.find(
        (file) => file.size > MAX_FILE_SIZE_BYTES
      );

      if (archivoGrande) {
        toast.error(
          `La imagen "${archivoGrande.name}" supera los ${MAX_FILE_SIZE_MB}MB permitidos.`
        );
        e.target.value = ""; // limpia el input
        return;
      }

    const archivosConPreview = archivosLimitados.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      name: file.name
    }));

    setImagenes(prev => [...prev, ...archivosConPreview]);
    // console.log(archivosConPreview)

    if (imagenes.length + archivosNuevos.length > 7) {
      toast.info("Solo puedes subir un máximo de 7 imágenes.");
    }
  };

  const eliminarImagen = (index) => {
    setImagenes(prev => {
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
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

  // -----------------------
  // Submit (crear)
  // -----------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();

    // Si tipo es compartido, limpiar precios; si es privado, limpiar precio fijo
  const payload = {
    ...formData,
    precio: formData.tipo === 'compartido' ? toNumber(formData.precio) : 0,
    precios: formData.tipo === 'privado'
      ? formData.precios.map(p => ({
          personas: toNumber(p.personas),
          precioPorPersona: toNumber(p.precioPorPersona),
        }))
      : [],
  };
    for (const key in payload) {
      if (key === "precios") {
        data.append("precios", JSON.stringify(payload.precios));
      } else {
        data.append(key, payload[key]);
      }
    }

    imagenes.forEach((img) => data.append('imagenes', img.file));
 
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('/api/tours', data, {
        headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` }
      });
       
      if (response.status === 200 || response.status === 201) {
        toast.success("✅ Tour creado exitosamente");
        if (typeof actualizarToursPadre === "function") await actualizarToursPadre();
        setTimeout(() => onClose(), 3000);
        resetForm();
      } else {
        toast.error("❌ Error al crear el Tour. Inténtalo de nuevo.");
      }
    } catch (error) {
      console.log("❌ Error en la petición:");
      console.log("Mensaje:", error.message);
      console.log("Response completa:", error.response);
      console.log("Status:", error?.response?.status);
      console.log("Data:", error?.response?.data);
      console.log("Headers:", error?.response?.headers);
      toast.error(error?.response?.data?.mensaje );
    }
  };

  // -----------------------
  // Update (editar)
  // -----------------------
  const update = async () => {
    
    const data = new FormData();

      const payload = {
    ...formData,
    precio: formData.tipo === 'compartido' ? toNumber(formData.precio) : 0,
    precios: formData.tipo === 'privado'
      ? formData.precios.map(p => ({
          personas: toNumber(p.personas),
          precioPorPersona: toNumber(p.precioPorPersona),
        }))
      : [],
  };

    for (const key in payload) {
      if (key === "precios") {
        data.append("precios", JSON.stringify(payload.precios));
      } else {
        data.append(key, payload[key]);
      }
    }
    //funcion para convertir url a file
    const urlToFile = async (url, index) => {
        const response = await fetch(url);
        const blob = await response.blob();
        return new File([blob], `imagen_existente_${index}.jpg`, { type: blob.type });
      };
     // convertirmos las iamgenes existentes de url a file   
       for (let i = 0; i < actualizarImagenes.length; i++) {
          const file = await urlToFile(actualizarImagenes[i], i);
          data.append('imagenes', file);
    }
    const nuevasImagenes=[...actualizarImagenes,...imagenes]

    nuevasImagenes.forEach((img) => data.append('imagenes', img.file));
   

    try {
      const token = localStorage.getItem('token');
      const response = await axios.patch(`/api/tours/${id}`, data, {
        headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` }
      });

      if (response.status === 200) {
        toast.success("✅ Tour actualizado exitosamente");
        if (typeof actualizarToursPadre === "function") await actualizarToursPadre();
        setTimeout(() => onClose(), 3000);
        resetForm();
      } else {
        toast.error("❌ Error al actualizar el Tour.");
      }
    } catch (error) {
      toast.error(error?.response?.data?.mensaje || "❌ Error al actualizar el Tour.");
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
      salidas: '',
      tiempo: '',
      precio: '',
      cantidadMaxima: '',
      toursPorDia: '',
      cantidadMinima: 1,
      tipo: 'compartido',
      precios: [],
      
    });
    setImagenes([]);
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
        salidas: tour.salidas || '',
        tiempo: tour.tiempo || '',
        precio: tour.precio || '',
        cantidadMaxima: tour.cantidadMaxima?.toString?.() || '',
        toursPorDia: tour.toursPorDia?.toString?.() || '',
        cantidadMinima: tour.cantidadMinima ?? 1,
        tipo: tour.tipo || 'compartido',
    
        precios: Array.isArray(tour.precios)
          ? tour.precios.map(p => ({
              personas: p.personas?.toString?.() || '',
              precioPorPersona: p.precioPorPersona?.toString?.() || ''
            }))
          : []
      });
      setActualizarImagenes(tour.fotos);
    }
  }, [isOpen, tour]);

  // Cleanup de previews
  useEffect(() => {
    return () => {
      imagenes.forEach((img) => URL.revokeObjectURL(img.preview));
    };
  }, [imagenes]);

  if (!isOpen) return null;

  // -----------------------
  // Render
  // -----------------------
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>{id ? "Editar Tour" : "Agregar Tour"}</h2>

        <form className="formulario" onSubmit={handleSubmit}>
         
          {/* Tipo */}
          <div className="fila">
            <div className="campo">
              <label>Tipo de tour</label>
              <select name="tipo" value={formData.tipo} onChange={handleChange} required>
                <option value="compartido">Compartido</option>
                <option value="privado">Privado</option>
              </select>
            </div>
          </div>

          {/* Nombre y precio (si compartido) */}
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
          </div>

          {/* Escalones si privado */}
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

          {/* Cantidades e idioma/tiempo */}
          <div className="fila">
            <div className="campo">
              <label>Cantidad máxima</label>
              <input
                type="number"
                name="cantidadMaxima"
                value={formData.cantidadMaxima}
                onChange={handleChange}
                placeholder="Ej: 8"
                required
              />
            </div>
            <div className="campo">
              <label>Cantidad mínima</label>
              <input
                type="number"
                name="cantidadMinima"
                value={formData.cantidadMinima}
                onChange={handleChange}
                placeholder="Ej: 1"
                required
              />
            </div>
          </div>

          <div className="fila">
            <div className="campo">
              <label>Duración</label>
              <input
                type="text"
                name="tiempo"
                value={formData.tiempo}
                onChange={handleChange}
                placeholder="Ej: 3 horas"
                required
              />
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

          <div className="fila">
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

          {/* Imágenes */}
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
                    ))}
                  </ol>
                </div>
              )}
            </div>
          </div>

          {/* Acciones */}
          <div className="acciones">
            <button type="button" className="btn cancelar" onClick={onClose}>Cancelar</button>
            {id
              ? <button type="button" className="btn naranja" onClick={update}>Actualizar</button>
              : <button type="submit" className="btn azul">Añadir Tour</button>}
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalAgregarTour;
