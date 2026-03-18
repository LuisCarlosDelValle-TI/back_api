const express = require('express');
const router = express.Router();
const { obtenerCategorias, crearCategoria } = require('../controllers/categoriaController');

// Ya no necesitas poner "/api/categorias" aquí, lo haremos en el index.js
router.get('/', obtenerCategorias);
router.post('/', crearCategoria);

module.exports = router;