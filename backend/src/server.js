//Crear servidor Express
require("dotenv").config();
const app = require('./app');

app.listen(3000, () => {
    console.log('Servidor funcionando en puerto 3000');
});