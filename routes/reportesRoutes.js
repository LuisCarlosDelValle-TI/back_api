const express = require("express");
const router = express.Router();
const { obtenerHistorialVentas, obtenerDetalleVenta } = require("../controllers/reportesController");

router.get("/ventas", obtenerHistorialVentas);
router.get("/ventas/:id", obtenerDetalleVenta);

module.exports = router;