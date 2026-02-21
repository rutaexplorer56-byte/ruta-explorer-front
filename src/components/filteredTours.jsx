import { useState,useEffect } from "react";
import axios from "../axiosConfig";
import Card from "./card";
import '../styles/tours.css'


function FilteredTours({categoria,numCategoria,hotel}) {
 
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
  const toursFiltrados =
    categoria === "todos"
      ? tours
      : tours.filter((tour) => tour.categoria === numCategoria);
  return (
    <>

    
    {toursFiltrados==0 ?(<>
          {/* <div className="tour-message">
            
            <h2>En el momento no contamos con tours disponibles ...</h2>
            <h2> Si deseas reservar con nosotros te invitamos a escribirnos al siguiente numero:</h2>
            <h2 className='phone'>+57 3124151539</h2>
            <img src="https://www.mdirector.com/wp-content/uploads/2022/04/smsreservar.jpg" alt="No tours available" />
            
    
    
    
          </div> */}
    
          </> ):(
              
              toursFiltrados.filter(tour => tour.activo === true).map(tour =>{
                
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
                            hotel={hotel}
                            slug={tour.slug}
                            
                            />
                        )}))
                        
                        
                        }
                        {/* {mostrarTours ? (<>

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
                  </>)} */}
      
    </>
  );
}   
export default FilteredTours;