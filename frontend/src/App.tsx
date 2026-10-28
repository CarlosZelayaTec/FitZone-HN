import { useRef, useState } from 'react';
import ModalMembresia from './components/ModalMembresia';
import { membresias } from './components/sedesData';
import { guardarSeleccion, leerSeleccion, limpiarSeleccion } from './components/seleccionInscripcion';
import type { SeleccionInscripcion } from './components/seleccionInscripcion';
import Sedes from './components/Sedes';
import HeroBackground from './components/HeroBackground';
import ModalSesion from './components/ModalSesion';
import { conservarToken } from './services/api';
import type { Sesion } from './services/api';

function App() {
  const [seleccion, setSeleccion] = useState(leerSeleccion);
  const [planAbierto, setPlanAbierto] = useState<string | null>(null);
  const [inicioCuenta, setInicioCuenta] = useState(false);
  const [recorrido, setRecorrido] = useState(0);
  const [sesion, setSesion] = useState<Sesion | null>(null);
  const [accesoAbierto, setAccesoAbierto] = useState(false);
  const [menuAbierto, setMenuAbierto] = useState(false);
  const menuBotonRef = useRef<HTMLButtonElement>(null);
  function cerrarSesion() {
    conservarToken(null);
    setSesion(null);
  }
  function actualizarSeleccion(valor: SeleccionInscripcion) {
    guardarSeleccion(valor);
    setSeleccion(valor);
  }
  function elegirMembresia(planId: string, sedeId: string) {
    actualizarSeleccion({ sedeId, planId, paso: 'cuenta' });
    setPlanAbierto(null);
    setInicioCuenta(true);
    setRecorrido(recorrido + 1);
  }
  function nuevaInscripcion() {
    limpiarSeleccion();
    setSeleccion(null);
    setInicioCuenta(false);
    setRecorrido(recorrido + 1);
  }
  return (
    <div className="min-h-screen bg-black text-white">
      <a href="#contenido-principal" onClick={() => document.getElementById('contenido-principal')?.focus()} className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-xl focus:bg-yellow-400 focus:px-5 focus:py-3 focus:font-bold focus:text-black focus:outline-2 focus:outline-offset-4 focus:outline-yellow-200">Saltar al contenido principal</a>

      {/* MENÚ PRINCIPAL */}
      <header onKeyDown={(event) => { if (event.key === 'Escape' && menuAbierto) { setMenuAbierto(false); menuBotonRef.current?.focus(); } }} className="flex flex-wrap items-center justify-between gap-3 bg-black px-4 py-3 md:gap-4 md:px-8 md:py-5">
        <h1 className="text-2xl font-black text-yellow-400 md:text-3xl">
          FITZONE-HN
        </h1>

        <button ref={menuBotonRef} type="button" aria-expanded={menuAbierto} aria-controls="menu-principal" onClick={() => setMenuAbierto(!menuAbierto)} className="flex min-h-11 items-center gap-2 rounded-xl border border-yellow-400/40 px-3 text-sm font-bold text-yellow-200 focus-visible:outline-2 focus-visible:outline-yellow-300 md:hidden"><svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8"><path d={menuAbierto ? 'm6 6 12 12M6 18 18 6' : 'M4 6h16M4 12h16M4 18h16'} /></svg>{menuAbierto ? 'CERRAR' : 'MENÚ'}</button>
        <div id="menu-principal" className={`${menuAbierto ? 'flex' : 'hidden'} w-full flex-col gap-4 border-t border-yellow-400/15 pt-3 md:contents`}>
        <nav aria-label="Navegación principal" onClick={() => setMenuAbierto(false)} className="grid grid-cols-2 gap-1 font-semibold [&_a]:rounded-lg [&_a]:px-3 [&_a]:py-3 md:flex md:flex-wrap md:gap-6 md:[&_a]:p-0">
          <a href="#inicio" className="hover:text-yellow-400">Inicio</a>
          <a href="#beneficios" className="hover:text-yellow-400">Beneficios</a>
          <a href="#planes" className="hover:text-yellow-400">Membresías</a>
          <a href="#sedes" className="hover:text-yellow-400">Sedes</a>
          <a href="#contacto" className="hover:text-yellow-400">Contacto</a>
        </nav>

        {sesion ? <div className="flex max-w-full flex-wrap items-center gap-3"><span className="break-words text-sm font-semibold text-yellow-200">Hola, {sesion.usuario.nombre}</span><button type="button" onClick={cerrarSesion} className="min-h-11 rounded-lg border border-yellow-400/40 px-4 py-2 text-sm font-bold text-yellow-200 hover:bg-yellow-400/10 focus-visible:outline-2 focus-visible:outline-yellow-300">CERRAR SESIÓN</button></div> : <button type="button" aria-haspopup="dialog" aria-controls="sesion-modal" onClick={() => { setMenuAbierto(false); setAccesoAbierto(true); }} className="rounded-lg bg-yellow-400 px-6 py-3 font-bold text-black hover:bg-yellow-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-yellow-300">
          INICIAR SESIÓN
        </button>}
        </div>
      </header>

      <main id="contenido-principal" tabIndex={-1} className="outline-none">
      {/* PORTADA PRINCIPAL */}
      <section
        id="inicio"
        className="relative isolate flex min-h-[650px] items-center"
      >
        <HeroBackground />
        <div className="relative z-10 max-w-3xl px-8 pt-20 pb-8 md:px-20 md:py-0">
          <span className="mb-5 inline-block rounded-full border border-yellow-400 px-5 py-2 text-sm font-bold text-yellow-400">
            BIENVENIDO A FITZONE-HN
          </span>

          <h2 className="mb-6 text-5xl font-black leading-tight md:text-7xl">
            ENTRENA DURO.
            <span className="block text-yellow-400">
              VIVE FUERTE.
            </span>
          </h2>

          <p className="mb-8 max-w-xl text-lg text-gray-200">
            Transforma tu cuerpo, supera tus límites y alcanza tus metas
            en FitZone-HN. Tu mejor versión comienza aquí.
          </p>

          <div className="flex flex-wrap gap-4">
            <a
              href="#planes"
              className="rounded-lg bg-yellow-400 px-8 py-4 font-bold text-black transition hover:bg-yellow-300"
            >
              CONOCE NUESTROS PLANES
            </a>

            <a
              href="#beneficios"
              className="rounded-lg border-2 border-white px-8 py-4 font-bold transition hover:bg-white hover:text-black"
            >
              DESCUBRE FITZONE
            </a>
          </div>
        </div>
      </section>

      {/* BENEFICIOS */}
      <section id="beneficios" className="bg-zinc-950 px-8 py-20">
        <h2 className="mb-12 text-center text-4xl font-black">
          ¿POR QUÉ ENTRENAR EN{" "}
          <span className="text-yellow-400">FITZONE-HN?</span>
        </h2>

        <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-3">
          {[
            {
              titulo: "EQUIPAMIENTO MODERNO",
              descripcion:
                "Entrena con equipos para desarrollar fuerza, resistencia y condición física.",
              imagen: "/images/equipamiento.png",
              encuadre: "center 60%",
            },
            {
              titulo: "ENTRENAMIENTO",
              descripcion:
                "Encuentra un espacio diseñado para motivarte a alcanzar tus objetivos.",
              imagen: "/images/entrenamiento.png",
              encuadre: "center 65%",
            },
            {
              titulo: "INSTALACIONES",
              descripcion:
                "Disfruta de ambientes cómodos y preparados para tus entrenamientos.",
              imagen: "/images/instalaciones.png",
              encuadre: "center center",
            },
          ].map((beneficio) => (
            <article
              key={beneficio.titulo}
              className="min-w-0 rounded-2xl border border-zinc-800 bg-zinc-900 p-8 text-center transition hover:border-yellow-400 md:px-4 lg:px-8"
            >
              <div className="mb-6 overflow-hidden rounded-xl">
                <img
                  src={beneficio.imagen}
                  alt={beneficio.titulo}
                  loading="lazy"
                  style={{ objectPosition: beneficio.encuadre }}
                  className="h-64 w-full object-cover transition-transform duration-300 hover:scale-105 motion-reduce:transform-none lg:h-72"
                />
              </div>

              <h3 className="mb-4 break-words text-xl font-black text-yellow-400 md:text-lg lg:text-xl">
                {beneficio.titulo}
              </h3>

              <p className="text-gray-300">{beneficio.descripcion}</p>
            </article>
          ))}
        </div>
      </section>

      {/* MEMBRESÍAS */}
      <section id="planes" aria-labelledby="planes-titulo" className="relative isolate overflow-hidden bg-black px-4 py-10 text-center sm:px-8 md:py-7">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-20 bg-cover bg-top bg-no-repeat md:bg-[length:100%_auto]" style={{ backgroundImage: "url('/images/membresias-gym.png')" }} />
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-black/40 via-black/20 to-black/80" />
        <div aria-hidden="true" className="pointer-events-none absolute -bottom-12 -left-16 -z-10 h-24 w-[45%] rotate-[20deg] border-t-4 border-yellow-400 bg-zinc-950 shadow-[0_-4px_24px_#facc1566]" />
        <div aria-hidden="true" className="pointer-events-none absolute -right-16 -bottom-12 -z-10 h-24 w-[45%] -rotate-[20deg] border-t-4 border-yellow-400 bg-zinc-950 shadow-[0_-4px_24px_#facc1566]" />

        <div className="mx-auto mb-2 flex max-w-lg items-center justify-center gap-5 text-xs font-semibold tracking-[0.4em] text-zinc-200 sm:text-sm">
          <span aria-hidden="true" className="h-px flex-1 bg-gradient-to-r from-transparent to-yellow-500" />
          FITZONE-HN
          <span aria-hidden="true" className="h-px flex-1 bg-gradient-to-l from-transparent to-yellow-500" />
        </div>
        <h2 id="planes-titulo" className="text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
          NUESTRAS <span className="bg-gradient-to-b from-yellow-200 via-yellow-400 to-amber-500 bg-clip-text text-transparent">MEMBRESÍAS</span>
        </h2>
        <p className="mx-auto mt-2 mb-10 max-w-2xl text-base leading-relaxed text-gray-300 md:mb-8">
          Encuentra el plan que mejor se adapte a tus objetivos.
        </p>

        <div className="mx-auto grid max-w-5xl auto-rows-fr items-stretch gap-9 text-left md:w-[76%] md:grid-cols-2 md:gap-6 lg:w-[70%]">
          {membresias.map((plan) => (
            <article
              key={plan.nombre}
              className={`relative flex h-full flex-col rounded-3xl border-2 p-6 pt-9 backdrop-blur-sm transition duration-300 ease-out motion-safe:hover:-translate-y-1 motion-reduce:transition-none md:p-5 md:pt-7 lg:p-6 lg:pt-7 ${
                plan.popular
                  ? "border-yellow-300 bg-gradient-to-br from-black/95 via-black/90 to-yellow-950/60 shadow-[0_0_6px_#fde047,0_0_28px_#facc1540,inset_0_0_20px_#facc1512] hover:shadow-[0_0_8px_#fde047,0_0_38px_#facc1560]"
                  : "border-zinc-700 bg-gradient-to-br from-zinc-950/95 to-black/85 shadow-2xl hover:border-zinc-500"
              }`}
            >
              {plan.popular && (
                <span className="absolute -top-5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-yellow-200 bg-gradient-to-b from-yellow-100 via-yellow-300 to-yellow-500 px-5 py-1.5 text-sm font-black tracking-wider text-black shadow-[0_0_20px_#facc1550] sm:text-sm">
                  MÁS POPULAR
                </span>
              )}
              <div className="mb-3 flex items-start justify-between gap-2">
                <div>
                  <h3 className="mb-2 text-2xl font-black tracking-tight text-white lg:text-3xl">
                    PLAN <span className="bg-gradient-to-b from-yellow-100 via-yellow-400 to-amber-500 bg-clip-text text-transparent">{plan.nombre.replace('PLAN ', '')}</span>
                  </h3>
                  <p className="inline-block rounded-full border border-yellow-400/50 px-3 py-1 text-[10px] font-semibold tracking-[0.2em] text-gray-200 lg:text-xs">
                    {plan.lema}
                  </p>
                </div>
                {plan.popular ? (
                  <svg aria-hidden="true" viewBox="0 0 64 64" className="h-14 w-14 shrink-0 text-yellow-400 drop-shadow-[0_0_10px_#facc1540] md:h-11 md:w-11 lg:h-12 lg:w-12" fill="currentColor">
                    <path d="M8 20 20 31 32 10 44 31 56 20 49 47H15Z" />
                    <rect x="15" y="52" width="34" height="4" rx="2" />
                    <circle cx="8" cy="17" r="4" /><circle cx="32" cy="8" r="4" /><circle cx="56" cy="17" r="4" />
                  </svg>
                ) : (
                  <svg aria-hidden="true" viewBox="0 0 64 64" className="h-14 w-14 shrink-0 text-yellow-400/25 md:h-11 md:w-11 lg:h-12 lg:w-12" fill="none" stroke="currentColor" strokeWidth="3">
                    <rect x="12" y="12" width="10" height="40" rx="3" /><rect x="42" y="12" width="10" height="40" rx="3" /><path d="M22 26h20v12H22M7 20h5v24H7ZM52 20h5v24h-5Z" />
                  </svg>
                )}
              </div>
              <p className="mb-3 flex flex-wrap items-baseline gap-x-2 font-black tracking-tight">
                <span className="bg-gradient-to-b from-yellow-100 via-yellow-300 to-amber-500 bg-clip-text text-5xl text-transparent lg:text-6xl">L {plan.precio}</span>
                <span className="text-lg font-bold text-gray-400 lg:text-lg">/ mes</span>
              </p>
              <p className="mb-4 min-h-12 text-sm leading-6 text-gray-200 lg:text-base">{plan.descripcion}</p>
              <ul className={`mb-5 flex-1 space-y-3 border-t pt-4 ${plan.popular ? "border-yellow-400/40" : "border-zinc-700"}`}>
                {plan.beneficios.map((beneficio) => (
                  <li key={beneficio} className="flex items-start gap-3 text-sm text-gray-100 lg:text-base">
                    <span aria-hidden="true" className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-yellow-100 via-yellow-300 to-yellow-500 text-lg font-black text-black shadow-sm">✓</span>
                    <span className="leading-6">{beneficio}</span>
                  </li>
                ))}
              </ul>
              <button type="button" aria-haspopup="dialog" onClick={() => setPlanAbierto(plan.id)} className="mt-auto inline-flex min-h-12 w-full items-center justify-center gap-4 rounded-2xl border border-yellow-200 bg-gradient-to-br from-yellow-200 via-yellow-400 to-amber-500 px-4 py-3 text-center text-base font-black text-black shadow-[0_4px_20px_#facc1530,inset_0_1px_0_#fff8] transition duration-300 hover:brightness-110 hover:shadow-[0_4px_28px_#facc1555] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-yellow-300 motion-reduce:transition-none lg:text-lg">
                CONOCER MÁS
                <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12h16m-6-6 6 6-6 6" /></svg>
              </button>
            </article>
          ))}
        </div>
        <p className="mt-5 text-xs leading-relaxed text-gray-400">Precios y beneficios ilustrativos del proyecto universitario, sujetos a confirmación.</p>
      </section>
      {/* SEDES */}
      <Sedes key={recorrido} sesion={sesion} onSesion={setSesion} onCerrarSesion={cerrarSesion} inicioCuenta={inicioCuenta} seleccionGuardada={seleccion} onSeleccion={actualizarSeleccion} onNuevaInscripcion={nuevaInscripcion} />
      {accesoAbierto && <ModalSesion sesion={sesion} onAutenticado={setSesion} onSesionInvalidada={cerrarSesion} onCerrar={() => setAccesoAbierto(false)} />}
      <ModalMembresia key={planAbierto ?? 'cerrado'} seleccionAnterior={seleccion} onNuevaInscripcion={nuevaInscripcion} plan={membresias.find((plan) => plan.id === planAbierto) ?? null} onCerrar={() => setPlanAbierto(null)} onElegir={elegirMembresia} />

      {/* CONTACTO */}
      <section id="contacto" aria-labelledby="contacto-titulo" className="relative isolate overflow-hidden border-t border-yellow-400/20 bg-black px-4 py-16 sm:px-8 lg:py-20">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,rgba(250,204,21,0.09),transparent_65%)]" />
        <div className="mx-auto max-w-6xl">
        <p className="mb-3 text-center text-xs font-bold tracking-[0.3em] text-yellow-400">TU PRÓXIMA META EMPIEZA AQUÍ</p>
        <h2 id="contacto-titulo" className="text-center text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
          COMIENZA TU <span className="text-yellow-400">TRANSFORMACIÓN</span>
        </h2>
        <p className="mx-auto mt-5 max-w-2xl text-center text-base leading-7 text-gray-300 sm:text-lg">
          Encuentra tu espacio para entrenar, conoce nuestras membresías y elige cómo dar el primer paso. Explora las sedes de FITZONE-HN y comienza tu inscripción a tu ritmo.
        </p>
        <div className="mt-10 grid items-stretch gap-5 lg:grid-cols-3">
          <article className="flex flex-col rounded-3xl border border-zinc-800 bg-gradient-to-br from-zinc-900/80 to-black p-6 sm:p-7">
            <span className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl border border-yellow-400/20 bg-yellow-400/10 text-yellow-400">
              <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 11-8 11S4 16 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.5" /></svg>
            </span>
            <h3 className="text-lg font-black tracking-wide text-white">NUESTRAS SEDES</h3>
            <p className="mt-3 text-sm leading-6 text-gray-400">Tres ciudades, una misma motivación. Conoce los espacios y las instalaciones de cada sede.</p>
            <ul className="my-6 space-y-3 text-sm text-gray-200">{['Choluteca', 'Tegucigalpa', 'San Pedro Sula'].map((ciudad) => <li key={ciudad} className="flex items-center gap-3"><span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-yellow-400" />{ciudad}</li>)}</ul>
            <a href="#sedes" className="mt-auto inline-flex min-h-12 items-center justify-between gap-3 rounded-xl border border-yellow-400/40 px-4 py-3 text-sm font-black text-yellow-200 transition hover:bg-yellow-400/10 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-yellow-300">VER SEDES <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14m-5-5 5 5-5 5" /></svg></a>
          </article>
          <article className="flex flex-col rounded-3xl border border-zinc-800 bg-gradient-to-br from-zinc-900/80 to-black p-6 sm:p-7">
            <span className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl border border-yellow-400/20 bg-yellow-400/10 text-yellow-400">
              <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8v.5Z" /><path d="M8 11h8m-8 4h5" /></svg>
            </span>
            <h3 className="text-lg font-black tracking-wide text-white">CONTÁCTANOS</h3>
            <p className="mt-3 text-sm leading-6 text-gray-400">Da el primer paso. Llámanos o escríbenos para conocer más sobre FITZONE-HN.</p>
            <dl className="mt-5 space-y-3 text-sm">
              <div className="rounded-xl border border-yellow-400/15 bg-yellow-400/5 px-4 py-3">
                <dt className="text-xs font-semibold uppercase tracking-wider text-gray-400">Teléfono</dt>
                <dd><a href="tel:+50495653890" className="inline-flex min-h-11 items-center gap-2 font-semibold text-yellow-200 hover:text-yellow-300 focus-visible:rounded focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-300"><svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="m7 3 3 5-2 2a14 14 0 0 0 6 6l2-2 5 3-1 4C10 22 2 14 3 4l4-1Z" /></svg>+504 9565-3890</a></dd>
              </div>
              <div className="rounded-xl border border-zinc-800 bg-black/30 px-4 py-3">
                <dt className="text-xs font-semibold uppercase tracking-wider text-gray-400">Correo electrónico</dt>
                <dd><a href="mailto:czelayabaca@gmail.com" className="flex min-h-11 items-center gap-2 font-medium text-yellow-200 hover:text-yellow-300 focus-visible:rounded focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-300"><svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></svg><span className="min-w-0 break-all">czelayabaca@gmail.com</span></a></dd>
              </div>
              <div className="grid grid-cols-1 gap-3 pt-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                <div className="min-w-0 rounded-xl border border-zinc-800 px-3 py-3"><dt className="text-xs font-semibold text-gray-400">Facebook</dt><dd className="mt-2 break-words font-medium text-gray-200">Carlos Zelaya</dd></div>
                <div className="min-w-0 rounded-xl border border-zinc-800 px-3 py-3"><dt className="text-xs font-semibold text-gray-400">Instagram</dt><dd className="mt-2 break-words font-medium text-gray-200">@zelayacarlos20</dd></div>
              </div>
            </dl>
          </article>
          <article className="flex flex-col rounded-3xl border border-yellow-400/35 bg-gradient-to-br from-yellow-400/10 via-zinc-950 to-black p-6 shadow-[0_0_30px_#facc1508] sm:p-7">
            <span className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl border border-yellow-400/20 bg-yellow-400/10 text-yellow-400">
              <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="m13 2-3 8H4l7 12 3-8h6L13 2Z" /></svg>
            </span>
            <h3 className="text-lg font-black tracking-wide text-white">ÚNETE A FITZONE-HN</h3>
            <p className="mt-3 text-sm leading-6 text-gray-300">Tu mejor versión comienza con una elección. Compara PLAN FIT y PLAN NEGRO y encuentra el que acompaña tus objetivos.</p>
            <p className="my-6 text-sm leading-6 text-gray-400">En «CONOCER MÁS» podrás revisar los beneficios, elegir tu sede y continuar con tu registro o inicio de sesión.</p>
            <a href="#planes" className="mt-auto inline-flex min-h-12 items-center justify-between gap-3 rounded-xl bg-gradient-to-br from-yellow-200 via-yellow-400 to-amber-500 px-4 py-3 text-sm font-black text-black transition hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-yellow-300">CONOCER MEMBRESÍAS <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14m-5-5 5 5-5 5" /></svg></a>
          </article>
        </div>
        </div>
      </section>

      </main>
      <footer className="border-t border-yellow-400/15 bg-zinc-950 px-4 py-8 sm:px-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 text-center sm:flex-row sm:text-left">
          <div><a href="#inicio" className="text-xl font-black tracking-tight text-yellow-400 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-yellow-300">FITZONE-HN</a><p className="mt-2 text-xs leading-6 text-gray-500">© 2026 FitZone-HN. Todos los derechos reservados.</p></div>
          <nav aria-label="Navegación del pie de página" className="flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm text-gray-300">
            <a href="#planes" className="inline-flex min-h-11 items-center hover:text-yellow-300 focus-visible:outline-2 focus-visible:outline-yellow-300">Membresías</a>
            <a href="#sedes" className="inline-flex min-h-11 items-center hover:text-yellow-300 focus-visible:outline-2 focus-visible:outline-yellow-300">Sedes</a>
            <a href="#inicio" className="inline-flex min-h-11 items-center gap-2 text-yellow-200 hover:text-yellow-300 focus-visible:outline-2 focus-visible:outline-yellow-300">VOLVER ARRIBA <span aria-hidden="true">↑</span></a>
          </nav>
        </div>
      </footer>
    </div>
  );
}

export default App;
