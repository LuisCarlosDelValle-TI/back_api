const express = require('express');
const router = express.Router();
const { obtenerVentas, crearVenta, obtenerDetalleVenta } = require('../controllers/ventaController');

router.get('/', obtenerVentas);
router.get('/:id', obtenerDetalleVenta || obtenerVentas);
router.post('/', crearVenta);

module.exports = router;