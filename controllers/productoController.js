const pgPool = require('../config/db');
const LogMongo = require('../models/LogMongo');

const obtenerProductos = async (req, res) => {
    try {
        const { rows } = await pgPool.query(`
            SELECT p.*, c.nombre as categoria 
            FROM productos p JOIN categorias c ON p.id_categoria = c.id_categoria
        `);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const crearProducto = async (req, res) => {
    try {
        const { nombre, descripcion, precio_venta, stock, id_categoria, id_usuario_accion, nombre_empleado } = req.body;

        // 1. Guardar en PostgreSQL
        const { rows } = await pgPool.query(
            'INSERT INTO productos (nombre, descripcion, precio_venta, stock, id_categoria) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [nombre, descripcion, precio_venta, stock, id_categoria]
        );

        // 2. Guardar TODO el chisme completo en MongoDB
        await LogMongo.create({
            accion: 'CREAR_PRODUCTO',
            usuario_id: id_usuario_accion, // Aquí simulamos que el Dueño (ID 1) lo hizo
            nombre_empleado: nombre_empleado, // El nombre del responsable
            detalles: {
                producto_creado: nombre,
                precio_asignado: precio_venta,
                stock_inicial: stock
            }
        });

        res.status(201).json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const actualizarPrecio = async (req, res) => {
    try {
        const { id } = req.params;
        const { nuevo_precio } = req.body;

        // Obtener precio anterior para el log
        const oldProd = await pgPool.query('SELECT precio_venta, nombre FROM productos WHERE id_producto = $1', [id]);

        const { rows } = await pgPool.query(
            'UPDATE productos SET precio_venta = $1 WHERE id_producto = $2 RETURNING *',
            [nuevo_precio, id]
        );

        await LogMongo.create({
            accion: 'CAMBIO_PRECIO',
            detalles: {
                producto: oldProd.rows[0].nombre,
                anterior: oldProd.rows[0].precio_venta,
                nuevo: nuevo_precio
            }
        });

        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const eliminarProducto = async (req, res) => {
    try {
        const { id } = req.params;

        // Obtener nombre para el log
        const oldProd = await pgPool.query('SELECT nombre FROM productos WHERE id_producto = $1', [id]);

        await pgPool.query('DELETE FROM productos WHERE id_producto = $1', [id]);

        await LogMongo.create({ accion: 'ELIMINAR_PRODUCTO', detalles: { producto: oldProd.rows[0].nombre } });
        res.json({ message: 'Producto eliminado' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { obtenerProductos, crearProducto, actualizarPrecio, eliminarProducto };