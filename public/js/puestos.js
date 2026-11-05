// Datos de ejemplo. La empresa debe validar los puestos antes de publicar.
// Más adelante esta lista se obtendrá desde Express y Neon.
const puestos = [
  { id: 'produccion', nombre: 'Operario/a de producción', area: 'Producción', descripcion: 'Participación en la elaboración de panificados, preparación de materias primas y asistencia en las distintas etapas de producción.' },
  { id: 'envasado', nombre: 'Operario/a de envasado', area: 'Envasado', descripcion: 'Acondicionamiento, envasado y etiquetado de productos, con atención a su presentación y a las pautas de higiene.' },
  { id: 'deposito', nombre: 'Auxiliar de depósito', area: 'Logística', descripcion: 'Recepción y organización de mercadería, preparación de pedidos y colaboración en el control de existencias.' },
  { id: 'distribucion', nombre: 'Chofer de distribución', area: 'Distribución', descripcion: 'Distribución de productos, entrega de pedidos y cuidado de la mercadería durante su traslado a los distintos destinos.' },
  { id: 'mantenimiento', nombre: 'Técnico/a de mantenimiento', area: 'Mantenimiento', descripcion: 'Revisión y mantenimiento de equipos e instalaciones, asistencia ante fallas y colaboración en tareas preventivas.' },
  { id: 'administracion', nombre: 'Auxiliar administrativo/a', area: 'Administración', descripcion: 'Carga de datos, organización de documentación y apoyo en las tareas administrativas diarias de la empresa.' }
];

const lista = document.querySelector('#lista-puestos');
const modal = document.querySelector('#modal-puesto');
document.querySelector('#cantidad').textContent = `${puestos.length} puestos`;

for (const puesto of puestos) {
  const tarjeta = document.createElement('article');
  tarjeta.className = 'tarjeta';

  const encabezado = document.createElement('div');
  encabezado.className = 'tarjeta-arriba';
  const area = document.createElement('span');
  area.className = 'area';
  area.textContent = puesto.area;
  encabezado.append(area);

  const titulo = document.createElement('h3');
  titulo.textContent = puesto.nombre;
  const descripcion = document.createElement('p');
  descripcion.textContent = puesto.descripcion;
  const boton = document.createElement('button');
  boton.type = 'button';
  boton.className = 'boton boton-verde';
  boton.textContent = 'Elegir puesto';
  boton.setAttribute('aria-label', `Elegir puesto: ${puesto.nombre}`);
  boton.setAttribute('aria-haspopup', 'dialog');
  boton.addEventListener('click', () => seleccionarPuesto(puesto));

  tarjeta.append(encabezado, titulo, descripcion, boton);
  lista.append(tarjeta);
}

function seleccionarPuesto(puesto) {
  // Conserva solo el identificador público; no datos personales ni permisos.
  // Al implementar acceso.html se usará este parámetro para continuar el flujo.
  const url = new URL(window.location.href);
  url.searchParams.set('puesto', puesto.id);
  window.history.replaceState(null, '', url);
  document.querySelector('#titulo-modal').textContent = puesto.nombre;
  document.querySelector('#descripcion-modal').textContent = puesto.descripcion;
  modal.showModal();
}
