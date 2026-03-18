const redis = require('redis');
require('dotenv').config();

// Creamos el cliente usando la URL de Upstash del .env
const redisClient = redis.createClient({
    url: process.env.REDIS_URL
});

redisClient.on('error', (err) => console.log('❌ Error en Redis Upstash:', err));

// Esta es la parte que te dará el mensaje verde:
redisClient.connect().then(() => {
    console.log('🔵 Redis Upstash conectado (Caché en la nube)');
});

module.exports = redisClient;