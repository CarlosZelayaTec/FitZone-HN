export const servicios = ['Asesoramiento de entrenamiento', 'Rutinas de ejercicio', 'Orientación sobre el uso de máquinas', 'Planes de membresía', 'Atención al cliente'];

export const sedes = [
  {
    id: 'choluteca',
    nombre: 'FITZONE-HN Choluteca',
    enfoque: 'FUERZA Y PROGRESO',
    imagen: '/images/sede-fuerza.png',
    alt: 'Interior de gimnasio con racks de fuerza y mancuernas.',
    ciudad: 'Choluteca',
    departamento: 'Choluteca',
    horarios: [['Lunes a viernes', '5:00 a. m. – 10:00 p. m.'], ['Sábados', '6:00 a. m. – 8:00 p. m.'], ['Domingos', '7:00 a. m. – 2:00 p. m.']],
    instalaciones: ['Área de musculación', 'Zona de cardio', 'Pesas libres', 'Vestidores', 'Área de estiramiento'],
  },
  {
    id: 'tegucigalpa',
    nombre: 'FITZONE-HN Tegucigalpa',
    enfoque: 'ENERGÍA EN MOVIMIENTO',
    imagen: '/images/sede-cardio.png',
    alt: 'Interior de gimnasio luminoso con caminadoras y bicicletas.',
    ciudad: 'Tegucigalpa',
    departamento: 'Francisco Morazán',
    horarios: [['Lunes a viernes', '5:00 a. m. – 11:00 p. m.'], ['Sábados', '6:00 a. m. – 9:00 p. m.'], ['Domingos', '7:00 a. m. – 4:00 p. m.']],
    instalaciones: ['Área de musculación', 'Zona de cardio', 'Pesas libres', 'Entrenamiento funcional', 'Vestidores y duchas', 'Área de estiramiento'],
  },
  {
    id: 'san-pedro-sula',
    nombre: 'FITZONE-HN San Pedro Sula',
    enfoque: 'SUPERA TUS LÍMITES',
    imagen: '/images/sede-funcional.png',
    alt: 'Interior de gimnasio con pesas rusas y zona de entrenamiento funcional.',
    ciudad: 'San Pedro Sula',
    departamento: 'Cortés',
    horarios: [['Lunes a viernes', '5:00 a. m. – 11:00 p. m.'], ['Sábados', '6:00 a. m. – 9:00 p. m.'], ['Domingos', '7:00 a. m. – 4:00 p. m.']],
    instalaciones: ['Área de musculación', 'Zona de cardio', 'Pesas libres', 'Entrenamiento funcional', 'Vestidores y duchas', 'Zona de estiramiento'],
  },
].map((sede) => ({
  ...sede,
  direccion: 'Dirección pendiente de definir',
}));

export const membresias = [
  { id: 'fit', nombre: 'PLAN FIT', precio: 599, descripcion: 'Ideal para comenzar tu transformación.' },
  { id: 'negro', nombre: 'PLAN NEGRO', precio: 799, descripcion: 'Entrena sin límites y disfruta más beneficios.' },
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