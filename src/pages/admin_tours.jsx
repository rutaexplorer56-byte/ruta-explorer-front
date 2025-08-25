import  { useState,useEffect } from 'react';
import Footer from "../components/footer";
import Header from "../components/header"
import Card from "../components/card";
import ModalAgregarTour from "../components/modal_tours";
import '../styles/admin_tours.css'
import axios from 'axios';

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

      try {
        const res = await axios.get('http://localhost:3001/api/tours');
        setTours(res.data); // aquí actualizamos el estado

        
      } catch (error) {
        console.error('Error al obtener tours:', error);
      }
  };
  useEffect(() => {
    
  obtenerTours();
  }, []);

    return(
        <>
        <Header></Header>
        <div className="container_titulo_tours">
            <h2 className="descripcion_tours">Tus Tours</h2>
            <button className="boton_tour" onClick={() => setModalAbierto(true)}>Crear nuevo Tour <i className="bi bi-plus-lg">   </i></button> 
            <ModalAgregarTour isOpen={modalAbierto}  onClose={() => setModalAbierto(false) } id={null} actualizarToursPadre={actualizarTours}></ModalAgregarTour>
        </div>
        
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
                        actualizarToursPadre={actualizarTours}
                        />
                    ))}
                    

        </div>
        <Footer></Footer>
        </>

    )
}

export default Admin_tours;