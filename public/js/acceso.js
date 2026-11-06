const pedir = document.querySelector('#pedir-codigo');
const validar = document.querySelector('#validar-codigo');
const campoCorreo = document.querySelector('#correo');
const campoCodigo = document.querySelector('#codigo');
const mensaje = document.querySelector('#estado-acceso');
let versionAcceso = 0;

function reiniciarAcceso() {
    versionAcceso++;
    pedir.hidden = false;
    validar.hidden = true;
    campoCodigo.value = '';
    mensaje.textContent = '';
}
document.querySelector('#modal-puesto').addEventListener('close', reiniciarAcceso);
document.querySelector('#volver-correo').addEventListener('click', () => {
    reiniciarAcceso();
    campoCorreo.focus();
});

async function procesar(evento) {
    evento.preventDefault();
    const formulario = evento.currentTarget;
    const verificando = formulario === validar;
    const version = versionAcceso;
    const boton = formulario.querySelector('button');
    const textoOriginal = boton.textContent;
    boton.disabled = true;
    boton.textContent = verificando ? 'Verificando…' : 'Enviando…';
    mensaje.textContent = '';
    try {
        const respuesta = await fetch('/api/auth/' + (verificando ? 'verificar' : 'solicitar'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ correo: campoCorreo.value.trim(), codigo: campoCodigo.value })
        });
        const datos = await respuesta.json();
        if (version !== versionAcceso) return;
        mensaje.textContent = datos.mensaje;
        if (respuesta.ok) {
            pedir.hidden = true;
            validar.hidden = verificando;
            if (!verificando) campoCodigo.focus();
        }
    } catch {
        if (version === versionAcceso) mensaje.textContent = 'No se pudo contactar con el servidor.';
    } finally {
        boton.disabled = false;
        boton.textContent = textoOriginal;
    }
}
pedir.addEventListener('submit', procesar);
validar.addEventListener('submit', procesar);
