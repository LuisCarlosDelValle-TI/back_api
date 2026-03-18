const mongoose = require('mongoose');
require('dotenv').config();

const conectarMongo = async () => {
    try {
        // Aquí conectamos usando la variable de la nube
        await mongoose.connect(process.env.MONGO_URI);
        console.log('🟢 MongoDB Atlas conectado exitosamente');
    } catch (error) {
        console.log('❌ Error conectando a MongoDB:', error);
        process.exit(1); // Detiene el proceso si hay error
    }
};

module.exports = conectarMongo;