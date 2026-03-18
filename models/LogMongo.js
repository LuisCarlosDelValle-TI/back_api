const mongoose = require('mongoose');

const LogSchema = new mongoose.Schema({
    accion: String,
    usuario_id: Number,
    nombre_empleado: String,
    fecha: { type: Date, default: Date.now },
    detalles: mongoose.Schema.Types.Mixed
}, { collection: 'bitacora_auditoria' });

module.exports = mongoose.model('Log', LogSchema);