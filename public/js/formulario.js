const formulario = document.querySelector('#form-perfil');
const estado = document.querySelector('#estado-perfil');
const resultado = document.querySelector('#resultado-guardado');
const botonGuardar = document.querySelector('#guardar-perfil');

const idPuesto = new URLSearchParams(window.location.search).get('puesto');
const puesto = puestos.find(item => item.id === idPuesto);

async function cargarPerfil() {
    if (!puesto) {
        estado.textContent = 'Volvé al listado y elegí un puesto para continuar.';
        return;
    }

    document.querySelector('#puesto-elegido').textContent = `Puesto elegido: ${puesto.nombre}`;

    try {
        const respuesta = await fetch('/api/perfil');
        const datos = await respuesta.json();

        if (!respuesta.ok) {
            estado.textContent = respuesta.status === 401 ? 'Volvé a los puestos y verificá tu correo para acceder al perfil.' : datos.mensaje || 'No se pudo cargar tu perfil.';
            return;
        }

        document.querySelector('#correo-verificado').value = datos.correo;

        if (datos.perfil) {
            for (const campo of formulario.querySelectorAll('[name]')) {
                campo.value = datos.perfil[campo.name] ?? '';
            }
        }

        estado.textContent = datos.perfil ? 'Recuperamos tus datos. Podés actualizarlos antes de continuar.' : 'Completá tus datos para guardarlos en tu perfil.';
        formulario.hidden = false;
    } catch {
        estado.textContent = 'No se pudo cargar el perfil. Recargá la página para reintentar.';
    }
}

formulario.addEventListener('submit', async (evento) => {
    evento.preventDefault();

    const perfil = Object.fromEntries(new FormData(formulario));
    botonGuardar.disabled = true;
    botonGuardar.textContent = 'Guardando…';
    resultado.textContent = '';
    delete resultado.dataset.tipo;

    try {
        const respuesta = await fetch('/api/perfil', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(perfil)
        });

        const datos = await respuesta.json();

        if (!respuesta.ok) {
            resultado.dataset.tipo = 'error';
            resultado.textContent = datos.mensaje || 'No se pudo guardar el perfil.';

            if (datos.campo) { formulario.elements.namedItem(datos.campo)?.focus(); }
            return;
        }

        resultado.dataset.tipo = 'exito';
        resultado.textContent = 'Perfil guardado correctamente.';
    } catch {
        resultado.dataset.tipo = 'error';
        resultado.textContent = 'No pudimos confirmar el guardado. Intentá nuevamente.';
    } finally {
        botonGuardar.disabled = false;
        botonGuardar.textContent = 'Guardar perfil';
    }
});

cargarPerfil();