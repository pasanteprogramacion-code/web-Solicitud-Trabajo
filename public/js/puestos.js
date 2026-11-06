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
