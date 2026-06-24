import { useState } from "react";
import { useParams } from "react-router-dom";

function Pago() {
  const { pedidoId } = useParams();

  const [metodoPago, setMetodoPago] = useState("");
  const [cuenta, setCuenta] = useState("");

  const handleNotificarPago = async () => {
    try {
      const res = await fetch("http://localhost:3000/api/pagos/notificar", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          pedidoId,
          metodo: metodoPago,
        }),
      });

      const data = await res.json();

      alert(data.mensaje);
    } catch (error) {
      console.error(error);

      alert("Error notificando pago");
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10 text-white">
      <section className="mx-auto max-w-xl rounded-3xl border border-white/10 bg-white/10 p-6 shadow-2xl backdrop-blur">
        <div className="mb-8 text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">
            Digital Juanex
          </p>

          <h1 className="mt-3 text-3xl font-black">Finalizar pago</h1>

          <p className="mt-2 text-sm text-slate-300">Pedido #{pedidoId}</p>
        </div>

        <div className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-200">
              Método de pago
            </label>

            <select
              value={metodoPago}
              onChange={(e) => setMetodoPago(e.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none focus:border-cyan-400"
            >
              <option value="">Seleccione</option>
              <option value="efectivo">Efectivo</option>
              <option value="transferencia">Transferencia</option>
            </select>
          </div>

          {metodoPago === "efectivo" && (
            <div className="rounded-2xl border border-emerald-400/30 bg-emerald-400/10 p-4">
              <h2 className="font-bold text-emerald-300">Pago en efectivo</h2>

              <p className="mt-2 text-sm text-slate-300">
                Presiona el botón para notificar que pagarás en efectivo.
              </p>

              <button
                onClick={handleNotificarPago}
                className="mt-5 w-full rounded-2xl bg-emerald-400 px-5 py-3 font-black text-slate-950 transition hover:bg-emerald-300"
              >
                Notificar pago
              </button>
            </div>
          )}

          {metodoPago === "transferencia" && (
            <div className="rounded-2xl border border-cyan-400/30 bg-cyan-400/10 p-4">
              <h2 className="font-bold text-cyan-300">
                Pago por transferencia
              </h2>

              <div className="mt-4">
                <label className="mb-2 block text-sm font-semibold text-slate-200">
                  Cuenta destino
                </label>

                <select
                  value={cuenta}
                  onChange={(e) => setCuenta(e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none focus:border-cyan-400"
                >
                  <option value="">Seleccione cuenta</option>
                  <option value="nequi">Nequi</option>
                  <option value="breb">Bre-B</option>
                </select>
              </div>
              <button
                onClick={handleNotificarPago}
                className="mt-5 w-full rounded-2xl bg-emerald-400 px-5 py-3 font-black text-slate-950 transition hover:bg-emerald-300"
              >
                Notificar pago
              </button>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

export default Pago;
