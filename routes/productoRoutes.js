const express = require('express');
const router = express.Router();
const { obtenerProductos, crearProducto, actualizarPrecio, actualizarProducto, eliminarProducto } = require('../controllers/productoController');

router.get('/', obtenerProductos);
router.post('/', crearProducto);
router.put('/:id/precio', actualizarPrecio);
router.put('/:id', actualizarProducto);
router.delete('/:id', eliminarProducto);

module.exports = router;