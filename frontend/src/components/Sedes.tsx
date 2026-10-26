import { useEffect, useRef, useState } from 'react';
import './Sedes.css';

import { sedes, servicios, membresias, filtrarSedes } from './sedesData';
import { guardarSeleccion, leerSeleccion } from './seleccionInscripcion';
import type { PasoInscripcion } from './seleccionInscripcion';
import AutenticacionInscripcion from './AutenticacionInscripcion';
import ConfirmacionInscripcion from './ConfirmacionInscripcion';
import { conservarToken } from '../services/api';
import type { Sesion } from '../services/api';

export default function Sedes() {
  const [sedeSeleccionada, setSedeSeleccionada] = useState<(typeof sedes)[number] | null>(null);
  const modalRef = useRef<HTMLDialogElement>(null);
  const cierreRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [cerrando, setCerrando] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [paso, setPaso] = useState<PasoInscripcion>('gimnasio');
  const [sesion, setSesion] = useState<Sesion | null>(null);
  const [seleccionGuardada, setSeleccionGuardada] = useState(leerSeleccion);
  const [planElegido, setPlanElegido] = useState<string | null>(null);
  const tituloPasoRef = useRef<HTMLHeadingElement>(null);
  const resultados = filtrarSedes(busqueda);
  const membresiaElegida = membresias.find((plan) => plan.id === planElegido);

  function abrirSede(sede: (typeof sedes)[number], siguientePaso: typeof paso) {
    const planId = seleccionGuardada?.sedeId === sede.id ? seleccionGuardada.planId : null;
    setPlanElegido(planId);
    // Un paso 4 guardado siempre vuelve a verificar la sesión con la API.
    const pasoRestaurado = siguientePaso === 'confirmacion' ? 'cuenta' : siguientePaso;
    const seleccion = { sedeId: sede.id, planId, paso: pasoRestaurado };
    guardarSeleccion(seleccion);
    setSeleccionGuardada(seleccion);
    setPaso(pasoRestaurado);
    setSedeSeleccionada(sede);
  }

  function elegirPlan(planId: string) {
    if (!sedeSeleccionada) return;
    setPlanElegido(planId);
    const seleccion = { sedeId: sedeSeleccionada.id, planId, paso };
    guardarSeleccion(seleccion);
    setSeleccionGuardada(seleccion);
  }

  function irPaso(siguientePaso: PasoInscripcion) {
    if (!sedeSeleccionada) return;
    const seleccion = { sedeId: sedeSeleccionada.id, planId: planElegido, paso: siguientePaso };
    guardarSeleccion(seleccion);
    setSeleccionGuardada(seleccion);
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

    const elementoAnterior = document.activeElement;
    const overflowAnterior = document.body.style.overflow;
    modal.showModal();
    document.body.style.overflow = 'hidden';

    return () => {
      if (cierreRef.current !== null) clearTimeout(cierreRef.current);
      cierreRef.current = null;
      if (modal.open) modal.close();
      document.body.style.overflow = overflowAnterior;
      if (elementoAnterior instanceof HTMLElement) elementoAnterior.focus();
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

        {seleccionGuardada && <div className="mb-7 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-yellow-400/25 bg-yellow-400/5 p-4 text-sm"><p className="text-gray-200">Tu selección: <strong className="text-yellow-200">{sedes.find((sede) => sede.id === seleccionGuardada.sedeId)?.nombre}</strong>{seleccionGuardada.planId && <> · {membresias.find((plan) => plan.id === seleccionGuardada.planId)?.nombre}</>}</p><button type="button" onClick={() => { const sede = sedes.find((item) => item.id === seleccionGuardada.sedeId); if (sede) abrirSede(sede, seleccionGuardada.paso ?? 'membresia'); }} className="min-h-11 rounded-xl border border-yellow-400/40 px-4 font-bold text-yellow-200 hover:bg-yellow-400/10 focus-visible:outline-2 focus-visible:outline-yellow-300">RETOMAR SELECCIÓN</button></div>}

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
                  <img src={sede.imagen} alt={sede.alt} width="1536" height="1024" loading="lazy" decoding="async" className="aspect-[3/2] w-full object-contain" />
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
                    {membresias.map((plan) => <span key={plan.id} className="rounded-lg border border-yellow-400/20 bg-yellow-400/5 px-2.5 py-2 text-xs text-yellow-100">{plan.nombre} <strong>L {plan.precio}/mes</strong></span>)}
                  </div>

                  <button type="button" aria-haspopup="dialog" aria-controls="sede-modal" aria-label={`Ver gimnasio ${sede.nombre}`} onClick={() => abrirSede(sede, 'gimnasio')} className="mt-auto flex min-h-12 w-full items-center justify-between gap-3 rounded-xl border border-zinc-600 bg-zinc-900 px-5 py-3 text-sm font-black text-white transition duration-300 hover:border-yellow-400 hover:text-yellow-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-yellow-300 motion-reduce:transition-none">
                    VER GIMNASIO
                    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 12h16m-6-6 6 6-6 6" /></svg>
                  </button>
                  <button type="button" aria-haspopup="dialog" aria-controls="sede-modal" aria-label={`Comenzar selección de membresía en ${sede.nombre}`} onClick={() => abrirSede(sede, 'membresia')} className="mt-3 min-h-12 w-full rounded-xl border border-yellow-300 bg-gradient-to-br from-yellow-200 via-yellow-400 to-amber-500 px-4 py-3 text-sm font-black text-black transition duration-300 hover:brightness-110 hover:shadow-lg hover:shadow-yellow-400/15 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-yellow-300 motion-reduce:transition-none">INSCRÍBETE AHORA</button>
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
        onClose={() => { setSedeSeleccionada(null); setCerrando(false); }}
        onCancel={(event) => { event.preventDefault(); cerrarModal(); }}
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
            {paso === 'gimnasio' ? <div className="grid gap-5 p-5 sm:p-6 md:grid-cols-2 lg:gap-7">
              <div className="min-w-0">
                <img src={sedeSeleccionada.imagen} alt={sedeSeleccionada.alt} width="1536" height="1024" className="block h-auto max-h-[32dvh] w-full rounded-2xl border border-white/10 bg-zinc-950 object-contain" />
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
                      <svg aria-hidden="true" viewBox="0 0 24 24" className="mt-0.5 h-4 w-4 shrink-0 text-yellow-400" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="6" width="4" height="12" rx="1" /><rect x="17" y="6" width="4" height="12" rx="1" /><path d="M7 12h10M1 10v4m22-4v4" /></svg>
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
                <p className="mt-5 rounded-xl border border-yellow-400/15 bg-yellow-400/5 p-3 text-xs leading-5 text-yellow-100/80">Propuesta del proyecto universitario. Horarios, instalaciones y servicios no verificados en establecimientos existentes.</p>
                <h4 className="mt-5 mb-3 text-sm font-bold text-yellow-200">Membresías disponibles</h4>
                <div className="flex flex-wrap gap-2">{membresias.map((plan) => <span key={plan.id} className="rounded-lg border border-yellow-400/20 px-3 py-2 text-xs text-yellow-100">{plan.nombre} · L {plan.precio}/mes</span>)}</div>
                <button type="button" onClick={() => irPaso('membresia')} className="mt-4 min-h-12 w-full rounded-xl bg-yellow-400 px-4 py-3 text-sm font-black text-black transition hover:bg-yellow-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-yellow-300">COMENZAR INSCRIPCIÓN</button>
              </div>
            </div> : <div className="p-5 sm:p-6">
              <ol aria-label="Pasos de inscripción" className="mb-5 grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">{['Gimnasio', 'Membresía', 'Registro o sesión', 'Confirmación'].map((nombre, indice) => <li key={nombre} aria-current={(paso === 'membresia' ? 1 : paso === 'cuenta' ? 2 : 3) === indice ? 'step' : undefined} className={`rounded-xl border px-3 py-2 ${indice === (paso === 'membresia' ? 1 : paso === 'cuenta' ? 2 : 3) ? 'border-yellow-400 bg-yellow-400/10 shadow-[0_0_20px_#facc1515] text-yellow-200' : 'border-zinc-800 text-gray-400'}`}><span className="mr-2 font-black">{indice + 1}.</span>{nombre}{indice === 3 && <span className="block text-xs">Pendiente de integración</span>}</li>)}</ol>
              {paso === 'cuenta' && membresiaElegida ? <AutenticacionInscripcion
                key={sedeSeleccionada.id}
                resumen={`${sedeSeleccionada.nombre} · ${membresiaElegida.nombre} · L ${membresiaElegida.precio}/mes`}
                tokenActual={sesion?.token}
                onVolver={() => irPaso('membresia')}
                onAutenticado={(nuevaSesion) => { setSesion(nuevaSesion); irPaso('confirmacion'); }}
              /> : paso === 'confirmacion' && sesion && membresiaElegida ? <ConfirmacionInscripcion
                usuario={sesion.usuario}
                sede={sedeSeleccionada}
                plan={membresiaElegida}
                onCambiarPlan={() => irPaso('membresia')}
                onCambiarCuenta={() => { conservarToken(null); setSesion(null); irPaso('cuenta'); }}
              /> : <>
              <div className="mb-6 flex flex-wrap items-center justify-between gap-3"><p className="text-xs font-bold tracking-wider text-yellow-400">1. SEDE ELEGIDA <span aria-hidden="true">→</span> 2. ELIGE TU MEMBRESÍA</p><button type="button" onClick={() => irPaso('gimnasio')} className="min-h-11 rounded-lg border border-zinc-700 px-3 text-xs font-semibold text-gray-200 hover:border-yellow-400 focus-visible:outline-2 focus-visible:outline-yellow-300">Volver al gimnasio</button></div>
              <fieldset><legend className="mb-4 text-xl font-bold text-white">¿Qué plan acompaña tu meta?</legend>
                <div className="grid gap-4 sm:grid-cols-2">{membresias.map((plan) => <label key={plan.id} className={`flex cursor-pointer flex-col rounded-2xl border p-5 transition focus-within:ring-2 focus-within:ring-yellow-300 ${planElegido === plan.id ? 'border-yellow-400 bg-yellow-400/10 shadow-[0_0_20px_#facc1515]' : 'border-zinc-700 bg-zinc-950 hover:border-yellow-400/60'}`}><span className="flex items-center justify-between gap-3 text-base font-black text-yellow-300">{plan.nombre}<input type="radio" name="membresia-sede" value={plan.id} checked={planElegido === plan.id} onChange={() => elegirPlan(plan.id)} className="h-5 w-5 accent-yellow-400" /></span><span className="mt-4 text-4xl font-black text-white">L {plan.precio}<span className="text-sm font-normal text-gray-400"> / mes</span></span><span className="mt-3 text-sm leading-6 text-gray-300">{plan.descripcion}</span><span className="mt-4 text-sm font-bold text-yellow-200">{planElegido === plan.id ? '✓ PLAN SELECCIONADO' : 'Seleccionar este plan'}</span></label>)}</div>
              </fieldset>
              <div role="status" aria-live="polite" aria-atomic="true" className="mt-5 rounded-xl border border-yellow-400/20 bg-zinc-950 p-4 text-sm leading-6 text-gray-200">{membresiaElegida ? <>Tu selección: <strong className="text-yellow-200">{sedeSeleccionada.nombre} · {membresiaElegida.nombre} · L {membresiaElegida.precio}/mes</strong>.</> : 'Selecciona una membresía para ver el resumen de tu elección.'}</div>
              <p className="mt-4 text-sm leading-6 text-gray-400">Conservamos tu selección en esta pestaña, incluso al recargar. En el siguiente paso podrás registrarte o iniciar sesión. La confirmación definitiva está pendiente de integración. Precios ilustrativos sujetos a confirmación.</p>
              <button type="button" disabled={!membresiaElegida} onClick={() => { if (membresiaElegida) irPaso('cuenta'); }} className="mt-5 min-h-12 w-full rounded-xl bg-yellow-400 px-5 py-3 text-sm font-black text-black transition hover:bg-yellow-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-yellow-300 disabled:cursor-not-allowed disabled:bg-zinc-800 disabled:text-zinc-500 sm:w-auto">CONTINUAR INSCRIPCIÓN</button>
              </>}
            </div>}
          </div>
        )}
      </dialog>
    </section>
  );
}
