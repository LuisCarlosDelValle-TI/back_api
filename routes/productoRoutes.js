const express = require('express');
const router = express.Router();
const { obtenerProductos, crearProducto, actualizarPrecio, eliminarProducto } = require('../controllers/productoController');

router.get('/', obtenerProductos);
router.post('/', crearProducto);
router.put('/:id/precio', actualizarPrecio);
router.delete('/:id', eliminarProducto);

module.exports = router;