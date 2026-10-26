import type { Usuario } from '../services/api';
import { membresias, sedes } from './sedesData';

type Props = { usuario: Usuario; sede: (typeof sedes)[number]; plan: (typeof membresias)[number]; onCambiarPlan: () => void; onCambiarCuenta: () => void };

export default function ConfirmacionInscripcion({ usuario, sede, plan, onCambiarPlan, onCambiarCuenta }: Props) {
  return <div className="grid gap-6 md:grid-cols-[0.8fr_1.2fr]">
    <div><img src={sede.imagen} alt={sede.alt} width="1536" height="1024" className="h-auto w-full rounded-2xl border border-yellow-400/20 object-contain" /><p className="mt-3 text-sm leading-6 text-gray-400">Horarios, instalaciones y servicios propuestos para el proyecto universitario. {sede.direccion}.</p></div>
    <div className="rounded-2xl border border-yellow-400/25 bg-zinc-950 p-5 sm:p-6">
      <p className="text-sm font-bold tracking-wider text-yellow-300">PASO 4 · REVISA TU SOLICITUD</p>
      <h4 className="mt-2 text-xl font-black text-white">Todo tu entrenamiento, en un resumen</h4>
      <dl className="mt-5 space-y-4 text-base">
        <div><dt className="text-sm text-gray-400">Titular de la cuenta</dt><dd className="mt-1 break-words font-semibold text-white">{usuario.nombre}</dd><dd className="mt-1 break-all text-sm text-gray-300">{usuario.email}</dd></div>
        <div className="border-t border-white/10 pt-4"><dt className="text-sm text-gray-400">Gimnasio seleccionado</dt><dd className="mt-1 font-semibold text-white">{sede.nombre}</dd><dd className="mt-1 text-sm text-gray-300">{sede.ciudad}, {sede.departamento}</dd></div>
        <div className="flex flex-wrap items-end justify-between gap-3 border-t border-white/10 pt-4"><div><dt className="text-sm text-gray-400">Membresía</dt><dd className="mt-1 font-black text-yellow-300">{plan.nombre}</dd></div><div><dt className="text-sm text-gray-400">Precio mensual</dt><dd className="mt-1 text-3xl font-black text-white">L {plan.precio}<span className="text-sm font-normal text-gray-400"> / mes</span></dd></div></div>
      </dl>
      <div className="mt-5 flex flex-wrap gap-3"><button type="button" onClick={onCambiarPlan} className="min-h-11 rounded-xl border border-zinc-600 px-3 text-sm font-bold text-gray-200 hover:border-yellow-400 focus-visible:outline-2 focus-visible:outline-yellow-300">CAMBIAR PLAN</button><button type="button" onClick={onCambiarCuenta} className="min-h-11 rounded-xl border border-zinc-600 px-3 text-sm font-bold text-gray-200 hover:border-yellow-400 focus-visible:outline-2 focus-visible:outline-yellow-300">CAMBIAR CUENTA</button></div>
      <p id="confirmacion-pendiente" className="mt-5 rounded-xl border border-yellow-400/25 bg-yellow-400/5 p-4 text-sm leading-6 text-yellow-100">La confirmación estará disponible cuando se conecte el servicio de inscripciones. Tu sesión fue verificada, pero todavía no se ha enviado ni registrado una solicitud.</p>
      <button type="button" disabled aria-describedby="confirmacion-pendiente" className="mt-4 min-h-12 w-full cursor-not-allowed rounded-xl bg-zinc-800 px-4 py-3 text-sm font-black text-zinc-400">CONFIRMAR SOLICITUD · PRÓXIMAMENTE</button>
      <p className="mt-3 text-sm text-gray-400">Precios ilustrativos sujetos a confirmación. No se realiza ningún pago.</p>
    </div>
  </div>;
}
