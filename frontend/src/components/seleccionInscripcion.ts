import { membresias, sedes } from './sedesData';

const clave = 'fitzone-hn:seleccion-inscripcion:v1';

export type PasoInscripcion = 'gimnasio' | 'membresia' | 'cuenta' | 'confirmacion';
export type SeleccionInscripcion = { sedeId: string; planId: string | null; paso?: PasoInscripcion };

export function leerSeleccion(): SeleccionInscripcion | null {
  try {
    const datos: unknown = JSON.parse(sessionStorage.getItem(clave) ?? 'null');
    if (!datos || typeof datos !== 'object' || !('sedeId' in datos) || !('planId' in datos)) return null;
    if (!sedes.some((sede) => sede.id === datos.sedeId)) return null;
    if (datos.planId !== null && !membresias.some((plan) => plan.id === datos.planId)) return null;
    const paso = 'paso' in datos && ['gimnasio', 'membresia', 'cuenta', 'confirmacion'].includes(String(datos.paso))
      ? datos.paso as PasoInscripcion : 'membresia';
    return { sedeId: datos.sedeId as string, planId: datos.planId as string | null, paso: datos.planId === null ? 'membresia' : paso };
  } catch {
    return null;
  }
}

export function guardarSeleccion(seleccion: SeleccionInscripcion) {
  try {
    sessionStorage.setItem(clave, JSON.stringify(seleccion));
  } catch {
    // La navegación del modal sigue funcionando si el navegador bloquea el almacenamiento.
  }
}
