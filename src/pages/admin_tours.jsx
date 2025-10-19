import  { useState,useEffect } from 'react';
import Footer from "../components/footer";
import Header from "../components/header"
import Card from "../components/card";
import ModalAgregarTour from "../components/modal_tours";
import '../styles/admin_tours.css'
import axios from "../axiosConfig";

function Admin_tours(){
    const [modalAbierto, setModalAbierto] = useState(false);
    const [tours, setTours] = useState([]);

 const obtenerTours = async () => {

      try {
        const res = await axios.get('/api/tours');
        setTours(res.data); // aquí actualizamos el estado
        
      } catch (error) {
        console.error('Error al obtener tours:', error);
      }
    };
const actualizarTours = async () => {
       window.location.reload();
      try {
        const res = await axios.get('/api/tours');
        setTours(res.data); // aquí actualizamos el estado

 
      } catch (error) {
        console.error('Error al obtener tours:', error);
      }
  };
  useEffect(() => {
    
  obtenerTours();
  }, []);
console.log(tours)

    return(
        <>
        <Header></Header>
        <div className="container_titulo_tours">
            <h2 className="descripcion_tours">Tus Tours</h2>
            <button className="boton_tour" onClick={() => setModalAbierto(true)}>Crear nuevo Tour <i className="bi bi-plus-lg">   </i></button> 
            <ModalAgregarTour isOpen={modalAbierto}  onClose={() => setModalAbierto(false) } id={null} actualizarToursPadre={actualizarTours}></ModalAgregarTour>
        </div>
        
        <div className="container_cards">
                     {tours.map(tour =>{
            console.log(tour.activo)
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
                    )})}
                    

        </div>
        <Footer></Footer>
        </>

    )
}

export default Admin_tours;