import { Navigate } from "react-router-dom";

export default function Private({ children }: any) {
  const usuario = JSON.parse(localStorage.getItem("usuario") || "null");

  if (!usuario) {
    return <Navigate to="/" />;
  }

  return children;
}
