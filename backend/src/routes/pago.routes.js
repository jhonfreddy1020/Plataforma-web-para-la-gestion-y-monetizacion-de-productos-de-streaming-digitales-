const express = require("express");
const router = express.Router();
const db = require("../config/db");
const { enviarCorreoPago } = require("../services/email.service");
const {
  obtenerPagosPendientes,
  aprobarPago,
  rechazarPago
} = require("../controllers/pago.controller");

router.get("/pendientes", obtenerPagosPendientes);
router.put("/aprobar/:idPago", aprobarPago);
router.put("/rechazar/:idPago", rechazarPago);

router.post("/notificar", async (req, res) => {
  console.log("ENTRÓ A NOTIFICAR");
  console.log("BODY:", req.body);

  const { pedidoId, metodo } = req.body;
   if (!pedidoId || !metodo) {
    return res.status(400).json({
      error: "Datos incompletos",
    });
  }

  try {
    
  // Verificar si ya existe un pago para este pedido
const pagoExistente = await db.query(
  `
  SELECT idpago, estadovalidacion
  FROM pago
  WHERE idpedido = $1
  `,
  [pedidoId]
);

if (pagoExistente.rows.length > 0) {
  return res.status(200).json({
    mensaje:
      "Ya notificaste este pago. Espera validación del administrador.",
  });
}
    console.log("PASO 1");

    await db.query(
      `
      INSERT INTO Pago
      (
        idPedido,
        metodoPago,
        estadoValidacion
      )
      VALUES
      (
        $1,
        $2,
        0
      )
      `,
      [
        pedidoId,
        metodo === "efectivo" ? 0 : 1,
      ]
    );

    const pedidoInfo = await db.query(
  `
  SELECT
      p.idpedido,
      p.total,
      u.nombre,
      u.email
  FROM pedido p
  JOIN usuario u
      ON p.idusuario = u.idusuario
  WHERE p.idpedido = $1
  `,
  [pedidoId]
); 

const productosPedido = await db.query(
  `
  SELECT
      pr.nombre,
      ic.cantidad,
      ic.preciounitario,
      (ic.cantidad * ic.preciounitario) AS subtotal
  FROM pedido p
  JOIN itemcarrito ic
      ON p.idcarrito = ic.idcarrito
  JOIN producto pr
      ON ic.idproducto = pr.idproducto
  WHERE p.idpedido = $1
  `,
  [pedidoId]
);

    console.log("PASO 2");

    await enviarCorreoPago(
  pedidoId,
  metodo,
  pedidoInfo.rows[0],
  productosPedido.rows
);

    console.log("PASO 3");

    return res.json({
      mensaje:
        "Pago notificado correctamente",
    });
  } catch (error) {
    console.error("ERROR COMPLETO:");
    console.error(error);

    return res.status(500).json({
      error: error.message,
    });
  }
});

module.exports = router;