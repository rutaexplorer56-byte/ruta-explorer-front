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
      img: "https://cocoratours.com.co/wp-content/uploads/2022/09/tour-valle-dle-cocora-1.jpg",      // opcional
    },
    {
      id: "2",
      label: "Experiencias de senderismo  privadas",
      img: "https://cocoratours.com.co/wp-content/uploads/2022/08/pasadia-valle-del-cocora-y-salento-1.jpg",
    },
    {
      id: "3",
      label: "Experiencias  senderismo (compartidas)",
      img: "https://cocoratours.com.co/wp-content/uploads/2022/09/la-carbonera-desde-salento.jpg",
    },
    {
      id: "4",
      label: "⁠Experiencias de aventura",
      img: "https://cocoratours.com.co/wp-content/uploads/2025/09/finca-cafetera-el-ocaso-reservar-3.jpg.webp",
    },
    {
      id: "5",
      label: "⁠Parques temáticos",
      img: "https://cocoratours.com.co/wp-content/uploads/2022/09/la-carbonera-desde-salento.jpg",
    },
    {
      id: "6",
      label: "⁠Experiencias gastronómicas",
      img: "https://cocoratours.com.co/wp-content/uploads/2025/09/finca-cafetera-el-ocaso-reservar-3.jpg.webp",
    },
    {
      id: "7",
      label: "⁠Tours con salida desde Pereira",
      img: "https://cocoratours.com.co/wp-content/uploads/2025/09/finca-cafetera-el-ocaso-reservar-3.jpg.webp",
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
                
                  {mostrarTours ? (<>

                  <div className="categoria-cards-container">
                    {categorias.map((cat) => (
                      <div
                        key={cat.id}
                        className={
                          "categoria-card" +
                          (categoriaSeleccionada === cat.id ? " categoria-card-activa" : "")
                        }
                        onClick={() => {
                          setCategoriaSeleccionada(cat.label)
                          setnumCategoria(cat.id)
                          setMostrarTours(!mostrarTours);
                        }}
                      >
                        <div className="categoria-card-img-wrapper">
                          <img src={cat.img} alt={cat.label} />
                          <div className="categoria-card-overlay" />
                          <span className="categoria-card-title">{cat.label}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  </>):(<>
                    <button  className="volver_categoria" onClick={() => setMostrarTours(!mostrarTours)}> <i className="bi bi-arrow-left-circle"></i> Volver a categorias</button>
                    <div className="container_cards">
                    <FilteredTours categoria={categoriaSeleccionada} numCategoria={numCategoria} hotel={hotel}></FilteredTours>
                    </div>
                  </>)}

                    <section className="seccion-reserva">
                        <div className="reserva-contenido">
                          <h3 className="reserva-subtitulo">...</h3>
                          <h2 className="reserva-titulo">Reserva fácil & difruta de la magia del eje cafetero</h2>

                          <p className="reserva-texto">
                            ¡Planear tu próxima aventura nunca había sido tan sencillo! En 
                            <strong>RutaExplorer</strong> te ayudamos a reservar tus experiencias de forma 
                            rápida, flexible y segura. Para asegurar tu cupo en cualquiera de nuestros tours 
                            por el Valle del Cocora y el Eje Cafetero, solo necesitas realizar   
                            <strong> tu reserva</strong> el día que desees.
                          </p>

                         <p className="reserva-texto">
                            En <strong>RutaExplorer</strong> hacemos que reservar tus actividades sea un 
                            proceso sencillo y flexible, para que puedas planear tu viaje sin estrés y con 
                            total tranquilidad.
                          </p>

                          <p className="reserva-texto">
                            Aceptamos pagos en <strong> Pesos Colombianos </strong>, para que disfrutes 
                            sin complicaciones sin importar de dónde nos visites. Con RutaExplorer, reservar 
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
                      {tours.slice(0, 5).map((exp) => (
                        <article key={exp.id} className="experiencia-card">
                          <div className="experiencia-img-wrapper">
                            <img src={exp.fotos[0]} alt={exp.titulo} />
                          </div>

                          <div className="experiencia-body">
                            <h3 className="experiencia-titulo">{exp.nombre}</h3>
                            <p className="experiencia-descripcion">{exp.descripcion}</p>

                            
                              <Link className="experiencia-link" to={`/tour/${hotel}/${exp.id}`}>
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