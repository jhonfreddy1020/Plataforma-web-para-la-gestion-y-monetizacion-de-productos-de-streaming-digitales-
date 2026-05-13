//Ruta obtención de productos

const express = require('express');
const router = express.Router();

const {
    obtenerProductos
} = require('../controllers/producto.controller');

router.get('/', obtenerProductos);

module.exports = router;