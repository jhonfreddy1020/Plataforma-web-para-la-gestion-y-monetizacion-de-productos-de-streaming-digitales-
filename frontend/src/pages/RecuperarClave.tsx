import { useState } from "react";

export default function RecuperarPassword() {
  const [email, setEmail] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    setMensaje("");

    try {
      const res = await fetch("http://localhost:3000/api/usuarios/recuperar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      setMensaje(data.mensaje);
    } catch (error) {
      setMensaje("Error de conexión con el servidor");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="bg-zinc-900 p-8 rounded-xl w-[400px] border border-red-600">
        <h1 className="text-xl font-bold text-red-500 mb-4 text-center">
          Recuperar contraseña
        </h1>

        <input
          type="email"
          placeholder="Tu correo"
          className="w-full p-2 mb-3 bg-black border border-red-700 rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-red-600 hover:bg-red-700 p-2 rounded font-bold"
        >
          {loading ? "Enviando..." : "Enviar enlace"}
        </button>

        {mensaje && (
          <p className="mt-4 text-center text-sm text-green-400">{mensaje}</p>
        )}
      </div>
    </div>
  );
}
