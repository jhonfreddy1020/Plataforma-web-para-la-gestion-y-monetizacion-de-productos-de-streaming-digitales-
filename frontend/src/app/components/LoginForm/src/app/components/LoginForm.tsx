import { useState } from "react";
import { useNavigate } from "react-router-dom";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setError("");
    setIsLoading(true);

    try {
      /*console.log("Intentando login...");
      console.log(email);
      console.log(password);*/
      const res = await fetch("http://localhost:3000/api/usuarios/login", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await res.json();

      /*console.log("Respuesta backend:");
      console.log(data);*/

      if (!res.ok) {
        alert(data.mensaje);
        setError(data.mensaje);
        setIsLoading(false);
        return;
      }

      localStorage.setItem("usuario", JSON.stringify(data));

      if (data.rol === 0) {
        navigate("/admin");
      } else {
        navigate("/inicio");
      }
    } catch (error) {
      setError("No se pudo conectar con el servidor");
    }

    setIsLoading(false);
  };

  return (
    <div className="w-full max-w-md">
      {/* Logo / Título */}
      <div className="text-center mb-8">
        <div
          className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4"
          style={{ background: "linear-gradient(135deg, #dc2626, #991b1b)" }}
        >
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <path d="M6 8h20v2H6zM6 14h14v2H6zM6 20h17v2H6z" fill="white" />
            <circle cx="26" cy="21" r="4" fill="#ff4444" />
            <path
              d="M24.5 21l1 1 2-2"
              stroke="white"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <h1
          className="text-3xl font-bold tracking-tight"
          style={{ color: "#ef4444" }}
        >
          Digital Juanex
        </h1>
        <p className="text-sm mt-1" style={{ color: "#6b7280" }}>
          Tu tienda de productos digitales
        </p>
      </div>

      {/* Card */}
      <div
        className="rounded-2xl border p-8"
        style={{ background: "#111111", borderColor: "#1f1f1f" }}
      >
        <h2 className="text-xl font-semibold mb-1" style={{ color: "#f9fafb" }}>
          Iniciar sesión
        </h2>
        <p className="text-sm mb-6" style={{ color: "#6b7280" }}>
          Selecciona tu tipo de acceso
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div className="space-y-1">
            <input
              type="email"
              placeholder={"tu@email.com"}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
              className="w-full px-4 py-2.5 rounded-lg text-sm outline-none transition-all"
              style={{
                background: "#1a1a1a",
                border: "1px solid #2d2d2d",
                color: "#f9fafb",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#dc2626";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#2d2d2d";
              }}
            />
          </div>

          {/* Password */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label
                className="text-sm font-medium"
                style={{ color: "#d1d5db" }}
              >
                Contraseña
              </label>
              <a
                href="#"
                className="text-xs"
                style={{ color: "#ef4444" }}
                onClick={(e) => {
                  e.preventDefault();
                  navigate("/recuperar");
                }}
              >
                ¿Olvidaste tu contraseña?
              </a>
            </div>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
              className="w-full px-4 py-2.5 rounded-lg text-sm outline-none transition-all"
              style={{
                background: "#1a1a1a",
                border: "1px solid #2d2d2d",
                color: "#f9fafb",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#dc2626";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#2d2d2d";
              }}
            />
          </div>

          {/* Error */}
          {error && (
            <p className="text-xs" style={{ color: "#ef4444" }}>
              {error}
            </p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 mt-2"
            style={{
              background: isLoading
                ? "#991b1b"
                : "linear-gradient(135deg, #dc2626, #b91c1c)",
              color: "#ffffff",
              cursor: isLoading ? "not-allowed" : "pointer",
              opacity: isLoading ? 0.8 : 1,
            }}
          >
            {isLoading ? "Ingresando..." : "Ingresar"}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center my-5">
          <div className="flex-1 h-px" style={{ background: "#1f1f1f" }} />
          <span className="px-3 text-xs" style={{ color: "#4b5563" }}>
            ¿Nuevo aquí?
          </span>
          <div className="flex-1 h-px" style={{ background: "#1f1f1f" }} />
        </div>

        <button
          type="button"
          onClick={() => navigate("/registro")} // Si usas react-router
          className="block w-full text-center py-2.5 rounded-lg text-sm font-medium transition-all duration-200"
          style={{
            background: "transparent",
            border: "1px solid #dc2626",
            color: "#ef4444",
            cursor: "pointer",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.background = "#dc262620";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.background = "transparent";
          }}
        >
          Crear cuenta
        </button>
      </div>

      <p className="text-center text-xs mt-6" style={{ color: "#374151" }}>
        © 2026 Digital Juanex · Todos los derechos reservados
      </p>
    </div>
  );
}
