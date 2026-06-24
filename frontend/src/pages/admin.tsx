import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  MonitorPlay,
  Search,
  Home,
  ShoppingBag,
  User,
  ClipboardCheck,
  LayoutDashboard,
  CheckCircle2,
  XCircle,
  Calendar,
  Banknote,
  Hash,
  Image as ImageIcon,
  Inbox,
  RotateCcw,
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { useNavigate } from "react-router-dom";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * ============================================================================
 * AJUSTA ESTOS ENDPOINTS Y CAMPOS A TU BACKEND REAL
 * ----------------------------------------------------------------------------
 * No tenía acceso a las rutas reales de "notificaciones de pago", así que
 * asumí las siguientes siguiendo la misma convención del resto del proyecto
 * (carrito, productos, pedidos). Si tu backend usa otros nombres, solo
 * cambia las constantes y la interfaz NotificacionPago de abajo; el resto
 * del componente no necesita tocarse.
 *
 *  GET  /notificaciones-pago            -> NotificacionPago[]
 *  POST /notificaciones-pago/confirmar  -> body: { idpago }
 *  POST /notificaciones-pago/rechazar   -> body: { idpago }
 * ============================================================================
 */
const API_URL = "http://localhost:3000";

interface NotificacionPago {
  idusuario: number;
  idpago: number;
  idpedido: number;
  fechapago: string;
  metodopago: number;
  estadovalidacion: number;
  total: number;
  nombre: string;
  email: string;
}

type EstadoFiltro = "todas" | "pendiente" | "confirmado" | "rechazado";

function Admin() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("admin");
  const [showSearch, setShowSearch] = useState(false); // búsqueda global de productos (tab "Buscar")
  const [showUserMenu, setShowUserMenu] = useState(false);

  const [notificaciones, setNotificaciones] = useState<NotificacionPago[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [procesando, setProcesando] = useState<number | null>(null);

  const [estadoFiltro, setEstadoFiltro] = useState<EstadoFiltro>("pendiente");
  const [busqueda, setBusqueda] = useState("");
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");

  // Búsqueda global de productos (idéntica a Inicio.tsx, para mantener el tab "Buscar" funcional)
  const [platforms, setPlatforms] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const usuario = JSON.parse(localStorage.getItem("usuario") || "{}");
  const isAdmin = usuario.rol === 0;

  useEffect(() => {
    const usuario = localStorage.getItem("usuario");
    if (!usuario) {
      navigate("/");
    }
    if (!isAdmin) navigate("/unauthorized");
  }, []);

  const cerrarSesion = () => {
    localStorage.removeItem("usuario");
    window.location.href = "/";
  };

  const loadNotificaciones = async () => {
    setLoading(true);
    setLoadError(false);
    try {
      const res = await fetch(`${API_URL}/api/pagos/pendientes`);
      const data = await res.json();
      console.log("PAGOS:", data[0]);
      setNotificaciones(data);
    } catch (error) {
      console.error("Error cargando notificaciones:", error);
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotificaciones();
  }, []);

  useEffect(() => {
    fetch(`${API_URL}/productos`)
      .then((res) => res.json())
      .then((data) => setPlatforms(data))
      .catch((error) => console.error("Error cargando productos:", error));
  }, []);

  const confirmarPago = async (idpago: number) => {
    setProcesando(idpago);
    try {
      await fetch(`${API_URL}/api/pagos/aprobar/${idpago}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idpago }),
      });
      await loadNotificaciones();
    } catch (error) {
      console.error("Error confirmando pago:", error);
      alert("No se pudo confirmar el pago. Intenta nuevamente.");
    } finally {
      setProcesando(null);
    }
  };

  const rechazarPago = async (idpago: number) => {
    const confirmacion = window.confirm(
      "¿Seguro que deseas rechazar esta notificación de pago?",
    );
    if (!confirmacion) return;

    setProcesando(idpago);
    try {
      await fetch(`${API_URL}/api/pagos/rechazar/${idpago}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idpago }),
      });
      await loadNotificaciones();
    } catch (error) {
      console.error("Error rechazando pago:", error);
      alert("No se pudo rechazar el pago. Intenta nuevamente.");
    } finally {
      setProcesando(null);
    }
  };

  const getIniciales = (nombre: string) => nombre.substring(0, 2).toUpperCase();

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

  const conteo = useMemo(() => {
    return {
      todas: notificaciones.length,

      pendiente: notificaciones.filter((n) => n.estadovalidacion === 0).length,

      confirmado: notificaciones.filter((n) => n.estadovalidacion === 1).length,

      rechazado: notificaciones.filter((n) => n.estadovalidacion === 2).length,
    };
  }, [notificaciones]);

  const filtradas = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();

    return notificaciones
      .filter((n) => {
        if (estadoFiltro === "todas") return true;

        if (estadoFiltro === "pendiente") return n.estadovalidacion === 0;

        if (estadoFiltro === "confirmado") return n.estadovalidacion === 1;

        if (estadoFiltro === "rechazado") return n.estadovalidacion === 2;

        return true;
      })
      .filter((n) => {
        if (!texto) return true;
        return (
          n.nombre.toLowerCase().includes(texto) ||
          n.email.toLowerCase().includes(texto) ||
          String(n.idpedido).includes(texto) ||
          String(n.idpago).includes(texto) ||
          String(n.total).includes(texto)
        );
      })
      .filter((n) => {
        if (!fechaDesde && !fechaHasta) return true;
        const fecha = n.fechapago.slice(0, 10); // yyyy-mm-dd
        if (fechaDesde && fecha < fechaDesde) return false;
        if (fechaHasta && fecha > fechaHasta) return false;
        return true;
      })
      .sort(
        (a, b) =>
          new Date(b.fechapago).getTime() - new Date(a.fechapago).getTime(),
      );
  }, [notificaciones, estadoFiltro, busqueda, fechaDesde, fechaHasta]);

  const limpiarFiltros = () => {
    setBusqueda("");
    setFechaDesde("");
    setFechaHasta("");
    setEstadoFiltro("todas");
  };

  const formatFecha = (fecha: string) => {
    const d = new Date(fecha);
    return d.toLocaleString("es-CO", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const filteredPlatformsNav = platforms.filter((p) =>
    p.nombre?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const hayFiltrosActivos =
    busqueda !== "" ||
    fechaDesde !== "" ||
    fechaHasta !== "" ||
    estadoFiltro !== "todas";

  return (
    <div className="bg-[#09090b] text-white min-h-screen font-sans overflow-x-hidden selection:bg-rose-500/30">
      {/* HEADER (idéntico a Inicio.tsx) */}
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

      {/* BÚSQUEDA GLOBAL DE PRODUCTOS (idéntica a Inicio.tsx, activada desde el tab "Buscar") */}
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
            <ClipboardCheck className="w-4 h-4 text-rose-500" />
            <span className="text-rose-400 text-xs font-bold uppercase tracking-wider">
              Panel de Administración
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black mb-1 tracking-tight">
            Notificaciones de pago
          </h1>
          <p className="text-neutral-400 text-sm">
            Confirma o rechaza cada pago.
          </p>
        </div>

        {/* PILLS DE ESTADO CON CONTEO */}
        <div className="flex gap-2.5 overflow-x-auto pb-2 mb-4 snap-x [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {[
            { id: "todas", label: "Todas", count: conteo.todas },
            { id: "pendiente", label: "Pendientes", count: conteo.pendiente },
            {
              id: "confirmado",
              label: "Confirmadas",
              count: conteo.confirmado,
            },
            { id: "rechazado", label: "Rechazadas", count: conteo.rechazado },
          ].map((f) => {
            const isActive = estadoFiltro === f.id;
            return (
              <button
                key={f.id}
                onClick={() => setEstadoFiltro(f.id as EstadoFiltro)}
                className={cn(
                  "snap-start shrink-0 px-4 py-2.5 rounded-full text-sm font-semibold flex items-center gap-2 transition-all duration-300",
                  isActive
                    ? "bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.2)]"
                    : "bg-neutral-800/80 text-neutral-400 hover:bg-neutral-700 hover:text-white",
                )}
              >
                {f.label}
                <span
                  className={cn(
                    "px-1.5 py-0.5 rounded-full text-[10px] font-bold",
                    isActive
                      ? "bg-black/10 text-black"
                      : "bg-white/10 text-neutral-300",
                  )}
                >
                  {f.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* BUSCADOR + FILTRO DE FECHA */}
        <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-4 mb-6 space-y-3">
          <div className="flex items-center gap-2 bg-black/40 border border-white/5 rounded-xl px-3 py-2.5">
            <Search className="w-4 h-4 text-neutral-500 shrink-0" />
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por cliente, referencia, pedido o monto..."
              className="w-full bg-transparent outline-none text-sm text-white placeholder:text-neutral-500"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex items-center gap-2 bg-black/40 border border-white/5 rounded-xl px-3 py-2.5 flex-1">
              <Calendar className="w-4 h-4 text-neutral-500 shrink-0" />
              <input
                type="date"
                value={fechaDesde}
                onChange={(e) => setFechaDesde(e.target.value)}
                className="w-full bg-transparent outline-none text-sm text-white [color-scheme:dark]"
              />
            </div>
            <div className="flex items-center gap-2 bg-black/40 border border-white/5 rounded-xl px-3 py-2.5 flex-1">
              <Calendar className="w-4 h-4 text-neutral-500 shrink-0" />
              <input
                type="date"
                value={fechaHasta}
                onChange={(e) => setFechaHasta(e.target.value)}
                className="w-full bg-transparent outline-none text-sm text-white [color-scheme:dark]"
              />
            </div>
            {hayFiltrosActivos && (
              <button
                onClick={limpiarFiltros}
                className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-sm font-semibold shrink-0"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Limpiar
              </button>
            )}
          </div>
        </div>

        {/* LISTA DE NOTIFICACIONES */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 text-neutral-500">
            <div className="w-8 h-8 border-2 border-neutral-700 border-t-rose-500 rounded-full animate-spin mb-3" />
            <p className="text-sm">Cargando notificaciones...</p>
          </div>
        ) : loadError ? (
          <div className="flex flex-col items-center justify-center py-16 text-center bg-neutral-900/50 border border-neutral-800 rounded-2xl">
            <Inbox className="w-10 h-10 text-neutral-600 mb-3" />
            <p className="font-bold text-white mb-1">
              No se pudieron cargar las notificaciones
            </p>
            <p className="text-sm text-neutral-500 mb-4">
              Revisa que el backend esté disponible.
            </p>
            <button
              onClick={loadNotificaciones}
              className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-sm font-semibold"
            >
              Reintentar
            </button>
          </div>
        ) : filtradas.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center bg-neutral-900/50 border border-neutral-800 rounded-2xl">
            <Inbox className="w-10 h-10 text-neutral-600 mb-3" />
            <p className="font-bold text-white mb-1">Sin resultados</p>
            <p className="text-sm text-neutral-500">
              Ningún pago coincide con los filtros aplicados.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {filtradas.map((n) => {
                const badge = getEstadoBadge(n.estadovalidacion);
                const isPendiente = n.estadovalidacion === 0;
                const isProcesando = procesando === n.idpago;
                const metodosPago: Record<number, string> = {
                  0: "Efectivo",
                  1: "Transferencia",
                };

                return (
                  <motion.div
                    key={n.idpago}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className={cn(
                      "relative p-4 rounded-2xl border bg-neutral-900/50",
                      isPendiente
                        ? "border-amber-500/30"
                        : "border-neutral-800",
                    )}
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-11 h-11 shrink-0 rounded-xl bg-gradient-to-br from-rose-500 to-orange-500 flex items-center justify-center font-black text-sm">
                        {getIniciales(n.nombre)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-white truncate">
                          {n.nombre} - Id: {n.idusuario}
                        </p>
                        <p className="text-xs text-neutral-500">
                          Pedido #{n.idpedido} · {formatFecha(n.fechapago)}
                        </p>
                      </div>
                      <span
                        className={cn(
                          "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border shrink-0",
                          badge.className,
                        )}
                      >
                        {badge.label}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <div className="bg-black/40 border border-white/5 rounded-xl p-3">
                        <p className="text-[10px] text-neutral-500 uppercase font-bold tracking-wider mb-1">
                          Monto
                        </p>
                        <p className="text-lg font-black text-white">
                          ${(n.total ?? 0).toLocaleString("es-CO")}
                        </p>
                      </div>
                      <div className="bg-black/40 border border-white/5 rounded-xl p-3">
                        <p className="text-[10px] text-neutral-500 uppercase font-bold tracking-wider mb-1">
                          Método
                        </p>
                        <p className="text-sm font-bold text-white flex items-center gap-1.5">
                          <Banknote className="w-3.5 h-3.5 text-neutral-400" />
                          {metodosPago[n.metodopago] || "Desconocido"}
                        </p>
                      </div>
                    </div>

                    {isPendiente && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => rechazarPago(n.idpago)}
                          disabled={isProcesando}
                          className="flex-1 py-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 font-bold text-sm flex items-center justify-center gap-1.5 hover:bg-rose-500/25 transition disabled:opacity-50"
                        >
                          <XCircle className="w-4 h-4" />
                          Rechazar
                        </button>
                        <button
                          onClick={() => confirmarPago(n.idpago)}
                          disabled={isProcesando}
                          className="flex-1 py-2.5 rounded-xl bg-green-500 text-black font-bold text-sm flex items-center justify-center gap-1.5 hover:bg-green-400 transition disabled:opacity-50"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          {isProcesando ? "Procesando..." : "Confirmar"}
                        </button>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </main>

      {/* BOTTOM NAVIGATION (mismo estilo de Inicio.tsx, ahora con 6 tabs) */}
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
            // TODO: falta conectar a la página de pedidos del cliente
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

export default Admin;
