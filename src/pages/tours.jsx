import Card from "../components/card";
import Header from "../components/header";
import Footer from "../components/footer";
import '../styles/tours.css'
import AOS from 'aos';
import { useEffect,useState } from 'react';
import axios from 'axios';
function Tours(){
    useEffect(() => {
      AOS.init({
        duration: 1000, // duración de la animación
        once: true,     // solo una vez al entrar al viewport
      });
    }, []);
   


const [tours, setTours] = useState([]);

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

    return(
            <>
            <Header></Header>
            <div className="container_tours">
                
                <h1 className="titulo">Descubre la magia de Salento y sus paisajes únicos. Vive experiencias inolvidables en cada tour, conectando con la naturaleza, la cultura y la aventura</h1>
                <div className="container_img" data-aos="fade-down">
                    
                    <img src="https://d2yoo3qu6vrk5d.cloudfront.net/images/20220707153640/cropped-valle-cocora-1-3.webp"></img>
                    
                </div>
                <h2 className="descripcion">Tours guiados por los destinos más icónicos del Quindío. Reserva tu experiencia y deja que comience la aventura.</h2>
               <div className="container_cards">
                     {tours.map(tour => (
                        <Card
                        key={tour.id}
                        id={tour.id}
                        titulo={tour.nombre}
                        imagen={tour.fotos[0]}
                        personasMax={tour.cantidadMaxima}
                        horarios={tour.salidas}
                        duracion={tour.tiempo}
                        precio={tour.precio}
                        idioma={tour.idioma}
                        />
                    ))}
                    

               </div>

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