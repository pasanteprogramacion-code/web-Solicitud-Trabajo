const express = require('express');
const { rateLimit } = require('express-rate-limit');
const crypto = require('node:crypto');
const pool = require('../config/db');
const { enviarCodigo } = require('../services/correo.service');
const router = express.Router();
for (const clave of ['CODIGO_SECRET', 'RESEND_API_KEY', 'EMAIL_FROM']) {
    if (!process.env[clave]) throw new Error('Falta configurar ' + clave);
}

function firma(correo, codigo) {
    return crypto.createHmac('sha256', process.env.CODIGO_SECRET).update(correo + ':' + codigo).digest('hex');
}

router.use((req, res, next) => {
    res.set('Cache-Control', 'no-store');
    next();
});

router.use(rateLimit({
    windowMs: 10 * 60 * 1000, limit: 40,
    message: { mensaje: 'Demasiados intentos. Volvé a intentar en 10 minutos.' }
}));

router.use((req, res, next) => {
    const correo = req.body?.correo;
    if (typeof correo !== 'string' || correo.trim().length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo.trim())) {
        return res.status(400).json({ mensaje: 'Ingresá un correo válido.' });
    }
    res.locals.correo = correo.trim().toLowerCase();
    next();
});

router.post('/solicitar', async (req, res, next) => {
    const correo = res.locals.correo;
    const codigo = String(crypto.randomInt(1000000)).padStart(6, '0');
    const hash = firma(correo, codigo);
    try {
        const resultado = await pool.query(`
            INSERT INTO codigos_acceso (correo, codigo_hash, expira_en)
            VALUES ($1, $2, NOW() + INTERVAL '10 minutes')
            ON CONFLICT (correo) DO UPDATE SET codigo_hash = EXCLUDED.codigo_hash,
                creado_en = NOW(), expira_en = EXCLUDED.expira_en, intentos = 0
            WHERE codigos_acceso.creado_en <= NOW() - INTERVAL '1 minute'`, [correo, hash]);
        if (!resultado.rowCount) return res.status(429).json({ mensaje: 'Esperá un minuto antes de pedir otro código.' });
        try {
            await enviarCodigo(correo, codigo);
        } catch (error) {
            console.error('Fallo de envío:', error.message);
            await pool.query('DELETE FROM codigos_acceso WHERE correo=$1 AND codigo_hash=$2', [correo, hash]);
            return res.status(503).json({ mensaje: 'No pudimos enviar el correo. Intentá nuevamente.' });
        }
        res.json({ mensaje: 'Revisá tu correo e ingresá el código de seis dígitos.' });
    } catch (error) { next(error); }
});

router.post('/verificar', async (req, res, next) => {
    const correo = res.locals.correo;
    const codigo = req.body.codigo;
    if (typeof codigo !== 'string' || !/^\d{6}$/.test(codigo)) {
        return res.status(400).json({ mensaje: 'Ingresá los seis dígitos del código.' });
    }

    let conexion;
    try {
        conexion = await pool.connect();
        await conexion.query('BEGIN');
        const resultado = await conexion.query(`
            UPDATE codigos_acceso SET intentos = intentos + 1
            WHERE correo=$1 AND expira_en > NOW() AND intentos < 5
            RETURNING codigo_hash`, [correo]);
        if (!resultado.rowCount || resultado.rows[0].codigo_hash !== firma(correo, codigo)) {
            await conexion.query('COMMIT');
            return res.status(401).json({ mensaje: 'Código incorrecto, vencido o sin intentos disponibles.' });
        }

        const usuario = await conexion.query(`
            INSERT INTO usuarios (correo) VALUES ($1)
            ON CONFLICT (correo) DO UPDATE SET correo_verificado_en=NOW()
            RETURNING id`, [correo]);
        const token = crypto.randomBytes(32).toString('hex');
        const hash = crypto.createHash('sha256').update(token).digest('hex');
        await conexion.query(`
            INSERT INTO sesiones (token_hash, usuario_id, expira_en)
            VALUES ($1, $2, NOW() + INTERVAL '2 hours')`, [hash, usuario.rows[0].id]);
        await conexion.query('DELETE FROM codigos_acceso WHERE correo=$1', [correo]);
        await conexion.query('DELETE FROM sesiones WHERE expira_en <= NOW()');
        await conexion.query('COMMIT');
        res.cookie('sesion', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: 2 * 60 * 60 * 1000 });
        res.json({ mensaje: 'Correo verificado. Ya iniciaste sesión.' });
    } catch (error) {
        if (conexion) await conexion.query('ROLLBACK').catch(() => {});
        next(error);
    } finally { conexion?.release(); }
});

module.exports = router;
