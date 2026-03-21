const pgPool = require('../config/db');

const obtenerProveedores = async (req, res) => {
    try {
        // CAMBIO: Solo traemos los proveedores que no han sido "borrados" (activo = true)
        const { rows } = await pgPool.query('SELECT * FROM proveedores WHERE activo = true ORDER BY id_proveedor DESC');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const crearProveedor = async (req, res) => {
    try {
        const { empresa, contacto_nombre, telefono, email } = req.body;
        // La columna 'activo' se pone en true automáticamente por el DEFAULT en la DB
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

// --- EL CAMBIO CLAVE ---
const eliminarProveedor = async (req, res) => {
    try {
        const { id } = req.params;

        // CAMBIO: En lugar de DELETE, actualizamos el estado a false
        const result = await pgPool.query(
            'UPDATE proveedores SET activo = false WHERE id_proveedor = $1',
            [id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Proveedor no encontrado' });
        }

        // Respondemos con éxito y un mensaje claro para el SweetAlert del Frontend
        res.json({ message: 'Proveedor desactivado correctamente' });
    } catch (error) {
        console.error("Error al desactivar proveedor:", error.message);
        res.status(500).json({ error: 'No se pudo eliminar el proveedor porque tiene registros asociados.' });
    }
};

module.exports = { obtenerProveedores, crearProveedor, actualizarProveedor, eliminarProveedor };