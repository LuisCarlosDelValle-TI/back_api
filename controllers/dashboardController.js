const pgPool = require('../config/db');

// Importamos exactamente tu cliente de Redis
// (Asegúrate de que la ruta '../config/redis' coincida con donde guardaste tu archivo de Redis)
const redisClient = require('../config/redis');

const obtenerEstadisticas = async (req, res) => {
    try {
        const cacheKey = 'dashboard_stats';

        // 1. ⚡ INTENTAMOS LEER DESDE REDIS PRIMERO
        const cachedData = await redisClient.get(cacheKey);

        if (cachedData) {
            console.log("⚡ CARGADO DESDE REDIS (Vuelo directo, 0 estrés para Postgres)");
            return res.json(JSON.parse(cachedData));
        }

        // 2. 🐢 SI NO HAY CACHÉ, HACEMOS LAS 6 CONSULTAS EN POSTGRESQL
        console.log("🐢 CALCULANDO EN POSTGRESQL (Haciendo el trabajo pesado...)");

        // Consultas con las correcciones de zona horaria y agrupación
        const ventasHoyRes = await pgPool.query("SELECT COALESCE(SUM(total), 0) as total FROM ventas WHERE fecha >= NOW() - INTERVAL '24 hours'");
        const transaccionesRes = await pgPool.query("SELECT COUNT(*) as cantidad FROM ventas");
        const stockRes = await pgPool.query("SELECT COALESCE(SUM(stock), 0) as total_piezas FROM productos");
        const clientesRes = await pgPool.query("SELECT COUNT(*) as total FROM usuarios");

        const ventasDiasRes = await pgPool.query(`
            SELECT TO_CHAR(DATE(fecha), 'Day') as dia, SUM(total) as total 
            FROM ventas 
            WHERE fecha >= CURRENT_DATE - INTERVAL '7 days'
            GROUP BY DATE(fecha), TO_CHAR(DATE(fecha), 'Day')
            ORDER BY DATE(fecha) ASC
        `);

        const categoriasRes = await pgPool.query(`
            SELECT c.nombre, COUNT(p.id_producto) as total
            FROM productos p
            JOIN categorias c ON p.id_categoria = c.id_categoria
            GROUP BY c.nombre
        `);

        // Armamos el paquete de datos
        const dashboardData = {
            ventasHoy: parseFloat(ventasHoyRes.rows[0].total),
            transacciones: parseInt(transaccionesRes.rows[0].cantidad),
            stockTotal: parseInt(stockRes.rows[0].total_piezas),
            clientesNuevos: parseInt(clientesRes.rows[0].total),
            graficaVentas: ventasDiasRes.rows,
            graficaCategorias: categoriasRes.rows
        };

        // 3. 💾 GUARDAMOS LA COPIA EN REDIS (Va a expirar y borrarse en 60 segundos)
        await redisClient.setEx(cacheKey, 60, JSON.stringify(dashboardData));

        // Entregamos al Frontend
        res.json(dashboardData);

    } catch (error) {
        console.error("❌ Error en el Dashboard:", error);
        res.status(500).json({ error: error.message });
    }
};

module.exports = { obtenerEstadisticas };