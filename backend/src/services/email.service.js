const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",

  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function enviarCorreoPago(
  pedidoId,
  metodo,
  datosPedido,
  productos
){
  try {
    const productosHTML = productos
  .map(
    (producto) => `
      <tr>
        <td>${producto.nombre}</td>
        <td>${producto.cantidad}</td>
        <td>$${producto.preciounitario}</td>
        <td>$${producto.subtotal}</td>
      </tr>
    `
  )
  .join(""); 
    await transporter.sendMail({
      from: process.env.EMAIL_USER,

      to: process.env.EMAIL_USER,

      subject: `Notificación Digital Juanex`,

      html: `
  <h2>🛒 Nuevo pago pendiente</h2>

  <hr>

  <p><b>Pedido:</b> #${pedidoId}</p>

  <p><b>Cliente:</b> ${datosPedido.nombre}</p>

  <p><b>Email:</b> ${datosPedido.email}</p>

  <p><b>Método:</b> ${metodo}</p>

  <hr>

  <h3>Productos solicitados</h3>

  <table border="1" cellpadding="8" cellspacing="0">
    <thead>
      <tr>
        <th>Producto</th>
        <th>Cantidad</th>
        <th>Precio</th>
        <th>Subtotal</th>
      </tr>
    </thead>

    <tbody>
      ${productosHTML}
    </tbody>
  </table>

  <h2>
    Total: $${datosPedido.total}
  </h2>

  <hr>

  <a
 href="http://localhost:5173/admin/pagos?pedido=${pedidoId}"
 style="
   background:#16a34a;
   color:white;
   padding:12px 20px;
   text-decoration:none;
   border-radius:8px;
 "
>
 Revisar Pago
</a>
`,
    });

    console.log("Correo enviado");
  } catch (error) {
    console.error("Error enviando correo:", error);
  }
}

async function enviarCorreoRecuperacion(
  email,
  nombre,
  token
) {
  try {

    const enlace =
      `http://localhost:5173/restablecer/${token}`;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,

      to: email,

      subject: "Recuperación de contraseña - Digital Juanex",

      html: `
      <div
        style="
          font-family:Arial;
          max-width:600px;
          margin:auto;
        "
      >
        <h1 style="color:#dc2626;">
          Digital Juanex
        </h1>

        <p>
          Hola <b>${nombre}</b>,
        </p>

        <p>
          Hemos recibido una solicitud para restablecer tu contraseña.
        </p>

        <p>
          Haz clic en el siguiente botón:
        </p>

        <a
          href="${enlace}"
          style="
            display:inline-block;
            background:#dc2626;
            color:white;
            padding:12px 24px;
            border-radius:8px;
            text-decoration:none;
            font-weight:bold;
          "
        >
          Restablecer contraseña
        </a>

        <p style="margin-top:20px;">
          Este enlace expirará en 1 hora.
        </p>

        <p>
          Si no solicitaste este cambio,
          puedes ignorar este mensaje.
        </p>

        <hr>

        <small>
          Digital Juanex
        </small>
      </div>
      `,
    });

    console.log(
      "Correo de recuperación enviado"
    );

  } catch (error) {

    console.error(
      "Error enviando recuperación:",
      error
    );

  }
}

module.exports = {
  enviarCorreoPago,
  transporter,
  enviarCorreoRecuperacion,
};