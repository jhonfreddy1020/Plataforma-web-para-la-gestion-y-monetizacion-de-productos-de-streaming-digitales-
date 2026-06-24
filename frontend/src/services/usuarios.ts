import { http } from "./http";

export const getUsuario = (id: number) =>
  http<Usuario>(`/api/usuarios/${id}`);

export const updateUsuario = (id: number, data: Partial<Usuario>) =>
  http<Usuario>(`/api/usuarios/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

export interface Usuario {
  id: number;
  nombre: string;
  email: string;
  celular: string;
}
