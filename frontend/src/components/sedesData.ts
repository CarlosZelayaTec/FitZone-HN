export const servicios = ['Asesoramiento de entrenamiento', 'Rutinas de ejercicio', 'Orientación sobre el uso de máquinas', 'Planes de membresía', 'Atención al cliente'];

export const sedes = [
  {
    id: 'choluteca',
    nombre: 'FITZONE-HN Choluteca',
    enfoque: 'FUERZA Y PROGRESO',
    imagen: '/images/choluteca-960.webp',
    alt: 'Interior de gimnasio con máquinas de fuerza amarillas y negras y pesas libres.',
    ciudad: 'Choluteca',
    departamento: 'Choluteca',
    horarios: [['Lunes a viernes', '5:00 a. m. – 10:00 p. m.'], ['Sábados', '6:00 a. m. – 8:00 p. m.'], ['Domingos', '7:00 a. m. – 2:00 p. m.']],
    instalaciones: ['Área de musculación', 'Zona de cardio', 'Pesas libres', 'Entrenamiento funcional', 'Vestidores y duchas', 'Área de estiramiento'],
  },
  {
    id: 'tegucigalpa',
    nombre: 'FITZONE-HN Tegucigalpa',
    enfoque: 'ENERGÍA EN MOVIMIENTO',
    imagen: '/images/tegucigalpa-960.webp',
    alt: 'Sala amplia de gimnasio con máquinas de musculación y luces rectangulares en el techo.',
    ciudad: 'Tegucigalpa',
    departamento: 'Francisco Morazán',
    horarios: [['Lunes a viernes', '5:00 a. m. – 11:00 p. m.'], ['Sábados', '6:00 a. m. – 9:00 p. m.'], ['Domingos', '7:00 a. m. – 4:00 p. m.']],
    instalaciones: ['Área de musculación', 'Zona de cardio', 'Pesas libres', 'Entrenamiento funcional', 'Vestidores y duchas', 'Área de estiramiento'],
  },
  {
    id: 'san-pedro-sula',
    nombre: 'FITZONE-HN San Pedro Sula',
    enfoque: 'SUPERA TUS LÍMITES',
    imagen: '/images/san-pedro-sula-960.webp',
    alt: 'Interior de gimnasio con máquinas de musculación, mancuernas y zona de entrenamiento funcional.',
    ciudad: 'San Pedro Sula',
    departamento: 'Cortés',
    horarios: [['Lunes a viernes', '5:00 a. m. – 11:00 p. m.'], ['Sábados', '6:00 a. m. – 9:00 p. m.'], ['Domingos', '7:00 a. m. – 4:00 p. m.']],
    instalaciones: ['Área de musculación', 'Zona de cardio', 'Pesas libres', 'Entrenamiento funcional', 'Vestidores y duchas', 'Área de estiramiento'],
  },
].map((sede) => ({
  ...sede,
  imagenSrcSet: [480, 960, 1536].map((ancho) => `/images/${sede.id}-${ancho}.webp ${ancho}w`).join(', '),
  direccion: 'Dirección pendiente de definir',
}));

export const membresias = [
  { id: 'fit', popular: false, lema: 'TU PRIMER PASO', nombre: 'PLAN FIT', precio: 599, descripcion: 'Ideal para comenzar tu transformación.', alcance: 'Acceso únicamente a la sede seleccionada', beneficios: ['Acceso únicamente a la sede seleccionada', 'Equipos de entrenamiento', 'Área de cardio y pesas', 'Ambiente cómodo y seguro'] },
  { id: 'negro', popular: true, lema: 'ENTRENA SIN LÍMITES', nombre: 'PLAN NEGRO', precio: 799, descripcion: 'Entrena sin límites y disfruta más beneficios.', alcance: 'Acceso a todas las sedes', beneficios: ['Acceso a todas las sedes', 'Equipos de entrenamiento', 'Área de cardio y pesas', 'Beneficio propuesto de invitar a un amigo'] },
] as const;

export function normalizarBusqueda(valor: string) {
  return valor.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('es').trim();
}

export function filtrarSedes(consulta: string) {
  const palabras = normalizarBusqueda(consulta).split(/\s+/).filter(Boolean);
  return sedes.filter((sede) => {
    const texto = normalizarBusqueda(`${sede.nombre} ${sede.ciudad} ${sede.departamento}`);
    return palabras.every((palabra) => texto.includes(palabra));
  });
}
