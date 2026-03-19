const express = require('express');
const cors = require('cors');
require('dotenv').config();
const app = express();
app.use(cors());
app.use(express.json());

// Configuraciones de Base de Datos
const conectarMongo = require('./config/mongo');
const redisClient = require('./config/redis');
const pool = require('./config/db'); // Cambié Pool a pool (minúscula) por buena práctica

// Rutas
const rolRoutes = require('./routes/rolRoutes');
const usuarioRoutes = require('./routes/usuarioRoutes');
const categoriaRoutes = require('./routes/categoriaRoutes');
const productoRoutes = require('./routes/productoRoutes');
const proveedorRoutes = require('./routes/proveedorRoutes');
const ventaRoutes = require('./routes/ventaRoutes');
const comprasRoutes = require('./routes/compraRoutes');



// Ejecutar conexión a MongoDB
conectarMongo();

// Middlewares de Rutas
app.use('/api/rol', rolRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/categorias', categoriaRoutes);
app.use('/api/productos', productoRoutes);
app.use('/api/proveedores', proveedorRoutes);
app.use('/api/ventas', ventaRoutes);
app.use('/api/compras', comprasRoutes);

// Iniciar el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor de Joyería corriendo en http://localhost:${PORT}`);
});