import { useState } from "react";
import { useNavigate } from "react-router-dom";

type Role = "usuario" | "administrador";

export default function RegisterForm() {
  const [role, setRole] = useState<Role>("usuario");
  const [adminCode, setAdminCode] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nombre, setNombre] = useState("");
  {
    /*const [celular, setCelular] = useState("");*/
  }
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const validarEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  {
    /*const validarCelular = (cel: string) => {
    return /^3\d{9}$/.test(cel); // celular colombiano empieza con 3 y 10 dígitos
  };*/
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (role === "administrador") {
      setError("La creación de administradores requiere aprobación.");
      return;
    }
    // Validaciones
    {
      /*|| !nombreUsuario*/
    }
    if (!email || !password) {
      setError("Datos incompletos");
      return;
    }

    // Validar correo y celular opcionalmente
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Correo inválido");
      return;
    }

    try {
      const res = await fetch("http://localhost:3000/api/usuarios/registrar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre,
          email,
          password,
          rol: 1,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        // Registro exitoso -> ir al login
        navigate("/");
      } else {
        setError(data.mensaje || "Datos incorrectos o incompletos");
      }
    } catch (err) {
      setError("Error de conexión al servidor");
    }
  };

  return (
    <div
      className="max-w-md mx-auto p-4 rounded-lg border"
      style={{ background: "#111", borderColor: "#222" }}
    >
      <h2 className="text-xl text-white font-bold mb-4">Crear Cuenta</h2>
      {error && <p className="text-red-500 mb-2">{error}</p>}

      <div className="mb-4">
        <p className="text-gray-400 text-sm">
          Las cuentas nuevas se crean como clientes.
        </p>
      </div>

      {role === "administrador" && (
        <div className="mb-2">
          <label className="text-sm text-gray-300">Código Admin</label>
          <input
            type="text"
            value={adminCode}
            onChange={(e) => setAdminCode(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-gray-900 text-white"
          />
        </div>
      )}

      <div className="mb-2">
        <label className="text-sm text-gray-300">Nombre</label>

        <input
          type="text"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          className="w-full px-3 py-2 rounded-lg bg-gray-900 text-white"
        />
      </div>

      <div className="mb-2">
        <label className="text-sm text-gray-300">Correo</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-3 py-2 rounded-lg bg-gray-900 text-white"
        />
      </div>

      <div className="mb-2">
        <label className="text-sm text-gray-300">Clave</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-3 py-2 rounded-lg bg-gray-900 text-white"
        />
      </div>

      {/*<div className="mb-4">
        <label className="text-sm text-gray-300">Celular</label>
        <input
          type="text"
          value={celular}
          onChange={(e) => setCelular(e.target.value)}
          className="w-full px-3 py-2 rounded-lg bg-gray-900 text-white"
        />
      </div>*/}

      <button
        className="w-full py-2 bg-red-600 text-white rounded-lg"
        onClick={handleSubmit}
      >
        Guardar
      </button>
    </div>
  );
}
