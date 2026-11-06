const express = require('express');
const pool = require('../config/db');
const requerirSesion = require('../middlewares/autenticacion');

const router = express.Router();

router.use(requerirSesion);

router.get('/', async (req, res, next) => {
    try {
        const resultado = await pool.query(`
            SELECT nombre, apellido, dni, telefono, localidad, estudios, experiencia, disponibilidad, actualizado_en
            FROM perfiles WHERE usuario_id = $1
        `, [req.usuario.id]);

        res.json({correo: req.usuario.correo,perfil: resultado.rows[0] ?? null});
    } catch (error) { next(error); }
});


router.put('/', async (req, res, next) => {
    const datos = req.body ?? {};

    const limites = {
        nombre: 100,
        apellido: 100,
        dni: 20,
        telefono: 40,
        localidad: 120,
        estudios: 3000,
        experiencia: 3000,
        disponibilidad: 200
    };

    const perfil = {};

    for (const [campo, limite] of Object.entries(limites)) {
        const valor = datos[campo] ?? '';

        if (typeof valor !== 'string') {
            return res.status(400).json({campo, mensaje: `El campo «${campo}» debe contener texto.`});
        }

        const texto = valor.trim();

        if (campo !== 'experiencia' && texto.length === 0) {
            return res.status(400).json({campo, mensaje: `Completá el campo «${campo}».`});
        }

        if (texto.length > limite) {
            return res.status(400).json({campo, mensaje: `El campo «${campo}» admite hasta ${limite} caracteres.`});
        }

        perfil[campo] = texto;
    }

    try {
        const resultado = await pool.query(`
            INSERT INTO perfiles (
                usuario_id, nombre, apellido, dni, telefono,
                localidad, estudios, experiencia, disponibilidad
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            ON CONFLICT (usuario_id) DO UPDATE SET
                nombre = EXCLUDED.nombre,
                apellido = EXCLUDED.apellido,
                dni = EXCLUDED.dni,
                telefono = EXCLUDED.telefono,
                localidad = EXCLUDED.localidad,
                estudios = EXCLUDED.estudios,
                experiencia = EXCLUDED.experiencia,
                disponibilidad = EXCLUDED.disponibilidad,
                actualizado_en = NOW()
            RETURNING actualizado_en
        `, [
            req.usuario.id,
            perfil.nombre,
            perfil.apellido,
            perfil.dni,
            perfil.telefono,
            perfil.localidad,
            perfil.estudios,
            perfil.experiencia || null,
            perfil.disponibilidad
        ]);

        res.json({mensaje: 'Perfil guardado correctamente.', actualizado_en: resultado.rows[0].actualizado_en});
    } catch (error) {next(error);}
});

module.exports = router;