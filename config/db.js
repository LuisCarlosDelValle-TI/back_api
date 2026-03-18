require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false // <--- ESTO ES LO QUE HACE QUE FUNCIONE EN LA NUBE
    }
});

// Prueba de fuego: esto te dirá en la consola si funcionó
pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('❌ Error conectando a Supabase:', err.message);
    } else {
        console.log('✅ ¡API conectada a la Joyería en la nube con éxito!');
    }
});
module.exports = pool;