//

const express = require('express');
const cors = require('cors');

const productosRoutes = require('./routes/producto.routes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/productos', productosRoutes);

module.exports = app;