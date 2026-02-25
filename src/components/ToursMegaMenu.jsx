import { useEffect, useState } from "react";
import axios from "../axiosConfig";
import { Link,useParams } from "react-router-dom";
import "../styles/toursMegaMenu.css";
import { useTranslation } from "react-i18next";

export default function ToursMegaMenu({ open, onClose }) {
  const { t, i18n } = useTranslation();
  const lang = (i18n.language || "es").split("-")[0];

  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(false);
    const { hotel} = useParams();


const categorias = [
  {
    id: "1",
    labelKey: "categories.coffeeRoutes.label",
    descKey: "categories.coffeeRoutes.description",
    img: "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/1a/7b/8f/64/caption.jpg?w=500&h=400&s=1",
  },
  {
    id: "2",
    labelKey: "categories.privateHiking.label",
    descKey: "categories.privateHiking.description",
    img: "https://cdn.getyourguide.com/image/format=auto,fit=contain,gravity=auto,quality=60,width=1440,height=650,dpr=1/tour_img/4c3da771a8af41b49b18b11c2c26e0bee40e4b32982966e00d8ebd4185435049.jpg",
  },
  {
    id: "3",
    labelKey: "categories.sharedHiking.label",
    descKey: "categories.sharedHiking.description",
    img: "https://www.quindioecotours.com/wp-content/uploads/2020/07/Carbonera-2.jpg",
  },
  {
    id: "4",
    labelKey: "categories.adventure.label",
    descKey: "categories.adventure.description",
    img: "https://www.valledelcocora.com.co/w/wp-content/uploads/2024/07/Caballos.jpg",
  },
  {
    id: "5",
    labelKey: "categories.themeParks.label",
    descKey: "categories.themeParks.description",
    img: "https://parquedelcafe.co/wp-content/uploads/2024/12/PDC-Avix-Experiencia-012-scaled.jpg",
  },
  {
    id: "6",
    labelKey: "categories.gastronomy.label",
    descKey: "categories.gastronomy.description",
    img: "https://arracheramex.wordpress.com/wp-content/uploads/2013/09/tejaditos_trucha.jpg",
  },
  {
    id: "7",
    labelKey: "categories.fromPereira.label",
    descKey: "categories.fromPereira.description",
    img: "https://elpereirano.com/wp-content/uploads/2025/02/6747cfeab9c02.r_d.1215-694-8176.jpeg",
  },
  {
    id: "8",
    labelKey: "categories.fromFilandia.label",
    descKey: "categories.fromFilandia.description",
    img: "https://elpereirano.com/wp-content/uploads/2025/02/6747cfeab9c02.r_d.1215-694-8176.jpeg",
  },
];
useEffect(() => {
  const fetchTours = async () => {
    try {
      setLoading(true);

      const { data } = await axios.get(`/api/tours`, {
        params: { lang },
      });

      const list = Array.isArray(data) ? data : data?.tours || [];
      setTours(list);
    } catch (e) {
      console.error("Error cargando tours:", e);
    } finally {
      setLoading(false);
    }
  };

  // ✅ cuando el menú está abierto, y cambie lang -> vuelve a pedir traducido
  if (open) fetchTours();
}, [open, lang]);

  if (!open) return null;


  return (
    <div className="tours-mega-overlay" onMouseLeave={onClose}>
      <div className="tours-mega">

        {loading ? (
          <div className="tours-mega-loading">Cargando tours…</div>
        ) : (
          <div className="tours-mega-grid">
            {categorias.map((cat) => {
              const toursFiltrados = tours.filter(
                (tour) => tour.categoria === cat.id
              );

              if (toursFiltrados.length === 0) return null;

              return (
                <div className="tours-mega-col" key={cat.id}>
                  <h4 className="tours-mega-title">
                    {t(cat.labelKey)}
                  </h4>

                  <div className="tours-mega-list">
                    {toursFiltrados.slice(0, 6).map((tour) => (
                      <div key={tour.id}>
                        <Link
                          to={`/tour/${hotel || "RutaExplorer"}/${tour.slug}`}
                          className="tours-mega-link"
                          onClick={onClose}
                        >
                         - {tour.nombre}
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {!loading && tours.length === 0 && (
          <div className="tours-mega-empty">
            No hay tours disponibles.
          </div>
        )}

      </div>
    </div>
  );
}