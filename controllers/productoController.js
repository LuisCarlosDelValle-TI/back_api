const pgPool = require('../config/db');
const LogMongo = require('../models/LogMongo');

const obtenerProductos = async (req, res) => {
    try {
        // CAMBIO: Agregamos WHERE p.activo = true para que no aparezcan los "borrados"
        const { rows } = await pgPool.query(`
            SELECT p.*, c.nombre as categoria
            FROM productos p
                     JOIN categorias c ON p.id_categoria = c.id_categoria
            WHERE p.activo = true
            ORDER BY p.id_producto DESC
        `);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const crearProducto = async (req, res) => {
    try {
        const {
            nombre,
            descripcion,
            precio_venta,
            stock,
            id_categoria,
            imagen_url,
            id_usuario_accion,
            nombre_empleado
        } = req.body;

        // Nota: Por defecto la columna 'activo' es TRUE en la DB, no necesitas enviarla aquí.
        const { rows } = await pgPool.query(
            'INSERT INTO productos (nombre, descripcion, precio_venta, stock, id_categoria, imagen_url) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [nombre, descripcion || null, precio_venta, stock, id_categoria, imagen_url || null]
        );

        await LogMongo.create({
            accion: 'CREAR_PRODUCTO',
            usuario_id: id_usuario_accion || 1,
            nombre_empleado: nombre_empleado || 'Admin',
            detalles: {
                producto_creado: nombre,
                precio_asignado: precio_venta,
                stock_inicial: stock
            }
        });

        res.status(201).json(rows[0]);
    } catch (error) {
        console.error("Error al crear producto:", error.message);
        res.status(500).json({ error: error.message });
    }
};

const actualizarProducto = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, descripcion, precio_venta, stock, id_categoria, imagen_url } = req.body;

        const { rows } = await pgPool.query(
            'UPDATE productos SET nombre = $1, descripcion = $2, precio_venta = $3, stock = $4, id_categoria = $5, imagen_url = $6 WHERE id_producto = $7 RETURNING *',
            [nombre, descripcion, precio_venta, stock, id_categoria, imagen_url, id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }

        await LogMongo.create({
            accion: 'ACTUALIZAR_PRODUCTO',
            detalles: { producto: nombre, id: id }
        });

        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const actualizarPrecio = async (req, res) => {
    try {
        const { id } = req.params;
        const { nuevo_precio } = req.body;

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

// --- FUNCIÓN CON EL CAMBIO MAESTRO: BORRADO LÓGICO ---
const eliminarProducto = async (req, res) => {
    try {
        const { id } = req.params;

        // 1. Buscamos el nombre para el log de Mongo
        const oldProd = await pgPool.query('SELECT nombre FROM productos WHERE id_producto = $1', [id]);

        if (oldProd.rows.length === 0) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }

        // 2. CAMBIO: En lugar de DELETE, hacemos un UPDATE de la columna activo
        await pgPool.query('UPDATE productos SET activo = false WHERE id_producto = $1', [id]);

        // 3. Registramos en Mongo (es importante saber quién "borró" algo)
        await LogMongo.create({
            accion: 'ELIMINAR_PRODUCTO_LOGICO',
            detalles: {
                producto: oldProd.rows[0].nombre,
                mensaje: 'Producto desactivado (borrado lógico)'
            }
        });

        res.json({ message: 'Producto desactivado correctamente' });
    } catch (error) {
        console.error("Error en borrado lógico:", error.message);
        res.status(500).json({ error: error.message });
    }
};

module.exports = { obtenerProductos, crearProducto, actualizarPrecio, actualizarProducto, eliminarProducto };