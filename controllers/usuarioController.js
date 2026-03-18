const pgPool = require('../config/db');
const LogMongo = require('../models/LogMongo');

const obtenerUsuarios = async (req, res) => {
    try {
        const { rows } = await pgPool.query(`
            SELECT u.id_usuario, u.nombre, u.email, u.telefono, r.nombre as rol 
            FROM usuarios u JOIN roles r ON u.id_rol = r.id_rol
        `);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const crearUsuario = async (req, res) => {
    try {
        const { nombre, email, password, telefono, id_rol } = req.body;
        const { rows } = await pgPool.query(
            'INSERT INTO usuarios (nombre, email, password, telefono, id_rol) VALUES ($1, $2, $3, $4, $5) RETURNING id_usuario, nombre, email',
            [nombre, email, password, telefono, id_rol]
        );

        await LogMongo.create({ accion: 'REGISTRAR_USUARIO', detalles: { email } });
        res.status(201).json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const eliminarUsuario = async (req, res) => {
    try {
        const { id } = req.params;
        const { rows } = await pgPool.query('DELETE FROM usuarios WHERE id_usuario = $1 RETURNING email', [id]);

        if(rows.length > 0) {
            await LogMongo.create({ accion: 'ELIMINAR_USUARIO', detalles: { email: rows[0].email } });
            res.json({ mensaje: 'Usuario eliminado' });
        } else {
            res.status(404).json({ error: 'Usuario no encontrado' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { obtenerUsuarios, crearUsuario, eliminarUsuario };