const express = require('express');
const router = express.Router();
const { obtenerVentas, crearVenta } = require('../controllers/ventaController');

router.get('/:id', obtenerVentas);
router.post('/', crearVenta);


module.exports = router;