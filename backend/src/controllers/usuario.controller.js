//LOGIN Y REGISTRO DE USUARIOS
const crypto = require("crypto");
const {
  enviarCorreoRecuperacion,
} = require("../services/email.service");
const pool = require("../config/db");
const bcrypt = require("bcrypt");

const loginUsuario = async (req, res) => {
   /*console.log("ENTRO AL CONTROLADOR LOGIN");
   console.log("BODY COMPLETO:");
console.log(req.body);*/
  try {
    
    const { email, password } = req.body;

    /*console.log("LOGIN RECIBIDO:");
    console.log("Correo:", email);
    console.log("Password:", password);*/

    const resultado = await pool.query(
      `
  SELECT *
  FROM Usuario
  WHERE LOWER(email) = LOWER($1)
  `,
  [email.trim()]
    );

    //console.log("Resultado SQL:", resultado.rows);

    if (resultado.rows.length === 0) {
      return res.status(401).json({
        mensaje: "Usuario no encontrado",
      });
    }

    const usuario = resultado.rows[0];

    let passwordValida = false;

// 🧠 Detecta si es bcrypt o texto plano
if (usuario.clavehash.startsWith("$2b$")) {
  // 🔒 caso seguro (bcrypt)
  passwordValida = await bcrypt.compare(password, usuario.clavehash);
} else {
  // ⚠️ caso antiguo (texto plano)
  passwordValida = (usuario.clavehash === password);

  // 🔥 MIGRACIÓN AUTOMÁTICA (opcional pero recomendado)
  if (passwordValida) {
    const newHash = await bcrypt.hash(password, 10);

    await pool.query(
      `UPDATE usuario SET clavehash = $1 WHERE idusuario = $2`,
      [newHash, usuario.idusuario]
    );
  }
}

if (!passwordValida) {
  return res.status(401).json({
    mensaje: "Contraseña incorrecta",
  });
}

    res.json({
      id: usuario.idusuario,
      nombre: usuario.nombre,
      email: usuario.email,
      rol: usuario.rol,
    });
  } catch (error) {
    console.error("Error en login:", error);
    res.status(500).json({
      mensaje: "Error interno del servidor",
    });
  }
};

const registrarUsuario = async (req, res) => {
  try {
    const { nombre, email, password } = req.body;

    // Validaciones básicas
    if (!nombre || !email || !password) {
      return res.status(400).json({ mensaje: "Datos incompletos" });
    }

    // Verificar si el email ya existe
    const usuarioExistente = await pool.query(
      "SELECT * FROM Usuario WHERE email=$1",
      [email]
    );

    if (usuarioExistente.rows.length > 0) {
      return res.status(400).json({ mensaje: "El email ya está registrado" });
    }

    // 🔒 HASH de contraseña (NUEVO)
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insertar usuario en la tabla
    const resultado = await pool.query(
      `
      INSERT INTO Usuario
      (nombre, email, claveHash, rol)
      VALUES ($1, $2, $3, $4)
      RETURNING idUsuario, nombre, email, rol
      `,
      [
        nombre,
        email,
        hashedPassword, // 👈 IMPORTANTE: ya NO es password plano
        1
      ]
    );

    res.status(201).json({
      mensaje: "Usuario registrado correctamente",
      usuario: resultado.rows[0],
    });

  } catch (error) {
    console.error("Error registrando usuario:", error);
    res.status(500).json({ mensaje: "Error interno del servidor" });
  }
};

const obtenerUsuario = async (req, res) => {
  try {
    const { id } = req.params;

    const resultado = await pool.query(
      `
      SELECT
        idusuario AS id,
        nombre,
        email AS correo,
        celular
      FROM usuario
      WHERE idusuario = $1
      `,
      [id]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({
        mensaje: "Usuario no encontrado",
      });
    }

    res.json(resultado.rows[0]);
  } catch (error) {
    console.error("Error obteniendo usuario:", error);

    res.status(500).json({
      mensaje: "Error interno del servidor",
    });
  }
};

const actualizarUsuario = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      nombre,
      correo,
      celular,
    } = req.body;

    const resultado = await pool.query(
      `
      UPDATE usuario
      SET
        nombre = $1,
        email = $2,
        celular = $3
      WHERE idusuario = $4
      RETURNING
        idusuario AS id,
        nombre,
        email AS correo,
        celular
      `,
      [
        nombre,
        correo,
        celular || null,
        id,
      ]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({
        mensaje: "Usuario no encontrado",
      });
    }

    res.json(resultado.rows[0]);
  } catch (error) {
    console.error("Error actualizando usuario:", error);

    res.status(500).json({
      mensaje: "Error interno del servidor",
    });
  }
};

const solicitarRecuperacion = async (req, res) => {
  try {
    const { email } = req.body;

    const usuario = await pool.query(
      `
      SELECT *
      FROM usuario
      WHERE LOWER(email) = LOWER($1)
      `,
      [email]
    );

    if (usuario.rows.length === 0) {
      return res.json({
        mensaje:
          "Si existe una cuenta asociada, se enviará un correo."
      });
    }

    const user = usuario.rows[0];

    const token = crypto.randomBytes(32).toString("hex");
    console.log("TOKEN GENERADO:");
console.log(token);

    const expiracion = new Date();

    expiracion.setHours(expiracion.getHours() + 1);

    const resultadoToken = await pool.query(
`
INSERT INTO tokenrecuperacion
(
 idusuario,
 token,
 expiracion
)
VALUES
(
 $1,
 $2,
 $3
)
RETURNING *
`,
[
 user.idusuario,
 token,
 expiracion
]
);

console.log("TOKEN GUARDADO:");
console.log(resultadoToken.rows[0]);

    const enlace =
      `http://localhost:5173/restablecer/${token}`;

    await enviarCorreoRecuperacion(
  user.email,
  user.nombre,
  token
);

    res.json({
      mensaje:
        "Si existe una cuenta asociada, se enviará un correo."
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      mensaje: "Error interno del servidor",
    });

  }
};

const validarTokenRecuperacion = async (req, res) => {
  try {

    const { token } = req.params;

    const resultado = await pool.query(
      `
      SELECT *
      FROM tokenrecuperacion
      WHERE token = $1
      AND usado = FALSE
      AND expiracion > NOW()
      `,
      [token]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({
        valido: false,
        mensaje: "Token inválido o expirado",
      });
    }

    res.json({
      valido: true,
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      mensaje: "Error interno",
    });

  }
};

const restablecerPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    // 1. Validar token
    const resultado = await pool.query(
      `
      SELECT *
      FROM tokenrecuperacion
      WHERE token = $1
        AND usado = FALSE
        AND expiracion > NOW()
      `,
      [token]
    );

    if (resultado.rows.length === 0) {
      return res.status(400).json({
        mensaje: "Token inválido o expirado",
      });
    }

    const tokenData = resultado.rows[0];

    // 2. Hash de nueva contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Actualizar contraseña del usuario
    await pool.query(
      `
      UPDATE usuario
      SET clavehash = $1
      WHERE idusuario = $2
      `,
      [hashedPassword, tokenData.idusuario]
    );

    // 4. Marcar token como usado (evita reutilización)
    await pool.query(
      `
      UPDATE tokenrecuperacion
      SET usado = TRUE
      WHERE token = $1
      `,
      [token]
    );

    console.log("TOKEN RECIBIDO:", token);
console.log("PASSWORD RECIBIDO:", password);

    res.json({
      mensaje: "Contraseña actualizada correctamente",
    });

  } catch (error) {
    console.error("Error en reset password:", error);
    res.status(500).json({
      mensaje: "Error interno del servidor",
    });
  }
};

module.exports = {
  loginUsuario,
  registrarUsuario,
  obtenerUsuario,
  actualizarUsuario,
  solicitarRecuperacion,
  validarTokenRecuperacion,
  restablecerPassword,
};

