const express = require("express");
const router = express.Router();
const { obtenerEstadisticas } = require("../controllers/dashboardController");

router.get("/", obtenerEstadisticas);

module.exports = router;