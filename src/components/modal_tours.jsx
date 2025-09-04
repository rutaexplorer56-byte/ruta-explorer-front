import  { useState ,useEffect} from 'react';

import '../styles/modal_tours.css';
import axios from "../axiosConfig";
import { toast } from 'react-toastify';
/* eslint-disable react/prop-types */
 
const ModalAgregarTour = (props) => {

  const [imagenes, setImagenes] = useState([]);
  const { isOpen, onClose, id, actualizarToursPadre}=props

 
    const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    idioma: '',
    incluido: '',
    recomendaciones: '',
    salidas: '',
    tiempo: '',
    precio: '',
    cantidadMaxima: '',
    toursPorDia: '',
    cantidadMinima: 1,
  });


 const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

const handleImageChange = (e) => {
  const archivosNuevos = Array.from(e.target.files);

  // Si la suma supera 7, recorto
  const disponibles = 7 - imagenes.length;
  const archivosLimitados = archivosNuevos.slice(0, disponibles);

  const archivosConPreview = archivosLimitados.map((file) => ({
    file,
    preview: URL.createObjectURL(file),
    name: file.name
  }));

  setImagenes((imagenesPrevias) => [...imagenesPrevias, ...archivosConPreview]);
  if (imagenes.length + archivosNuevos.length > 7) {
  
  toast.info("Solo puedes subir un máximo de 7 imágenes.");
}
};
const eliminarImagen = (index) => {
  setImagenes((imagenesPrevias) => {
    // Liberar memoria del ObjectURL
    URL.revokeObjectURL(imagenesPrevias[index].preview);

    // Retornar las demás imágenes sin la eliminada
    return imagenesPrevias.filter((_, i) => i !== index);
  });
};

const handleSubmit = async (e) => {
  e.preventDefault();

  const data = new FormData();

  for (const key in formData) {
    data.append(key, formData[key]);
  }

  imagenes.forEach((img) => {
    data.append('imagenes', img.file);
  });

  try {
    const token = localStorage.getItem('token');
    const response = await axios.post('/api/tours', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.status === 200 || response.status === 201) {
      toast.success("✅ Tour creado exitosamente");

      // ✅ 🔥 ACTUALIZAR LISTA EN EL PADRE
      if (typeof actualizarToursPadre === "function") {
        await actualizarToursPadre();
      }

      // ✅ Cerrar modal
      setTimeout(()=>{onClose();},5000)
      

      // ✅ Resetear formulario
      setFormData({
        nombre: '',
        descripcion: '',
        idioma: '',
        incluido: '',
        recomendaciones: '',
        salidas: '',
        tiempo: '',
        precio: '',
        cantidadMaxima: '',
        toursPorDia: '',
        cantidadMinima: 1,
      });
      setImagenes([]);
    } else {
      toast.error("❌ Error al crear el Tour. Inténtalo de nuevo.");
    }
  } catch (error) {
    
    toast.error("❌ Ocurrió un error al enviar los datos.");
  }
};
    const [tour, setTour] = useState([]);

  useEffect(() => {
    if(id){
      const obtenerTours = async () => {
      try {
        const res = await axios.get(`/api/tours/${id}`);
        setTour(res.data); // aquí actualizamos el estado
        
      } catch (error) {
        console.error('Error al obtener tours:', error);
      }
    };
    obtenerTours();
    }
    
  }, [id]);
  useEffect(() => {
  if (isOpen && tour) {
    setFormData({
      nombre: tour.nombre || '',
      descripcion: tour.descripcion || '',
      idioma: tour.idioma || '',
      incluido: tour.incluido || '',
      recomendaciones: tour.recomendaciones || '',
      salidas: tour.salidas || '',
      tiempo: tour.tiempo || '',
      precio: tour.precio || '',
      cantidadMaxima: tour.cantidadMaxima || '',
      toursPorDia: tour.toursPorDia || '',
      id: tour.id || '',
      cantidadMinima: tour.cantidadMinima || '',
    });
    setImagenes([]);
  }
}, [isOpen, tour]);

 const update = async () => {
  const data = new FormData();
  for (const key in formData) {
    data.append(key, formData[key]);
  }
  imagenes.forEach((img) => {
    data.append('imagenes', img.file);
  });

  try {
    const token = localStorage.getItem('token');
    const response = await axios.patch(`/api/tours/${id}`, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.status === 200 || response.status === 204) {
      toast.success("✅ Tour actualizado exitosamente");


      // ✅ 🔥 ACTUALIZAR LISTA EN EL PADRE
      if (typeof actualizarToursPadre === "function") {
        await actualizarToursPadre();
      }
      // ✅ Cerrar modal
      setTimeout(()=>{onClose();},3000)
      
      

      // Resetear formulario
      setFormData({
        nombre: '',
        descripcion: '',
        idioma: '',
        incluido: '',
        recomendaciones: '',
        salidas: '',
        tiempo: '',
        precio: '',
        cantidadMaxima: '',
        toursPorDia: '',
        cantidadMinima: '',

      });
      setImagenes([]);
    } else {
      toast.error("❌ Error al actualizar el tour.");
    }
  } catch (error) {
    console.error('Error en la solicitud PATCH:', error);
    toast.error("❌ Ocurrió un error al actualizar los datos.");
  }
};
useEffect(() => {
  return () => {
    imagenes.forEach((img) => URL.revokeObjectURL(img.preview));
  };
}, []);


  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Agregar Tour</h2>
        <form className="formulario" onSubmit={handleSubmit} >
          <div className="fila">
            <div className="campo">
              <label>Nombre del Tour</label>
              <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} placeholder={id!=null?tour.nombre:"Ej: Tour del cafe"} required />
            </div>
            <div className="campo">
              <label>Precio</label>
              <input type="number" name="precio" value={formData.precio} onChange={handleChange} placeholder={id!=null?tour.precio:"Ej: 85000 (sin puntos ni comas)"} required />
            </div>
          </div>

          <div className="fila">
            <div className="campo">
              <label>Cantidad máxima</label>
              <input type="number" name="cantidadMaxima" value={formData.cantidadMaxima} onChange={handleChange} placeholder={id!=null?tour.cantidadMaxima:"Ej: 2"} required />
            </div>
            <div className="campo">
              <label>Cantidad minima</label>
              <input type="number" name="cantidadMinima" value={formData.cantidadMinima} onChange={handleChange} placeholder={id!=null?tour.cantidadMinima:"Ej: 1"} required />
            </div>
            
          </div>

          <div className="fila">
            <div className="campo">
              <label>Duración</label>
              <input type="text" name="tiempo" value={formData.tiempo} onChange={handleChange} placeholder={id!=null?tour.tiempo:"Ej: 3 horas"} required />
            </div>
            <div className="campo">
              <label>Idioma</label>
              <input type="text" name="idioma" value={formData.idioma} onChange={handleChange} placeholder={id!=null?tour.idioma:"Ej: Español/ingles (separado por barra inclinada)"} required />
            </div>
          </div>

          <div className="fila">
            <div className="campo">
              <label>Tours por día</label>
              <input type="number" name="toursPorDia" value={formData.toursPorDia} onChange={handleChange}placeholder={id!=null?tour.toursPorDia:"Ej: 3"} required />
            </div>
            
            <div className="campo">
              <label>Horarios por día</label>
              <input type="text" name="salidas" value={formData.salidas} onChange={handleChange} placeholder={id!=null?tour.salidas:"Ej: 07:30 AM / 02:00 PM (separado por barra inclinada)"}required />
            </div>
            
          </div>
          <div className="fila">
            <div className="campo">
              <label>Recomendaciones</label>
              <input type="text" name="recomendaciones" value={formData.recomendaciones} onChange={handleChange} placeholder={id!=null?tour.recomendaciones:"Ej: llevar agua, utilizar ropa comoda (separado por comas)"} required />
            </div>
            <div className="campo">
              <label>Incluido</label>
              <input type="text" name="incluido" value={formData.incluido} onChange={handleChange} placeholder={id!=null?tour.incluido:"Ej: almuerzo, transporte (separado por comas)"} required />
            </div>
            
          </div>


          <div className="fila">
            <div className="campo full">
              <label>Descripción</label>
              <textarea name="descripcion" rows="4" value={formData.descripcion} onChange={handleChange}placeholder={id!=null?tour.descripcion:"Ej: esto es un tour por salento"} required></textarea>
            </div>
          </div>

          <div className="fila">
            <div className="campo full">
              <label>Imágenes del tour</label>
              <input type="file" name="imagenes"   multiple accept="image/*" onChange={handleImageChange} />
              <p className="info-img">SVG, PNG, JPG o GIF (máx. 7 Imagenes)</p>
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

          <div className="acciones">
            <button type="button" className="btn cancelar" onClick={onClose}>Cancelar</button>
            {id!=null?<button type="button" className="btn naranja" onClick={update}>Actualizar</button>:<button type="submit" className="btn azul">Añadir Tour</button>}
            
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalAgregarTour;
