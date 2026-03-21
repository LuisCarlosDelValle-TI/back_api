const pgPool = require('../config/db');

// Trae la tabla principal (Cabecera)
const obtenerHistorialVentas = async (req, res) => {
    try {
        const query = `
            SELECT v.id_venta, v.total, v.fecha, u.nombre as cajero
            FROM ventas v
            LEFT JOIN usuarios u ON v.id_usuario = u.id_usuario
            ORDER BY v.fecha DESC
        `;
        const { rows } = await pgPool.query(query);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Trae los productos de un ticket específico (Cuerpo)
const obtenerDetalleVenta = async (req, res) => {
    try {
        const { id } = req.params;
        const query = `
            SELECT p.nombre as producto, dv.cantidad, dv.precio_unitario, (dv.cantidad * dv.precio_unitario) as subtotal
            FROM detalle_ventas dv
            JOIN productos p ON dv.id_producto = p.id_producto
            WHERE dv.id_venta = $1
        `;
        const { rows } = await pgPool.query(query, [id]);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { obtenerHistorialVentas, obtenerDetalleVenta };