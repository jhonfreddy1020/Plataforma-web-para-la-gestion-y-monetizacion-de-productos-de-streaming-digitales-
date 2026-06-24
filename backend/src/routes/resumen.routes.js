const express = require('express');
const router = express.Router();

const {
    obtenerResumenProductos,
    obtenerResumenClientes
} = require('../controllers/resumen.controller');

router.get('/productos', obtenerResumenProductos);
router.get('/clientes', obtenerResumenClientes);

module.exports = router;