const pgPool = require('../config/db');

const obtenerRoles = async (req, res) => {
    try {
        const { rows } = await pgPool.query('SELECT * FROM roles');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const crearRol = async (req, res) => {
    try {
        const { nombre } = req.body;
        const { rows } = await pgPool.query('INSERT INTO roles (nombre) VALUES ($1) RETURNING *', [nombre]);
        res.status(201).json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const eliminarRol = async (req, res) => {
    try {
        const { id_rol } = req.params;
        await pgPool.query('DELETE FROM roles WHERE id_rol = $1', [id_rol]);
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { obtenerRoles, crearRol, eliminarRol };