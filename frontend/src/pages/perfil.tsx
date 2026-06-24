import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  MonitorPlay,
  Search,
  Home,
  ShoppingBag,
  User,
  ClipboardCheck,
  LayoutDashboard,
  Pencil,
  Save,
  CheckCircle2,
  AlertCircle,
  Mail,
  Phone,
  UserCircle2,
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { useNavigate } from "react-router-dom";
import { getUsuario, updateUsuario } from "../services/usuarios";
import { getProductos } from "../services/productos";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const API_URL = "http://localhost:3000";

interface Usuario {
  id: number;
  nombre: string;
  correo: string;
  celular: string;
}

//Validacion de rol
const user = JSON.parse(localStorage.getItem("usuario") || "{}");
const isAdmin = user.rol === 0;

const correo_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function Perfil() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("profile");
  const [showSearch, setShowSearch] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const [editando, setEditando] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [exito, setExito] = useState(false);

  const [perfil, setPerfil] = useState<Usuario>({
    id: 0,
    nombre: "",
    correo: "",
    celular: "",
  });

  const [errores, setErrores] = useState<{
    nombre?: string;
    correo?: string;
    celular?: string;
  }>({});

  // Búsqueda global de productos (idéntica al resto de páginas, tab "Buscar")
  const [platforms, setPlatforms] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const usuarioLS = localStorage.getItem("usuario");
    if (!usuarioLS) {
      navigate("/");
      return;
    }

    const usuario = JSON.parse(usuarioLS);

    setPerfil({
      id: usuario.id,
      nombre: usuario.nombre || "",
      correo: usuario.correo || "",
      celular: usuario.celular || "",
    });
    getUsuario(usuario.id)
      .then((data) => {
        setPerfil({
          id: data.id,
          nombre: data.nombre ?? "",
          correo: data.correo ?? "",
          celular: data.celular ?? "",
        });
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    getProductos().then(setPlatforms).catch(console.error);
  }, []);

  const cerrarSesion = () => {
    localStorage.removeItem("usuario");
    window.location.href = "/";
  };

  const validar = () => {
    const nuevosErrores: typeof errores = {};

    if (!perfil.nombre.trim()) {
      nuevosErrores.nombre = "El nombre es obligatorio";
    }

    if (!perfil.correo.trim()) {
      nuevosErrores.correo = "El correo es obligatorio";
    } else if (!correo_REGEX.test(perfil.correo.trim())) {
      nuevosErrores.correo = "Ingresa un correo válido (ej: nombre@correo.com)";
    }

    const celularLimpio = (perfil.celular || "").replace(/\s/g, "");
    if (celularLimpio && !/^\+?[0-9]{7,15}$/.test(celularLimpio)) {
      nuevosErrores.celular = "Ingresa un número válido";
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleEditar = () => {
    setExito(false);
    setEditando(true);
  };

  const handleGuardar = async () => {
    if (!validar()) return;

    setGuardando(true);
    try {
      const actualizado = await updateUsuario(perfil.id, {
        nombre: perfil.nombre.trim(),
        correo: perfil.correo.trim(),
        celular: (perfil.celular || "").trim(),
      });

      // Mantiene sincronizado localStorage con los datos guardados
      const usuarioLS = JSON.parse(localStorage.getItem("usuario") || "{}");
      localStorage.setItem(
        "usuario",
        JSON.stringify({ ...usuarioLS, ...actualizado }),
      );

      setEditando(false);
      setExito(true);
      setTimeout(() => setExito(false), 3000);
    } catch (error) {
      console.error("Error guardando perfil:", error);
      alert("No se pudo guardar el perfil. Intenta nuevamente.");
    } finally {
      setGuardando(false);
    }
  };

  const handleChange = (campo: keyof Usuario, valor: string) => {
    setPerfil((prev) => ({ ...prev, [campo]: valor }));
    if (errores[campo as keyof typeof errores]) {
      setErrores((prev) => ({ ...prev, [campo]: undefined }));
    }
  };

  const getIniciales = (nombre: string) => {
    if (!nombre.trim()) return "?";
    return nombre
      .trim()
      .split(" ")
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase())
      .join("");
  };

  const filteredPlatformsNav = platforms.filter((p) =>
    p.nombre?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="bg-[#09090b] text-white min-h-screen font-sans overflow-x-hidden selection:bg-rose-500/30">
      {/* HEADER (idéntico al resto de páginas) */}
      <header className="fixed top-0 w-full z-40 px-5 py-4 flex justify-between items-center bg-gradient-to-b from-[#09090b] via-[#09090b]/80 to-transparent pointer-events-none">
        <div className="flex items-center gap-2 pointer-events-auto">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-rose-500 to-orange-500 flex items-center justify-center shadow-[0_0_15px_rgba(244,63,94,0.4)]">
            <MonitorPlay className="w-4 h-4 text-white" />
          </div>
          <span className="font-extrabold text-xl tracking-tight">
            Digital <span className="text-rose-500">Juanex</span>
          </span>
        </div>
        <div className="relative pointer-events-auto">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="w-10 h-10 rounded-full bg-neutral-800 border-2 border-neutral-700 flex items-center justify-center"
          >
            <User className="w-5 h-5 text-neutral-400" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 top-12 w-44 bg-neutral-900 border border-neutral-700 rounded-xl shadow-xl overflow-hidden z-50">
              <button className="w-full px-4 py-3 text-left hover:bg-neutral-800">
                Mi perfil
              </button>
              <button
                onClick={cerrarSesion}
                className="w-full px-4 py-3 text-left text-red-500 hover:bg-neutral-800"
              >
                Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </header>

      {/* BÚSQUEDA GLOBAL DE PRODUCTOS */}
      <AnimatePresence>
        {showSearch && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 left-0 w-full z-50 px-5"
          >
            <div className="max-w-lg mx-auto bg-neutral-900 border border-neutral-700 rounded-2xl p-3 shadow-2xl">
              <div className="flex items-center gap-2">
                <Search className="w-5 h-5 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Buscar producto..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-transparent outline-none text-white placeholder:text-neutral-500"
                />
              </div>

              {searchTerm.length > 0 && (
                <div className="mt-3 max-h-60 overflow-y-auto">
                  {filteredPlatformsNav.length > 0 ? (
                    filteredPlatformsNav.map((platform) => (
                      <button
                        key={platform.idproducto}
                        onClick={() => setSearchTerm(platform.nombre)}
                        className="w-full text-left px-3 py-2 rounded-xl hover:bg-neutral-800 transition"
                      >
                        <p className="font-semibold text-white">
                          {platform.nombre}
                        </p>
                        <p className="text-sm text-neutral-400">
                          ${platform.precioventa?.toLocaleString("es-CO")}
                        </p>
                      </button>
                    ))
                  ) : (
                    <p className="text-neutral-500 text-sm px-3 py-2">
                      No hay coincidencias
                    </p>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="pb-32 pt-24 px-5 max-w-lg mx-auto md:max-w-2xl">
        {/* TÍTULO */}
        <div className="mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-3 rounded-full bg-rose-500/10 border border-rose-500/30">
            <UserCircle2 className="w-4 h-4 text-rose-500" />
            <span className="text-rose-400 text-xs font-bold uppercase tracking-wider">
              Mi Perfil
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black mb-1 tracking-tight">
            Mis datos
          </h1>
          <p className="text-neutral-400 text-sm">
            Mantén actualizada tu información de contacto.
          </p>
        </div>

        {/* AVATAR */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-500 to-orange-500 flex items-center justify-center font-black text-2xl shadow-[0_0_20px_rgba(244,63,94,0.3)] shrink-0">
            {getIniciales(perfil.nombre)}
          </div>
          <div className="min-w-0">
            <p className="font-bold text-lg text-white truncate">
              {perfil.nombre || "Sin nombre"}
            </p>
            <p className="text-sm text-neutral-500 truncate">
              {perfil.correo || "—"}
            </p>
          </div>
        </div>

        {/* MENSAJE DE ÉXITO */}
        <AnimatePresence>
          {exito && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center gap-2 px-4 py-3 mb-4 rounded-xl bg-green-500/10 border border-green-500/30 text-green-400 text-sm font-semibold"
            >
              <CheckCircle2 className="w-4 h-4" />
              Perfil actualizado correctamente
            </motion.div>
          )}
        </AnimatePresence>

        {/* FORMULARIO */}
        <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-5 space-y-4">
          {/* NOMBRE */}
          <div>
            <label className="text-[11px] text-neutral-500 uppercase font-bold tracking-wider mb-1.5 flex items-center gap-1.5">
              <UserCircle2 className="w-3.5 h-3.5" />
              Nombre
            </label>
            <input
              type="text"
              value={perfil.nombre}
              disabled={!editando}
              onChange={(e) => handleChange("nombre", e.target.value)}
              placeholder="Tu nombre completo"
              className={cn(
                "w-full bg-black/40 border rounded-xl px-3.5 py-3 text-sm outline-none transition-colors",
                editando
                  ? "border-rose-500/40 text-white focus:border-rose-500"
                  : "border-white/5 text-neutral-400 cursor-not-allowed",
                errores.nombre && "border-rose-500",
              )}
            />
            {errores.nombre && (
              <p className="flex items-center gap-1 text-xs text-rose-400 mt-1.5">
                <AlertCircle className="w-3 h-3" />
                {errores.nombre}
              </p>
            )}
          </div>

          {/* correo */}
          <div>
            <label className="text-[11px] text-neutral-500 uppercase font-bold tracking-wider mb-1.5 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5" />
              correo electrónico
            </label>
            <input
              type="correo"
              value={perfil.correo}
              disabled={!editando}
              onChange={(e) => handleChange("correo", e.target.value)}
              placeholder="nombre@correo.com"
              className={cn(
                "w-full bg-black/40 border rounded-xl px-3.5 py-3 text-sm outline-none transition-colors",
                editando
                  ? "border-rose-500/40 text-white focus:border-rose-500"
                  : "border-white/5 text-neutral-400 cursor-not-allowed",
                errores.correo && "border-rose-500",
              )}
            />
            {errores.correo && (
              <p className="flex items-center gap-1 text-xs text-rose-400 mt-1.5">
                <AlertCircle className="w-3 h-3" />
                {errores.correo}
              </p>
            )}
          </div>

          {/* CELULAR */}
          <div>
            <label className="text-[11px] text-neutral-500 uppercase font-bold tracking-wider mb-1.5 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5" />
              Celular
            </label>
            <input
              type="tel"
              value={perfil.celular}
              disabled={!editando}
              onChange={(e) => handleChange("celular", e.target.value)}
              placeholder="300 123 4567"
              className={cn(
                "w-full bg-black/40 border rounded-xl px-3.5 py-3 text-sm outline-none transition-colors",
                editando
                  ? "border-rose-500/40 text-white focus:border-rose-500"
                  : "border-white/5 text-neutral-400 cursor-not-allowed",
                errores.celular && "border-rose-500",
              )}
            />
            {errores.celular && (
              <p className="flex items-center gap-1 text-xs text-rose-400 mt-1.5">
                <AlertCircle className="w-3 h-3" />
                {errores.celular}
              </p>
            )}
          </div>

          {/* BOTONES: Guardar inicia inhabilitado, se habilita al presionar Editar */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={handleEditar}
              disabled={editando}
              className={cn(
                "flex-1 py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition",
                editando
                  ? "bg-neutral-800/50 text-neutral-600 cursor-not-allowed"
                  : "bg-neutral-800 text-white hover:bg-neutral-700",
              )}
            >
              <Pencil className="w-4 h-4" />
              Editar
            </button>

            <button
              onClick={handleGuardar}
              disabled={!editando || guardando}
              className={cn(
                "flex-1 py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition",
                editando && !guardando
                  ? "bg-gradient-to-r from-rose-500 to-orange-500 text-white"
                  : "bg-neutral-800/50 text-neutral-600 cursor-not-allowed",
              )}
            >
              <Save className="w-4 h-4" />
              {guardando ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </div>
      </main>

      {/* BOTTOM NAVIGATION (mismo componente del resto de páginas) */}
      <nav className="fixed bottom-0 w-full z-50 bg-[#09090b]/90 backdrop-blur-2xl border-t border-neutral-800/80 pb-safe pt-2 px-4 pb-4">
        <div className="max-w-md mx-auto flex justify-between items-center">
          {[
            {
              id: "home",
              icon: Home,
              label: "Inicio",
              action: () => navigate("/inicio"),
            },
            {
              id: "search",
              icon: Search,
              label: "Buscar",
              action: () => setShowSearch((prev) => !prev),
            },
            {
              id: "orders",
              icon: ShoppingBag,
              label: "Mis Pedidos",
              action: () => navigate("/mis-pedidos"),
            },

            // 👇 AQUÍ SE INYECTA LA OPCIONES DE ADMIN Y RESUMEN SOLO SI ES ADMINISTRADOR
            ...(isAdmin
              ? [
                  {
                    id: "admin",
                    icon: ClipboardCheck,
                    label: "Admin",
                    action: () => navigate("/admin"), // Te redirige a tu pantalla de administración
                  },
                  {
                    id: "summary",
                    icon: LayoutDashboard,
                    label: "Resumen",
                    action: () => navigate("/resumen"),
                  },
                ]
              : []),

            {
              id: "profile",
              icon: User,
              label: "Perfil",
              action: () => navigate("/perfil"),
            },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  if (tab.action) {
                    tab.action();
                  }
                }}
                className="flex flex-col items-center gap-1.5 min-w-[44px] group relative py-1"
              >
                {isActive && (
                  <motion.div
                    layoutId="navIndicatorBottom"
                    className="absolute -top-3 w-8 h-1 bg-rose-500 rounded-full shadow-[0_0_10px_rgba(244,63,94,0.8)]"
                  />
                )}
                <Icon
                  className={cn(
                    "w-6 h-6 transition-all duration-300",
                    isActive
                      ? "text-rose-500 scale-110"
                      : "text-neutral-500 group-hover:text-neutral-300",
                  )}
                  strokeWidth={isActive ? 2.5 : 2}
                />
                <span
                  className={cn(
                    "text-[10px] font-bold transition-colors duration-300",
                    isActive
                      ? "text-rose-500"
                      : "text-neutral-500 group-hover:text-neutral-300",
                  )}
                >
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

export default Perfil;
