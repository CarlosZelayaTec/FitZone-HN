import Sedes from './components/Sedes';

function App() {
  return (
    <div className="min-h-screen bg-black text-white">

      {/* MENÚ PRINCIPAL */}
      <header className="flex flex-wrap items-center justify-between gap-4 bg-black px-8 py-5">
        <h1 className="text-3xl font-black text-yellow-400">
          FITZONE-HN
        </h1>

        <nav className="flex flex-wrap gap-6 font-semibold">
          <a href="#inicio" className="hover:text-yellow-400">Inicio</a>
          <a href="#beneficios" className="hover:text-yellow-400">Beneficios</a>
          <a href="#planes" className="hover:text-yellow-400">Membresías</a>
          <a href="#sedes" className="hover:text-yellow-400">Sedes</a>
          <a href="#contacto" className="hover:text-yellow-400">Contacto</a>
        </nav>

        <button className="rounded-lg bg-yellow-400 px-6 py-3 font-bold text-black hover:bg-yellow-300">
          INICIAR SESIÓN
        </button>
      </header>

      {/* PORTADA PRINCIPAL */}
      <section
        id="inicio"
        className="relative flex min-h-[650px] items-center bg-cover bg-center"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(0,0,0,0.95), rgba(0,0,0,0.35)), url('https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg')",
        }}
      >
        <div className="max-w-3xl px-8 md:px-20">
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
              icono: "/iconos/mancuerna.png",
            },
            {
              titulo: "ENTRENAMIENTO",
              descripcion:
                "Encuentra un espacio diseñado para motivarte a alcanzar tus objetivos.",
              icono: "/iconos/brazo.png",
            },
            {
              titulo: "INSTALACIONES",
              descripcion:
                "Disfruta de ambientes cómodos y preparados para tus entrenamientos.",
              icono: "/iconos/gimnasio.png",
            },
          ].map((beneficio) => (
            <article
              key={beneficio.titulo}
              className="rounded-2xl border border-zinc-800 bg-zinc-900 p-8 text-center transition hover:border-yellow-400"
            >
 <div className="mb-6 flex justify-center">
  <img
    src={beneficio.icono}
    alt={beneficio.titulo}
    className="h-60 w-60 object-contain transition-transform duration-300 hover:scale-110"
  />
</div>

              <h3 className="mb-4 text-xl font-black text-yellow-400">
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
          {[
            {
              nombre: "FIT",
              precio: "599",
              lema: "TU PRIMER PASO",
              descripcion: "Ideal para comenzar tu transformación.",
              beneficios: [
                "Acceso a tu gimnasio",
                "Equipos de entrenamiento",
                "Área de cardio y pesas",
                "Ambiente cómodo y seguro",
              ],
              popular: false,
            },
            {
              nombre: "BLACK",
              precio: "799",
              lema: "ENTRENA SIN LÍMITES",
              descripcion: "Entrena sin límites y disfruta más beneficios.",
              beneficios: [
                "Acceso a todas las sedes",
                "Equipos de entrenamiento",
                "Área de cardio y pesas",
                "Invita a un amigo",
              ],
              popular: true,
            },
          ].map((plan) => (
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
                    PLAN <span className="bg-gradient-to-b from-yellow-100 via-yellow-400 to-amber-500 bg-clip-text text-transparent">{plan.nombre}</span>
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
              <a href="#contacto" className="mt-auto inline-flex min-h-12 w-full items-center justify-center gap-4 rounded-2xl border border-yellow-200 bg-gradient-to-br from-yellow-200 via-yellow-400 to-amber-500 px-4 py-3 text-center text-base font-black text-black shadow-[0_4px_20px_#facc1530,inset_0_1px_0_#fff8] transition duration-300 hover:brightness-110 hover:shadow-[0_4px_28px_#facc1555] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-yellow-300 motion-reduce:transition-none lg:text-lg">
                CONOCER MÁS
                <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12h16m-6-6 6 6-6 6" /></svg>
              </a>
            </article>
          ))}
        </div>
        <p className="mt-5 text-xs leading-relaxed text-gray-400">Precios ilustrativos sujetos a confirmación.</p>
      </section>
      {/* SEDES */}
      <Sedes />

      {/* CONTACTO */}
      <section id="contacto" className="bg-black px-8 py-20 text-center">
        <h2 className="mb-6 text-4xl font-black">
          COMIENZA TU <span className="text-yellow-400">TRANSFORMACIÓN</span>
        </h2>

        <p className="text-gray-300">
          Únete a FitZone-HN y trabaja por tu mejor versión.
        </p>
      </section>

      <footer className="border-t border-zinc-800 bg-black py-8 text-center text-gray-400">
        © 2026 FitZone-HN. Todos los derechos reservados.
      </footer>
    </div>
  );
}

export default App;
