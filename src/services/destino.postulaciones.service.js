async function enviarADestino(postulacion) {
    const destino = process.env.POSTULACIONES_WEBHOOK_URL;

    if (!destino) {
        return 'pendiente';
    }

    const url = new URL(destino);

    if (url.protocol !== 'https:') {
        throw new Error('El destino debe utilizar HTTPS.');
    }

    const token = process.env.POSTULACIONES_WEBHOOK_TOKEN;

    if (!token) {
        throw new Error('Falta configurar el token del destino.');
    }

    const respuesta = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'Idempotency-Key': `postulacion-${postulacion.id}`
        },
        body: JSON.stringify({
            id: postulacion.id,
            puesto_id: postulacion.puesto_id,
            datos: postulacion.datos_enviados,
            creado_en: postulacion.creado_en
        }),
        signal: AbortSignal.timeout(8000)
    });

    if (!respuesta.ok) {
        throw new Error(`Error del destino: HTTP ${respuesta.status}`);
    }

    return 'enviado';
}

module.exports = { enviarADestino };