import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { consultarPerfil, conservarToken, ErrorApi, iniciarSesion, leerToken, registrarCuenta } from '../services/api';
import type { Sesion } from '../services/api';

type Props = { onAutenticado: (sesion: Sesion) => void; onVolver: () => void; resumen: string; tokenActual?: string };

export default function AutenticacionInscripcion({ onAutenticado, onVolver, resumen, tokenActual }: Props) {
  const [modo, setModo] = useState<'login' | 'registro'>('login');
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmacion, setConfirmacion] = useState('');
  const [visible, setVisible] = useState(false);
  const [ocupado, setOcupado] = useState(() => Boolean(tokenActual || leerToken()));
  const [error, setError] = useState('');
  const [aviso, setAviso] = useState('');
  const peticionRef = useRef<AbortController | null>(null);
  const onAutenticadoRef = useRef(onAutenticado);

  useEffect(() => { onAutenticadoRef.current = onAutenticado; }, [onAutenticado]);

  useEffect(() => {
    const controller = new AbortController();
    peticionRef.current = controller;
    const token = tokenActual || leerToken();
    if (token) {
      consultarPerfil(token, controller.signal).then((usuario) => {
        if (!controller.signal.aborted) onAutenticadoRef.current({ token, usuario });
      }).catch((fallo: unknown) => {
        if (controller.signal.aborted) return;
        if (fallo instanceof ErrorApi && (fallo.status === 401 || fallo.status === 404)) conservarToken(null);
        setError(fallo instanceof Error ? fallo.message : 'No se pudo verificar tu sesión.');
      }).finally(() => { if (!controller.signal.aborted) setOcupado(false); });
    }
    return () => { controller.abort(); peticionRef.current?.abort(); };
  }, [tokenActual]);

  async function enviar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (ocupado) return;
    setError('');
    setAviso('');
    if (modo === 'registro' && (!nombre.trim() || password.length < 8 || password !== confirmacion)) {
      setError('Escribe tu nombre y usa una contraseña de al menos 8 caracteres que coincida en ambos campos.');
      return;
    }
    const controller = new AbortController();
    peticionRef.current?.abort();
    peticionRef.current = controller;
    setOcupado(true);
    let cuentaCreada = false;
    try {
      const correo = email.trim().toLowerCase();
      if (modo === 'registro') {
        await registrarCuenta({ nombre: nombre.trim(), email: correo, password }, controller.signal);
        cuentaCreada = true;
        if (!controller.signal.aborted) setAviso('El servidor confirmó la creación de tu cuenta. Estamos verificando el inicio de sesión.');
      }
      const sesion = await iniciarSesion(correo, password, controller.signal);
      if (controller.signal.aborted) return;
      conservarToken(sesion.token);
      setPassword('');
      setConfirmacion('');
      onAutenticadoRef.current(sesion);
    } catch (fallo) {
      if (controller.signal.aborted) return;
      if (cuentaCreada) {
        setModo('login');
        setAviso('Tu cuenta fue creada por el servidor. Falta iniciar sesión; no necesitas registrarte otra vez.');
      }
      setError(fallo instanceof Error ? fallo.message : 'No se pudo completar la operación.');
    } finally {
      if (!controller.signal.aborted) setOcupado(false);
    }
  }

  function cambiarModo(siguiente: typeof modo) {
    setModo(siguiente); setError(''); setAviso(''); setPassword(''); setConfirmacion('');
  }

  return <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
    <aside className="rounded-2xl border border-yellow-400/20 bg-yellow-400/5 p-5">
      <p className="text-sm font-bold tracking-wider text-yellow-300">PASO 3 · TU CUENTA FITZONE-HN</p>
      <h4 className="mt-3 text-xl font-black text-white">Tu próxima meta está más cerca</h4>
      <p className="mt-3 text-base leading-7 text-gray-300">Inicia sesión o crea tu cuenta para revisar la solicitud. Tu gimnasio y tu plan se conservan durante el proceso.</p>
      <p className="mt-5 border-t border-yellow-400/15 pt-4 text-sm leading-6 text-yellow-100">{resumen}</p>
      <button type="button" onClick={onVolver} className="mt-5 min-h-11 rounded-xl border border-zinc-600 px-4 py-2 text-sm font-bold text-gray-200 hover:border-yellow-400 focus-visible:outline-2 focus-visible:outline-yellow-300">VOLVER A MEMBRESÍAS</button>
    </aside>
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5 sm:p-6">
      <div role="group" aria-label="Acceso a tu cuenta" className="mb-5 grid grid-cols-2 gap-2 rounded-xl bg-black p-1">
        <button type="button" disabled={ocupado} aria-pressed={modo === 'login'} onClick={() => cambiarModo('login')} className={`min-h-12 rounded-lg px-3 text-sm font-bold focus-visible:outline-2 focus-visible:outline-yellow-300 disabled:opacity-60 ${modo === 'login' ? 'bg-yellow-400 text-black' : 'text-gray-300 hover:bg-zinc-800'}`}>INICIAR SESIÓN</button>
        <button type="button" disabled={ocupado} aria-pressed={modo === 'registro'} onClick={() => cambiarModo('registro')} className={`min-h-12 rounded-lg px-3 text-sm font-bold focus-visible:outline-2 focus-visible:outline-yellow-300 disabled:opacity-60 ${modo === 'registro' ? 'bg-yellow-400 text-black' : 'text-gray-300 hover:bg-zinc-800'}`}>CREAR CUENTA</button>
      </div>
      {aviso && <p role="status" className="mb-4 rounded-xl border border-yellow-400/30 bg-yellow-400/5 p-3 text-sm leading-6 text-yellow-100">{aviso}</p>}
      {error && <p id="error-autenticacion" role="alert" className="mb-4 rounded-xl border border-red-400/40 bg-red-400/10 p-3 text-sm leading-6 text-red-100">{error}</p>}
      <form onSubmit={enviar} aria-busy={ocupado} aria-describedby={error ? 'error-autenticacion' : undefined} className="space-y-4">
        <fieldset disabled={ocupado} className="space-y-4 disabled:opacity-60">
          <legend className="sr-only">{modo === 'login' ? 'Datos de inicio de sesión' : 'Datos de registro'}</legend>
          {modo === 'registro' && <div><label htmlFor="cuenta-nombre" className="mb-2 block text-sm font-semibold text-gray-200">Nombre completo</label><input id="cuenta-nombre" name="nombre" autoComplete="name" required maxLength={120} value={nombre} onChange={(event) => setNombre(event.target.value)} className="sedes-input" /></div>}
          <div><label htmlFor="cuenta-email" className="mb-2 block text-sm font-semibold text-gray-200">Correo electrónico</label><input id="cuenta-email" name="email" type="email" autoComplete="email" required maxLength={254} value={email} onChange={(event) => setEmail(event.target.value)} className="sedes-input" /></div>
          <div><label htmlFor="cuenta-password" className="mb-2 block text-sm font-semibold text-gray-200">Contraseña</label><div className="flex gap-2"><input id="cuenta-password" name="password" type={visible ? 'text' : 'password'} autoComplete={modo === 'registro' ? 'new-password' : 'current-password'} required minLength={modo === 'registro' ? 8 : undefined} value={password} onChange={(event) => setPassword(event.target.value)} aria-describedby={modo === 'registro' ? 'ayuda-password' : undefined} className="sedes-input min-w-0 flex-1" /><button type="button" aria-controls="cuenta-password" aria-pressed={visible} onClick={() => setVisible(!visible)} className="rounded-lg border border-zinc-700 px-3 text-sm text-yellow-200 focus-visible:outline-2 focus-visible:outline-yellow-300">{visible ? 'Ocultar' : 'Mostrar'}</button></div>{modo === 'registro' && <p id="ayuda-password" className="mt-2 text-sm text-gray-400">Usa al menos 8 caracteres.</p>}</div>
          {modo === 'registro' && <div><label htmlFor="cuenta-confirmacion" className="mb-2 block text-sm font-semibold text-gray-200">Confirmar contraseña</label><input id="cuenta-confirmacion" name="confirmacion" type={visible ? 'text' : 'password'} autoComplete="new-password" required minLength={8} value={confirmacion} onChange={(event) => setConfirmacion(event.target.value)} className="sedes-input" /></div>}
          <button type="submit" className="min-h-12 w-full rounded-xl bg-yellow-400 px-4 py-3 text-sm font-black text-black hover:bg-yellow-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-yellow-300">{ocupado ? 'VERIFICANDO…' : modo === 'registro' ? 'CREAR CUENTA Y CONTINUAR' : 'INICIAR SESIÓN Y CONTINUAR'}</button>
        </fieldset>
      </form>
      {ocupado && <p role="status" className="mt-3 text-sm text-yellow-200">Conectando con el servidor. Puedes volver atrás o cerrar la ventana.</p>}
      <p className="mt-4 text-sm leading-6 text-gray-400">Crear una cuenta no confirma una inscripción ni realiza un cobro. Las contraseñas no se guardan en este navegador.</p>
    </div>
  </div>;
}
