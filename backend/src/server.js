//Crear servidor Express

const app = require('./app');

app.listen(3000, () => {
    console.log('Servidor funcionando en puerto 3000');
});