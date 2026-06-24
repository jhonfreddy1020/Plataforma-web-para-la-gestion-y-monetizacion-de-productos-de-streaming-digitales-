const cron = require("node-cron");
const pool = require("../src/config/db");

// corre cada 10 minutos
cron.schedule("*/10 * * * *", async () => {
  try {
    await pool.query(`
      DELETE FROM tokenrecuperacion
      WHERE expiracion < NOW()
         OR usado = TRUE
    `);

    console.log("🧹 Limpieza de tokens ejecutada");
  } catch (error) {
    console.error("Error en cron de tokens:", error);
  }
});