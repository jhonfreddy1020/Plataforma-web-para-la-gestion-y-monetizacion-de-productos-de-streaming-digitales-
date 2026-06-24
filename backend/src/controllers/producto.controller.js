const pool = require('../config/db');

const obtenerProductos = async (req, res) => {

    try {

        const resultado = await pool.query(`
            SELECT *
            FROM Producto
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

const crearProducto = async (req, res) => {

    try {

        const {
            nombre,
            preciocompra,
            precioventa,
            tipo
        } = req.body;

        const resultado = await pool.query(`
            INSERT INTO producto (
                nombre,
                preciocompra,
                precioventa,
                tipo,
                disponible
            )
            VALUES ($1, $2, $3, $4, true)
            RETURNING *
        `, [
            nombre,
            preciocompra,
            precioventa,
            tipo
        ]);

        res.json(resultado.rows[0]);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            mensaje: 'Error al crear producto'
        });

    }
};

const actualizarProducto = async (req, res) => {

    try {

        const { id } = req.params;

        const {
            nombre,
            preciocompra,
            precioventa,
            tipo,
            disponible
        } = req.body;

        const resultado = await pool.query(`
            UPDATE producto
            SET
                nombre = $1,
                preciocompra = $2,
                precioventa = $3,
                tipo = $4,
                disponible = $5
            WHERE idproducto = $6
            RETURNING *
        `, [
            nombre,
            preciocompra,
            precioventa,
            tipo,
            disponible,
            id
        ]);

        if (resultado.rows.length === 0) {
            return res.status(404).json({
                mensaje: 'Producto no encontrado'
            });
        }

        res.json(resultado.rows[0]);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            mensaje: 'Error al actualizar producto'
        });

    }
};

const desactivarProducto = async (req, res) => {

    try {

        const { id } = req.params;

        const resultado = await pool.query(`
            UPDATE producto
            SET disponible = false
            WHERE idproducto = $1
            RETURNING *
        `, [id]);

        if (resultado.rows.length === 0) {
            return res.status(404).json({
                mensaje: 'Producto no encontrado'
            });
        }

        res.json({
            mensaje: 'Producto desactivado correctamente',
            producto: resultado.rows[0]
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            mensaje: 'Error al desactivar producto'
        });

    }
};

module.exports = {
    obtenerProductos,
    crearProducto,
    actualizarProducto,
    desactivarProducto
};
