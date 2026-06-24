//Ruta obtención de productos

const express = require('express');
const router = express.Router();

const {
    obtenerProductos,
    crearProducto,
    actualizarProducto,
    desactivarProducto
} = require('../controllers/producto.controller');

router.get('/', obtenerProductos);
router.post('/', crearProducto);
router.put('/:id', actualizarProducto);
router.delete('/:id', desactivarProducto);

module.exports = router;