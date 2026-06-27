import { useState, useEffect } from "react";
import axios from "../axiosConfig";
import Card from "./card";
import "../styles/tours.css";

function FilteredTours({ categoria, numCategoria,subCategoria, hotel, busqueda = "", filtros = {}, mostrarMensaje = false }) {
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
const obtenerPrecioTour = (tour) => {
  if (tour.tipo === "compartido") {
    return Number(tour.precio) || 0;
  }

  if (tour.precios?.length > 0) {
    return Math.min(
      ...tour.precios.map((p) => Number(p.precioPorPersona) || 0)
    );
  }

  return 0;
};

const obtenerHorasTour = (tiempo = "") => {
  const match = String(tiempo).match(/\d+([.,]\d+)?/);
  return match ? Number(match[0].replace(",", ".")) : 0;
};

const categoriasPorExperiencia = {
  naturaleza: ["2", "3", "8", "9"],
  cultura: ["1", "8"],
  aventura: ["4"],
  bienestar: ["10"],
  familiar: ["5", "6"],
};
const toursFiltrados = tours
  .filter((tour) => tour.activo === true)

  .filter((tour) => {
    if (categoria === "todos") return true;

    if (subCategoria) {
      return String(tour.subCategoria) === String(subCategoria);
    }

    if (numCategoria) {
      return String(tour.categoria) === String(numCategoria);
    }

    return true;
  })

  .filter((tour) => {
    if (!textoBuscado) return true;

    const nombreTour = normalizarTexto(tour.nombre);
    return nombreTour.includes(textoBuscado);
  })

  .filter((tour) => {
    if (!filtros?.categoriaTour || filtros.categoriaTour === "todos") {
      return true;
    }

    return String(tour.categoria) === String(filtros.categoriaTour);
  })

  .filter((tour) => {
    if (!filtros?.duracion || filtros.duracion === "todos") {
      return true;
    }

    const horas = obtenerHorasTour(tour.tiempo);

    if (filtros.duracion === "0-4") return horas <= 4;
    if (filtros.duracion === "4-8") return horas > 4 && horas <= 8;
    if (filtros.duracion === "8+") return horas > 8;

    return true;
  })

  .filter((tour) => {
    if (!filtros?.precioMax) return true;

    const precioTour = obtenerPrecioTour(tour);
    return precioTour <= filtros.precioMax;
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