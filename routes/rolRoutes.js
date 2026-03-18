const express = require("express/lib/express");
const router = express.Router();
const { obtenerRoles, crearRol, eliminarRol } = require("../controllers/rolController");

router.get("/", obtenerRoles);
router.post("/", crearRol);
router.delete("/:id_rol", eliminarRol);

module.exports = router;