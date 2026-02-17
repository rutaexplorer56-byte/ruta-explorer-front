import Card from "../components/card";
import Header from "../components/header";
import Footer from "../components/footer";
import '../styles/tours.css'
import AOS from 'aos';
import { useEffect,useState,useRef } from 'react';
import axios from "../axiosConfig";
import { useParams } from 'react-router-dom';
import { set } from "date-fns";
import FilteredTours from "../components/filteredTours";
import { Link } from 'react-router-dom';
function Tours(){
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

  const images = [
    "https://upload.wikimedia.org/wikipedia/commons/2/2c/Filandia.jpg",
    "https://listsbylukiih.com/wp-content/uploads/2025/02/cocora-valley-colombia-mirador-2-trees.webp",
    "https://bucketlistbri.com/wp-content/uploads/2018/03/DSC07841-min-min.jpg"
    ,"https://admin.kunapak.com/uploads/imagenes/47556c0d72642b8a15b5563514eb47aeab0f9ad2.jpg",
    "https://manwiththemovingcamera.com/wp-content/uploads/Main-pic-IMG_9763.jpg"
  ];
   const categorias = [
    {
      id: "1",
      label: "Rutas cafeteras",
      description: "Recorridos inmersivos por el corazón del Paisaje Cultural Cafetero, descubriendo fincas, miradores y la esencia del café colombiano.",
      img: "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/1a/7b/8f/64/caption.jpg?w=500&h=400&s=1",      // opcional
    },
    {
      id: "2",
      label: "Experiencias de senderismo  privadas",
      description:"Tours exclusivos de senderismo con guía personal, ideales para quienes buscan tranquilidad, flexibilidad y una conexión más íntima con la naturaleza.",
      img: "https://cdn.getyourguide.com/image/format=auto,fit=contain,gravity=auto,quality=60,width=1440,height=650,dpr=1/tour_img/4c3da771a8af41b49b18b11c2c26e0bee40e4b32982966e00d8ebd4185435049.jpg",
    },
    {
      id: "3",
      label: "Experiencias  senderismo (compartidas)",
      description:"Caminatas grupales en los principales destinos naturales del Eje Cafetero, perfectas para disfrutar en compañía y conocer nuevos viajeros.",
      img: "https://www.quindioecotours.com/wp-content/uploads/2020/07/Carbonera-2.jpg",
    },
    {
      id: "4",
      label: "⁠Experiencias de aventura",
      description:"Actividades llenas de adrenalina como cabalgatas, canopy, cuatrimotos y más, creadas para quienes buscan emoción en el Eje Cafetero.",
      img: "https://www.valledelcocora.com.co/w/wp-content/uploads/2024/07/Caballos.jpg",
    },
    {
      id: "5",
      label: "⁠Parques temáticos",
      description:"Visitas a los parques más emblemáticos de la región, combinando diversión, cultura y naturaleza para todas las edades.",
      img: "https://parquedelcafe.co/wp-content/uploads/2024/12/PDC-Avix-Experiencia-012-scaled.jpg",
    },
    {
      id: "6",
      label: "⁠Experiencias gastronómicas",
      description:"Degustaciones, clases y recorridos culinarios donde podrás disfrutar los sabores auténticos del Eje Cafetero.",
      img: "https://arracheramex.wordpress.com/wp-content/uploads/2013/09/tejaditos_trucha.jpg",
    },
    {
      id: "7",
      label: "⁠Tours con salida desde Pereira",
      description:"Experiencias especialmente diseñadas para viajeros ubicados en Pereira, con transporte incluido y rutas optimizadas.",
      img: "https://elpereirano.com/wp-content/uploads/2025/02/6747cfeab9c02.r_d.1215-694-8176.jpeg",
    },
    {
      id: "8",
      label: "⁠Tours con salida desde Filandia",
      description:"Experiencias especialmente diseñadas para viajeros que se encuentren ubicados en Filandia",
      img: "https://elpereirano.com/wp-content/uploads/2025/02/6747cfeab9c02.r_d.1215-694-8176.jpeg",
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
  }, []);


  useEffect(() => {
    const id = setInterval(() => {
      if (!pausedRef.current) {
        setSlide((s) => (s + 1) % images.length);
      }
    }, 4000);
    return () => clearInterval(id);
  }, [images.length]);
const scrollLeft = (id) => {
  const container = document.getElementById(`scroll-${id}`);
  container.scrollBy({ left: -250, behavior: "smooth" });
};

const scrollRight = (id) => {
  const container = document.getElementById(`scroll-${id}`);
  container.scrollBy({ left: 200, behavior: "smooth" });
};


    return(
            <>
            <Header></Header>
            <div className="container_tours">
                <div className="hero-slider fade"data-aos="fade-down">
                    {images.map((src, i) => (
                      <div
                        key={i}
                        className={`fade-slide ${i === slide ? "active" : ""}`}
                        style={{ backgroundImage: `url(${src})` }}
                      ><span className="bg">
                        </span>
                        <h1 className="titulo">¡Explora destinos, vive experiencias: ruta.xplorer tu compañero de viaje!
                      EN EL EJE CAFETERO <br></br><div>OPERADORA TURISTICA EN EL EJE CAFETERO <br></br>
                      AGENCIA DE VIAJES</div> </h1>
                      </div>
                    ))}

                    
                  </div>
               
                <div className="titulo-tours">
                  <p>TOURS</p>
                  <h1>OPERADORA TURISTICA <br></br>
                      AGENCIA DE VIAJES</h1>
                  <span></span>
                </div>
                <div className="container-tours">
                  {tours? (categorias.map((cat) => {
                     const toursDeCategoria = tours.filter(t => t.categoria === cat.id);

  // si no hay tours → NO renderizar nada
                  if (toursDeCategoria.length === 0) return null;
                  const showArrows = toursDeCategoria.length > 2;
                    return(
                      
                     <div className="categoria" key={cat.id}>
                          <h2 className="titulo-categoria">{cat.label}</h2>
                          <span className="span">{cat.description}</span>

                          <div className="slider-wrapper">
                            {showArrows && (
                              <button
                                className="arrow left"
                                onClick={() => scrollLeft(cat.id)}
                              >
                                ◀
                              </button>
                            )}

                            <div id={`scroll-${cat.id}`} className="tours-categoria">
                              <FilteredTours
                                categoria={cat.label}
                                numCategoria={cat.id}
                                hotel={hotel}
                              />
                            </div>

                            {showArrows && (
                              <button
                                className="arrow right"
                                onClick={() => scrollRight(cat.id)}
                              >
                                ▶
                              </button>
                            )}
                          </div>
                        </div>
                        
                        )})):
                        (
                           <div className="tour-message">
            
                              <h2>En el momento no contamos con tours disponibles ...</h2>
                              <h2> Si deseas reservar con nosotros te invitamos a escribirnos al siguiente numero:</h2>
                              <h2 className='phone'>+57 3124151539</h2>
                              <img src="https://www.mdirector.com/wp-content/uploads/2022/04/smsreservar.jpg" alt="No tours available" />
                                             
                            </div>
                        )
                  }
                  

                </div>


{/* 
                {tours?(
                    categorias.map((cat) => {
                      return(
                        <div className="categoria" key={cat.id}>
                        <h2 className="titulo-categoria">{cat.label}</h2>
                        <div className="tours-categoria">
                          <FilteredTours
                            categoria={cat.label} 
                            numCategoria={cat.id}
                            hotel={hotel}
                          />


                        </div>
                      </div>
                      )
                      
                    }
                      
                     
            

                  ):(<></>)} */}
                
                  

                    <section className="seccion-reserva">
                        <div className="reserva-contenido">
                          <h3 className="reserva-subtitulo">...</h3>
                          <h2 className="reserva-titulo">Reserva fácil & difruta de la magia del eje cafetero</h2>

                          <p className="reserva-texto">
                            ¡Planear tu próxima aventura nunca había sido tan sencillo! En 
                            <strong>Ruta Xplorer</strong> te ayudamos a reservar tus experiencias de forma 
                            rápida, flexible y segura. Para asegurar tu cupo en cualquiera de nuestros tours 
                            por el Valle del Cocora y el Eje Cafetero, solo necesitas realizar   
                            <strong> tu reserva</strong> el día que desees.
                          </p>

                         <p className="reserva-texto">
                            En <strong>Ruta Xplorer</strong> hacemos que reservar tus actividades sea un 
                            proceso sencillo y flexible, para que puedas planear tu viaje sin estrés y con 
                            total tranquilidad.
                          </p>

                          <p className="reserva-texto">
                            Aceptamos pagos en <strong> Pesos Colombianos </strong>, para que disfrutes 
                            sin complicaciones sin importar de dónde nos visites. Con Ruta Xplorer, reservar 
                            tus actividades se convierte en un proceso fácil, confiable y diseñado para que 
                            solo te preocupes de lo más importante:
                            <br /><br />
                            👉 <strong>Vivir una experiencia inolvidable en el corazón del Eje Cafetero.</strong>
                          </p>
                        </div>

                        <div className="reserva-imagenes">
                          <img src="https://cdn-icons-png.flaticon.com/512/7325/7325270.png" className="img-principal" />
                          
                        </div>
                      </section>


                   <div className="titulo-tours">
                  <p>TOURS</p>
                  <h1>QUE TE PUEDAN INTERESAR</h1>
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

                            
                              <Link className="experiencia-link" to={`/tour/${hotel}/${exp.nombre}`}>
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