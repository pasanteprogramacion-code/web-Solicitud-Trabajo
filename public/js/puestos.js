// Puestos relevados en la empresa; denominaciones y descripciones
// pendientes de validación final del supervisor.
// Más adelante esta lista se obtendrá desde Express y Neon.
const puestos = [
  {
    id: 'mantenimiento',
    nombre: 'Técnico/a de mantenimiento industrial',
    area: 'Mantenimiento',
    descripcion: 'Realiza tareas de mantenimiento y reparación de maquinaria, identifica fallas y colabora en mantener los equipos de la planta en condiciones de funcionamiento.'
  },
  {
    id: 'amasador',
    nombre: 'Amasador/a',
    area: 'Fabricación',
    descripcion: 'Opera la amasadora y controla el mezclado y amasado, siguiendo las indicaciones de elaboración de cada producto.'
  },
  {
    id: 'maquinista-fabricacion',
    nombre: 'Maquinista de fabricación',
    area: 'Fabricación',
    descripcion: 'Opera y controla las máquinas de las líneas de bollería o pan de molde, ajustando los parámetros establecidos para la elaboración.'
  },
  {
    id: 'estibador',
    nombre: 'Estibador/a de producción',
    area: 'Fabricación y Horno',
    descripcion: 'Organiza, carga, descarga y traslada carros, bandejas y moldes entre las distintas etapas del proceso productivo.'
  },
  {
    id: 'hornero',
    nombre: 'Hornero/a',
    area: 'Horno',
    descripcion: 'Opera los hornos y controla los tiempos y parámetros de cocción, verificando el estado de los productos durante el horneado.'
  },
  {
    id: 'maquinista-envasado',
    nombre: 'Maquinista de envasado',
    area: 'Envase',
    descripcion: 'Prepara y opera las máquinas de envasado, abastece los materiales necesarios y verifica que los productos queden correctamente envasados.'
  },
  {
    id: 'expedicion',
    nombre: 'Operario/a de expedición',
    area: 'Producción',
    descripcion: 'Prepara y organiza los pedidos para su despacho y realiza la carga de los productos en los vehículos de distribución.'
  },
  {
    id: 'dosificacion',
    nombre: 'Operario/a de dosificación',
    area: 'Producción',
    descripcion: 'Pesa y dosifica las materias primas según las fórmulas establecidas y prepara los ingredientes necesarios para la elaboración.'
  },
  {
    id: 'chofer',
    nombre: 'Chofer de reparto',
    area: 'Distribución',
    descripcion: 'Transporta y entrega los pedidos en los destinos asignados, preservando las condiciones de la mercadería durante el traslado.'
  },
  {
    id: 'limpieza',
    nombre: 'Operario/a de limpieza y saneamiento',
    area: 'Sanidad',
    descripcion: 'Realiza la limpieza y desinfección de instalaciones, equipos y áreas comunes, siguiendo los procedimientos establecidos para cada sector.'
  },
  {
    id: 'contador',
    nombre: 'Contador/a',
    area: 'Administración',
    descripcion: 'Gestiona y revisa la información contable de la empresa y prepara los registros e informes correspondientes a su función.'
  },
  {
    id: 'administrativo',
    nombre: 'Administrativo/a general',
    area: 'Administración',
    descripcion: 'Registra información en los sistemas de gestión, organiza documentación y realiza tareas de apoyo administrativo a los distintos sectores.'
  }
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
