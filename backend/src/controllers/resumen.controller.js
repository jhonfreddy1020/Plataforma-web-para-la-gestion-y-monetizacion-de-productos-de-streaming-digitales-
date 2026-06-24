const pool = require('../config/db');

const obtenerResumenProductos = async (req, res) => {

    try {

        const resultado = await pool.query(`
            SELECT
                p.idproducto,
                p.nombre,
                COALESCE(SUM(ic.cantidad), 0) AS unidadesvendidas,
                COALESCE(
                    SUM(
                        ic.cantidad *
                        (p.precioventa - p.preciocompra)
                    ),
                0) AS ganancia
            FROM producto p
            LEFT JOIN itemcarrito ic
                ON p.idproducto = ic.idproducto
            LEFT JOIN carrito c
                ON ic.idcarrito = c.idcarrito
            LEFT JOIN pedido pe
                ON c.idcarrito = pe.idcarrito
            LEFT JOIN pago pa
                ON pe.idpedido = pa.idpedido
            WHERE pa.estadovalidacion = 1
            GROUP BY p.idproducto, p.nombre
            ORDER BY ganancia DESC
        `);

        const datos = resultado.rows.map(item => ({
    idproducto: item.idproducto,
    nombre: item.nombre,
    unidadesvendidas: Number(item.unidadesvendidas),
    ganancia: Number(item.ganancia)
}));

res.json(datos);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            mensaje: 'Error del servidor'
        });

    }

};

const obtenerResumenClientes = async (req, res) => {

    try {

        const resultado = await pool.query(`
            SELECT
                u.idusuario,
                u.nombre,

                COALESCE(uc.unidadescompradas, 0) AS unidadescompradas,

                COALESCE(pc.pedidos, 0) AS pedidos,

                COALESCE(pc.totalgastado, 0) AS totalgastado

            FROM usuario u

            LEFT JOIN (

                SELECT
                    pe.idusuario,
                    COUNT(*) AS pedidos,
                    SUM(pe.total) AS totalgastado

                FROM pedido pe

                INNER JOIN pago pa
                    ON pe.idpedido = pa.idpedido

                WHERE pa.estadovalidacion = 1

                GROUP BY pe.idusuario

            ) pc
                ON u.idusuario = pc.idusuario

            LEFT JOIN (

                SELECT
                    pe.idusuario,
                    SUM(ic.cantidad) AS unidadescompradas

                FROM pedido pe

                INNER JOIN pago pa
                    ON pe.idpedido = pa.idpedido

                INNER JOIN carrito c
                    ON pe.idcarrito = c.idcarrito

                INNER JOIN itemcarrito ic
                    ON c.idcarrito = ic.idcarrito

                WHERE pa.estadovalidacion = 1

                GROUP BY pe.idusuario

            ) uc
                ON u.idusuario = uc.idusuario

            ORDER BY totalgastado DESC
        `);

        const datos = resultado.rows.map(item => ({
            idusuario: item.idusuario,
            nombre: item.nombre,
            unidadescompradas: Number(item.unidadescompradas),
            pedidos: Number(item.pedidos),
            totalgastado: Number(item.totalgastado)
        }));

        res.json(datos);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            mensaje: 'Error del servidor'
        });

    }

};

module.exports = {
    obtenerResumenProductos,
    obtenerResumenClientes
};