import Card from "../components/card";
import Header from "../components/header";
import Footer from "../components/footer";
import '../styles/tours.css'
import AOS from 'aos';
import { useEffect,useState } from 'react';
import axios from "../axiosConfig";
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

                {tours==0 ?(<>
      <div className="tour-message">
        
        <h2>En el momento nos enconramos en mantenimiento...</h2>
        <h2> Si deseas reservar con nosotros te invitamos a escribirnos al siguiente numero:</h2>
        <h2 className='phone'>+57 3124151539</h2>
        <img src='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASYAAACrCAMAAAD8Q8FaAAABtlBMVEUordJCouT///8orNMfpclauPgGUoj///0DL1lCouZCouMorNSq2OZFpOn2///5//8DR3IAKFQ7caHq6OcbS4BSgac2dq5LqOgAMlzl8vgdfawALVoDSHFDkMwFS38AP3Tt//8UZo3L6PMAI1E+qMQffabQ9fkymL5YtM5Un9UAKFElirItsdPQ4fAANWAjU3UnaJhIjr8AG0q85+8AQG2s4OU/nOQqQ38AN2fj+/0gdZk2frE4j9Bwvs8AEUKQqLY2kuAwit4AVred4esmWYhdvfqDzN13ueJctvylz+crgt02n7s5ecQccNciedkAYr4yhMUNacKRs9cWTpwAXsgOMG6pxNJ1hJbT3+J4y92R4u+NytZ/1eTU/f5dvdGk6e9spLGBweYZO1tQmLSFustqtOew3fJopdO68vkukLRymspXkKoAMGS01e5EpLhnscObweRaiMR+ncEARLsyTWxuirR8m7sqb7xrmNAaW69LY4G9yOTg5/oAKqgAK5aVosBbfcIHP6YhaKQaXNAQU5NSYogcYaypwcuVnbMAJWVcbpEQVa0YS5FTZoszSHaD2PiB4/8AAEoPS7+dAAAfzElEQVR4nO2dj0Mad7LAYXcV2RVQmzMSlICssAgaEpAElZZfahUjIZomRqu11ySmjfnR1zuba/uul7ZJW728e//xm5nvd5cFFrVK0vSVScBlgXX3szPznZnv7GqzdaQjHelIRzrSkY50pCMd6UhHOtKRjnSkIx3pSEc60pGOdKQjHelIR84oosh//r678UeRDqajJa4Qo3iHU0sBixNFMW5T4vCjw+k4kUBsHU5HiCjZbOrdzc27kmiTfu+dObuI6ECYabTtrMPGyut3JUndlMp3y5J6d0tS2O/6f+LS23MQorh1d2trs7iblaSNqWJRzd7dsin8lPxBRVFQl0Q63e3CJG1qorQRnipubhanPn4iSdn1tm38dxHRFocnRbeJthwJ+O1ssXx3U5NItM3N8jYu/zGVifZZlGLBS8OpvuFL0zHFFo+f+VBEdNzZqXBRVcS4SJuT1GJyKnt3U0LDU1iADg9FpJFQYq5RacchvQGBuCauxIZTiZHova7z56MzpWvBCGrXWTjB0UvrWXX+4ywwESVV21JhQZHmP55X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'></img>



      </div>

      </> ):(
          tours.filter(tour => tour.activo === true).map(tour =>{
            
            const precioMostrar = tour.tipo === "compartido"
            ? tour.precio
            : tour.precios?.length > 0
              ? Math.min(...tour.precios.map(p => p.precioPorPersona)) // el más barato
              : 0;
            return (

            
                        <Card
                        key={tour.id}
                        id={tour.id}
                        titulo={tour.nombre}
                        imagen={tour.fotos[0]}
                        personasMax={tour.cantidadMaxima}
                        horarios={tour.salidas}
                        duracion={tour.tiempo}
                        precio={precioMostrar}
                        idioma={tour.idioma}
                        precios={tour.precios}
                        tipo={tour.tipo}
                        activo={tour.activo}
                        />
                    )}))}

                     
                    

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