import { useEffect, useMemo, useRef, useState } from "react";
import axios from "../axiosConfig"; // si ya usas uno (recomendado)
// si no tienes axiosConfig: import axios from "axios";
import "../styles/googleReviews.css";

function Stars({ value = 0 }) {
  const full = Math.floor(value);
  const half = value - full >= 0.5;

  return (
    <div className="gr-stars" aria-label={`Rating ${value} de 5`}>
      {Array.from({ length: 5 }).map((_, i) => {
        const idx = i + 1;
        const cls =
          idx <= full ? "gr-star full" : half && idx === full + 1 ? "gr-star half" : "gr-star empty";
        return (
          <h2 key={i} className={cls}>
            ★
          </h2>
        );
      })}
    </div>
  );
}

function truncate(text = "", max = 120) {
  if (!text) return "";
  return text.length > max ? text.slice(0, max).trim() + "…" : text;
}

export default function GoogleReviews() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState({});
  const scrollerRef = useRef(null);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setLoading(true);
        const resp = await axios.get("/api/google-reviews"); // backend
        if (alive) setData(resp.data);
      } catch (e) {
        console.error(e);
        if (alive) setData(null);
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  const reviews = useMemo(() => data?.reviews || [], [data]);

  const scrollByCards = (dir = 1) => {
    const el = scrollerRef.current;
    if (!el) return;

    const card = el.querySelector(".gr-card");
    const w = card ? card.getBoundingClientRect().width : 320;
    el.scrollBy({ left: dir * (w + 16), behavior: "smooth" });
  };

  if (loading) {
    return (
      <section className="gr-wrap">
        <div className="gr-skeleton-header" />
        <div className="gr-skeleton-row">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="gr-skeleton-card" />
          ))}
        </div>
      </section>
    );
  }

  if (!data) {
    return (
      <section className="gr-wrap">
        <p className="gr-error">No se pudieron cargar las reseñas de Google.</p>
      </section>
    );
  }

  return (
    <section className="gr-wrap">
      {/* Header igual al de tu captura */}
      <div className="gr-header">
        <div className="gr-business">
          <div className="gr-logo" aria-hidden="true">
            <img src="https://cdn.trustindex.io/assets/platform/Google/icon.svg" alt="Google" />
          </div>

          <div className="gr-business-info">
            <div className="gr-business-title">{data.placeName}</div>

            <div className="gr-business-meta">
              <Stars value={data.placeRating} />
              <span className="gr-total">{data.totalRatings} reseñas Google</span>
            </div>
          </div>
        </div>

        <a className="gr-btn" href={"https://www.google.com/search?hl=es&gl&q=Salento+ToursRuta.Xplorer+SAS+Transporte+y+turismo,+MANZANA+B+%23CASA+1,+Salento,+Quind%C3%ADo,+Colombia&ludocid=2964882668421952619&lsig=AB86z5VzMHrWSyuelaSutH3gKjSu&hl=es&gl=419#lrd=0x8e388df9d2f6e29d:0x292561140c00b46b,1"} target="_blank" rel="noreferrer">
          Escribe una reseña <i className="bi bi-pencil"></i>
        </a>
      </div>

      {/* Carrusel */}
      <div className="gr-carousel">
        <button className="gr-arrow left" onClick={() => scrollByCards(-1)} aria-label="Anterior">
          ‹
        </button>

        <div className="gr-scroller" ref={scrollerRef}>
          {reviews.map((r, idx) => {
            const isOpen = !!expanded[idx];
            const textToShow = isOpen ? r.text : truncate(r.text, 120);

            return (
              <article className="gr-card" key={`${r.time || idx}-${idx}`}>
                <div className="gr-card-top">
                  <div className="gr-avatar">
                    {r.profile_photo_url ? (
                      <img src={r.profile_photo_url} alt={r.author_name} />
                    ) : (
                      <span>{(r.author_name || "?").slice(0, 1).toUpperCase()}</span>
                    )}
                  </div>

                  <div className="gr-user">
                    <div className="gr-user-name">{r.author_name}</div>
                    <div className="gr-user-date">{r.relative_time_description}</div>
                  </div>

                  <div className="gr-google-badge" title="Google" aria-label="Google">
                    <img src="https://cdn.trustindex.io/assets/platform/Google/icon.svg"></img>
                  </div>
                </div>

                <div className="gr-card-stars">
                  <Stars value={r.rating} />
                </div>

                <p className="gr-text">{textToShow || "—"}</p>

                {r.text && r.text.length > 120 && (
                  <button
                    className="gr-readmore"
                    onClick={() => setExpanded((prev) => ({ ...prev, [idx]: !prev[idx] }))}
                  >
                    {isOpen ? "Ver menos" : "Leer más"}
                  </button>
                )}
              </article>
            );
          })}
        </div>

        <button className="gr-arrow right" onClick={() => scrollByCards(1)} aria-label="Siguiente">
          ›
        </button>
      </div>
    </section>
  );
}