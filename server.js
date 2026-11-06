require('dotenv').config();

const express = require('express');
const path = require('node:path');
const pool = require('./src/config/db');
const requerirSesion = require('./src/middlewares/autenticacion');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '100kb' }));

app.use('/api/auth', require('./src/routes/auth.routes'));

app.use('/api/perfil', require('./src/routes/perfil.routes'));

app.get('/api/sesion', requerirSesion, (req, res) => {
    res.json({usuario: req.usuario});
});

app.use(express.urlencoded({ extended: false, limit: '100kb'}));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'views', 'index.html'));
});

app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/estado', (req, res) => { 
    res.json({ ok: true, mensaje: 'Servidor funcionando correctamente.'});
});

app.use((req, res) => {
    res.status(404).json({ok: false, mensaje: 'La ruta solicitada no existe.'});
});

app.use((error, req, res, next) => {
    console.error('Error al procesar una solicitud:',error.code || error.name);

    if (res.headersSent) {
        return next(error);
    }

    const estado = error.status || 500;

    res.status(estado).json({
        ok: false,
        mensaje: estado >= 500 ? 'Ocurrió un error en el servidor.' : 'La solicitud no es válida.'
    });
});

async function iniciarServidor() {
    try {
        await pool.query('SELECT 1');

        console.log('Conexión con Neon establecida.');

        const servidor = app.listen(PORT, () => {
            console.log(`Servidor disponible en http://localhost:${PORT}`);
        });

        servidor.on('error', async (error) => {
            console.error('No se pudo iniciar el servidor:', error.code || 'SIN_CODIGO');
            await pool.end();
            process.exitCode = 1;
        });
    } catch (error) {
        console.error('No se pudo conectar con Neon. Revisá DATABASE_URL y tu conexión.', error.code || 'SIN_CODIGO');

        await pool.end();
        process.exitCode = 1;
    }
}

iniciarServidor();