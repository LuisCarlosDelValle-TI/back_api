const express = require("express");
const router = express.Router();
const { obtenerProveedores, crearProveedor, eliminarProveedor } = require("../controllers/proveedorController");

router.get("/", obtenerProveedores);
router.post("/", crearProveedor);
router.delete("/:id", eliminarProveedor);

module.exports = router;