
import { useState, useEffect,useMemo } from "react";
import Footer from "../components/footer";
import Header from "../components/header";
import Card from "../components/card";
import ModalAgregarTour from "../components/modal_tours";
import "../styles/admin_tours.css";
import axios from "../axiosConfig";

function Admin_tours() {
  const [modalAbierto, setModalAbierto] = useState(false);
  const [tours, setTours] = useState([]);
  const [editId, setEditId] = useState(null);
  const [busqueda, setBusqueda] = useState("");
  const [busquedaDebounce, setBusquedaDebounce] = useState("");

  const abrirCrear = () => {
    setEditId(null);
    setModalAbierto(true);
  };

  const abrirEditar = (id) => {
    setEditId(id);
    setModalAbierto(true);
  };
useEffect(() => {
  const timer = setTimeout(() => {
    setBusquedaDebounce(busqueda);
  }, 300);

  return () => clearTimeout(timer);
}, [busqueda]);
  const obtenerTours = async () => {
    try {
      const res = await axios.get("/api/tours");
      setTours(res.data);
    } catch (error) {
      console.error("Error al obtener tours:", error);
    }
  };

  const actualizarTours = async () => {
    await obtenerTours();
  };

  useEffect(() => {
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

  const toursFiltrados = tours.filter((tour) => {
    if (!textoBuscado) return true;

    const nombre = normalizarTexto(tour.nombre);
    const slug = normalizarTexto(tour.slug);
    const categoria = normalizarTexto(tour.categoria);
    const subCategoria = normalizarTexto(tour.subCategoria);

    return (
      nombre.includes(textoBuscado) ||
      slug.includes(textoBuscado) ||
      categoria.includes(textoBuscado) ||
      subCategoria.includes(textoBuscado)
    );
  });

  return (
    <>
      <Header />

      {!modalAbierto ? (
        <>
          <div className="container_titulo_tours">
            <div>
              <h2 className="descripcion_tours">Tus Tours</h2>
              <p className="contador_tours">
                {toursFiltrados.length} tour
                {toursFiltrados.length !== 1 ? "s" : ""} encontrado
                {toursFiltrados.length !== 1 ? "s" : ""}
              </p>
            </div>

            <button className="boton_tour" onClick={abrirCrear}>
              Crear nuevo Tour <i className="bi bi-plus-lg"></i>
            </button>
          </div>

          <div className="admin_buscador_tours">
            <input
              type="text"
              placeholder="Buscar tour por nombre, categoría o salida..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />

            {busqueda && (
              <button
                type="button"
                className="btn_limpiar_busqueda"
                onClick={() => setBusqueda("")}
              >
                Limpiar
              </button>
            )}
          </div>

          <div className="container_cards">
            {toursFiltrados.length > 0 ? (
              toursFiltrados.map((tour) => {
                const precioMostrar =
                  tour.tipo === "compartido"
                    ? tour.precio
                    : tour.precios?.length > 0
                    ? Math.min(
                        ...tour.precios.map((p) => p.precioPorPersona)
                      )
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
                    slug={tour.slug}
                    onEdit={abrirEditar}
                    actualizarToursPadre={actualizarTours}
                  />
                );
              })
            ) : (
              <div className="admin_sin_resultados">
                <h3>No se encontraron tours</h3>
                <p>Intenta buscar con otro nombre o limpia el buscador.</p>
              </div>
            )}
          </div>
        </>
      ) : (
        <ModalAgregarTour
          isOpen={modalAbierto}
          onClose={() => setModalAbierto(false)}
          id={editId}
          actualizarToursPadre={actualizarTours}
        />
      )}

      <Footer />
    </>
  );
}

export default Admin_tours;

