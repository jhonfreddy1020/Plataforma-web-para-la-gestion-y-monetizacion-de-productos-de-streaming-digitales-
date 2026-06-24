import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  MonitorPlay,
  Smartphone,
  Tv,
  Music,
  Gamepad2,
  Search,
  Home,
  ShoppingBag,
  User,
  Zap,
  CheckCircle2,
  ShieldCheck,
  Clock,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  LayoutDashboard,
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { useNavigate } from "react-router-dom";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Data structures
const typeMap: any = {
  0: { label: "Streaming", icon: Tv },
  1: { label: "Música", icon: Music },
  2: { label: "Gaming", icon: Gamepad2 },
  3: { label: "Deportes", icon: Zap },
  4: { label: "IA", icon: Sparkles },
  5: { label: "Oficina", icon: MonitorPlay },
  6: { label: "Otro", icon: Smartphone },
};

function Inicio() {
  const carouselRef = React.useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState("home");
  const [activeFilter, setActiveFilter] = useState<string | number>("all");
  const [platforms, setPlatforms] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [adminView, setAdminView] = useState<"active" | "inactive">("active");
  const categories = [
    { id: "all", label: "Todo" },
    ...Array.from(new Set(platforms.map((p) => p.tipo))).map((tipo) => ({
      id: tipo, // siempre numérico
      label: typeMap[tipo]?.label || "Otro",
    })),
  ];
  const API = "http://localhost:3000";
  const navigate = useNavigate();

  const cerrarSesion = () => {
    localStorage.removeItem("usuario");

    window.location.href = "/";
  };

  const [cart, setCart] = useState<any[]>([]);

  const [timeLeft, setTimeLeft] = useState({ h: 2, m: 45, s: 12 });

  useEffect(() => {
    const usuario = localStorage.getItem("usuario");

    if (!usuario) {
      navigate("/");
    }
  }, []);

  //Validacion de rol
  const user = JSON.parse(localStorage.getItem("usuario") || "{}");
  const isAdmin = user.rol === 0;

  //useEffect → PRODUCTOS
  useEffect(() => {
    fetch("http://localhost:3000/productos")
      .then((res) => res.json())
      .then((data) => {
        setPlatforms(data);
      })
      .catch((error) => {
        console.error("Error cargando productos:", error);
      });
  }, []);

  const usuario = JSON.parse(localStorage.getItem("usuario") || "{}");

  const idUsuario = usuario.id;

  const loadCart = async () => {
    try {
      const response = await fetch(
        `http://localhost:3000/carrito/${idUsuario}`,
      );

      const data = await response.json();

      setCart(data);
    } catch (error) {
      console.error("Error cargando carrito:", error);
    }
  };

  useEffect(() => {
    loadCart();
  }, []);

  //useEffect → TIMER
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        let { h, m, s } = prev;

        if (s > 0) s--;
        else if (m > 0) {
          s = 59;
          m--;
        } else if (h > 0) {
          s = 59;
          m = 59;
          h--;
        }

        return { h, m, s };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {}, [adminView]);

  const addToCart = async (idProducto: number) => {
    try {
      await fetch("http://localhost:3000/carrito/agregar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          idUsuario,
          idProducto,
        }),
      });

      // RECARGAR CARRITO
      loadCart();
    } catch (error) {
      console.error("Error agregando:", error);
    }
  };

  const removeFromCart = async (idProducto: number) => {
    try {
      await fetch("http://localhost:3000/carrito/restar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          idUsuario,
          idProducto,
        }),
      });

      // RECARGAR
      loadCart();
    } catch (error) {
      console.error("Error restando:", error);
    }
  };

  const deleteFromCart = async (idProducto: number) => {
    try {
      await fetch("http://localhost:3000/carrito/eliminar", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          idUsuario,
          idProducto,
        }),
      });

      loadCart();
    } catch (error) {
      console.error(error);
    }
  };

  const clearCart = async () => {
    const confirmacion = window.confirm(
      "Se eliminarán todos los productos de tu pedido",
    );

    if (!confirmacion) return;

    const segundaConfirmacion = window.confirm(
      "¿Seguro que deseas vaciar el carrito?",
    );

    if (!segundaConfirmacion) return;

    try {
      await fetch("http://localhost:3000/carrito/vaciar", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          idUsuario,
        }),
      });

      loadCart();
    } catch (error) {
      console.error(error);
    }
  };

  const scrollLeft = () => {
    carouselRef.current?.scrollBy({
      left: -300,
      behavior: "smooth",
    });
  };

  const scrollRight = () => {
    carouselRef.current?.scrollBy({
      left: 300,
      behavior: "smooth",
    });
  };

  const getCategory = (tipo: number) => {
    return typeMap[tipo]?.label || "Otro";
  };

  const handleDelete = async (id: number) => {
    const confirm = window.confirm("¿Desactivar este producto?");
    if (!confirm) return;

    try {
      await fetch(`${API}/productos/${id}`, {
        method: "DELETE",
      });

      // recargar productos
      const res = await fetch(`${API}/productos`);
      const data = await res.json();
      setPlatforms(data);
    } catch (error) {
      console.error(error);
    }
  };

  const validate = () => {
    const newErrors: any = {};

    if (!form.nombre.trim()) {
      newErrors.nombre = "El nombre es obligatorio";
    }

    if (!form.preciocompra.toString().trim()) {
      newErrors.preciocompra = "Requerido";
    }

    if (!form.precioventa.toString().trim()) {
      newErrors.precioventa = "Requerido";
    }

    if (Number(form.precioventa) < Number(form.preciocompra)) {
      newErrors.precioventa = "Debe ser mayor que el precio de compra";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  //MODAL CRUD
  const [form, setForm] = useState({
    nombre: "",
    preciocompra: "",
    precioventa: "",
    disponible: true,
    tipo: 0,
  });

  const [errors, setErrors] = useState<any>({});

  const openCreateModal = () => {
    setEditingProduct(null);
    setForm({
      nombre: "",
      preciocompra: "",
      precioventa: "",
      disponible: true,
      tipo: 0,
    });
    setShowProductModal(true);
  };

  //Validacion en tiempo real
  const handleChange = (e: any) => {
    const { name, value } = e.target;

    if (name === "preciocompra" || name === "precioventa") {
      if (value !== "" && !/^\d+$/.test(value)) return;
    }

    setForm({
      ...form,
      [name]: value, // SIEMPRE string
    });
  };

  const handleEdit = (product: any) => {
    setEditingProduct(product);

    setForm({
      nombre: product.nombre,
      preciocompra: product.preciocompra,
      precioventa: product.precioventa,
      disponible: product.disponible ?? true,
      tipo: product.tipo,
    });

    setShowProductModal(true);
  };

  const handleSaveProduct = async () => {
    if (!validate()) return;

    const payload = {
      nombre: form.nombre.trim(),
      preciocompra: Number(form.preciocompra),
      precioventa: Number(form.precioventa),
      disponible: form.disponible ?? true,
      tipo: Number(form.tipo),
    };

    const url = editingProduct
      ? `${API}/productos/${editingProduct.idproducto}`
      : `${API}/productos`;

    const method = editingProduct ? "PUT" : "POST";

    await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    setShowProductModal(false);

    const res = await fetch(`${API}/productos`);
    const data = await res.json();
    setPlatforms(data);
  };

  const isAvailable = (p: any) =>
    String(p.disponible) === "true" ||
    p.disponible == 1 ||
    p.disponible === true;

  const toggleDisponible = async (product: any) => {
    await fetch(`${API}/productos/${product.idproducto}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...product,
        disponible: !product.disponible,
      }),
    });

    const res = await fetch(`${API}/productos`);
    const data = await res.json();
    setPlatforms(data);
  };

  const filteredPlatforms = platforms.filter((p) => {
    const matchesCategory = activeFilter === "all" || p.tipo === activeFilter;

    const matchesSearch = p.nombre
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    return matchesCategory && matchesSearch && isAvailable(p);
  });

  const adminFilteredPlatforms = platforms.filter((p) => {
    const matchesCategory = activeFilter === "all" || p.tipo === activeFilter;

    const matchesSearch = p.nombre
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    const matchesAvailability =
      adminView === "active" ? isAvailable(p) : !isAvailable(p);

    return matchesCategory && matchesSearch && matchesAvailability;
  });

  const dataToShow = isAdmin ? adminFilteredPlatforms : filteredPlatforms;

  const getGradient = (tipo: number) => {
    switch (tipo) {
      case 0:
        return "from-red-600 to-red-900";

      case 1:
        return "from-green-500 to-emerald-900";

      case 2:
        return "from-green-600 to-black";

      case 3:
        return "from-blue-500 to-cyan-900";

      case 4:
        return "from-purple-600 to-purple-900";

      case 5:
        return "from-orange-500 to-yellow-700";

      default:
        return "from-zinc-600 to-zinc-900";
    }
  };

  const getLogo = (nombre: string) => {
    return nombre.substring(0, 2).toUpperCase();
  };

  const handleComprar = async () => {
    try {
      const res = await fetch("http://localhost:3000/api/pedidos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idUsuario }),
      });

      if (!res.ok) {
        throw new Error("No se pudo crear el pedido");
      }

      const pedido = await res.json();
      const idPedido = pedido.idPedido;

      if (!idPedido) {
        alert("Pedido creado, pero no se recibió el ID del pedido.");
        return;
      }

      window.open(`/pago/${idPedido}`, "_blank");
    } catch (err) {
      console.error("Error creando pedido:", err);
      alert("No se pudo crear el pedido. Revisa el backend o la consola.");
    }
  };

  return (
    <div className="bg-[#09090b] text-white min-h-screen font-sans overflow-x-hidden selection:bg-rose-500/30">
      {/* MINIMAL BRAND HEADER */}
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
            className="
      w-10 h-10
      rounded-full
      bg-neutral-800
      border-2 border-neutral-700
      flex items-center justify-center
    "
          >
            <User className="w-5 h-5 text-neutral-400" />
          </button>

          {showUserMenu && (
            <div
              className="
        absolute
        right-0
        top-12
        w-44
        bg-neutral-900
        border
        border-neutral-700
        rounded-xl
        shadow-xl
        overflow-hidden
        z-50
      "
            >
              <button
                onClick={() => navigate("/perfil")}
                className="
          w-full
          px-4 py-3
          text-left
          hover:bg-neutral-800
        "
              >
                Mi perfil
              </button>

              <button
                onClick={cerrarSesion}
                className="
          w-full
          px-4 py-3
          text-left
          text-red-500
          hover:bg-neutral-800
        "
              >
                Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </header>

      <AnimatePresence>
        {showSearch && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 left-0 w-full z-50 px-5"
          >
            <div className="max-w-lg mx-auto bg-neutral-900 border border-neutral-700 rounded-2xl p-3 shadow-2xl">
              {/* INPUT */}
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

              {/* RESULTADOS */}
              {searchTerm.length > 0 && (
                <div className="mt-3 max-h-60 overflow-y-auto">
                  {filteredPlatforms.length > 0 ? (
                    dataToShow.map((platform) => {
                      const cartItem = cart.find(
                        (item) => item.idproducto === platform.idproducto,
                      );

                      const cantidad = cartItem?.cantidad || 0;

                      return (
                        <button
                          key={platform.idproducto}
                          onClick={() => {
                            setSearchTerm(platform.nombre);
                          }}
                          className="w-full text-left px-3 py-2 rounded-xl hover:bg-neutral-800 transition"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-semibold text-white">
                                {platform.nombre}
                              </p>

                              <p className="text-sm text-neutral-400">
                                ${platform.precioventa.toLocaleString("es-CO")}
                              </p>
                            </div>

                            {cantidad > 0 && (
                              <div className="bg-rose-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                                {cantidad} en carrito
                              </div>
                            )}
                          </div>
                        </button>
                      );
                    })
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

      {/* MODAL CARRITO */}
      <AnimatePresence>
        {showCart && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="
        fixed
        inset-0
        z-[100]
        bg-black/60
        backdrop-blur-sm
        flex
        items-end
        md:items-center
        justify-center
      "
          >
            <motion.div
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              exit={{ y: 100 }}
              transition={{ duration: 0.25 }}
              className="
          w-full
          md:max-w-md
          h-[90vh]
          md:h-[85vh]
          bg-[#111]
          rounded-t-3xl
          md:rounded-3xl
          border
          border-zinc-800
          flex
          flex-col
          overflow-hidden
        "
            >
              {/* HEADER */}
              <div className="flex items-center justify-between p-5 border-b border-zinc-800 shrink-0">
                <h2 className="text-2xl font-black text-white">Mi Carrito</h2>

                <button
                  onClick={() => setShowCart(false)}
                  className="
              w-10
              h-10
              rounded-full
              bg-zinc-800
              hover:bg-zinc-700
              text-white
            "
                >
                  ✕
                </button>
              </div>

              {/* PRODUCTOS */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {cart.map((item) => (
                  <div
                    key={item.iditem}
                    className="
                bg-zinc-900
                rounded-2xl
                p-4
                flex
                items-center
                gap-4
              "
                  >
                    <div className="flex-1">
                      <h3 className="font-bold text-white">{item.nombre}</h3>

                      <p className="text-zinc-400">
                        ${item.preciounitario?.toLocaleString("es-CO")}
                      </p>
                    </div>

                    {/* CONTROLES */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => removeFromCart(item.idproducto)}
                        className="
                    w-9
                    h-9
                    rounded-full
                    bg-zinc-800
                    text-white
                  "
                      >
                        -
                      </button>

                      <span className="font-bold text-white w-5 text-center">
                        {item.cantidad}
                      </span>

                      <button
                        onClick={() => addToCart(item.idproducto)}
                        className="
                    w-9
                    h-9
                    rounded-full
                    bg-white
                    text-black
                  "
                      >
                        +
                      </button>

                      <button
                        onClick={() => deleteFromCart(item.idproducto)}
                        className="
                    ml-2
                    w-9
                    h-9
                    rounded-full
                    bg-rose-500/20
                    text-rose-400
                  "
                      >
                        🗑
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* FOOTER */}
              <div className="border-t border-zinc-800 p-5 shrink-0">
                <div className="flex justify-between mb-4">
                  <span className="text-lg font-bold text-white">Total</span>

                  <span className="text-2xl font-black text-white">
                    $
                    {cart
                      .reduce((acc, item) => acc + item.subtotal, 0)
                      .toLocaleString("es-CO")}
                  </span>
                </div>

                <button
                  className="
              w-full
              py-4
              rounded-2xl
              bg-gradient-to-r
              from-rose-500
              to-orange-500
              font-black
              text-lg
              text-white
              mb-3
            "
                  onClick={handleComprar}
                >
                  Comprar
                </button>

                <button
                  onClick={clearCart}
                  className="
              w-full
              py-4
              rounded-2xl
              bg-zinc-800
              hover:bg-zinc-700
              text-rose-400
              font-bold
            "
                >
                  Vaciar carrito
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="pb-32">
        {/* HERO SECTION - Vibrant & Urgency Driven */}
        <section className="relative w-full pt-24 pb-10 px-5">
          {/* Background Glows */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[40vh] bg-rose-500/10 blur-[100px] pointer-events-none" />
          <div className="absolute top-20 right-0 w-[40vw] h-[40vw] bg-purple-500/10 blur-[80px] pointer-events-none rounded-full" />

          <div className="relative z-10 max-w-lg mx-auto md:max-w-4xl">
            {/* Urgency Badge */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 mb-6 rounded-full bg-rose-500/10 border border-rose-500/30 backdrop-blur-md"
            >
              <Zap className="w-4 h-4 text-rose-500 fill-rose-500 animate-pulse" />
              <span className="text-rose-400 text-xs font-bold uppercase tracking-wider">
                Venta Relámpago Termina en:{" "}
                {String(timeLeft.h).padStart(2, "0")}:
                {String(timeLeft.m).padStart(2, "0")}:
                {String(timeLeft.s).padStart(2, "0")}
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-6xl font-black mb-4 leading-[1.1] tracking-tight"
            >
              Todo tu entretenimiento.
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-fuchsia-400 to-indigo-400">
                Aquí en Digital Juanex
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-neutral-400 text-base mb-6 max-w-sm"
            >
              Accede a Netflix, Disney+, Max y más desde{" "}
              <span className="text-white font-bold">$5.000/mes</span>. Entrega
              rápida y garantía total.
            </motion.p>

            {/* Trust Indicators */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap gap-4 mb-8"
            >
              <div className="flex items-center gap-1.5 text-xs text-neutral-300">
                <CheckCircle2 className="w-4 h-4 text-green-500" /> Pantallas
                Personales
              </div>
              <div className="flex items-center gap-1.5 text-xs text-neutral-300">
                <span className="text-base leading-none">🇨🇴</span> Pesos
                Colombianos
              </div>
              <div className="flex items-center gap-1.5 text-xs text-neutral-300">
                <ShieldCheck className="w-4 h-4 text-green-500" /> 100% Seguro
              </div>
            </motion.div>
          </div>
        </section>

        {/* DYNAMIC CATALOGUE - Thumb Reachable */}
        <section className="w-full max-w-lg mx-auto md:max-w-4xl relative z-20">
          {/* Sticky Filters */}
          <div className="px-5 mb-5 sticky top-16 z-30 pt-2 pb-2 backdrop-blur-xl bg-[#09090b]/80 -mx-5 px-5">
            <h2 className="text-xl font-bold mb-3 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-yellow-500" />
              Catálogo Premium
            </h2>

            {/* Scrollable Filter Pills */}
            <div className="flex gap-2.5 overflow-x-auto pb-2 snap-x [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {categories.map((cat) => {
                const Icon = cat.icon;
                const isActive = activeFilter === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() =>
                      setActiveFilter(cat.id === "all" ? "all" : Number(cat.id))
                    }
                    className={cn(
                      "snap-start shrink-0 px-4 py-2.5 rounded-full text-sm font-semibold flex items-center gap-2 transition-all duration-300",
                      isActive
                        ? "bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.2)]"
                        : "bg-neutral-800/80 text-neutral-400 hover:bg-neutral-700 hover:text-white",
                    )}
                  >
                    {Icon && <Icon className="w-4 h-4" />}
                    {cat.label}
                  </button>
                );
              })}
            </div>
            {isAdmin && (
              <button
                onClick={openCreateModal}
                className="px-4 py-2 mb-4 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold"
              >
                + Nuevo Producto
              </button>
            )}
            {isAdmin && (
              <div className="flex gap-2 mb-3">
                <button
                  onClick={() => setAdminView("active")}
                  className={`px-3 py-1 rounded-lg text-xs ${
                    adminView === "active"
                      ? "bg-green-600 text-white"
                      : "bg-neutral-800"
                  }`}
                >
                  Activos
                </button>

                <button
                  onClick={() => {
                    setAdminView("inactive");
                  }}
                  className={`px-3 py-1 rounded-lg text-xs ${
                    adminView === "inactive"
                      ? "bg-red-600 text-white"
                      : "bg-neutral-800"
                  }`}
                >
                  Inactivos
                </button>
              </div>
            )}
          </div>

          {/* Product Cards Carousel */}
          <div className="flex justify-end gap-2 px-5 mb-4">
            <button
              onClick={scrollLeft}
              className="w-10 h-10 rounded-full bg-neutral-800 hover:bg-neutral-700 flex items-center justify-center"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <button
              onClick={scrollRight}
              className="w-10 h-10 rounded-full bg-neutral-800 hover:bg-neutral-700 flex items-center justify-center"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          <div className="px-5">
            <AnimatePresence mode="wait">
              <div
                ref={carouselRef}
                className="flex gap-4 overflow-x-auto pb-8 pt-2 snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              >
                {dataToShow.map((platform, idx) => {
                  const descuento = 20;

                  const precioFull =
                    platform.precioventa +
                    (platform.precioventa * descuento) / 100;

                  const cartItem = cart.find(
                    (item) => item.idproducto === platform.idproducto,
                  );

                  const cantidad = cartItem?.cantidad || 0;

                  const inCart = cantidad > 0;

                  return (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.3, delay: idx * 0.05 }}
                      key={platform.idproducto}
                      className="min-w-[260px] md:min-w-[300px] snap-center shrink-0"
                    >
                      {/* Card Container */}
                      <div
                        className={cn(
                          "relative p-5 rounded-3xl overflow-hidden border transition-all duration-300",
                          cartItem
                            ? "border-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.2)]"
                            : "border-neutral-800 bg-neutral-900/50",
                        )}
                      >
                        {/* Background Gradient */}
                        <div
                          className={cn(
                            "absolute inset-0 opacity-20 bg-gradient-to-br",
                            getGradient(platform.tipo),
                          )}
                        />

                        {/* Content */}
                        <div className="relative z-10">
                          <h3 className="font-bold text-xl text-white mb-1">
                            {platform.nombre}
                          </h3>

                          {/* Pricing Area - Highly visible */}
                          <div className="flex items-end gap-3 mb-5 p-3 rounded-2xl bg-black/40 border border-white/5">
                            <div>
                              <p className="text-[10px] text-neutral-500 uppercase font-bold tracking-wider mb-0.5">
                                Precio Hoy
                              </p>
                              <div className="flex items-baseline gap-2">
                                <span className="text-2xl font-black text-white">
                                  $
                                  {platform.precioventa.toLocaleString("es-CO")}
                                </span>
                                <span className="text-sm font-medium text-neutral-500 line-through">
                                  ${precioFull.toLocaleString("es-CO")}
                                </span>
                              </div>
                            </div>
                            <div className="ml-auto bg-green-500/20 text-green-400 px-2 py-1 rounded text-xs font-bold border border-green-500/30">
                              -{descuento}%
                            </div>
                          </div>

                          {/* Action Button */}
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-3 w-full">
                              {inCart ? (
                                <>
                                  <button
                                    onClick={() =>
                                      removeFromCart(platform.idproducto)
                                    }
                                    className="w-12 h-12 rounded-xl bg-neutral-800 text-white text-2xl font-bold hover:bg-neutral-700 transition"
                                  >
                                    -
                                  </button>

                                  <motion.div
                                    layout
                                    className="flex-1 py-3 rounded-xl bg-rose-500 text-center font-bold"
                                  >
                                    {cantidad} en carrito
                                  </motion.div>

                                  <button
                                    onClick={() =>
                                      addToCart(platform.idproducto)
                                    }
                                    className="w-12 h-12 rounded-xl bg-white text-black text-2xl font-bold hover:bg-neutral-200 transition"
                                  >
                                    +
                                  </button>
                                </>
                              ) : (
                                <motion.button
                                  layout
                                  whileTap={{ scale: 0.96 }}
                                  onClick={() => addToCart(platform.idproducto)}
                                  className="w-full py-3.5 rounded-xl font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 bg-white text-black hover:bg-neutral-200"
                                >
                                  Lo Quiero Ahora
                                  <ChevronRight className="w-4 h-4" />
                                </motion.button>
                              )}
                            </div>
                          </div>
                          {isAdmin && (
                            <div className="flex gap-2 mb-3">
                              <button
                                onClick={() => handleEdit(platform)}
                                className="px-3 py-1 text-xs rounded-lg bg-blue-600 text-white"
                              >
                                Editar
                              </button>

                              {isAvailable(platform) ? (
                                <button
                                  onClick={() =>
                                    handleDelete(platform.idproducto)
                                  }
                                  className="px-3 py-1 text-xs rounded-lg bg-red-600 text-white"
                                >
                                  Desactivar
                                </button>
                              ) : (
                                <button
                                  onClick={() => toggleDisponible(platform)}
                                  className="px-3 py-1 text-xs rounded-lg bg-green-600 text-white"
                                >
                                  Activar
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </AnimatePresence>
          </div>
        </section>

        {/* VALUE PROPOSITION - Quick Trust Building */}
        <section className="px-5 mt-6 max-w-lg mx-auto md:max-w-4xl">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-4 flex flex-col items-center text-center">
              <Clock className="w-8 h-8 text-indigo-400 mb-2" />
              <h4 className="font-bold text-sm mb-1">Entregas Rápidas</h4>
              <p className="text-[11px] text-neutral-400 leading-tight">
                Recibe tus credenciales por email y WhatsApp.
              </p>
            </div>
            <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-4 flex flex-col items-center text-center">
              <ShieldCheck className="w-8 h-8 text-emerald-400 mb-2" />
              <h4 className="font-bold text-sm mb-1">Garantía Total</h4>
              <p className="text-[11px] text-neutral-400 leading-tight">
                Soporte técnico 24/7 y garantía de reposición si algo falla.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* STRATEGIC FLOATING CART - The ultimate Call to Action */}
      {/* BOTÓN FLOTANTE */}
      <AnimatePresence>
        {cart.length > 0 && !showCart && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-24 left-0 w-full px-5 z-40"
          >
            <div className="max-w-lg mx-auto">
              <button
                onClick={() => setShowCart(true)}
                className="
            w-full
            bg-gradient-to-r
            from-rose-500
            to-orange-500
            rounded-2xl
            p-4
            flex
            items-center
            justify-between
            shadow-[0_10px_40px_rgba(244,63,94,0.4)]
          "
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <ShoppingBag className="w-6 h-6 text-white" />

                    <span
                      className="
                  absolute
                  -top-2
                  -right-2
                  w-5
                  h-5
                  rounded-full
                  bg-white
                  text-black
                  text-xs
                  font-bold
                  flex
                  items-center
                  justify-center
                "
                    >
                      {cart.reduce((acc, item) => acc + item.cantidad, 0)}
                    </span>
                  </div>

                  <div className="text-left">
                    <p className="font-bold text-white">Mi Carrito</p>

                    <p className="text-xs text-rose-100">
                      Toca para ver pedido
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-black text-xl text-white">
                    $
                    {cart
                      .reduce((acc, item) => acc + item.subtotal, 0)
                      .toLocaleString("es-CO")}
                  </span>

                  <ChevronRight className="w-5 h-5 text-white" />
                </div>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showProductModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/60 flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="w-full max-w-md bg-[#111] border border-neutral-800 rounded-2xl p-6"
            >
              <h2 className="text-xl font-black mb-4">
                {editingProduct ? "Editar Producto" : "Nuevo Producto"}
              </h2>

              {/* FORM */}
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-neutral-400">
                    Nombre del producto
                  </label>
                  <input
                    name="nombre"
                    value={form.nombre}
                    onChange={handleChange}
                    className="w-full mt-1 p-3 rounded-xl bg-neutral-900 border border-neutral-700"
                    placeholder="Ej: Netflix Premium"
                  />
                  {errors.nombre && (
                    <p className="text-red-400 text-xs mt-1">{errors.nombre}</p>
                  )}
                </div>
                <div>
                  <label className="text-sm text-neutral-400">
                    Precio de compra
                  </label>
                  <input
                    name="preciocompra"
                    value={form.preciocompra}
                    onChange={handleChange}
                    inputMode="numeric"
                    className="w-full mt-1 p-3 rounded-xl bg-neutral-900 border border-neutral-700"
                    placeholder="Ej: 9000"
                  />
                </div>
                <div>
                  <label className="text-sm text-neutral-400">
                    Precio de venta
                  </label>
                  <input
                    name="precioventa"
                    value={form.precioventa}
                    onChange={handleChange}
                    inputMode="numeric"
                    className="w-full mt-1 p-3 rounded-xl bg-neutral-900 border border-neutral-700"
                    placeholder="Ej: 15000"
                  />
                </div>
                <div>
                  <label className="text-sm text-neutral-400">
                    Tipo de producto
                  </label>
                  <select
                    name="tipo"
                    value={form.tipo}
                    onChange={handleChange}
                    className="w-full mt-1 p-3 rounded-xl bg-neutral-900 border border-neutral-700"
                  >
                    <option value={0}>Streaming</option>
                    <option value={1}>Música</option>
                    <option value={2}>Gaming</option>
                    <option value={3}>Deportes</option>
                    <option value={4}>IA</option>
                    <option value={5}>Oficina</option>
                    <option value={6}>Otro</option>
                  </select>
                </div>
              </div>

              {/* ACTIONS */}
              <div className="flex gap-2 mt-5">
                <button
                  onClick={() => setShowProductModal(false)}
                  className="flex-1 p-3 rounded-lg bg-neutral-800"
                >
                  Cancelar
                </button>

                <button
                  onClick={handleSaveProduct}
                  className="flex-1 p-3 rounded-lg bg-rose-500 text-white font-bold"
                >
                  Guardar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* BOTTOM NAVIGATION - Keeps user grounded */}
      <nav className="fixed bottom-0 w-full z-50 bg-[#09090b]/90 backdrop-blur-2xl border-t border-neutral-800/80 pb-safe pt-2 px-6 pb-4">
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
                // 👇 Ajustamos dinámicamente el ancho mínimo si hay 5 elementos en vez de 4
                className={cn(
                  "flex flex-col items-center gap-1.5 group relative py-1",
                  isAdmin ? "min-w-[52px]" : "min-w-[64px]",
                )}
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

export default Inicio;
