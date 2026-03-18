const pgPool = require('../config/db');
const LogMongo = require('../models/LogMongo');

const obtenerCategorias = async (req, res) => {
    try {
        const resultado = await pgPool.query('SELECT * FROM categorias');
        res.json(resultado.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const crearCategoria = async (req, res) => {
    const { nombre, descripcion } = req.body;
    try {
        const query = 'INSERT INTO categorias (nombre, descripcion) VALUES ($1, $2) RETURNING *';
        const resultadoPg = await pgPool.query(query, [nombre, descripcion]);

        // Guardar en bitácora Mongo
        await LogMongo.create({
            accion: 'CREAR_CATEGORIA',
            usuario_id: 1,
            nombre_empleado: 'Carlos Admin',
            detalles: { categoria_creada: resultadoPg.rows[0].nombre }
        });

        res.status(201).json(resultadoPg.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { obtenerCategorias, crearCategoria };