const express = require('express');
const cors = require('cors');

const productosRoutes = require('./routes/producto.routes');
const carritoRoutes = require('./routes/carrito.routes');
const pedidoRoutes = require("./routes/pedido.routes");
const pagoRoutes = require("./routes/pago.routes");
const usuarioRoutes = require("./routes/usuario.routes");
const resumenRoutes = require('./routes/resumen.routes');

require("../cron/tokenCleanup");

const app = express();

app.use(cors());
app.use(express.json());

app.use('/productos', productosRoutes);
app.use('/carrito', carritoRoutes);
app.use("/api/pedidos", pedidoRoutes);
app.use("/api/pagos", pagoRoutes);
app.use("/api/usuarios", usuarioRoutes);
app.use('/resumen', resumenRoutes);
module.exports = app;