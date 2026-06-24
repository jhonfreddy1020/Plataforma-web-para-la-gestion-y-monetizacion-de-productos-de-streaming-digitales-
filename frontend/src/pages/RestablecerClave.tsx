import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function RestablecerPassword() {
  const { token } = useParams();

  const [loading, setLoading] = useState(true);
  const [valido, setValido] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetch(`http://localhost:3000/api/usuarios/validar/${token}`)
      .then((res) => res.json())
      .then((data) => {
        setValido(data.valido);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSubmit = async () => {
    if (password !== confirmar) {
      setMensaje("Las contraseñas no coinciden");
      return;
    }

    setLoadingSubmit(true);

    try {
      const res = await fetch(
        "http://localhost:3000/api/usuarios/restablecer",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, password }),
        },
      );

      const data = await res.json();

      if (!res.ok) {
        setMensaje(data.mensaje || "Error al cambiar contraseña");
        setLoadingSubmit(false);
        return;
      }

      setSuccess(true);
      setMensaje("Contraseña actualizada correctamente");

      // ⏳ redirección automática
      setTimeout(() => {
        window.location.href = "/";
      }, 2500);
    } catch (error) {
      setMensaje("Error de conexión con el servidor");
    } finally {
      setLoadingSubmit(false);
    }
  };

  if (loading) {
    return <h2 className="text-white">Validando enlace...</h2>;
  }

  if (!valido) {
    return (
      <h2 className="text-red-500">El enlace ha expirado o no es válido.</h2>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="bg-zinc-900 p-8 rounded-xl w-[400px] shadow-lg border border-purple-700">
        <h1 className="text-2xl font-bold text-fuchsia-500 mb-6 text-center">
          Restablecer contraseña
        </h1>

        {success ? (
          <p className="text-green-400 text-center font-semibold">
            ✔ Contraseña actualizada. Redirigiendo...
          </p>
        ) : (
          <>
            <input
              type="password"
              placeholder="Nueva contraseña"
              className="w-full p-2 mb-3 bg-black border border-purple-600 rounded"
              onChange={(e) => setPassword(e.target.value)}
            />

            <input
              type="password"
              placeholder="Confirmar contraseña"
              className="w-full p-2 mb-3 bg-black border border-purple-600 rounded"
              onChange={(e) => setConfirmar(e.target.value)}
            />

            <button
              onClick={handleSubmit}
              disabled={loadingSubmit}
              className="w-full bg-fuchsia-600 hover:bg-purple-700 p-2 rounded font-bold disabled:opacity-50"
            >
              {loadingSubmit ? "Cambiando..." : "Cambiar contraseña"}
            </button>

            {mensaje && (
              <p className="mt-4 text-center text-sm text-green-400">
                {mensaje}
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
