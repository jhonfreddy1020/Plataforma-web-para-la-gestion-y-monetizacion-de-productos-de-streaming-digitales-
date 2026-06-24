const express = require("express");
const {
  loginUsuario,
  registrarUsuario,
  obtenerUsuario,
  actualizarUsuario,
  solicitarRecuperacion,
  validarTokenRecuperacion,
  restablecerPassword,
} = require("../controllers/usuario.controller");

const router = express.Router();

router.post("/registrar", registrarUsuario);

router.post("/recuperar", solicitarRecuperacion);

router.get("/validar/:token", validarTokenRecuperacion);

// 🔥 ESTA DEBE IR DESPUÉS DE LAS ESPECÍFICAS
router.get("/:id", obtenerUsuario);

router.put("/:id", actualizarUsuario);

router.post("/login", loginUsuario);

router.post("/restablecer", restablecerPassword);

module.exports = router;