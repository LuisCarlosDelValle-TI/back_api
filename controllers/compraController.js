const pgPool = require('../config/db');
const LogMongo = require('../models/LogMongo');

// GET: Ver todo el historial de compras
const obtenerCompras = async (req, res) => {
    try {
        // Hacemos JOIN para traer el nombre del proveedor en lugar de solo su ID
        const query = `
            SELECT c.id_compra, c.total, c.fecha, p.empresa as proveedor, u.nombre as comprador
            FROM compras c
            JOIN proveedores p ON c.id_proveedor = p.id_proveedor
            JOIN usuarios u ON c.id_usuario = u.id_usuario
            ORDER BY c.fecha DESC
        `;
        const { rows } = await pgPool.query(query);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// POST: Registrar una compra nueva
const registrarCompra = async (req, res) => {
    // detalles es un arreglo: [{ id_producto: 1, cantidad: 10, precio_unitario: 400 }, ...]
    const { id_usuario, id_proveedor, detalles } = req.body;

    const cliente = await pgPool.connect(); // Usamos un cliente específico para la transacción

    try {
        await cliente.query('BEGIN'); // 🚀 Iniciamos la transacción

        // 1. Calcular el total de la compra sumando los subtotales
        const total = detalles.reduce((sum, item) => sum + (item.cantidad * item.precio_unitario), 0);

        // 2. Insertar en la tabla principal (compras)
        const resCompra = await cliente.query(
            'INSERT INTO compras (total, id_usuario, id_proveedor) VALUES ($1, $2, $3) RETURNING id_compra',
            [total, id_usuario, id_proveedor]
        );
        const idCompra = resCompra.rows[0].id_compra;

        // 3. Insertar cada producto en el detalle (detalle_compras)
        for (let item of detalles) {
            await cliente.query(
                'INSERT INTO detalle_compras (id_compra, id_producto, cantidad, precio_unitario) VALUES ($1, $2, $3, $4)',
                [idCompra, item.id_producto, item.cantidad, item.precio_unitario]
            );

            // Opcional: Si no tienes triggers en la base de datos para sumar el stock, lo hacemos aquí por código:
            await cliente.query(
                'UPDATE productos SET stock = stock + $1 WHERE id_producto = $2',
                [item.cantidad, item.id_producto]
            );
        }

        await cliente.query('COMMIT'); // ✅ Confirmamos y guardamos todo de golpe

        // 4. Guardar evidencia en MongoDB
        await LogMongo.create({
            accion: 'NUEVA_COMPRA',
            usuario_id: id_usuario,
            nombre_empleado: 'Sistema', // Aquí podrías mandar el nombre desde el frontend
            detalles: {
                id_compra: idCompra,
                proveedor_id: id_proveedor,
                total_pagado: total,
                articulos_comprados: detalles.length
            }
        });

        res.status(201).json({ mensaje: 'Compra registrada con éxito y stock actualizado', id_compra: idCompra });

    } catch (error) {
        await cliente.query('ROLLBACK'); // ❌ Si algo falla, deshacemos todo para no dejar basura
        res.status(500).json({ error: error.message });
    } finally {
        cliente.release(); // Soltamos la conexión para que otros la usen
    }
};

module.exports = { obtenerCompras, registrarCompra };