import Card from "../components/card";
import Header from "../components/header";
import Footer from "../components/footer";
import '../styles/tours.css'
import AOS from 'aos';
import { useEffect,useState,useRef, useMemo } from 'react';
import axios from "../axiosConfig";
import { useParams } from 'react-router-dom';
import { set } from "date-fns";
import FilteredTours from "../components/filteredTours";
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import imagen from "../assets/paisaje_hero.png";
import GoogleReviews from "../components/GoogleReviews";

function Tours(){
  const [busqueda, setBusqueda] = useState("");

  const { i18n } = useTranslation();
  const { t } = useTranslation();
  const lang = (i18n.language || "es").split("-")[0];
    useEffect(() => {
      AOS.init({
        duration: 1000, // duración de la animación
        once: true,     // solo una vez al entrar al viewport
      });
    }, []);
   


  const [tours, setTours] = useState([]);
  const [slide, setSlide] = useState(0);
  const pausedRef = useRef(false);
  const { hotel} = useParams();
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("");
  const [numCategoria, setnumCategoria] = useState("");
  const [mostrarTours, setMostrarTours] = useState(true);
  const [salidaSeleccionada, setSalidaSeleccionada] = useState(null);
// const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(null);
const [toursMasReservados, setToursMasReservados] = useState([]);
const filtrosIniciales = {
  categoriaTour: "todos",
  duracion: "todos",
  precioMax: 0,
};
const [filtros, setFiltros] = useState(filtrosIniciales);
// const categorias = [ { id: "1", label: "Rutas cafeteras", description: "Recorridos inmersivos por el corazón del Paisaje Cultural Cafetero, descubriendo fincas, miradores y la esencia del café colombiano.", img: "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/1a/7b/8f/64/caption.jpg?w=500&h=400&s=1",  }, { id: "2", label: "Experiencias de senderismo privadas", description:"Tours exclusivos de senderismo con guía personal, ideales para quienes buscan tranquilidad, flexibilidad y una conexión más íntima con la naturaleza.", img: "https://cdn.getyourguide.com/image/format=auto,fit=contain,gravity=auto,quality=60,width=1440,height=650,dpr=1/tour_img/4c3da771a8af41b49b18b11c2c26e0bee40e4b32982966e00d8ebd4185435049.jpg", }, { id: "3", label: "Experiencias senderismo (compartidas)", description:"Caminatas grupales en los principales destinos naturales del Eje Cafetero, perfectas para disfrutar en compañía y conocer nuevos viajeros.", img: "https://www.quindioecotours.com/wp-content/uploads/2020/07/Carbonera-2.jpg", }, { id: "4", label: "⁠Experiencias de aventura", description:"Actividades llenas de adrenalina como cabalgatas, canopy, cuatrimotos y más, creadas para quienes buscan emoción en el Eje Cafetero.", img: "https://www.valledelcocora.com.co/w/wp-content/uploads/2024/07/Caballos.jpg", }, { id: "5", label: "⁠Parques temáticos", description:"Visitas a los parques más emblemáticos de la región, combinando diversión, cultura y naturaleza para todas las edades.", img: "https://parquedelcafe.co/wp-content/uploads/2024/12/PDC-Avix-Experiencia-012-scaled.jpg", }, { id: "6", label: "⁠Experiencias gastronómicas", description:"Degustaciones, clases y recorridos culinarios donde podrás disfrutar los sabores auténticos del Eje Cafetero.", img: "https://arracheramex.wordpress.com/wp-content/uploads/2013/09/tejaditos_trucha.jpg", }, { id: "7", label: "⁠Tours con salida desde Pereira", description:"Experiencias especialmente diseñadas para viajeros ubicados en Pereira, con transporte incluido y rutas optimizadas.", img: "https://elpereirano.com/wp-content/uploads/2025/02/6747cfeab9c02.r_d.1215-694-8176.jpeg", }, { id: "8", label: "⁠Tours con salida desde Filandia", description:"Experiencias especialmente diseñadas para viajeros que se encuentren ubicados en Filandia", img: "https://elpereirano.com/wp-content/uploads/2025/02/6747cfeab9c02.r_d.1215-694-8176.jpeg", }, ];
const categorias = [
  {
    id: "1",
    labelKey: "categories.coffeeRoutes.label",
    descKey: "categories.coffeeRoutes.description",
    img: "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/1a/7b/8f/64/caption.jpg?w=900&h=600&s=1",
    alt: "Ruta cafetera en Salento y el Eje Cafetero",
  },
  {
    id: "2",
    labelKey: "categories.privateHiking.label",
    descKey: "categories.privateHiking.description",
    img: "https://planesquindio.com/wp-content/uploads/2026/05/caminatas-por-el-quindio.webp",
    alt: "Senderismo privado en paisajes naturales del Quindío",
  },
  {
    id: "3",
    labelKey: "categories.sharedHiking.label",
    descKey: "categories.sharedHiking.description",
    img: "https://turismoquindio.com/wp-content/uploads/2017/08/valle-de-cocora-salento-ejecafetero.jpg",
    alt: "Senderismo compartido en el Valle del Cocora",
  },
  {
    id: "4",
    labelKey: "categories.adventure.label",
    descKey: "categories.adventure.description",
    img: "https://media-cdn.tripadvisor.com/media/attractions-splice-spp-674x446/11/ad/a9/15.jpg",
    alt: "Tour de aventura a caballo en Salento",
  },
  {
    id: "5",
    labelKey: "categories.themeParks.label",
    descKey: "categories.themeParks.description",
    img: "https://turismoquindio.com/wp-content/uploads/2017/08/krater4.jpg",
    alt: "Parques temáticos del Eje Cafetero",
  },
  {
    id: "6",
    labelKey: "categories.gastronomy.label",
    descKey: "categories.gastronomy.description",
    img: "https://www.triviantes.com/wp-content/uploads/2021/04/Trucha-Salento.jpg",
    alt: "Gastronomía típica de Salento y el Quindío",
  },
  {
    id: "7",
    labelKey: "categories.fromPereira.label",
    descKey: "categories.fromPereira.description",
    img: "https://www.triviantes.com/wp-content/uploads/2021/06/Salento-1200x900.jpg",
    alt: "Tours desde Pereira hacia Salento y el Eje Cafetero",
  },
  {
    id: "8",
    labelKey: "categories.fromFilandia.label",
    descKey: "categories.fromFilandia.description",
    img: "https://imagescdn.citix.com.co/citix/production/tours/7ff213c0-c9c0-4dd8-b7e6-d17a39da3a2b/ad75789611820690cb0874dfa36cdbc2.jpg",
    alt: "Tours desde Filandia Quindío",
  },
  {
    id: "9",
    labelKey: "categories.carbonera.label",
    descKey: "categories.carbonera.description",
    img: "https://www.quindioecotours.com/wp-content/uploads/2020/07/Carbonera-2.jpg",
    alt: "Tour a La Carbonera con palmas de cera",
  },
  {
    id: "10",
    labelKey: "categories.hotelsQuindio.label",
    descKey: "categories.hotelsQuindio.description",
    img: "https://turismoquindio.com/wp-content/uploads/2017/07/hotel-las-camelias-quindio-107-800x507.jpg",
    alt: "Tours para hoteles del Quindío",
  },
];

const salidas = [
  {
    id: "1",
    titulo: "SALIDAS DESDE SALENTO",
    descripcion: "Experiencias con salida desde Salento y hoteles en Salento.",
    img: "https://www.triviantes.com/wp-content/uploads/2021/06/Salento-1200x900.jpg",
  },
  {
    id: "2",
    titulo: "SALIDAS DESDE PEREIRA",
    descripcion: "Experiencias con salida desde Pereira y alrededores.",
    img: "https://www.semana.com/resizer/FMwD006VZT9DmxOhvLb_aIDHats=/arc-anglerfish-arc2-prod-semana/public/NJLMN3XLA5AE5K3MIMZWJ6L7MU.png",
  },
  {
    id: "3",
    titulo: "SALIDAS DESDE HOTELES DEL QUINDÍO",
    descripcion: "Experiencias con recogida en hoteles de todo el Quindío.",
    img: "https://turismoquindio.com/wp-content/uploads/2017/07/hotel-las-camelias-quindio-107-800x507.jpg",
  },
];


  useEffect(() => {
    const obtenerTours = async () => {
      try {
        const res = await axios.get('/api/tours');
        
        setTours(res.data); // aquí actualizamos el estado
        
      } catch (error) {
        console.error('Error al obtener tours:', error);
      }
    };
    obtenerTours();
  }, [lang]);
useEffect(() => {
  const obtenerToursMasReservados = async () => {
    try {
      const res = await axios.get("/api/tours/mas-reservados");
      setToursMasReservados(res.data);
      consolo.log()
    } catch (error) {
      console.error("Error cargando tours más reservados:", error);
    }
  };

  obtenerToursMasReservados();
}, []);


const scrollLeft = (id) => {
  const container = document.getElementById(`scroll-${id}`);
  container.scrollBy({ left: -250, behavior: "smooth" });
};

const scrollRight = (id) => {
  const container = document.getElementById(`scroll-${id}`);
  container.scrollBy({ left: 200, behavior: "smooth" });
};
const seccionRef = useRef(null);

  const scrollToSection = () => {
    seccionRef.current?.scrollIntoView({
      behavior: "smooth"
    });
  };

// const categoriasConTours = categorias.filter((cat) =>
//   tours?.some((tour) => tour.categoria === cat.id && tour.activo === true)
// );
const salidasConTours = salidas.filter((salida) =>
  tours?.some(
    (tour) =>
      tour.activo === true &&
      String(tour.subCategoria) === String(salida.id)
  )
);

const obtenerPrecioMostrar = (tour) => {
  if (tour.tipo === "compartido") {
    return Number(tour.precio || 0).toLocaleString("es-CO");
  }

  if (tour.precios?.length > 0) {
    const menorPrecio = Math.min(
      ...tour.precios.map((p) => Number(p.precioPorPersona) || 0)
    );

    return menorPrecio.toLocaleString("es-CO");
  }

  return "0";
};
const categoriasTours = [
  { id: "1", nombre: "Rutas cafeteras" },
  { id: "2", nombre: "Experiencias de senderismo privadas" },
  { id: "3", nombre: "Experiencias de senderismo compartidas" },
  { id: "4", nombre: "Experiencias de aventura" },
  { id: "5", nombre: "Parques temáticos" },
  { id: "6", nombre: "Experiencias gastronómicas" },
  { id: "7", nombre: "Tours con salida desde Pereira" },
  { id: "8", nombre: "Tours con salida desde Filandia" },
  { id: "9", nombre: "Tours a la Carbonera" },
  { id: "10", nombre: "Tours desde los Hoteles del Quindío" },
];

const categoriasFiltroDisponibles = categoriasTours.filter((cat) =>
  tours?.some((tour) => {
    const tourActivo = tour.activo === true;
    const coincideCategoria = String(tour.categoria) === String(cat.id);

    if (salidaSeleccionada) {
      return (
        tourActivo &&
        coincideCategoria &&
        String(tour.subCategoria) === String(salidaSeleccionada.id)
      );
    }

    return tourActivo && coincideCategoria;
  })
);

    return(
            <>
            <Header></Header>
            <div className="container_tours">
                
               
                <div className="titulo-tours">
                <p>{t("home.tours")}</p>
                <h1 className="titulo-tours">
                  {t("home.operadora")} <br />
                  {t("home.agencia")}
                </h1>
                <span></span>
              </div>

             <div className="buscador-tours">
                  <input
                    type="text"
                    placeholder="Buscar tour por nombre..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                  />
                </div>

               
          
                      
              <div className="container-tours" ref={seccionRef}>
                {tours && tours.length > 0 ? (
                  <>
                    {busqueda.trim() === "" && !salidaSeleccionada && (
                      <div className="salidas-section">
                        <div className="salidas-header">
                          <h2>¿DESDE DÓNDE DESEAS SALIR?</h2>
                          <p>
                            Elige tu punto de salida y descubre las mejores experiencias
                            disponibles para ti.
                          </p>
                        </div>

                        <div className="salidas-grid">
                          {salidasConTours.map((salida) => (
                            <div key={salida.id} className="salida-card">
                              <div className="salida-img-wrapper">
                                <img
                                  src={salida.img}
                                  alt={salida.titulo}
                                  className="salida-img"
                                  loading="lazy"
                                />
                              </div>

                              <div className="salida-icon">📍</div>

                              <div className="salida-content">
                                <h3>{salida.titulo}</h3>
                                <p>{salida.descripcion}</p>

                                <button
                                  type="button"
                                  className="salida-btn"
                                  onClick={() => setSalidaSeleccionada(salida)}
                                >
                                  VER EXPERIENCIAS
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {busqueda.trim() !== "" ? (
                      <div className="categoria resultados-busqueda">
                        <div className="tours-layout-filtros">
                          <aside className="filtros-sidebar">
                            <h3>Filtrar experiencias</h3>

                            <div className="filtro-grupo">
                             <h4>Categoría</h4>

                            {[
                              { id: "todos", nombre: "Todos" },
                              ...categoriasFiltroDisponibles,
                            ].map((item) => (
                              <label key={item.id} className="filtro-check">
                                <input
                                  type="radio"
                                  name="categoriaTour"
                                  checked={filtros.categoriaTour === item.id}
                                  onChange={() =>
                                    setFiltros((prev) => ({
                                      ...prev,
                                      categoriaTour: item.id,
                                    }))
                                  }
                                />
                                <span>{item.nombre}</span>
                              </label>
                            ))}
                            </div>

                            <div className="filtro-grupo">
                              <h4>Duración</h4>

                              {[
                                { value: "todos", label: "Cualquier duración" },
                                { value: "0-4", label: "0 - 4 horas" },
                                { value: "4-8", label: "4 - 8 horas" },
                                { value: "8+", label: "Más de 8 horas" },
                              ].map((item) => (
                                <label key={item.value} className="filtro-check">
                                  <input
                                    type="radio"
                                    name="duracion"
                                    checked={filtros.duracion === item.value}
                                    onChange={() =>
                                      setFiltros((prev) => ({
                                        ...prev,
                                        duracion: item.value,
                                      }))
                                    }
                                  />
                                  <span>{item.label}</span>
                                </label>
                              ))}
                            </div>

                            <div className="filtro-grupo">
                              <h4>Precio por persona</h4>

                              <input
                                type="range"
                                min="0"
                                max="300000"
                                step="10000"
                                value={filtros.precioMax}
                                onChange={(e) =>
                                  setFiltros((prev) => ({
                                    ...prev,
                                    precioMax: Number(e.target.value),
                                  }))
                                }
                                className="filtro-range"
                              />

                              <div className="precio-rango">
                                <span>$0</span>
                                <span>
                                  ${Number(filtros.precioMax).toLocaleString("es-CO")}
                                </span>
                              </div>
                            </div>

                            <button
                              type="button"
                              className="btn-limpiar-filtros"
                              onClick={() =>
                                setFiltros({
                                  tipoExperiencia: "todos",
                                  duracion: "todos",
                                  precioMax: 3000000,
                                })
                              }
                            >
                              Limpiar filtros
                            </button>
                          </aside>

                          <div className="tours-listado">
                            <div className="tours-categoria">
                              <FilteredTours
                                key={`${lang}-busqueda-${busqueda}`}
                                categoria="todos"
                                hotel={hotel}
                                busqueda={busqueda}
                                filtros={filtros}
                                mostrarMensaje={true}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : salidaSeleccionada ? (
                      <div className="categoria tours-filtrados-categoria">
                        <div className="titulo-categoria-seleccionada">
                          <button
                            type="button"
                            className="volver-categorias"
                            onClick={() => setSalidaSeleccionada(null)}
                          >
                            ← Volver
                          </button>

                          <h2>{salidaSeleccionada.titulo}</h2>
                          <span>{salidaSeleccionada.descripcion}</span>
                        </div>

                        <div className="tours-layout-filtros">
                          <aside className="filtros-sidebar">
                            <h3>Filtrar experiencias</h3>

                            


                             <h4>Categoría</h4>

                                  {[
                                    { id: "todos", nombre: "Todos" },
                                    ...categoriasFiltroDisponibles,
                                  ].map((item) => (
                                    <label key={item.id} className="filtro-check">
                                      <input
                                        type="radio"
                                        name="categoriaTour"
                                        checked={filtros.categoriaTour === item.id}
                                        onChange={() =>
                                          setFiltros((prev) => ({
                                            ...prev,
                                            categoriaTour: item.id,
                                          }))
                                        }
                                      />
                                      <span>{item.nombre}</span>
                                    </label>
                                  ))}

                            <div className="filtro-grupo">
                              <h4>Duración</h4>

                              {[
                                { value: "todos", label: "Cualquier duración" },
                                { value: "0-4", label: "0 - 4 horas" },
                                { value: "4-8", label: "4 - 8 horas" },
                                { value: "8+", label: "Más de 8 horas" },
                              ].map((item) => (
                                <label key={item.value} className="filtro-check">
                                  <input
                                    type="radio"
                                    name="duracion"
                                    checked={filtros.duracion === item.value}
                                    onChange={() =>
                                      setFiltros((prev) => ({
                                        ...prev,
                                        duracion: item.value,
                                      }))
                                    }
                                  />
                                  <span>{item.label}</span>
                                </label>
                              ))}
                            </div>

                            <div className="filtro-grupo">
                              <h4>Precio por persona</h4>

                              <input
                                type="range"
                                min="0"
                                max="3000000"
                                step="10000"
                                value={filtros.precioMax}
                                onChange={(e) =>
                                  setFiltros((prev) => ({
                                    ...prev,
                                    precioMax: Number(e.target.value),
                                  }))
                                }
                                className="filtro-range"
                              />

                              <div className="precio-rango">
                                <span>$0</span>
                                <span>
                                  ${Number(filtros.precioMax).toLocaleString("es-CO")}
                                </span>
                              </div>
                            </div>

                            <button
                              type="button"
                              className="btn-limpiar-filtros"
                              onClick={() =>
                                setFiltros({
                                 categoriaTour: "todos",
                                  duracion: "todos",
                                  precioMax: 3000000,
                                })
                              }
                            >
                              Limpiar filtros
                            </button>
                          </aside>

                          <div className="tours-listado">
                            <div className="tours-categoria">
                              <FilteredTours
                                key={`${lang}-salida-${salidaSeleccionada.id}`}
                                subCategoria={salidaSeleccionada.id}
                                hotel={hotel}
                                busqueda=""
                                filtros={filtros}
                                mostrarMensaje={true}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : null}
                  </>
                ) : (
                  <div className="tour-message">
                    <h2>En el momento no contamos con tours disponibles ...</h2>
                    <h2>
                      Si deseas reservar con nosotros te invitamos a escribirnos al siguiente
                      número:
                    </h2>
                    <h2 className="phone">+57 3124151539</h2>
                    <img
                      src="https://www.mdirector.com/wp-content/uploads/2022/04/smsreservar.jpg"
                      alt="No tours available"
                    />
                  </div>
                )}
              </div>
{busqueda.trim() === "" && !salidaSeleccionada && toursMasReservados.length > 0 && (
  <section className="experiencias-reservadas">
    <div className="experiencias-reservadas-header">
      <h2>
        <span>⭐</span> EXPERIENCIAS MÁS RESERVADAS
      </h2>

      
    </div>

    <div className="experiencias-reservadas-grid">
{toursMasReservados
  .filter((tour) => tour.activo === true || tour.activo === 1)
  .slice(0, 4)
  .map((tour, index) => (
    <div key={tour.id} className="experiencia-reservada-card">
      <div className="experiencia-reservada-img">
        <img
          src={tour.fotos?.[0]}
          alt={tour.nombre}
          loading="lazy"
        />

        {index === 0 && (
          <span className="experiencia-badge">
            MÁS VENDIDO
          </span>
        )}
      </div>

      <div className="experiencia-reservada-info">
        <h3>{tour.nombre}</h3>

        <div className="experiencia-meta">
          <span>
            <i className="bi bi-clock"></i>
            {tour.tiempo}
          </span>

          <span>
            {tour.totalReservas} reservas
          </span>
        </div>

        <p>
          Desde{" "}
          <strong>
            ${obtenerPrecioMostrar(tour)} COP
          </strong>
        </p>

        <Link
          className="experiencia-link"
          to={`/tour/${hotel || "RutaExplorer"}/${tour.slug}`}
        >
          Ver más Detalles <span>➜</span>
        </Link>
      </div>
    </div>
  ))}
    </div>
  </section>
)}





                  
                
                  

                    <section className="seccion-reserva">
                        <div className="reserva-contenido">
                          <h3 className="reserva-subtitulo">...</h3>
                  <h2 className="reserva-titulo">
                          {t("booking.title")}
                        </h2>

                        <p className="reserva-texto">
                          {t("booking.p1")}
                        </p>

                        <p className="reserva-texto">
                          {t("booking.p2")}
                        </p>

                        <p className="reserva-texto">
                          {t("booking.p3")}
                            <br />
                          <strong>👉{t("booking.highlight")}</strong>
                        </p>
                          
                        </div>

                        <div className="reserva-imagenes">
                          <img src="https://cdn-icons-png.flaticon.com/512/7325/7325270.png" className="img-principal" />
                          
                        </div>
                      </section>


                   <div className="titulo-tours">
                  <p>Comentarios</p>
                  <h1>Ellos ya vivieron la aventura en Quindío - Colombia</h1>
                  <span></span>
                </div>
                <GoogleReviews></GoogleReviews>

                <div className="titulo-tours">
                  <p>{t("sectionLabel")}</p>
                  <h1>{t("sectionTitle")}</h1>
                  <span></span>
                </div>

                 <section className="experiencias-section">
                   
      
                    {/* CONTENEDOR DESPLAZABLE */}
                    <div className="experiencias-scroll">
                      {tours.slice(0, 4).map((exp) => (
                        <article key={exp.id} className="experiencia-card">
                          <div className="experiencia-img-wrapper">
                            <img src={exp.fotos[0]} alt={exp.titulo} />
                          </div>

                          <div className="experiencia-body">
                            <h3 className="experiencia-titulo">{exp.nombre}</h3>
                            <p className="experiencia-descripcion">{exp.descripcion}</p>

                            
                              <Link className="experiencia-link" to={`/tour/${hotel}/${exp.slug}`}>
                              Leer más <span>➜</span>
                              </Link>
                          
                          </div>
                        </article>
                      ))}
                    </div>
                  </section>
                

           

                     
                    

               

               <div className="container_logos"data-aos="fade">
                <img className="img_logo" src="https://rutaxplorer.com/wp-content/uploads/2024/03/WhatsApp-Image-2024-03-26-at-14.28.24.jpeg"></img>
                <img className="img_logo" src="https://rutaxplorer.com/wp-content/uploads/2023/08/logo_camara.jpeg"></img>
                <img className="img_logo" src="https://rutaxplorer.com/wp-content/uploads/2023/08/RNT.jpeg"></img>
                <img className="img_logo" src="https://rutaxplorer.com/wp-content/uploads/2023/08/logo_fontur.png"></img>
                <img className="img_logo" src="https://rutaxplorer.com/wp-content/uploads/2023/07/Tripadvisor_Logo_circle-green_vertical-lockup_registered_CMYK-1024x475.png"></img>
               </div>
               

            </div>
            <Footer></Footer>
            </>
    )
}

export default Tours;