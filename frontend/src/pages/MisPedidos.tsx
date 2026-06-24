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
  Calendar,
  Banknote,
  Hash,
  ChevronDown,
  Inbox,
  ExternalLink,
  Package,
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { useNavigate } from "react-router-dom";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * ============================================================================
 * AJUSTA ESTE ENDPOINT Y CAMPOS A TU BACKEND REAL
 * ----------------------------------------------------------------------------
 * Se asumió la siguiente ruta, siguiendo la misma convención que ya usa
 * /carrito/:idUsuario en el proyecto. Si tu backend devuelve otros nombres
 * de campo, solo ajusta las interfaces Pedido / ProductoPedido de abajo.
 *
 *  GET /pedidos/:idUsuario -> Pedido[]
 * ============================================================================
 */
const API_URL = "http://localhost:3000";

interface ProductoPedido {
  idproducto: number;
  nombre: string;
  cantidad: number;
  preciounitario: number;
  subtotal: number;
}

interface Pedido {
  idpedido: number;
  fechapago: string; // ISO string
  metodopago: number;
  estado: number;
  total: number;
  productos: ProductoPedido[];
}

function MisPedidos() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("orders");
  const [showSearch, setShowSearch] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());

  // Búsqueda global de productos (idéntica a Inicio.tsx / Admin.tsx, tab "Buscar")
  const [platforms, setPlatforms] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const usuario = localStorage.getItem("usuario");
    if (!usuario) {
      navigate("/");
    }
  }, []);

  const cerrarSesion = () => {
    localStorage.removeItem("usuario");
    window.location.href = "/";
  };

  const usuario = JSON.parse(localStorage.getItem("usuario") || "{}");
  const idUsuario = usuario.id;
  const isAdmin = usuario.rol === 0;

  const loadPedidos = async () => {
    setLoading(true);
    setLoadError(false);
    try {
      const res = await fetch(`${API_URL}/api/pedidos/${idUsuario}`);
      const data = await res.json();

      if (!Array.isArray(data)) {
        throw new Error("La respuesta no es un arreglo");
      }

      setPedidos(data);
    } catch (error) {
      console.error("Error cargando pedidos:", error);
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPedidos();
  }, []);

  // Búsqueda global de productos (idéntica a Inicio.tsx)
  useEffect(() => {
    fetch(`${API_URL}/productos`)
      .then((res) => res.json())
      .then((data) => setPlatforms(data))
      .catch((error) => console.error("Error cargando productos:", error));
  }, []);

  const toggleExpand = (idpedido: number) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(idpedido)) {
        next.delete(idpedido);
      } else {
        next.add(idpedido);
      }
      return next;
    });
  };

  //Estado del pedido
  const getEstadoBadge = (estado: number) => {
    switch (estado) {
      case 1:
        return {
          label: "Confirmado",
          className: "bg-green-500/15 text-green-400 border-green-500/30",
        };

      case 2:
        return {
          label: "Rechazado",
          className: "bg-rose-500/15 text-rose-400 border-rose-500/30",
        };

      default:
        return {
          label: "Pendiente",
          className: "bg-amber-500/15 text-amber-400 border-amber-500/30",
        };
    }
  };

  const formatFecha = (fechapago: string) => {
    const d = new Date(fechapago);
    return d.toLocaleString("es-CO", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const pedidosOrdenados = [...pedidos].sort(
    (a, b) => new Date(b.fechapago).getTime() - new Date(a.fechapago).getTime(),
  );

  const filteredPlatformsNav = platforms.filter((p) =>
    p.nombre?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Reutiliza el mismo flujo de pago que ya existe en Inicio.tsx (handleComprar -> /pago/:idPedido)
  const irAPagar = (idpedido: number) => {
    window.open(`/pago/${idpedido}`, "_blank");
  };

  return (
    <div className="bg-[#09090b] text-white min-h-screen font-sans overflow-x-hidden selection:bg-rose-500/30">
      {/* HEADER (idéntico a Inicio.tsx / Admin.tsx) */}
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

      {/* BÚSQUEDA GLOBAL DE PRODUCTOS (idéntica a Inicio.tsx / Admin.tsx) */}
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

      <main className="pb-32 pt-24 px-5 max-w-lg mx-auto md:max-w-4xl">
        {/* TÍTULO */}
        <div className="mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-3 rounded-full bg-rose-500/10 border border-rose-500/30">
            <Package className="w-4 h-4 text-rose-500" />
            <span className="text-rose-400 text-xs font-bold uppercase tracking-wider">
              Mis Pedidos
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black mb-1 tracking-tight">
            Historial de pedidos
          </h1>
          <p className="text-neutral-400 text-sm">
            Toca un pedido para ver el detalle de productos y el total.
          </p>
        </div>

        {/* LISTA DE PEDIDOS */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 text-neutral-500">
            <div className="w-8 h-8 border-2 border-neutral-700 border-t-rose-500 rounded-full animate-spin mb-3" />
            <p className="text-sm">Cargando tus pedidos...</p>
          </div>
        ) : loadError ? (
          <div className="flex flex-col items-center justify-center py-16 text-center bg-neutral-900/50 border border-neutral-800 rounded-2xl">
            <Inbox className="w-10 h-10 text-neutral-600 mb-3" />
            <p className="font-bold text-white mb-1">
              No se pudieron cargar tus pedidos
            </p>
            <p className="text-sm text-neutral-500 mb-4">
              Revisa que el backend esté disponible.
            </p>
            <button
              onClick={loadPedidos}
              className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-sm font-semibold"
            >
              Reintentar
            </button>
          </div>
        ) : pedidosOrdenados.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center bg-neutral-900/50 border border-neutral-800 rounded-2xl">
            <Inbox className="w-10 h-10 text-neutral-600 mb-3" />
            <p className="font-bold text-white mb-1">Aún no tienes pedidos</p>
            <p className="text-sm text-neutral-500">
              Cuando compres una plataforma, aparecerá aquí.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {pedidosOrdenados.map((pedido) => {
              const badge = getEstadoBadge(pedido.estado);
              const isExpanded = expandedIds.has(pedido.idpedido);
              const metodosPago: Record<number, string> = {
                0: "Efectivo",
                1: "Transferencia",
              };

              return (
                <motion.div
                  layout
                  key={pedido.idpedido}
                  className="rounded-2xl border border-neutral-800 bg-neutral-900/50 overflow-hidden"
                >
                  {/* HEADER DEL PEDIDO (clickeable, despliega el detalle) */}
                  <button
                    onClick={() => toggleExpand(pedido.idpedido)}
                    className="w-full flex items-center gap-3 p-4 text-left"
                  >
                    <div className="w-11 h-11 shrink-0 rounded-xl bg-gradient-to-br from-rose-500 to-orange-500 flex items-center justify-center">
                      <Hash className="w-5 h-5 text-white" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-white">
                        Pedido #{pedido.idpedido}
                      </p>
                      <div className="flex items-center gap-1.5 text-xs text-neutral-500 flex-wrap">
                        <Calendar className="w-3 h-3" />
                        {formatFecha(pedido.fechapago)}
                        <span className="mx-0.5">·</span>
                        <Banknote className="w-3 h-3" />
                        {metodosPago[pedido.metodopago] || "Desconocido"}
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <span
                        className={cn(
                          "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border",
                          badge.className,
                        )}
                      >
                        {badge.label}
                      </span>
                      <span className="font-black text-white">
                        ${pedido.total.toLocaleString("es-CO")}
                      </span>
                    </div>

                    <motion.div
                      animate={{ rotate: isExpanded ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                      className="shrink-0 ml-1"
                    >
                      <ChevronDown className="w-5 h-5 text-neutral-500" />
                    </motion.div>
                  </button>

                  {/* DETALLE DESPLEGABLE: productos + total */}
                  <AnimatePresence initial={false}>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden border-t border-neutral-800"
                      >
                        <div className="p-4 space-y-2">
                          {pedido.productos.map((p) => (
                            <div
                              key={p.idproducto}
                              className="flex items-center justify-between bg-black/40 border border-white/5 rounded-xl px-3 py-2.5"
                            >
                              <div className="min-w-0">
                                <p className="text-sm font-semibold text-white truncate">
                                  {p.nombre}
                                </p>
                                <p className="text-xs text-neutral-500">
                                  {p.cantidad} × $
                                  {p.preciounitario.toLocaleString("es-CO")}
                                </p>
                              </div>
                              <p className="text-sm font-bold text-white shrink-0 ml-3">
                                ${p.subtotal.toLocaleString("es-CO")}
                              </p>
                            </div>
                          ))}

                          <div className="flex items-center justify-between pt-2 px-1">
                            <span className="text-sm font-bold text-neutral-300">
                              Total
                            </span>
                            <span className="text-lg font-black text-white">
                              ${pedido.total.toLocaleString("es-CO")}
                            </span>
                          </div>

                          {pedido.estado === 0 && (
                            <button
                              onClick={() => irAPagar(pedido.idpedido)}
                              className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-rose-500 to-orange-500 font-bold text-sm flex items-center justify-center gap-2"
                            >
                              Completar pago
                              <ExternalLink className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>

      {/* BOTTOM NAVIGATION (mismo componente que Inicio.tsx / Admin.tsx) */}
      <nav className="fixed bottom-0 w-full z-50 bg-[#09090b]/90 backdrop-blur-2xl border-t border-neutral-800/80 pb-safe pt-2 px-4 pb-4">
        <div className="max-w-md mx-auto flex justify-between items-center">
          {[
            // Interactivo: navega de vuelta a Inicio
            {
              id: "home",
              icon: Home,
              label: "Inicio",
              action: () => navigate("/inicio"),
            },
            // Interactivo: abre la búsqueda global de productos
            {
              id: "search",
              icon: Search,
              label: "Buscar",
              action: () => setShowSearch((p) => !p),
            },
            // Página actual
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
            // TODO: falta conectar a la página de perfil
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

export default MisPedidos;
