import { useEffect, useRef } from 'react';
import AutenticacionInscripcion from './AutenticacionInscripcion';
import type { Sesion } from '../services/api';

type Props = { sesion: Sesion | null; onAutenticado: (sesion: Sesion) => void; onSesionInvalidada: () => void; onCerrar: () => void };

export default function ModalSesion({ sesion, onAutenticado, onSesionInvalidada, onCerrar }: Props) {
  const dialogo = useRef<HTMLDialogElement>(null);
  const titulo = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    const modal = dialogo.current;
    if (!modal) return;
    const anterior = document.activeElement;
    const overflow = document.body.style.overflow;
    modal.showModal();
    document.body.style.overflow = 'hidden';
    return () => {
      modal.close();
      document.body.style.overflow = overflow;
      if (anterior instanceof HTMLElement && anterior.isConnected && anterior !== document.body && anterior.getClientRects().length > 0) anterior.focus({ preventScroll: true });
      else Array.from(document.querySelectorAll<HTMLButtonElement>('header button')).find((boton) => boton.getClientRects().length > 0)?.focus({ preventScroll: true });
    };
  }, []);
  useEffect(() => { if (sesion) titulo.current?.focus(); }, [sesion]);

  return <dialog id="sesion-modal" ref={dialogo} aria-labelledby="sesion-titulo" onCancel={(event) => { event.preventDefault(); onCerrar(); }} onClick={(event) => { if (event.currentTarget === event.target) onCerrar(); }} onKeyDown={(event) => {
    if (event.key !== 'Tab') return;
    const elementos = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('button, input, a[href]')).filter((elemento) => !elemento.matches(':disabled') && elemento.tabIndex >= 0);
    const primero = elementos[0];
    const ultimo = elementos[elementos.length - 1];
    if (event.shiftKey && (document.activeElement === primero || document.activeElement === titulo.current)) { event.preventDefault(); ultimo?.focus(); }
    else if (!event.shiftKey && document.activeElement === ultimo) { event.preventDefault(); primero?.focus(); }
  }} className="sedes-modal fixed inset-0 m-auto max-h-[90dvh] w-[calc(100%-2rem)] max-w-xl overflow-y-auto rounded-3xl border border-yellow-400/50 bg-black p-5 text-white shadow-[0_0_60px_#facc1520] sm:p-7">
    <div className="mb-5 flex items-start justify-between gap-4">
      <div><p className="mb-2 text-xs font-bold tracking-widest text-yellow-400">TU CUENTA FITZONE-HN</p><h2 id="sesion-titulo" ref={titulo} tabIndex={-1} className="text-xl font-black outline-none sm:text-2xl">{sesion ? 'Sesión iniciada' : 'INICIAR SESIÓN'}</h2></div>
      <button type="button" autoFocus onClick={onCerrar} className="min-h-11 shrink-0 rounded-full border border-yellow-400/40 px-3 text-sm font-bold text-yellow-200 hover:bg-yellow-400/10 focus-visible:outline-2 focus-visible:outline-yellow-300">CERRAR ×</button>
    </div>
    {sesion ? <div className="rounded-2xl border border-yellow-400/20 bg-yellow-400/5 p-5">
      <p className="break-words text-lg font-bold text-yellow-200">Hola, {sesion.usuario.nombre}</p>
      <p className="mt-3 text-sm leading-6 text-gray-300">Tu cuenta fue verificada por el servidor. Puedes explorar las membresías o retomar tu selección desde Sedes. Iniciar sesión no activa una membresía ni confirma una inscripción.</p>
      <div className="mt-5 grid gap-3 sm:grid-cols-2"><a href="#planes" onClick={onCerrar} className="inline-flex min-h-12 items-center justify-center rounded-xl bg-yellow-400 px-4 text-sm font-black text-black focus-visible:outline-2 focus-visible:outline-yellow-300">VER MEMBRESÍAS</a><a href="#sedes" onClick={onCerrar} className="inline-flex min-h-12 items-center justify-center rounded-xl border border-yellow-400/40 px-4 text-sm font-bold text-yellow-200 focus-visible:outline-2 focus-visible:outline-yellow-300">VER SEDES</a></div>
      <p className="mt-4 text-xs leading-6 text-gray-400">La sesión se conserva únicamente en memoria. Al recargar tendrás que iniciar sesión nuevamente.</p>
    </div> : <AutenticacionInscripcion independiente resumen="" onVolver={onCerrar} onAutenticado={onAutenticado} onSesionInvalidada={onSesionInvalidada} />}
  </dialog>;
}
