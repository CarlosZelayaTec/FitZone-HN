import { useEffect, useRef, useState } from 'react';
import { membresias, sedes } from './sedesData';
import type { SeleccionInscripcion } from './seleccionInscripcion';

type Props = { plan: (typeof membresias)[number] | null; seleccionAnterior: SeleccionInscripcion | null; onNuevaInscripcion: () => void; onCerrar: () => void; onElegir: (planId: string, sedeId: string) => void };

export default function ModalMembresia({ plan, seleccionAnterior, onNuevaInscripcion, onCerrar, onElegir }: Props) {
  const [sedeId, setSedeId] = useState<string | null>(seleccionAnterior?.sedeId ?? null);
  const dialogo = useRef<HTMLDialogElement>(null);
  const eligiendo = useRef(false);
  useEffect(() => {
    if (!plan || !dialogo.current) return;
    const modal = dialogo.current;
    const anterior = document.activeElement;
    const overflow = document.body.style.overflow;
    eligiendo.current = false;
    modal.showModal();
    document.body.style.overflow = 'hidden';
    return () => {
      modal.close();
      document.body.style.overflow = overflow;
      if (!eligiendo.current && anterior instanceof HTMLElement) anterior.focus({ preventScroll: true });
    };
  }, [plan]);

  return <dialog ref={dialogo} aria-labelledby="membresia-modal-titulo" onCancel={(event) => { event.preventDefault(); onCerrar(); }} onClick={(event) => { if (event.target === event.currentTarget) onCerrar(); }} onKeyDown={(event) => {
    if (event.key !== 'Tab') return;
    const botones = event.currentTarget.querySelectorAll<HTMLElement>('button:not(:disabled), input:checked, input[tabindex="0"]');
    const primero = botones[0];
    const ultimo = botones[botones.length - 1];
    if (event.shiftKey && document.activeElement === primero) { event.preventDefault(); ultimo?.focus(); }
    else if (!event.shiftKey && document.activeElement === ultimo) { event.preventDefault(); primero?.focus(); }
  }} className="sedes-modal fixed inset-0 m-auto max-h-[90dvh] w-[calc(100%-2rem)] max-w-lg overflow-y-auto rounded-3xl border border-yellow-400/50 bg-black p-6 text-white shadow-[0_0_60px_#facc1520] sm:p-8">
    {plan && <>
      <div className="flex items-center justify-between gap-4">
        <h2 id="membresia-modal-titulo" className="text-2xl font-black text-yellow-300">{plan.nombre}</h2>
        <button type="button" autoFocus onClick={onCerrar} className="min-h-11 rounded-full border border-yellow-400/40 px-4 text-sm font-bold text-yellow-200 hover:bg-yellow-400/10 focus-visible:outline-2 focus-visible:outline-yellow-300">CERRAR ×</button>
      </div>
      <p className="mt-5 text-4xl font-black">L {plan.precio}<span className="text-base font-normal text-gray-400">/mes</span></p>
      <p className="mt-3 text-gray-300">{plan.descripcion}</p>
      <ul className="mt-6 space-y-4">{plan.beneficios.map((beneficio) => <li key={beneficio} className="flex gap-3 text-sm leading-6"><span aria-hidden="true" className="text-yellow-400">✓</span>{beneficio}</li>)}</ul>
      <fieldset className="mt-6 border-t border-yellow-400/20 pt-5">
        <legend className="float-left mb-4 w-full text-sm font-black tracking-wide text-yellow-200">{plan.id === 'fit' ? '¿EN QUÉ SEDE QUIERES INSCRIBIRTE?' : '¿CUÁL SERÁ TU SEDE PRINCIPAL?'}</legend>
        <div className="clear-both space-y-2">
          {sedes.map((sede, indice) => <label key={sede.id} className={`flex min-h-14 cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-sm transition focus-within:ring-2 focus-within:ring-yellow-300 ${sedeId === sede.id ? 'border-yellow-400 bg-yellow-400/10 text-yellow-100' : 'border-zinc-700 bg-zinc-950 text-gray-200 hover:border-yellow-400/60'}`}>
            <input type="radio" name="sede-plan" value={sede.id} checked={sedeId === sede.id} tabIndex={sedeId === sede.id || (!sedeId && indice === 0) ? 0 : -1} onChange={() => setSedeId(sede.id)} className="h-5 w-5 shrink-0 accent-yellow-400" />
            <span>{sede.nombre}</span>
          </label>)}
        </div>
      </fieldset>
      <p role="status" aria-live="polite" className="mt-3 text-sm leading-6 text-gray-300">{sedeId ? `${seleccionAnterior?.sedeId === sedeId ? 'Sede seleccionada anteriormente' : 'Sede elegida'}: ${sedes.find((sede) => sede.id === sedeId)?.nombre}. Puedes cambiarla arriba.` : 'Sede pendiente de seleccionar'}</p>
      <p className="mt-3 text-sm leading-6 text-yellow-100">{plan.id === 'fit' ? 'El acceso será únicamente a la sede elegida.' : 'Tendrás acceso a todas las sedes; la elegida será tu sede principal.'}</p>
      <p className="mt-4 text-xs leading-6 text-gray-400">Precios y beneficios propuestos para el proyecto universitario, sujetos a confirmación.</p>
      <button type="button" disabled={!sedeId} onClick={() => { if (!sedeId) return; eligiendo.current = true; onElegir(plan.id, sedeId); }} className="mt-5 min-h-12 w-full rounded-xl bg-yellow-400 px-4 py-3 font-black text-black hover:bg-yellow-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-yellow-300 disabled:cursor-not-allowed disabled:bg-zinc-800 disabled:text-zinc-500">CONTINUAR INSCRIPCIÓN</button>
      <button type="button" onClick={onCerrar} className="mt-3 min-h-11 w-full rounded-xl border border-zinc-700 px-4 text-sm font-bold text-gray-300 hover:border-yellow-400 focus-visible:outline-2 focus-visible:outline-yellow-300">CANCELAR</button>
      {seleccionAnterior && <button type="button" onClick={() => { setSedeId(null); onNuevaInscripcion(); }} className="mt-3 min-h-11 w-full rounded-xl border border-zinc-700 px-4 text-sm font-bold text-gray-300 hover:border-yellow-400 focus-visible:outline-2 focus-visible:outline-yellow-300">NUEVA INSCRIPCIÓN</button>}
    </>}
  </dialog>;
}
