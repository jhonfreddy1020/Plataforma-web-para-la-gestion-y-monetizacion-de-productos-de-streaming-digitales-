const express = require("express");
const router = express.Router();

const pool = require("../config/db");

router.post("/crear", async (req, res) => {

  try {

    const { idUsuario } = req.body;

    // BUSCAR CARRITO ACTIVO
    const carrito = await pool.query(`
      SELECT idCarrito
      FROM Carrito
      WHERE idUsuario = $1
      AND estado = 0
    `, [idUsuario]);

    if (carrito.rows.length === 0) {

      return res.status(404).json({
        error: "No hay carrito activo"
      });
    }

    const idCarrito = carrito.rows[0].idcarrito;

    // TOTAL
    const totalQuery = await pool.query(`
      SELECT SUM(cantidad * precioUnitario) AS total
      FROM ItemCarrito
      WHERE idCarrito = $1
    `, [idCarrito]);

    const total = totalQuery.rows[0].total || 0;

    // CREAR PEDIDO
    const pedido = await pool.query(`
      INSERT INTO Pedido(
        idUsuario,
        idCarrito,
        total
      )
      VALUES($1,$2,$3)
      RETURNING idPedido
    `, [idUsuario, idCarrito, total]);

    // CONFIRMAR CARRITO
    await pool.query(`
      UPDATE Carrito
      SET estado = 1
      WHERE idCarrito = $1
    `, [idCarrito]);

    res.json({
      ok: true,
      idPedido: pedido.rows[0].idpedido
    });

  } catch(error) {

    console.error(error);

    res.status(500).json({
      error: "Error creando pedido"
    });
  }
});

module.exports = router;