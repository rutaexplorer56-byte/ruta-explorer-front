import { useEffect, useState } from 'react';
import DatePicker from 'react-datepicker';
import es from 'date-fns/locale/es';
import en from 'date-fns/locale/en-US';
import fr from 'date-fns/locale/fr';
import { useTranslation } from 'react-i18next';
import axios from '../axiosConfig';
import { fechaCalendario, leerConteosMes } from '../utils/calendarioReservas';
import 'react-datepicker/dist/react-datepicker.css';
import '../styles/calendarioReservas.css';

/* eslint-disable react/prop-types */
export default function CalendarioReservas({ tourId, mostrarReservas = false, selected, onChange, fechaNoDisponible }) {
  const { t, i18n } = useTranslation();
  const lang = (i18n.resolvedLanguage || i18n.language || 'es').split('-')[0];
  const idioma = ['es', 'en', 'fr'].includes(lang) ? lang : 'es';
  const [mesVisible, setMesVisible] = useState(() => selected || new Date());
  const [respuesta, setRespuesta] = useState({ clave: '', conteos: {}, estado: 'idle' });
  const anio = mesVisible.getFullYear(), mes = mesVisible.getMonth() + 1;
  const clave = `${tourId}/${anio}/${mes}`;
  const mostrar = mostrarReservas === true && !!tourId;

  useEffect(() => {
    if (!mostrar) return;
    const controller = new AbortController();
    setRespuesta({ clave, conteos: {}, estado: 'loading' });
    axios.get(`/api/reservas/calendario/${tourId}`, { params: { anio, mes }, signal: controller.signal })
      .then(({ data }) => {
        if (!controller.signal.aborted) setRespuesta({ clave, conteos: leerConteosMes(data, anio, mes), estado: 'ready' });
      }).catch(() => {
        if (!controller.signal.aborted) setRespuesta({ clave, conteos: {}, estado: 'error' });
      });
    return () => controller.abort();
  }, [mostrar, tourId, anio, mes, clave]);

  const conteos = mostrar && respuesta.clave === clave ? respuesta.conteos : {};
  const estado = respuesta.clave === clave ? respuesta.estado : 'loading';
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const bloqueada = date => date < hoy || fechaNoDisponible(date);
  const cantidadDia = date => date.getMonth() + 1 === mes && date.getFullYear() === anio ? conteos[fechaCalendario(date)] || 0 : 0;

  return <section className="rx-calendar" aria-label={t('calendario.titulo')}>
    <div className="rx-calendar-heading"><i className="bi bi-calendar3" aria-hidden="true" /><h3>{t('calendario.titulo')}</h3></div>
    <DatePicker
      inline locale={{ es, en, fr }[idioma]} selected={selected} onChange={onChange}
      minDate={hoy} filterDate={date => !fechaNoDisponible(date)} dateFormat="dd/MM/yyyy"
      calendarClassName="rx-calendar-picker"
      onMonthChange={setMesVisible} onYearChange={setMesVisible}
      formatWeekDay={nombre => nombre.slice(0, 2)}
      dayClassName={date => bloqueada(date) ? 'rx-calendar-blocked' : cantidadDia(date) ? 'rx-calendar-booked' : undefined}
      renderCustomHeader={({ date, decreaseMonth, increaseMonth, prevMonthButtonDisabled, nextMonthButtonDisabled }) => <div className="rx-calendar-month">
        <button type="button" onClick={decreaseMonth} disabled={prevMonthButtonDisabled} aria-label={t('calendario.anterior')}><i className="bi bi-chevron-left" aria-hidden="true" /></button>
        <span aria-live="polite">{new Intl.DateTimeFormat(idioma, { month: 'long', year: 'numeric' }).format(date)}</span>
        <button type="button" onClick={increaseMonth} disabled={nextMonthButtonDisabled} aria-label={t('calendario.siguiente')}><i className="bi bi-chevron-right" aria-hidden="true" /></button>
      </div>}
      renderDayContents={(numero, date) => {
        const cantidad = cantidadDia(date);
        return <span className="rx-calendar-day" data-fecha={fechaCalendario(date)}>
          <span>{numero}</span>
          {cantidad > 0 && <span className="rx-calendar-count" title={t('calendario.reservas', { count: cantidad })}>
            <span aria-hidden="true">+{cantidad}</span><span className="rx-calendar-sr">{t('calendario.reservas', { count: cantidad })}</span>
          </span>}
        </span>;
      }}
    />
    {mostrar && <div className="rx-calendar-info">
      <p className="rx-calendar-legend"><span aria-hidden="true" />{t('calendario.leyenda')}</p>
      <p className="rx-calendar-status" role="status">{estado === 'loading' ? t('calendario.cargando') : estado === 'error' ? t('calendario.error') : t('calendario.aclaracion')}</p>
    </div>}
  </section>;
}
