const express = require("express");
const router = express.Router();
const db = require("../config/db");

router.post("/", async (req, res) => {
  const idUsuario = Number(req.body.idUsuario);

  if (!idUsuario) {
    return res.status(400).json({
      error: "idUsuario es obligatorio y debe ser numérico",
    });
  }

  try {
    console.log("Creando pedido para idUsuario:", idUsuario);

    const carritoRes = await db.query(
      `
      SELECT idcarrito
      FROM carrito
      WHERE idusuario = $1::int
        AND estado = 0
      ORDER BY idcarrito DESC
      LIMIT 1
      `,
      [idUsuario]
    );

    console.log("Carrito activo encontrado:", carritoRes.rows);

    if (carritoRes.rows.length === 0) {
      return res.status(400).json({
        error: "No hay carrito activo para este usuario",
      });
    }

    const idCarrito = carritoRes.rows[0].idcarrito;

    await db.query(
      `
      UPDATE carrito
      SET estado = 1
      WHERE idcarrito = $1
      `,
      [idCarrito]
    );

    const pedidoRes = await db.query(
  `
  SELECT
      idpedido AS "idPedido",
      idusuario AS "idUsuario",
      idcarrito AS "idCarrito",
      estado,
      total
  FROM pedido
  WHERE idcarrito = $1
  ORDER BY idpedido DESC
  LIMIT 1
  `,
  [idCarrito]
);

    console.log(
      "Pedido generado por trigger:",
      pedidoRes.rows[0]
    );

    return res.status(201).json(
      pedidoRes.rows[0]
    );
  } catch (error) {
    console.error("Error creando pedido:", error);

    return res.status(500).json({
      error: error.message,
    });
  }
});

router.get('/:idUsuario', async (req, res) => {
  const { idUsuario } = req.params;

  const query = `
    SELECT
      p.idpedido,
      p.estado,
      p.total,
      pg.fechapago,
      pg.metodopago,
      pg.comprobante,
      COALESCE(
        json_agg(
          json_build_object(
            'idproducto', pr.idproducto,
            'nombre', pr.nombre,
            'cantidad', ic.cantidad,
            'preciounitario', ic.preciounitario,
            'subtotal', ic.cantidad * ic.preciounitario
          )
        ) FILTER (WHERE ic.iditem IS NOT NULL),
        '[]'
      ) AS productos
    FROM pedido p
    LEFT JOIN pago pg ON pg.idpedido = p.idpedido
    LEFT JOIN itemcarrito ic ON ic.idcarrito = p.idcarrito
    LEFT JOIN producto pr ON pr.idproducto = ic.idproducto
    WHERE p.idusuario = $1
    GROUP BY p.idpedido, p.estado, p.total, pg.fechapago, pg.metodopago, pg.comprobante
    ORDER BY p.idpedido DESC;
  `;

  try {
    const result = await db.query(query, [idUsuario]);
    res.json(result.rows);
  } catch (error) {
    console.error('Error obteniendo pedidos:', error);
    res.status(500).json({ error: 'No se pudieron obtener los pedidos' });
  }
});

module.exports = router;