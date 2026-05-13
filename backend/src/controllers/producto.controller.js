const pool = require('../config/db');

const obtenerProductos = async (req, res) => {

    try {

        const resultado = await pool.query(`
            SELECT *
            FROM Producto
            WHERE disponible = TRUE
            ORDER BY idProducto
        `);

        res.json(resultado.rows);

    } catch (error) {

        console.error(error);
        res.status(500).json({
            mensaje: 'Error del servidor'
        });

    }

};

module.exports = {
    obtenerProductos
};
