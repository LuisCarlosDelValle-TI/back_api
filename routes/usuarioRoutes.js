const express = require('express');
const router = express.Router();
const { obtenerUsuarios, crearUsuario, eliminarUsuario } = require('../controllers/usuarioController');

router.get('/', obtenerUsuarios);
router.post('/', crearUsuario);
router.delete('/:id', eliminarUsuario);

module.exports = router;