//

const express = require('express');
const cors = require('cors');

const productosRoutes = require('./routes/producto.routes');
const carritoRoutes = require('./routes/carrito.routes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/productos', productosRoutes);
app.use('/carrito', carritoRoutes);

module.exports = app;