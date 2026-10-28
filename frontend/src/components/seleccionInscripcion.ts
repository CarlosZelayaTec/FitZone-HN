import { membresias, sedes } from './sedesData';

const clave = 'fitzone-hn:seleccion-inscripcion:v1';

export type PasoInscripcion = 'gimnasio' | 'membresia' | 'cuenta' | 'confirmacion';
export type SeleccionInscripcion = { sedeId: string | null; planId: string | null; paso?: PasoInscripcion };

export function leerSeleccion(): SeleccionInscripcion | null {
  try {
    const datos: unknown = JSON.parse(sessionStorage.getItem(clave) ?? 'null');
    if (!datos || typeof datos !== 'object' || !('sedeId' in datos) || !('planId' in datos)) return null;
    if (datos.sedeId !== null && !sedes.some((sede) => sede.id === datos.sedeId)) return null;
    if (datos.planId !== null && !membresias.some((plan) => plan.id === datos.planId)) return null;
    const paso = 'paso' in datos && ['gimnasio', 'membresia', 'cuenta', 'confirmacion'].includes(String(datos.paso))
      ? datos.paso as PasoInscripcion : 'membresia';
    if (datos.sedeId === null && datos.planId === null) return null;
    return { sedeId: datos.sedeId as string | null, planId: datos.planId as string | null, paso: datos.sedeId === null ? 'gimnasio' : datos.planId === null ? 'membresia' : paso };
  } catch {
    return null;
  }
}

export function guardarSeleccion(seleccion: SeleccionInscripcion) {
  try {
    sessionStorage.setItem(clave, JSON.stringify({ sedeId: seleccion.sedeId, planId: seleccion.planId, paso: seleccion.paso }));
  } catch {
    // La navegación del modal sigue funcionando si el navegador bloquea el almacenamiento.
  }
}

export function limpiarSeleccion() {
  try { sessionStorage.removeItem(clave); } catch { /* El estado en memoria se limpia igualmente. */ }
}
