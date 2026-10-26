export type Usuario = { id: string | number; nombre: string; email: string; rol: string };
export type Sesion = { token: string; usuario: Usuario };

// En desarrollo usa la API local; en un despliegue sin configuración, el mismo origen.
const apiBase = (import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:3000/api' : '/api')).replace(/\/+$/, '');
const claveSesion = 'fitzone-hn:token:v1';

export class ErrorApi extends Error {
  status: number;
  constructor(message: string, status = 0) {
    super(message);
    this.name = 'ErrorApi';
    this.status = status;
  }
}

function objeto(valor: unknown): valor is Record<string, unknown> {
  return typeof valor === 'object' && valor !== null;
}

function esUsuario(valor: unknown): valor is Usuario {
  return objeto(valor) && ((typeof valor.id === 'number' && Number.isFinite(valor.id)) || (typeof valor.id === 'string' && valor.id.length > 0))
    && typeof valor.nombre === 'string' && valor.nombre.trim().length > 0
    && typeof valor.email === 'string' && valor.email.includes('@') && typeof valor.rol === 'string';
}

async function solicitar(ruta: string, opciones: RequestInit, signal?: AbortSignal): Promise<unknown> {
  const controller = new AbortController();
  const cancelar = () => controller.abort();
  if (signal?.aborted) controller.abort();
  signal?.addEventListener('abort', cancelar, { once: true });
  const timeout = setTimeout(cancelar, 12000);
  try {
    const respuesta = await fetch(`${apiBase}${ruta}`, { ...opciones, signal: controller.signal, headers: { 'Content-Type': 'application/json', ...opciones.headers } });
    const datos: unknown = await respuesta.json().catch(() => null);
    if (!respuesta.ok) {
      const mensaje = respuesta.status === 401 ? 'Correo o contraseña incorrectos, o sesión vencida. Inicia sesión nuevamente.'
        : respuesta.status === 409 ? 'Este correo ya está registrado. Inicia sesión con tu cuenta.'
        : respuesta.status === 429 ? 'Hay demasiados intentos. Espera un momento antes de reintentar.'
        : respuesta.status >= 500 ? 'El servidor no pudo completar la operación. Inténtalo más tarde.'
        : respuesta.status === 404 ? 'El servicio solicitado no está disponible. Puedes volver atrás sin perder tu selección.'
        : 'No se pudo completar la solicitud. Revisa los datos e inténtalo nuevamente.';
      throw new ErrorApi(mensaje, respuesta.status);
    }
    if (!objeto(datos)) throw new ErrorApi('El servidor devolvió una respuesta inesperada. No se pudo validar la operación.');
    return datos;
  } catch (error) {
    if (signal?.aborted) throw new DOMException('Solicitud cancelada', 'AbortError');
    if (error instanceof ErrorApi) throw error;
    throw new ErrorApi(controller.signal.aborted
      ? 'El servidor tardó demasiado en responder. Puedes reintentar sin perder tu selección.'
      : 'No pudimos conectar con el servidor. Comprueba tu conexión o inténtalo más tarde. Tu selección se conserva.');
  } finally {
    clearTimeout(timeout);
    signal?.removeEventListener('abort', cancelar);
  }
}

export async function registrarCuenta(datos: { nombre: string; email: string; password: string }, signal?: AbortSignal): Promise<Usuario> {
  const respuesta = await solicitar('/auth/register', { method: 'POST', body: JSON.stringify(datos) }, signal);
  if (!objeto(respuesta) || !esUsuario(respuesta.usuario)) throw new ErrorApi('No se pudo verificar la respuesta de registro. Antes de reintentar, prueba iniciar sesión con ese correo.');
  return respuesta.usuario;
}

export async function iniciarSesion(email: string, password: string, signal?: AbortSignal): Promise<Sesion> {
  const respuesta = await solicitar('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }, signal);
  if (!objeto(respuesta) || typeof respuesta.token !== 'string' || !respuesta.token.trim() || !esUsuario(respuesta.usuario)) {
    throw new ErrorApi('No se pudo verificar la respuesta de inicio de sesión. Inténtalo nuevamente.');
  }
  // El perfil protegido confirma que la API acepta el token recibido.
  const usuario = await consultarPerfil(respuesta.token, signal);
  if (String(usuario.id) !== String(respuesta.usuario.id)) throw new ErrorApi('La sesión recibida no corresponde al usuario. Inicia sesión nuevamente.');
  return { token: respuesta.token, usuario };
}

export async function consultarPerfil(token: string, signal?: AbortSignal): Promise<Usuario> {
  const respuesta = await solicitar('/users/me', { method: 'GET', headers: { Authorization: `Bearer ${token}` } }, signal);
  if (!objeto(respuesta) || !esUsuario(respuesta.usuario)) throw new ErrorApi('No se pudo verificar el perfil de la sesión.');
  return respuesta.usuario;
}

export function leerToken(): string | null {
  try { return sessionStorage.getItem(claveSesion) || null; } catch { return null; }
}

export function conservarToken(token: string | null) {
  try {
    if (token) sessionStorage.setItem(claveSesion, token);
    else sessionStorage.removeItem(claveSesion);
  } catch { /* La sesión sigue disponible en memoria hasta cerrar o recargar. */ }
}
