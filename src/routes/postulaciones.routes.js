const express = require('express');
const pool = require('../config/db');
const requerirSesion = require('../middlewares/autenticacion');
const puestos = require('../../public/js/catalogo-puestos');
const { enviarADestino } = require('../services/destino.postulaciones.service');

const router = express.Router();

const puestosValidos = new Set(puestos.map(puesto => puesto.id));

router.use(requerirSesion);

router.post('/', async (req, res, next) => {
    const puestoId = req.body?.puesto_id;

    
    if (typeof puestoId !== 'string' || !puestosValidos.has(puestoId)) {
        return res.status(400).json({ mensaje: 'Seleccioná un puesto válido.'});
    }

    try {
        
        const resultadoPerfil = await pool.query(`
            SELECT  nombre,
                    apellido,
                    dni,
                    telefono,
                    localidad,
                    estudios,
                    experiencia,
                    disponibilidad
            FROM perfiles WHERE usuario_id = $1
        `, [req.usuario.id]);

        if (resultadoPerfil.rowCount === 0) {
            return res.status(409).json({ mensaje: 'Primero completá tu perfil.' });
        }


        const datosEnviados = {
            correo: req.usuario.correo,
            ...resultadoPerfil.rows[0]
        };

        const resultado = await pool.query(`
            INSERT INTO postulaciones (
                usuario_id,
                puesto_id,
                datos_enviados
            )
            VALUES ($1, $2, $3::jsonb)
            RETURNING id, puesto_id, datos_enviados, creado_en
        `, [
            req.usuario.id,
            puestoId,
            JSON.stringify(datosEnviados)
        ]);

        const postulacion = resultado.rows[0];
        
        let estadoEntrega = 'pendiente';
        
        try {
            estadoEntrega = await enviarADestino(postulacion);
        } catch (error) {
            estadoEntrega = 'error';
            console.error( 'Falló la entrega externa:', error.message);
        }
        
        if (estadoEntrega !== 'pendiente') {
            try {
                await pool.query(`
                    UPDATE postulaciones SET estado_entrega = $1 WHERE id = $2
                    `, [
                        estadoEntrega,
                        postulacion.id
                    ]
                );
            } catch (error) {
                console.error('No se pudo actualizar el estado de entrega:', error.code);
            }
        }

        res.status(201).json({
            mensaje: 'Tu postulación quedó registrada correctamente.',
            postulacion_id: resultado.rows[0].id
        });

    } catch (error) {
        next(error);
    }
});

module.exports = router;