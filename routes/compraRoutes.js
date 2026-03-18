const express = require('express');
const router = express.Router();
const { obtenerCompras, registrarCompra } = require('../controllers/compraController');

router.get('/', obtenerCompras);
router.post('/', registrarCompra);

module.exports = router;