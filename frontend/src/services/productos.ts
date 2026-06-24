import { http } from "./http";

export const getProductos = () =>
  http<Producto[]>("/productos");

export interface Producto {
  idproducto: number;
  nombre: string;
  precioventa: number;
}