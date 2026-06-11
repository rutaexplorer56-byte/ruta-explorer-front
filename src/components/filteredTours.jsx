import { useState, useEffect } from "react";
import axios from "../axiosConfig";
import Card from "./card";
import "../styles/tours.css";

function FilteredTours({ categoria, numCategoria, hotel, busqueda = "",  mostrarMensaje = false }) {
  const [tours, setTours] = useState([]);

  useEffect(() => {
    const obtenerTours = async () => {
      try {
        const res = await axios.get("/api/tours");
        setTours(res.data);
      } catch (error) {
        console.error("Error al obtener tours:", error);
      }
    };

    obtenerTours();
  }, []);

const normalizarTexto = (texto = "") => {
  return texto
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
};

const textoBuscado = normalizarTexto(busqueda);

const toursFiltrados = tours
  .filter((tour) => tour.activo === true)
  .filter((tour) => {
    if (categoria === "todos") return true;

    return String(tour.categoria) === String(numCategoria);
  })
  .filter((tour) => {
    if (!textoBuscado) return true;

    const nombreTour = normalizarTexto(tour.nombre);

    return nombreTour.includes(textoBuscado);
  });

 return (
        <>
          {toursFiltrados.length === 0 ? (
            mostrarMensaje ? (
              <div className="tour-message">
                <h2>No encontramos tours relacionados con "{busqueda}"</h2>
                <h2>Intenta buscar por otro nombre.</h2>
              </div>
            ) : null
          ) : (
            toursFiltrados.map((tour) => {
              const precioMostrar =
                tour.tipo === "compartido"
                  ? tour.precio
                  : tour.precios?.length > 0
                  ? Math.min(...tour.precios.map((p) => p.precioPorPersona))
                  : 0;

              return (
                <Card
                  key={tour.id}
                  id={tour.id}
                  titulo={tour.nombre}
                  imagen={tour.fotos?.[0]}
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
              );
            })
          )}
        </>
      );
}

export default FilteredTours;