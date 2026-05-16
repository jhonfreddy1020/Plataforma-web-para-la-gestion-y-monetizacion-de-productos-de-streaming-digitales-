const express = require("express");
const router = express.Router();

const pool = require("../config/db");


// OBTENER CARRITO ACTIVO
router.get("/:idUsuario", async (req, res) => {
  try {
    const { idUsuario } = req.params;

    const carrito = await pool.query(`
      SELECT idCarrito
      FROM Carrito
      WHERE idUsuario = $1
      AND estado = 0
    `, [idUsuario]);

    if (carrito.rows.length === 0) {
      return res.json([]);
    }

    const idCarrito = carrito.rows[0].idcarrito;

    const items = await pool.query(`
      SELECT
        ic.idItem,
        ic.idProducto,
        p.nombre,
        p.tipo,
        ic.cantidad,
        ic.precioUnitario,
        ic.cantidad * ic.precioUnitario AS subtotal
      FROM ItemCarrito ic
      JOIN Producto p
      ON p.idProducto = ic.idProducto
      WHERE ic.idCarrito = $1
      ORDER BY ic.idItem ASC
    `, [idCarrito]);

    res.json(items.rows);

  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Error obteniendo carrito"
    });
  }
});

// AGREGAR PRODUCTO
router.post("/agregar", async (req, res) => {

  try {

    const { idUsuario, idProducto } = req.body;

    // BUSCAR CARRITO ACTIVO
    let carrito = await pool.query(`
      SELECT idCarrito
      FROM Carrito
      WHERE idUsuario = $1
      AND estado = 0
    `, [idUsuario]);

    let idCarrito;

    // SI NO EXISTE → CREAR
    if (carrito.rows.length === 0) {

      const nuevo = await pool.query(`
        INSERT INTO Carrito(idUsuario)
        VALUES($1)
        RETURNING idCarrito
      `, [idUsuario]);

      idCarrito = nuevo.rows[0].idcarrito;

    } else {

      idCarrito = carrito.rows[0].idcarrito;
    }

    // VERIFICAR SI YA EXISTE ITEM
    const item = await pool.query(`
      SELECT *
      FROM ItemCarrito
      WHERE idCarrito = $1
      AND idProducto = $2
    `, [idCarrito, idProducto]);

    // SI EXISTE → SUMAR
    if (item.rows.length > 0) {

      await pool.query(`
        UPDATE ItemCarrito
        SET cantidad = cantidad + 1
        WHERE idCarrito = $1
        AND idProducto = $2
      `, [idCarrito, idProducto]);

    } else {

      // CREAR ITEM
      await pool.query(`
        INSERT INTO ItemCarrito(
          idCarrito,
          idProducto,
          cantidad
        )
        VALUES($1,$2,1)
      `, [idCarrito, idProducto]);
    }

    res.json({
      ok: true
    });

  } catch(error) {

    console.error(error);

    res.status(500).json({
      error: "Error agregando producto"
    });
  }
});

// RESTAR PRODUCTO
router.post("/restar", async (req, res) => {

  try {

    const { idUsuario, idProducto } = req.body;

    const carrito = await pool.query(`
      SELECT idCarrito
      FROM Carrito
      WHERE idUsuario = $1
      AND estado = 0
    `, [idUsuario]);

    if (carrito.rows.length === 0) {
      return res.json({ ok: true });
    }

    const idCarrito = carrito.rows[0].idcarrito;

    const item = await pool.query(`
      SELECT cantidad
      FROM ItemCarrito
      WHERE idCarrito = $1
      AND idProducto = $2
    `, [idCarrito, idProducto]);

    if (item.rows.length === 0) {
      return res.json({ ok: true });
    }

    const cantidad = item.rows[0].cantidad;

    // SI QUEDA 0 → BORRAR
    if (cantidad <= 1) {

      await pool.query(`
        DELETE FROM ItemCarrito
        WHERE idCarrito = $1
        AND idProducto = $2
      `, [idCarrito, idProducto]);

    } else {

      await pool.query(`
        UPDATE ItemCarrito
        SET cantidad = cantidad - 1
        WHERE idCarrito = $1
        AND idProducto = $2
      `, [idCarrito, idProducto]);
    }

    res.json({
      ok: true
    });

  } catch(error) {

    console.error(error);

    res.status(500).json({
      error: "Error restando producto"
    });
  }
});

// ELIMINAR PRODUCTO COMPLETAMENTE
router.delete("/eliminar", async (req, res) => {

  try {

    const { idUsuario, idProducto } = req.body;

    // BUSCAR CARRITO ACTIVO
    const carrito = await pool.query(`
      SELECT idCarrito
      FROM Carrito
      WHERE idUsuario = $1
      AND estado = 0
    `, [idUsuario]);

    if (carrito.rows.length === 0) {
      return res.json({ ok: true });
    }

    const idCarrito = carrito.rows[0].idcarrito;

    // BORRAR ITEM
    await pool.query(`
      DELETE FROM ItemCarrito
      WHERE idCarrito = $1
      AND idProducto = $2
    `, [idCarrito, idProducto]);

    res.json({
      ok: true
    });

  } catch(error) {

    console.error(error);

    res.status(500).json({
      error: "Error eliminando producto"
    });
  }
});

// VACIAR CARRITO
router.delete("/vaciar", async (req, res) => {

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
      return res.json({ ok: true });
    }

    const idCarrito = carrito.rows[0].idcarrito;

    // ELIMINAR TODOS LOS ITEMS
    await pool.query(`
      DELETE FROM ItemCarrito
      WHERE idCarrito = $1
    `, [idCarrito]);

    res.json({
      ok: true
    });

  } catch(error) {

    console.error(error);

    res.status(500).json({
      error: "Error vaciando carrito"
    });
  }
});

// CONFIRMAR COMPRA
router.put("/confirmar/:idUsuario", async (req, res) => {

  try {

    const { idUsuario } = req.params;

    const carrito = await pool.query(`
      SELECT idCarrito
      FROM Carrito
      WHERE idUsuario = $1
      AND estado = 0
    `, [idUsuario]);

    if (carrito.rows.length === 0) {
      return res.status(404).json({
        error: "No hay carrito"
      });
    }

    const idCarrito = carrito.rows[0].idcarrito;

    // ESTO DISPARA EL TRIGGER
    await pool.query(`
      UPDATE Carrito
      SET estado = 1
      WHERE idCarrito = $1
    `, [idCarrito]);

    res.json({
      ok: true
    });

  } catch(error) {

    console.error(error);

    res.status(500).json({
      error: "Error confirmando compra"
    });
  }
});


module.exports = router;