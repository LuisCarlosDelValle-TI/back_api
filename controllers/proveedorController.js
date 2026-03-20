const pgPool = require('../config/db');

const obtenerProveedores = async (req, res) => {
    try {
        const { rows } = await pgPool.query('SELECT * FROM proveedores');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const crearProveedor = async (req, res) => {
    try {
        const { empresa, contacto_nombre, telefono, email } = req.body;
        const { rows } = await pgPool.query(
            'INSERT INTO proveedores (empresa, contacto_nombre, telefono, email) VALUES ($1, $2, $3, $4) RETURNING *',
            [empresa, contacto_nombre, telefono, email]
        );
        res.status(201).json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const actualizarProveedor = async (req, res) => {
    try {
        const { id } = req.params;
        const { empresa, contacto_nombre, telefono, email } = req.body;

        const { rows } = await pgPool.query(
            'UPDATE proveedores SET empresa = $1, contacto_nombre = $2, telefono = $3, email = $4 WHERE id_proveedor = $5 RETURNING *',
            [empresa, contacto_nombre, telefono, email, id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Proveedor no encontrado' });
        }

        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const eliminarProveedor = async (req, res) => {
    try {
        const { id } = req.params;
        await pgPool.query('DELETE FROM proveedores WHERE id_proveedor = $1', [id]);
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { obtenerProveedores, crearProveedor, actualizarProveedor, eliminarProveedor };