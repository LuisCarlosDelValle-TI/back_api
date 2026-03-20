const express = require("express");
const router = express.Router();
const { obtenerProveedores, crearProveedor, eliminarProveedor, actualizarProveedor} = require("../controllers/proveedorController");

router.get("/", obtenerProveedores);
router.post("/", crearProveedor);
router.put("/:id", actualizarProveedor);
router.delete("/:id", eliminarProveedor);

module.exports = router;