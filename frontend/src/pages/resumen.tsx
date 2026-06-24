import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  MonitorPlay,
  Search,
  Home,
  ShoppingBag,
  User,
  ClipboardCheck,
  LayoutDashboard,
  TrendingUp,
  Users,
  Package,
  Hash,
  BarChart3,
  ArrowDownWideNarrow,
  ArrowUpWideNarrow,
  Inbox,
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { useNavigate } from "react-router-dom";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * ============================================================================
 * DEPENDENCIA Y ENDPOINTS A AJUSTAR
 * ----------------------------------------------------------------------------
 * 1) Este archivo usa la librería "recharts" para la gráfica. Si tu proyecto
 *    no la tiene instalada, corre:  npm install recharts
 *
 * 2) Se asumieron las siguientes rutas, siguiendo la misma convención del
 *    resto del proyecto. Si tu backend usa otros nombres, solo ajusta las
 *    interfaces y las constantes de abajo.
 *
 *  GET /resumen/productos -> ProductoGanancia[]
 *  GET /resumen/clientes  -> ClienteResumen[]
 * ============================================================================
 */
const API_URL = "http://localhost:3000";

//Validacion de rol
const user = JSON.parse(localStorage.getItem("usuario") || "{}");
const isAdmin = user.rol === 0;

interface ProductoGanancia {
  idproducto: number;
  nombre: string;
  unidadesvendidas: number;
  ganancia: number;
}

interface ClienteResumen {
  idusuario: number;
  nombre: string;
  unidadescompradas: number;
  pedidos: number;
  totalgastado: number;
}

type OrdenProducto = "mayor" | "menor";

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload || !payload.length) return null;
  const item = payload[0].payload;
  return (
    <div className="bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 shadow-xl max-w-[200px]">
      <p className="text-xs font-bold text-white mb-1 truncate">
        {item.nombre}
      </p>
      <p className="text-xs text-rose-400 font-semibold">
        Ganancia: ${item.ganancia.toLocaleString("es-CO")}
      </p>
      <p className="text-xs text-neutral-400">
        {item.unidadesvendidas} unidades vendidas
      </p>
    </div>
  );
};

function Resumen() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("summary");
  const [showSearch, setShowSearch] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const [productos, setProductos] = useState<ProductoGanancia[]>([]);
  const [clientes, setClientes] = useState<ClienteResumen[]>([]);
  const [loadingProductos, setLoadingProductos] = useState(true);
  const [loadingClientes, setLoadingClientes] = useState(true);
  const [errorProductos, setErrorProductos] = useState(false);
  const [errorClientes, setErrorClientes] = useState(false);

  const [ordenProductos, setOrdenProductos] = useState<OrdenProducto>("mayor");
  const [busquedaCliente, setBusquedaCliente] = useState("");

  // Búsqueda global de productos (idéntica al resto de páginas, tab "Buscar")
  const [platformsNav, setPlatformsNav] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

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

  const loadProductos = async () => {
    setLoadingProductos(true);
    setErrorProductos(false);
    try {
      const res = await fetch(`${API_URL}/resumen/productos`);
      const data = await res.json();
      setProductos(data);
    } catch (error) {
      console.error("Error cargando ganancias por producto:", error);
      setErrorProductos(true);
    } finally {
      setLoadingProductos(false);
    }
  };

  const loadClientes = async () => {
    setLoadingClientes(true);
    setErrorClientes(false);
    try {
      const res = await fetch(`${API_URL}/resumen/clientes`);
      const data = await res.json();
      setClientes(data);
    } catch (error) {
      console.error("Error cargando resumen de clientes:", error);
      setErrorClientes(true);
    } finally {
      setLoadingClientes(false);
    }
  };

  useEffect(() => {
    loadProductos();
    loadClientes();
  }, []);

  useEffect(() => {
    fetch(`${API_URL}/productos`)
      .then((res) => res.json())
      .then((data) => setPlatformsNav(data))
      .catch((error) => console.error("Error cargando productos:", error));
  }, []);

  // --- Productos por ganancia, con orden mayor/menor ---
  const productosOrdenados = useMemo(() => {
    const copia = [...productos];
    copia.sort((a, b) =>
      ordenProductos === "mayor"
        ? b.ganancia - a.ganancia
        : a.ganancia - b.ganancia,
    );
    return copia;
  }, [productos, ordenProductos]);

  const productosChart = useMemo(
    () =>
      productosOrdenados.slice(0, 8).map((p) => ({
        ...p,
        nombreCorto:
          p.nombre.length > 16 ? `${p.nombre.slice(0, 15)}…` : p.nombre,
      })),
    [productosOrdenados],
  );

  const maxGanancia = useMemo(
    () => Math.max(...productos.map((p) => p.ganancia), 1),
    [productos],
  );

  const totalGanancias = useMemo(
    () => productos.reduce((acc, p) => acc + p.ganancia, 0),
    [productos],
  );
  const totalUnidades = useMemo(
    () => productos.reduce((acc, p) => acc + p.unidadesvendidas, 0),
    [productos],
  );

  // --- Clientes que más han comprado, con ranking real + filtro por id/nombre ---
  const clientesRankeados = useMemo(() => {
    return [...clientes]
      .sort((a, b) => b.totalgastado - a.totalgastado)
      .map((c, idx) => ({ ...c, rank: idx + 1 }));
  }, [clientes]);

  const clientesFiltrados = useMemo(() => {
    const texto = busquedaCliente.trim().toLowerCase();
    if (!texto) return clientesRankeados;
    return clientesRankeados.filter(
      (c) =>
        c.nombre.toLowerCase().includes(texto) ||
        String(c.idusuario).includes(texto),
    );
  }, [clientesRankeados, busquedaCliente]);

  const getIniciales = (nombre: string) => nombre.substring(0, 2).toUpperCase();

  const filteredPlatformsNav = platformsNav.filter((p) =>
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

      <main className="pb-32 pt-24 px-5 max-w-lg mx-auto md:max-w-4xl">
        {/* TÍTULO */}
        <div className="mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-3 rounded-full bg-rose-500/10 border border-rose-500/30">
            <BarChart3 className="w-4 h-4 text-rose-500" />
            <span className="text-rose-400 text-xs font-bold uppercase tracking-wider">
              Resumen
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black mb-1 tracking-tight">
            Estadísticas de ventas
          </h1>
          <p className="text-neutral-400 text-sm">
            Ganancias por producto y tus clientes más frecuentes.
          </p>
        </div>

        {/* KPIs RÁPIDOS */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-8">
          <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-3 sm:p-4 flex flex-col items-center text-center">
            <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-green-400 mb-1.5" />
            <p className="text-base sm:text-lg font-black text-white leading-tight">
              ${totalGanancias.toLocaleString("es-CO")}
            </p>
            <p className="text-[9px] sm:text-[10px] text-neutral-500 uppercase font-bold tracking-wide">
              Ganancia total
            </p>
          </div>
          <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-3 sm:p-4 flex flex-col items-center text-center">
            <Package className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-400 mb-1.5" />
            <p className="text-base sm:text-lg font-black text-white leading-tight">
              {totalUnidades.toLocaleString("es-CO")}
            </p>
            <p className="text-[9px] sm:text-[10px] text-neutral-500 uppercase font-bold tracking-wide">
              Unidades vendidas
            </p>
          </div>
          <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-3 sm:p-4 flex flex-col items-center text-center">
            <Users className="w-5 h-5 sm:w-6 sm:h-6 text-rose-400 mb-1.5" />
            <p className="text-base sm:text-lg font-black text-white leading-tight">
              {clientes.length}
            </p>
            <p className="text-[9px] sm:text-[10px] text-neutral-500 uppercase font-bold tracking-wide">
              Clientes
            </p>
          </div>
        </div>

        {/* GANANCIAS POR PRODUCTO */}
        <section className="mb-10">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-rose-500" />
              Ganancias por producto
            </h2>

            <div className="flex gap-2">
              <button
                onClick={() => setOrdenProductos("mayor")}
                className={cn(
                  "px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition",
                  ordenProductos === "mayor"
                    ? "bg-white text-black"
                    : "bg-neutral-800/80 text-neutral-400 hover:bg-neutral-700 hover:text-white",
                )}
              >
                <ArrowDownWideNarrow className="w-3.5 h-3.5" />
                Mayor a menor
              </button>
              <button
                onClick={() => setOrdenProductos("menor")}
                className={cn(
                  "px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition",
                  ordenProductos === "menor"
                    ? "bg-white text-black"
                    : "bg-neutral-800/80 text-neutral-400 hover:bg-neutral-700 hover:text-white",
                )}
              >
                <ArrowUpWideNarrow className="w-3.5 h-3.5" />
                Menor a mayor
              </button>
            </div>
          </div>

          {loadingProductos ? (
            <div className="flex flex-col items-center justify-center py-16 text-neutral-500">
              <div className="w-8 h-8 border-2 border-neutral-700 border-t-rose-500 rounded-full animate-spin mb-3" />
              <p className="text-sm">Cargando ganancias...</p>
            </div>
          ) : errorProductos ? (
            <div className="flex flex-col items-center justify-center py-16 text-center bg-neutral-900/50 border border-neutral-800 rounded-2xl">
              <Inbox className="w-10 h-10 text-neutral-600 mb-3" />
              <p className="font-bold text-white mb-1">
                No se pudieron cargar las ganancias
              </p>
              <p className="text-sm text-neutral-500 mb-4">
                Revisa que el backend esté disponible.
              </p>
              <button
                onClick={loadProductos}
                className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-sm font-semibold"
              >
                Reintentar
              </button>
            </div>
          ) : productos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center bg-neutral-900/50 border border-neutral-800 rounded-2xl">
              <Inbox className="w-10 h-10 text-neutral-600 mb-3" />
              <p className="font-bold text-white mb-1">
                Aún no hay ventas registradas
              </p>
            </div>
          ) : (
            <>
              {/* GRÁFICA */}
              <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-4 mb-4">
                <div
                  style={{ height: Math.max(240, productosChart.length * 46) }}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={productosChart}
                      layout="vertical"
                      margin={{ top: 5, right: 24, left: 0, bottom: 5 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#27272a"
                        horizontal={false}
                      />
                      <XAxis
                        type="number"
                        tick={{ fill: "#71717a", fontSize: 11 }}
                        tickFormatter={(v) => `$${v.toLocaleString("es-CO")}`}
                        axisLine={{ stroke: "#27272a" }}
                        tickLine={false}
                      />
                      <YAxis
                        type="category"
                        dataKey="nombreCorto"
                        width={110}
                        tick={{ fill: "#a3a3a3", fontSize: 11 }}
                        axisLine={{ stroke: "#27272a" }}
                        tickLine={false}
                      />
                      <Tooltip
                        content={<CustomTooltip />}
                        cursor={{ fill: "rgba(244,63,94,0.06)" }}
                      />
                      <Bar
                        dataKey="ganancia"
                        fill="#f43f5e"
                        radius={[0, 8, 8, 0]}
                        barSize={22}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                {productos.length > 8 && (
                  <p className="text-[11px] text-neutral-500 text-center mt-2">
                    Mostrando los 8 productos con{" "}
                    {ordenProductos === "mayor" ? "mayor" : "menor"} ganancia.
                    Mira la lista completa abajo.
                  </p>
                )}
              </div>

              {/* LISTA COMPLETA, en el mismo orden seleccionado */}
              <div className="space-y-2">
                {productosOrdenados.map((p, idx) => {
                  const pct = (p.ganancia / maxGanancia) * 100;
                  return (
                    <div
                      key={p.idproducto}
                      className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-3"
                    >
                      <div className="flex items-center justify-between mb-2 gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-xs font-bold text-neutral-600 shrink-0 w-5">
                            #{idx + 1}
                          </span>
                          <p className="text-sm font-semibold text-white truncate">
                            {p.nombre}
                          </p>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <span className="text-xs text-neutral-500">
                            {p.unidadesvendidas} und.
                          </span>
                          <span className="text-sm font-black text-white">
                            ${p.ganancia.toLocaleString("es-CO")}
                          </span>
                        </div>
                      </div>
                      <div className="h-1.5 rounded-full bg-black/40 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-rose-500 to-orange-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </section>

        {/* CLIENTES QUE MÁS HAN COMPRADO */}
        <section>
          <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-rose-500" />
            Clientes que más han comprado
          </h2>

          <div className="flex items-center gap-2 bg-neutral-900/50 border border-neutral-800 rounded-2xl px-3 py-2.5 mb-4">
            <Search className="w-4 h-4 text-neutral-500 shrink-0" />
            <input
              type="text"
              value={busquedaCliente}
              onChange={(e) => setBusquedaCliente(e.target.value)}
              placeholder="Buscar por ID o nombre de usuario..."
              className="w-full bg-transparent outline-none text-sm text-white placeholder:text-neutral-500"
            />
          </div>

          {loadingClientes ? (
            <div className="flex flex-col items-center justify-center py-16 text-neutral-500">
              <div className="w-8 h-8 border-2 border-neutral-700 border-t-rose-500 rounded-full animate-spin mb-3" />
              <p className="text-sm">Cargando clientes...</p>
            </div>
          ) : errorClientes ? (
            <div className="flex flex-col items-center justify-center py-16 text-center bg-neutral-900/50 border border-neutral-800 rounded-2xl">
              <Inbox className="w-10 h-10 text-neutral-600 mb-3" />
              <p className="font-bold text-white mb-1">
                No se pudo cargar el resumen de clientes
              </p>
              <p className="text-sm text-neutral-500 mb-4">
                Revisa que el backend esté disponible.
              </p>
              <button
                onClick={loadClientes}
                className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-sm font-semibold"
              >
                Reintentar
              </button>
            </div>
          ) : clientesFiltrados.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center bg-neutral-900/50 border border-neutral-800 rounded-2xl">
              <Inbox className="w-10 h-10 text-neutral-600 mb-3" />
              <p className="font-bold text-white mb-1">Sin resultados</p>
              <p className="text-sm text-neutral-500">
                Ningún cliente coincide con tu búsqueda.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {clientesFiltrados.map((c) => {
                const esTop3 = c.rank <= 3;
                return (
                  <motion.div
                    layout
                    key={c.idusuario}
                    className={cn(
                      "flex items-center gap-3 p-4 rounded-2xl border bg-neutral-900/50",
                      esTop3 ? "border-rose-500/30" : "border-neutral-800",
                    )}
                  >
                    <span
                      className={cn(
                        "w-7 h-7 shrink-0 rounded-full flex items-center justify-center text-xs font-black",
                        esTop3
                          ? "bg-gradient-to-br from-rose-500 to-orange-500 text-white"
                          : "bg-neutral-800 text-neutral-400",
                      )}
                    >
                      {c.rank}
                    </span>

                    <div className="w-10 h-10 shrink-0 rounded-xl bg-neutral-800 border border-neutral-700 flex items-center justify-center font-black text-xs text-neutral-300">
                      {getIniciales(c.nombre)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-white truncate">
                        {c.nombre}
                      </p>
                      <p className="text-xs text-neutral-500 flex items-center gap-1 flex-wrap">
                        <Hash className="w-3 h-3" />
                        {c.idusuario}
                        <span className="mx-0.5">·</span>
                        {c.pedidos} pedido{c.pedidos === 1 ? "" : "s"}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <p className="font-black text-white">
                        ${c.totalgastado.toLocaleString("es-CO")}
                      </p>
                      <p className="text-[10px] text-neutral-500 flex items-center justify-end gap-1">
                        <Package className="w-3 h-3" />
                        {c.unidadescompradas} und.
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </section>
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

export default Resumen;
