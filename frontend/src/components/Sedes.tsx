import { useEffect, useRef, useState } from 'react';
import './Sedes.css';

import { sedes, servicios, membresias, filtrarSedes } from './sedesData';
import type { SeleccionInscripcion } from './seleccionInscripcion';
import type { PasoInscripcion } from './seleccionInscripcion';
import AutenticacionInscripcion from './AutenticacionInscripcion';
import ConfirmacionInscripcion from './ConfirmacionInscripcion';
import type { Sesion } from '../services/api';

const trazosInstalaciones: Record<string, string> = {
  'Área de musculación': 'M4 20V4m16 16V4M2 4h4m12 0h4M4 8h16M8 6v4m8-4v4M8 20v-5h8v5M6 20h12',
  'Zona de cardio': 'M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8M3 12h4l2-4 4 8 2-4h6',
  'Pesas libres': 'M7 12h10M3 7h4v10H3zM17 7h4v10h-4zM1 10v4m22-4v4',
  'Vestidores': 'm8 3-6 4 3 5 3-2v11h8V10l3 2 3-5-6-4c-1 3-7 3-8 0Z',
  'Vestidores y duchas': 'M4 21V6a4 4 0 0 1 8 0v1M8 11a4 4 0 0 1 8 0H8Zm1 4v1m3-1v2m3-2v1m-6 3v1m3-1v2m3-3v1',
  'Entrenamiento funcional': 'M10 4a2 2 0 1 0 4 0 2 2 0 1 0-4 0M4 8l8 3 8-3M12 11v5m0 0-5 5m5-5 5 5',
  'Área de estiramiento': 'M10 4a2 2 0 1 0 4 0 2 2 0 1 0-4 0M8 9l-3 5H2m14-5 3 5h3M9 9l3 3 3-3M12 12v5m0 0-5-2-4 5h18l-4-5-5 2',
  'Zona de estiramiento': 'M10 4a2 2 0 1 0 4 0 2 2 0 1 0-4 0M8 9l-3 5H2m14-5 3 5h3M9 9l3 3 3-3M12 12v5m0 0-5-2-4 5h18l-4-5-5 2',
};

type Props = { seleccionGuardada: SeleccionInscripcion | null; onSeleccion: (seleccion: SeleccionInscripcion) => void; inicioCuenta?: boolean; onNuevaInscripcion: () => void; sesion: Sesion | null; onSesion: (sesion: Sesion) => void; onCerrarSesion: () => void };

export default function Sedes({ seleccionGuardada, onSeleccion, inicioCuenta = false, onNuevaInscripcion, sesion, onSesion, onCerrarSesion }: Props) {
  const [sedeSeleccionada, setSedeSeleccionada] = useState<(typeof sedes)[number] | null>(() => inicioCuenta ? sedes.find((sede) => sede.id === seleccionGuardada?.sedeId) ?? null : null);
  const modalRef = useRef<HTMLDialogElement>(null);
  const aperturaRef = useRef<HTMLElement | null>(null);
  const cambioBotonRef = useRef<HTMLButtonElement>(null);
  const cierreRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [cerrando, setCerrando] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [cambioSede, setCambioSede] = useState<{ sedeId: string | null } | null>(null);
  const [paso, setPaso] = useState<PasoInscripcion>(inicioCuenta ? 'cuenta' : 'gimnasio');
  const [planElegido, setPlanElegido] = useState<string | null>(inicioCuenta ? seleccionGuardada?.planId ?? null : null);
  const tituloPasoRef = useRef<HTMLHeadingElement>(null);
  const pasoActual = paso === 'confirmacion' && !sesion ? 'cuenta' : paso;
  const resultados = filtrarSedes(busqueda);
  const membresiaElegida = membresias.find((plan) => plan.id === planElegido);

  function abrirSede(sede: (typeof sedes)[number], siguientePaso: typeof paso, apertura?: HTMLElement, retomar = false) {
    aperturaRef.current = apertura ?? null;
    const planId = seleccionGuardada?.planId ?? null;
    setPlanElegido(planId);
    // Un paso 4 guardado siempre vuelve a verificar la sesión con la API.
    const pasoRestaurado = siguientePaso === 'confirmacion' || (retomar && siguientePaso === 'membresia' && planId) ? 'cuenta' : siguientePaso;

    setPaso(pasoRestaurado);
    setSedeSeleccionada(sede);
  }

  function elegirPlan(planId: string) {
    if (!sedeSeleccionada) return;
    setPlanElegido(planId);

  }

  function irPaso(siguientePaso: PasoInscripcion) {
    if (!sedeSeleccionada) return;
    const seleccion = { sedeId: sedeSeleccionada.id, planId: planElegido, paso: siguientePaso };
    if (siguientePaso === 'cuenta' || siguientePaso === 'confirmacion') onSeleccion(seleccion);
    setPaso(siguientePaso);
  }

  useEffect(() => {
    if (modalRef.current?.open) {
      modalRef.current.scrollTop = 0;
      tituloPasoRef.current?.focus({ preventScroll: true });
    }
  }, [paso]);

  function cerrarModal() {
    if (!modalRef.current?.open || cierreRef.current !== null) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      modalRef.current.close();
      return;
    }
    setCerrando(true);
    cierreRef.current = setTimeout(() => {
      cierreRef.current = null;
      modalRef.current?.close();
    }, 180);
  }

  useEffect(() => {
    const modal = modalRef.current;
    if (!sedeSeleccionada || !modal) return;

    const elementoAnterior = aperturaRef.current ?? document.activeElement;
    const overflowAnterior = document.body.style.overflow;
    modal.showModal();
    document.body.style.overflow = 'hidden';

    return () => {
      if (cierreRef.current !== null) clearTimeout(cierreRef.current);
      cierreRef.current = null;
      if (modal.open) modal.close();
      document.body.style.overflow = overflowAnterior;
      if (elementoAnterior instanceof HTMLElement && elementoAnterior.isConnected && elementoAnterior !== document.body && !modal.contains(elementoAnterior)) elementoAnterior.focus({ preventScroll: true });
      else document.getElementById('contenido-principal')?.focus({ preventScroll: true });
    };
  }, [sedeSeleccionada]);

  return (
    <section id="sedes" aria-labelledby="sedes-titulo" className="relative isolate border-t border-yellow-400/20 bg-zinc-950 px-4 py-16 sm:px-8 lg:py-20">
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-80 bg-[radial-gradient(ellipse_at_top,rgba(250,204,21,0.08),transparent_70%)]" />
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto mb-10 max-w-2xl text-center sm:mb-12">
          <p className="mb-3 text-xs font-bold tracking-[0.3em] text-yellow-400">NUESTRAS SEDES · HONDURAS</p>
          <h2 id="sedes-titulo" className="text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl">
            ¿DÓNDE QUIERES <span className="bg-gradient-to-b from-yellow-200 to-amber-500 bg-clip-text text-transparent">ENTRENAR?</span>
          </h2>
          <p className="mt-4 text-base leading-7 text-gray-300 sm:text-lg">
            Encuentra tu gimnasio, explora sus espacios y elige la membresía que acompañará tu próxima meta.
          </p>
        </div>

        {seleccionGuardada && <div className="mb-7 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-yellow-400/25 bg-yellow-400/5 p-4 text-sm">
          <p className="text-gray-200">Tu selección: <strong className="text-yellow-200">{seleccionGuardada.planId ? membresias.find((plan) => plan.id === seleccionGuardada.planId)?.nombre : 'Elige una membresía'}</strong>{seleccionGuardada.sedeId ? ` · Sede seleccionada anteriormente: ${sedes.find((sede) => sede.id === seleccionGuardada.sedeId)?.nombre}` : ' · Sede pendiente de seleccionar'}</p>
          <div className="flex flex-wrap gap-3">
            {seleccionGuardada.sedeId && <button type="button" onClick={(event) => { const sede = sedes.find((item) => item.id === seleccionGuardada.sedeId); if (sede) abrirSede(sede, seleccionGuardada.paso ?? 'membresia', event?.currentTarget, true); }} className="min-h-11 rounded-xl border border-yellow-400/40 px-4 font-bold text-yellow-200 hover:bg-yellow-400/10 focus-visible:outline-2 focus-visible:outline-yellow-300">RETOMAR SELECCIÓN</button>}
            <a href="#planes" className="inline-flex min-h-11 items-center rounded-xl border border-zinc-700 px-4 text-yellow-200 focus-visible:outline-2 focus-visible:outline-yellow-300">CAMBIAR PLAN</a>
            <button ref={cambioBotonRef} type="button" aria-expanded={cambioSede !== null} aria-controls="cambiar-sede-opciones" onClick={() => setCambioSede({ sedeId: seleccionGuardada.sedeId })} className="min-h-11 rounded-xl border border-zinc-700 px-4 text-yellow-200 focus-visible:outline-2 focus-visible:outline-yellow-300">CAMBIAR SEDE</button>
            <button type="button" onClick={onNuevaInscripcion} className="min-h-11 rounded-xl border border-zinc-700 px-4 text-gray-200 focus-visible:outline-2 focus-visible:outline-yellow-300">NUEVA INSCRIPCIÓN</button>
          </div>
          {seleccionGuardada.planId && <p className="w-full text-xs leading-6 text-gray-300">{membresias.find((plan) => plan.id === seleccionGuardada.planId)?.alcance}. Regla comercial propuesta, sujeta a confirmación.</p>}
          {cambioSede && <div id="cambiar-sede-opciones" className="w-full border-t border-yellow-400/20 pt-5">
            <fieldset>
              <legend className="mb-3 font-bold text-yellow-200">Elige tu nueva sede principal</legend>
              <p className="mb-4 text-sm leading-6 text-gray-300">Conservaremos tu membresía. El cambio de sede solo se guardará cuando lo confirmes.</p>
              <div className="grid gap-3 md:grid-cols-3">{sedes.map((sede) => <label key={sede.id} className={`flex min-h-14 cursor-pointer items-center gap-3 rounded-xl border p-3 focus-within:ring-2 focus-within:ring-yellow-300 ${cambioSede.sedeId === sede.id ? 'border-yellow-400 bg-yellow-400/10 text-yellow-100' : 'border-zinc-700 bg-black text-gray-200 hover:border-yellow-400/60'}`}>
                <input type="radio" name="cambiar-sede" value={sede.id} checked={cambioSede.sedeId === sede.id} onChange={() => setCambioSede({ sedeId: sede.id })} className="h-5 w-5 shrink-0 accent-yellow-400" />{sede.nombre}
              </label>)}</div>
            </fieldset>
            <div className="mt-4 flex flex-wrap gap-3">
              <button type="button" disabled={!cambioSede.sedeId} onClick={() => {
                if (!cambioSede.sedeId) return;
                onSeleccion({ ...seleccionGuardada, sedeId: cambioSede.sedeId, paso: seleccionGuardada.paso === 'confirmacion' ? 'cuenta' : seleccionGuardada.paso });
                setCambioSede(null);
                cambioBotonRef.current?.focus();
              }} className="min-h-11 rounded-xl bg-yellow-400 px-4 py-3 font-black text-black hover:bg-yellow-300 focus-visible:outline-2 focus-visible:outline-yellow-300 disabled:bg-zinc-800 disabled:text-zinc-500">CONFIRMAR CAMBIO DE SEDE</button>
              <button type="button" onClick={() => { setCambioSede(null); cambioBotonRef.current?.focus(); }} className="min-h-11 rounded-xl border border-zinc-700 px-4 text-gray-200 hover:border-yellow-400 focus-visible:outline-2 focus-visible:outline-yellow-300">CANCELAR</button>
            </div>
          </div>}
        </div>}

        <div className="mx-auto mb-9 max-w-3xl">
          <label htmlFor="buscar-sede" className="mb-2 block text-sm font-semibold text-gray-200">Busca por ciudad, departamento o nombre</label>
          <div className="flex items-center gap-3 rounded-2xl border border-zinc-700 bg-black px-4 shadow-lg shadow-black/20 transition-colors focus-within:border-yellow-400 focus-within:ring-2 focus-within:ring-yellow-400/15">
            <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 shrink-0 text-yellow-400" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 5 5" /></svg>
            <input id="buscar-sede" type="search" value={busqueda} onChange={(event) => setBusqueda(event.target.value)} placeholder="Choluteca, Tegucigalpa, San Pedro Sula…" aria-controls="resultados-sedes" aria-describedby="contador-sedes" className="min-h-16 min-w-0 flex-1 bg-transparent py-4 text-base text-white outline-none placeholder:text-zinc-500" />
            {busqueda && <button type="button" onClick={() => { setBusqueda(''); document.getElementById('buscar-sede')?.focus(); }} className="min-h-11 rounded-lg px-2 text-xs font-bold text-yellow-300 hover:bg-yellow-400/10 focus-visible:outline-2 focus-visible:outline-yellow-400">Limpiar</button>}
          </div>
          <p id="contador-sedes" role="status" aria-live="polite" aria-atomic="true" className="mt-3 text-sm text-gray-400"><span className="font-bold text-yellow-300">{resultados.length}</span> {resultados.length === 1 ? 'sede encontrada' : 'sedes encontradas'}{busqueda.trim() ? ` para “${busqueda.trim()}”` : ' para tu próxima meta'}</p>
        </div>

        <div id="resultados-sedes" className="grid auto-rows-fr items-stretch gap-6 md:grid-cols-2 xl:grid-cols-3">
          {resultados.map((sede) => (
              <article key={sede.id} aria-labelledby={`titulo-${sede.id}`} className="group flex h-full flex-col overflow-hidden rounded-3xl border border-zinc-800 bg-gradient-to-b from-zinc-900 to-black shadow-xl shadow-black/20 transition duration-300 hover:border-yellow-400/60 hover:shadow-yellow-400/5 focus-within:border-yellow-400/60 motion-safe:hover:-translate-y-1 motion-reduce:transition-none">
                <div className="relative border-b border-white/5 bg-black">
                  <img src={sede.imagen} srcSet={sede.imagenSrcSet} sizes="(min-width: 1280px) 368px, (min-width: 768px) calc((100vw - 88px) / 2), calc(100vw - 32px)" alt={sede.alt} width="1536" height="1024" loading="lazy" decoding="async" className="block aspect-[3/2] w-full object-cover object-center" />
                  <span aria-hidden="true" className="absolute right-4 bottom-3 text-4xl font-black text-yellow-300 drop-shadow-lg">0{sedes.indexOf(sede) + 1}</span>
                </div>

                <div className="flex flex-1 flex-col p-6 sm:p-7">
                  <p className="mb-2 text-[10px] font-bold tracking-[0.2em] text-yellow-400">{sede.enfoque}</p>
                  <h3 id={`titulo-${sede.id}`} className="min-h-14 text-xl leading-7 font-black text-white">{sede.nombre}</h3>

                  <dl className="mt-5 space-y-4 border-t border-white/10 pt-5 text-sm">
                    <div>
                      <dt className="mb-1 flex items-center gap-2 font-semibold text-yellow-200">
                        <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M20 10c0 6-8 11-8 11S4 16 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.5" /></svg>
                        Ciudad y departamento
                      </dt>
                      <dd className="min-h-12 leading-6 text-gray-300">{sede.ciudad}, {sede.departamento}</dd>
                      <dd className="mt-1 text-xs text-gray-400">{sede.direccion}</dd>
                    </div>
                    <div>
                      <dt className="mb-1 flex items-center gap-2 font-semibold text-yellow-200">
                        <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.7"><circle cx="12" cy="12" r="9" /><path d="M12 6v6l4 2" /></svg>
                        Horario propuesto
                      </dt>
                      <dd className="min-h-12 leading-6 text-gray-300">Lun–vie: {sede.horarios[0][1]}</dd>
                    </div>
                  </dl>

                  <h4 className="mt-5 mb-3 text-xs font-bold uppercase tracking-wider text-gray-400">Instalaciones y servicios</h4>
                  <ul className="flex min-h-20 flex-wrap content-start gap-2">
                    {sede.instalaciones.slice(0, 3).map((instalacion) => (
                      <li key={instalacion} className="rounded-lg border border-zinc-700/70 bg-zinc-900 px-2.5 py-1.5 text-xs text-gray-200">{instalacion}</li>
                    ))}
                  </ul>

                  <p className="mb-3 text-xs leading-5 text-gray-400">Asesoramiento de entrenamiento y rutinas de ejercicio. {servicios.length} servicios en la propuesta.</p>
                  <div className="mb-5 flex flex-wrap gap-2" aria-label="Membresías disponibles">
                    {membresias.map((plan) => <span key={plan.id} className="rounded-lg border border-yellow-400/20 bg-yellow-400/5 px-2.5 py-2 text-xs text-yellow-100">{plan.nombre} · <strong>L {plan.precio}/mes</strong></span>)}
                  </div>

                  <button type="button" aria-haspopup="dialog" aria-controls="sede-modal" aria-label={`Ver gimnasio ${sede.nombre}`} onClick={(event) => abrirSede(sede, 'gimnasio', event?.currentTarget)} className="mt-auto flex min-h-12 w-full items-center justify-between gap-3 rounded-xl border border-zinc-600 bg-zinc-900 px-5 py-3 text-sm font-black text-white transition duration-300 hover:border-yellow-400 hover:text-yellow-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-yellow-300 motion-reduce:transition-none">
                    VER GIMNASIO
                    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 12h16m-6-6 6 6-6 6" /></svg>
                  </button>
                  <button type="button" aria-haspopup="dialog" aria-controls="sede-modal" aria-label={`Comenzar selección de membresía en ${sede.nombre}`} onClick={(event) => abrirSede(sede, 'membresia', event?.currentTarget)} className="mt-3 min-h-12 w-full rounded-xl border border-yellow-300 bg-gradient-to-br from-yellow-200 via-yellow-400 to-amber-500 px-4 py-3 text-sm font-black text-black transition duration-300 hover:brightness-110 hover:shadow-lg hover:shadow-yellow-400/15 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-yellow-300 motion-reduce:transition-none">INSCRÍBETE AHORA</button>
                </div>
              </article>
          ))}
        </div>
        {resultados.length === 0 && <div className="rounded-3xl border border-dashed border-yellow-400/30 bg-black/50 px-5 py-12 text-center"><h3 className="text-xl font-bold text-white">Tu próxima meta aún tiene un lugar</h3><p className="mt-3 text-sm leading-6 text-gray-400">No encontramos sedes con esa búsqueda. Prueba con Choluteca, Tegucigalpa o San Pedro Sula.</p><button type="button" onClick={() => { setBusqueda(''); document.getElementById('buscar-sede')?.focus(); }} className="mt-5 min-h-11 rounded-xl bg-yellow-400 px-5 py-3 text-sm font-bold text-black hover:bg-yellow-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-yellow-300">VER TODAS LAS SEDES</button></div>}

      </div>
      <p className="mx-auto mt-7 max-w-3xl text-center text-xs leading-6 text-gray-400">Horarios, instalaciones y servicios propuestos para el proyecto universitario FITZONE-HN; no corresponden a información verificada de establecimientos existentes.</p>
      <dialog
        id="sede-modal"
        ref={modalRef}
        aria-labelledby="sede-modal-titulo"
        onClose={() => {
          // React puede cerrar y reabrir el diálogo al verificar los efectos en desarrollo.
          if (modalRef.current?.open) return;
          setSedeSeleccionada(null);
          setCerrando(false);
        }}
        onCancel={(event) => { event.preventDefault(); cerrarModal(); }}
        onKeyDown={(event) => {
          if (event.key !== 'Tab') return;
          const elementos = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('button, a[href], input, select, textarea, [tabindex]')).filter((elemento) => elemento.tabIndex >= 0 && !elemento.matches(':disabled') && elemento.getClientRects().length > 0).filter((elemento, _, todos) => {
            if (!(elemento instanceof HTMLInputElement) || elemento.type !== 'radio') return true;
            const grupo = todos.filter((otro) => otro instanceof HTMLInputElement && otro.type === 'radio' && otro.name === elemento.name) as HTMLInputElement[];
            return elemento === (grupo.find((radio) => radio.checked) ?? grupo[0]);
          });
          const primero = elementos[0];
          const ultimo = elementos[elementos.length - 1];
          if (!primero) { event.preventDefault(); tituloPasoRef.current?.focus(); return; }
          if (event.shiftKey && (document.activeElement === primero || document.activeElement === tituloPasoRef.current)) { event.preventDefault(); ultimo?.focus(); }
          else if (!event.shiftKey && document.activeElement === ultimo) { event.preventDefault(); primero.focus(); }
        }}
        onClick={(event) => {
          if (event.target === event.currentTarget) cerrarModal();
        }}
        className={`sedes-modal fixed inset-0 m-auto max-h-[94dvh] w-[calc(100%-1.5rem)] max-w-6xl overflow-y-auto overscroll-contain rounded-3xl border border-yellow-400/50 bg-black p-0 text-white shadow-[0_0_60px_#facc1520] ${cerrando ? 'sedes-modal--closing' : ''}`}
      >
        {sedeSeleccionada && (
          <div>
            <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-yellow-400/15 bg-black/95 p-5 backdrop-blur-sm sm:px-7">
              <div>
                <p className="mb-1 text-[10px] font-bold tracking-[0.2em] text-yellow-400">{sedeSeleccionada.enfoque}</p>
                <h3 id="sede-modal-titulo" ref={tituloPasoRef} tabIndex={-1} className="text-xl font-black outline-none sm:text-2xl">{sedeSeleccionada.nombre}</h3>
                <p className="mt-1 text-sm text-gray-300">{sedeSeleccionada.ciudad}, {sedeSeleccionada.departamento}</p>
              </div>
              <button type="button" autoFocus onClick={cerrarModal} className="flex min-h-11 shrink-0 items-center gap-2 rounded-full border border-yellow-400/40 bg-yellow-400/5 px-3 text-sm font-semibold text-yellow-200 transition-colors hover:bg-yellow-400 hover:text-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-300">
                <span>CERRAR</span><span aria-hidden="true" className="text-xl">×</span>
              </button>
            </div>
            {pasoActual === 'gimnasio' ? <div className="grid gap-5 p-5 sm:p-6 md:grid-cols-2 lg:gap-7">
              <div className="min-w-0">
                <img src={sedeSeleccionada.imagen} srcSet={sedeSeleccionada.imagenSrcSet} sizes="(min-width: 768px) 50vw, 100vw" alt={sedeSeleccionada.alt} width="1536" height="1024" className="block h-auto max-h-[32dvh] w-full rounded-2xl border border-white/10 bg-zinc-950 object-contain" />
                <h4 className="mt-5 mb-3 flex items-center gap-2 text-sm font-bold text-yellow-200">
                  <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="9" /><path d="M12 6v6l4 2" /></svg>
                  Horarios propuestos
                </h4>
                <dl className="divide-y divide-white/5 rounded-xl border border-white/10 bg-zinc-950 px-3 text-xs sm:text-sm">
                  {sedeSeleccionada.horarios.map(([dia, horario]) => (
                    <div key={dia} className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 py-2.5">
                      <dt className="text-gray-400">{dia}</dt><dd className="font-medium text-gray-100">{horario}</dd>
                    </div>
                  ))}
                </dl>
                <p className="mt-3 text-xs text-gray-400">{sedeSeleccionada.direccion}</p>
              </div>
              <div className="min-w-0">
                <h4 className="mb-3 text-sm font-bold text-yellow-200">Instalaciones</h4>
                <ul className="grid gap-2 sm:grid-cols-2">
                  {sedeSeleccionada.instalaciones.map((instalacion) => (
                    <li key={instalacion} className="flex items-start gap-2 rounded-xl border border-yellow-400/10 bg-zinc-950 p-2.5 text-xs leading-5 text-gray-200">
                      <svg aria-hidden="true" viewBox="0 0 24 24" className="mt-0.5 h-4 w-4 shrink-0 text-yellow-400" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d={trazosInstalaciones[instalacion]} /></svg>
                      {instalacion}
                    </li>
                  ))}
                </ul>
                <h4 className="mt-5 mb-3 text-sm font-bold text-yellow-200">Servicios · propuesta comercial</h4>
                <ul className="space-y-2">
                  {servicios.map((servicio) => (
                    <li key={servicio} className="flex items-start gap-2 text-sm leading-5 text-gray-300"><span aria-hidden="true" className="text-yellow-400">✓</span>{servicio}</li>
                  ))}
                </ul>
                <h4 className="mt-5 mb-3 text-sm font-bold text-yellow-200">Membresías disponibles</h4>
                <div className="flex flex-wrap gap-2">{membresias.map((plan) => <span key={plan.id} className="rounded-lg border border-yellow-400/20 px-3 py-2 text-xs text-yellow-100">{plan.nombre} · L {plan.precio}/mes</span>)}</div>
                <button type="button" onClick={() => irPaso(planElegido ? 'cuenta' : 'membresia')} className="mt-4 min-h-12 w-full rounded-xl bg-yellow-400 px-4 py-3 text-sm font-black text-black transition hover:bg-yellow-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-yellow-300">COMENZAR INSCRIPCIÓN</button>
              </div>
            </div> : <div className="p-5 sm:p-6">
              <ol aria-label="Pasos de inscripción" className="mb-5 grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">{['Gimnasio', 'Membresía', 'Registro o sesión', 'Confirmación'].map((nombre, indice) => <li key={nombre} aria-current={(pasoActual === 'membresia' ? 1 : pasoActual === 'cuenta' ? 2 : 3) === indice ? 'step' : undefined} className={`rounded-xl border px-3 py-2 ${indice === (pasoActual === 'membresia' ? 1 : pasoActual === 'cuenta' ? 2 : 3) ? 'border-yellow-400 bg-yellow-400/10 shadow-[0_0_20px_#facc1515] text-yellow-200' : 'border-zinc-800 text-gray-400'}`}><span className="mr-2 font-black">{indice + 1}.</span>{nombre}{indice === 3 && <span className="block text-xs">Pendiente de integración</span>}</li>)}</ol>
              {pasoActual === 'cuenta' && membresiaElegida ? <AutenticacionInscripcion
                key={sedeSeleccionada.id}
                resumen={`${sedeSeleccionada.nombre} · ${membresiaElegida.nombre} · L ${membresiaElegida.precio}/mes`}
                tokenActual={sesion?.token}
                onSesionInvalidada={onCerrarSesion}
                onVolver={() => irPaso('membresia')}
                onAutenticado={(nuevaSesion) => { onSesion(nuevaSesion); irPaso('confirmacion'); }}
              /> : pasoActual === 'confirmacion' && sesion && membresiaElegida ? <ConfirmacionInscripcion
                usuario={sesion.usuario}
                sede={sedeSeleccionada}
                plan={membresiaElegida}
                onCambiarPlan={() => irPaso('membresia')}
                onCambiarCuenta={() => { onCerrarSesion(); irPaso('cuenta'); }}
              /> : <>
              <div className="mb-6 flex flex-wrap items-center justify-between gap-3"><p className="text-xs font-bold tracking-wider text-yellow-400">1. SEDE ELEGIDA <span aria-hidden="true">→</span> 2. ELIGE TU MEMBRESÍA</p><button type="button" onClick={() => irPaso('gimnasio')} className="min-h-11 rounded-lg border border-zinc-700 px-3 text-xs font-semibold text-gray-200 hover:border-yellow-400 focus-visible:outline-2 focus-visible:outline-yellow-300">Volver al gimnasio</button></div>
              <fieldset><legend className="mb-4 text-xl font-bold text-white">¿Qué plan acompaña tu meta?</legend>
                <div className="grid gap-4 sm:grid-cols-2">{membresias.map((plan) => <label key={plan.id} className={`flex cursor-pointer flex-col rounded-2xl border p-5 transition focus-within:ring-2 focus-within:ring-yellow-300 ${planElegido === plan.id ? 'border-yellow-400 bg-yellow-400/10 shadow-[0_0_20px_#facc1515]' : 'border-zinc-700 bg-zinc-950 hover:border-yellow-400/60'}`}><span className="flex items-center justify-between gap-3 text-base font-black text-yellow-300">{plan.nombre}<input type="radio" name="membresia-sede" value={plan.id} checked={planElegido === plan.id} onChange={() => elegirPlan(plan.id)} className="h-5 w-5 accent-yellow-400" /></span><span className="mt-4 text-4xl font-black text-white">L {plan.precio}<span className="text-sm font-normal text-gray-400"> / mes</span></span><span className="mt-3 text-sm leading-6 text-gray-300">{plan.descripcion}</span><span className="mt-3 text-sm leading-6 text-yellow-100">{plan.alcance}{plan.id === 'fit' ? `: ${sedeSeleccionada.nombre}` : `; sede principal: ${sedeSeleccionada.nombre}`}.</span><ul className="mt-3 space-y-2 text-sm text-gray-300">{plan.beneficios.map((beneficio) => <li key={beneficio}>✓ {beneficio}</li>)}</ul><span className="mt-4 text-sm font-bold text-yellow-200">{planElegido === plan.id ? '✓ PLAN SELECCIONADO' : 'Seleccionar este plan'}</span></label>)}</div>
              </fieldset>
              <div role="status" aria-live="polite" aria-atomic="true" className="mt-5 rounded-xl border border-yellow-400/20 bg-zinc-950 p-4 text-sm leading-6 text-gray-200">{membresiaElegida ? <>Tu selección: <strong className="text-yellow-200">{sedeSeleccionada.nombre} · {membresiaElegida.nombre} · L {membresiaElegida.precio}/mes</strong>.</> : 'Selecciona una membresía para ver el resumen de tu elección.'}</div>
              <p className="mt-4 text-sm leading-6 text-gray-400">Guardaremos tu sede y tu plan al continuar. Cerrar o cancelar descarta los cambios pendientes y conserva tu selección confirmada. En el siguiente paso podrás registrarte o iniciar sesión. Al recargar tendrás que iniciar sesión nuevamente. La confirmación definitiva está pendiente de integración. Precios y beneficios ilustrativos del proyecto universitario, sujetos a confirmación.</p>
              <button type="button" disabled={!membresiaElegida} onClick={() => { if (membresiaElegida) irPaso('cuenta'); }} className="mt-5 min-h-12 w-full rounded-xl bg-yellow-400 px-5 py-3 text-sm font-black text-black transition hover:bg-yellow-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-yellow-300 disabled:cursor-not-allowed disabled:bg-zinc-800 disabled:text-zinc-500 sm:w-auto">CONTINUAR INSCRIPCIÓN</button>
              <button type="button" onClick={cerrarModal} className="mt-3 min-h-12 w-full rounded-xl border border-zinc-700 px-5 py-3 text-sm font-bold text-gray-200 hover:border-yellow-400 focus-visible:outline-2 focus-visible:outline-yellow-300 sm:ml-3 sm:w-auto">CANCELAR</button>
              </>}
            </div>}
          </div>
        )}
      </dialog>
    </section>
  );
}
