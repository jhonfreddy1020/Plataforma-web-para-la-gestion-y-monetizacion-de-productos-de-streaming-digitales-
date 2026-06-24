const db = require("../config/db");

const obtenerPagosPendientes = async (req, res) => {
  try {
    const resultado = await db.query(`
      SELECT
        p.idusuario,
        pg.idpago,
        pg.idpedido,
        pg.fechapago,
        pg.metodopago,
        pg.estadovalidacion,

        p.total,

        u.nombre,
        u.email

      FROM pago pg

      JOIN pedido p
        ON pg.idpedido = p.idpedido

      JOIN usuario u
        ON p.idusuario = u.idusuario

      ORDER BY pg.fechapago DESC
    `);

    res.json(resultado.rows);

  } catch(error) {

    console.error(error);

    res.status(500).json({
      mensaje: "Error obteniendo pagos"
    });

  }
};

const aprobarPago = async (req,res) => {

  try {

    const { idPago } = req.params;

    await db.query(`
      UPDATE pago
      SET estadovalidacion = 1
      WHERE idpago = $1
    `,[idPago]);

    res.json({
      mensaje: "Pago aprobado"
    });

  } catch(error){

    console.error(error);

    res.status(500).json({
      mensaje: "Error aprobando pago"
    });

  }

};

const rechazarPago = async (req,res) => {

  try {

    const { idPago } = req.params;

    await db.query(`
      UPDATE pago
      SET estadovalidacion = 2
      WHERE idpago = $1
    `,[idPago]);

    res.json({
      mensaje: "Pago rechazado"
    });

  } catch(error){

    console.error(error);

    res.status(500).json({
      mensaje: "Error rechazando pago"
    });

  }

};

module.exports = {
  obtenerPagosPendientes,
  aprobarPago,
  rechazarPago
};