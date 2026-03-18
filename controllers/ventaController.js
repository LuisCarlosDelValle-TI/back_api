const pgPool = require('../config/db');
const LogMongo = require('../models/LogMongo');

const crearVenta = async (req, res) => {
    const { id_usuario, cliente_nombre, detalles } = req.body;
    // detalles = [{ id_producto: 1, cantidad: 2, precio_unitario: 500 }, ...]

    const cliente = await pgPool.connect(); // Usamos un cliente específico para la transacción

    try {
        await cliente.query('BEGIN'); // Iniciar transacción

        // 1. Calcular total
        const total = detalles.reduce((sum, item) => sum + (item.cantidad * item.precio_unitario), 0);

        // 2. Insertar Venta (Cabecera)
        const resVenta = await cliente.query(
            'INSERT INTO ventas (total, id_usuario, cliente_nombre) VALUES ($1, $2, $3) RETURNING id_venta',
            [total, id_usuario, cliente_nombre]
        );
        const idVenta = resVenta.rows[0].id_venta;

        // 3. Insertar Detalles (Los triggers que creamos actualizarán el stock)
        for (let item of detalles) {
            await cliente.query(
                'INSERT INTO detalle_ventas (id_venta, id_producto, cantidad, precio_unitario) VALUES ($1, $2, $3, $4)',
                [idVenta, item.id_producto, item.cantidad, item.precio_unitario]
            );
        }

        await cliente.query('COMMIT'); // Confirmar transacción

        const resUsuario = await cliente.query('SELECT nombre FROM usuarios WHERE id_usuario = $1', [id_usuario]);
        const nombreCajero = resUsuario.rows.length > 0 ? resUsuario.rows[0].nombre : 'Desconocido';

        await LogMongo.create({ accion: 'NUEVA_VENTA', usuario_id: id_usuario, nombre_empleado: nombreCajero, detalles: { idVenta, total, cliente } });
        res.status(201).json({ mensaje: 'Venta registrada con éxito', id_venta: idVenta });

    } catch (error) {
        await cliente.query('ROLLBACK'); // Si algo falla, deshacer todo
        res.status(500).json({ error: error.message });
    } finally {
        cliente.release(); // Liberar el cliente
    }
};

const obtenerVentas = async (req, res) => {
    try {
        const { rows } = await pgPool.query('SELECT * FROM ventas ORDER BY fecha DESC');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { crearVenta, obtenerVentas };