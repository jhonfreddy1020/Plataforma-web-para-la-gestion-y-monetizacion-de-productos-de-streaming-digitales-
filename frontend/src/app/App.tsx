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
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

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

export default function App() {
  const carouselRef = React.useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState("home");
  const [activeFilter, setActiveFilter] = useState("all");
  const [platforms, setPlatforms] = useState<any[]>([]);
  const categories = [
    { id: "all", label: "Todo" },

    ...Array.from(new Set(platforms.map((p) => p.tipo))).map((tipo) => ({
      id: tipo,
      label: typeMap[tipo]?.label || "Otro",
      icon: typeMap[tipo]?.icon || Smartphone,
    })),
  ];
  const [cart, setCart] = useState<number[]>([]);
  const [timeLeft, setTimeLeft] = useState({ h: 2, m: 45, s: 12 });

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

  const toggleCart = (id: number) => {
    setCart((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
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

  const filteredPlatforms = platforms.filter((p: any) => {
    if (activeFilter === "all") return true;

    return getCategory(p.tipo) === activeFilter;
  });

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
        <div className="w-9 h-9 rounded-full bg-neutral-800 border-2 border-neutral-700 pointer-events-auto flex items-center justify-center overflow-hidden">
          <User className="w-5 h-5 text-neutral-400" />
        </div>
      </header>

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
                    onClick={() => setActiveFilter(cat.id)}
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
            <AnimatePresence>
              <div
                ref={carouselRef}
                className="flex gap-4 overflow-x-auto pb-8 pt-2 snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              >
                {filteredPlatforms.map((platform, idx) => {
                  const descuento = 20;

                  const precioFull =
                    platform.precioventa +
                    (platform.precioventa * descuento) / 100;
                  const inCart = cart.includes(platform.idproducto);

                  return (
                    <motion.div
                      layout
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
                          inCart
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

                        {/* Tags
                        <div className="relative z-10 flex justify-between items-start mb-6">
                          <div
                            className={cn(
                              "w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl shadow-lg bg-gradient-to-br",
                              getGradient(platform.tipo),
                            )}
                          >
                            {getLogo(platform.nombre)}
                          </div>

                          {platform.tag && (
                            <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-white/10 backdrop-blur-md text-white border border-white/20">
                              {platform.tag}
                            </span>
                          )}
                        </div>*/}

                        {/* Content */}
                        <div className="relative z-10">
                          <h3 className="font-bold text-xl text-white mb-1">
                            {platform.nombre}
                          </h3>
                          {/*<div className="flex items-center gap-1.5 text-xs text-neutral-400 mb-4">
                            <Smartphone className="w-3.5 h-3.5" />
                            {platform.devices}
                          </div>*/}

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
                          <button
                            onClick={() => toggleCart(platform.idproducto)}
                            className={cn(
                              "w-full py-3.5 rounded-xl font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2",
                              inCart
                                ? "bg-rose-500 text-white"
                                : "bg-white text-black hover:bg-neutral-200",
                            )}
                          >
                            {inCart ? (
                              <>
                                <CheckCircle2 className="w-5 h-5" />
                                Añadido al Carrito
                              </>
                            ) : (
                              <>
                                Lo Quiero Ahora
                                <ChevronRight className="w-4 h-4" />
                              </>
                            )}
                          </button>
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
      <AnimatePresence>
        {cart.length > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-24 left-0 w-full px-5 z-40 md:hidden"
          >
            <div className="w-full max-w-lg mx-auto bg-gradient-to-r from-rose-500 to-orange-500 rounded-2xl p-1 shadow-[0_10px_40px_rgba(244,63,94,0.4)]">
              <button className="w-full bg-black/20 backdrop-blur-md rounded-xl p-4 flex items-center justify-between active:scale-[0.98] transition-transform">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <ShoppingBag className="w-6 h-6 text-white" />
                    <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-white text-black text-xs font-bold flex items-center justify-center">
                      {cart.length}
                    </span>
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-sm text-white leading-tight">
                      Completar Compra
                    </p>
                    <p className="text-xs text-rose-100/80">
                      Estás ahorrando +50%
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-black text-lg text-white">
                    $
                    {cart
                      .reduce((acc, id) => {
                        const p = platforms.find(
                          (pl: any) => pl.idproducto === id,
                        );

                        return acc + (p?.precioventa || 0);
                      }, 0)
                      .toLocaleString("es-CO")}
                  </span>
                  <ChevronRight className="w-5 h-5 text-white/70" />
                </div>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* BOTTOM NAVIGATION - Keeps user grounded */}
      <nav className="fixed bottom-0 w-full z-50 bg-[#09090b]/90 backdrop-blur-2xl border-t border-neutral-800/80 pb-safe pt-2 px-6 pb-4">
        <div className="max-w-md mx-auto flex justify-between items-center">
          {[
            { id: "home", icon: Home, label: "Inicio" },
            { id: "search", icon: Search, label: "Buscar" },
            { id: "orders", icon: ShoppingBag, label: "Mis Pedidos" },
            { id: "profile", icon: User, label: "Perfil" },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="flex flex-col items-center gap-1.5 min-w-[64px] group relative py-1"
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
