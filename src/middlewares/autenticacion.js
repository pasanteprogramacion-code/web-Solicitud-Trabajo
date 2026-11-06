const { createHash } = require('node:crypto');
const pool = require('../config/db');

async function requerirSesion(req, res, next) {
    res.set('Cache-Control', 'no-store');

    const cookies = req.headers.cookie || '';
    const coincidencia = cookies.match(/(?:^|;\s*)sesion=([a-f0-9]{64})(?:;|$)/);

    if (!coincidencia) {
        return res.status(401).json({mensaje: 'Verificá tu correo para continuar.'});
    }

    const token = coincidencia[1];
    const tokenHash = createHash('sha256').update(token).digest('hex');

    try {
        const resultado = await pool.query(`
            SELECT u.id, u.correo
            FROM sesiones AS s
            JOIN usuarios AS u ON u.id = s.usuario_id
            WHERE s.token_hash = $1 AND s.expira_en > NOW()
        `, [tokenHash]);

        if (resultado.rowCount === 0) {
            res.clearCookie('sesion', { path: '/' });

            return res.status(401).json({
                mensaje: 'Tu sesión venció o dejó de estar disponible. Verificá tu correo nuevamente.'
            });
        }

        req.usuario = resultado.rows[0];
        next();
    } catch (error) {
        next(error);
    }
}

module.exports = requerirSesion;