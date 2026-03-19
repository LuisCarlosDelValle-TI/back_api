const express = require('express');
const router = express.Router();
const { obtenerUsuarios, crearUsuario, eliminarUsuario, actualizarUsuario, login } = require('../controllers/usuarioController');

router.get('/', obtenerUsuarios);
router.post('/', crearUsuario);
router.delete('/:id', eliminarUsuario);
router.put('/:id', actualizarUsuario);
router.post('/login', login);

module.exports = router;