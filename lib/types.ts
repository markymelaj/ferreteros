export type StockEstado = 'disponible' | 'bajo_stock' | 'sin_stock' | 'consultar';
export type ProductTipo = 'producto' | 'arido';
export type UbicacionTipo = 'direccion' | 'gps' | 'referencia';

export interface Category {
  id: string;
  slug: string;
  nombre: string;
  icono: string | null;
  orden: number;
  activo: boolean;
}

export interface Product {
  id: string;
  sku: string | null;
  slug: string;
  nombre: string;
  descripcion: string | null;
  categoria_id: string | null;
  precio: number;
  precio_oferta: number | null;
  unidad: string;
  stock_estado: StockEstado;
  destacado: boolean;
  activo: boolean;
  tipo: ProductTipo;
  imagen_url: string | null;
  categoria?: Category;
}

export interface Maquinaria {
  id: string;
  slug: string;
  nombre: string;
  descripcion: string | null;
  tarifa_dia: number;
  tarifa_semana: number | null;
  tarifa_mes: number | null;
  garantia: number;
  requisitos: string | null;
  imagen_url: string | null;
  activo: boolean;
}

export interface Settings {
  id: number;
  nombre_ferreteria: string;
  descripcion_seo: string;
  telefono_whatsapp: string;
  email: string;
  direccion_fisica: string;
  horarios: string;
  comunas_despacho: string[];
  iva_pct: number;
  costo_despacho_base: number;
}

export interface CartItem {
  id: string;
  slug: string;
  nombre: string;
  precio: number;
  unidad: string;
  cantidad: number;
  imagen_url: string | null;
  tipo: ProductTipo;
}

export interface Presupuesto {
  id: string;
  fecha: string;
  items: CartItem[];
  subtotal: number;
  iva: number;
  total: number;
  cliente_nombre: string | null;
  cliente_telefono: string | null;
  cliente_email: string | null;
  comuna: string | null;
  direccion_despacho: string | null;
  observaciones: string | null;
  estado: 'enviado' | 'contactado' | 'vendido' | 'perdido';
  lat: number | null;
  lng: number | null;
  ubicacion_tipo: UbicacionTipo;
}
