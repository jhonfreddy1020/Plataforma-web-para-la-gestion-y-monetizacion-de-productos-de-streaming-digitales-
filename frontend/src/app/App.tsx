import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "../pages/inicio.tsx";
import Pago from "../pages/pago.tsx";
import Login from "../pages/login";
import RegisterForm from "../pages/RegisterForm";
import Admin from "../pages/admin";
import Private from "../pages/private.tsx";
import MisPedidos from "../pages/misPedidos.tsx";
import Perfil from "../pages/perfil.tsx";
import Resumen from "../pages/resumen.tsx";
import RestablecerClave from "../pages/RestablecerClave.tsx";
import RecuperarClave from "../pages/RecuperarClave.tsx";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/registro" element={<RegisterForm />} />
        <Route path="/inicio" element={<Home />} />
        <Route
          path="/pago/:pedidoId"
          element={
            <Private>
              <Pago />
            </Private>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
        <Route
          path="/admin"
          element={
            <Private>
              <Admin />
            </Private>
          }
        />
        <Route
          path="/mis-pedidos"
          element={
            <Private>
              <MisPedidos />
            </Private>
          }
        />
        <Route
          path="/perfil"
          element={
            <Private>
              <Perfil />
            </Private>
          }
        />
        <Route
          path="/resumen"
          element={
            <Private>
              <Resumen />
            </Private>
          }
        />
        <Route path="/recuperar" element={<RecuperarClave />} />
        <Route path="/restablecer/:token" element={<RestablecerClave />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
