export interface SessionUser {
  id: number;
  nombre: string;
  correo: string;
}

export interface SessionAdmin {
  id: number;
  nombre: string;
}

export interface Session {
  user: SessionUser | null;
  admin: SessionAdmin | null;
  csrfToken: string;
}

export interface Category {
  id: number;
  nombre: string;
}

export interface Family {
  id: number;
  nombre: string;
}

export interface Product {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  stock: number;
  imagen: string | null;
  marca: string | null;
  color: string | null;
  categoria: string | null;
}

export interface ProductDetail extends Product {
  idCategoria: number | null;
  familia: string | null;
  idFamilia: number | null;
  similares: Product[];
}

export interface ProductPage {
  items: Product[];
  page: number;
  pages: number;
  total: number;
}

export interface CartItem {
  id: number;
  nombre: string;
  precio: number;
  imagen: string | null;
  cantidad: number;
  stock: number;
  disponible: boolean;
  subtotal: number;
}

export interface Cart {
  items: CartItem[];
  total: number;
  count: number;
}

export interface Profile {
  id: number;
  rut: string;
  nombre: string;
  correo: string;
  telefono: string | null;
  direccion: string | null;
}

export type OrderStatus = 'pendiente' | 'pagado' | 'enviado' | 'entregado' | 'cancelado';
export type PaymentMethod = 'transferencia' | 'tarjeta' | 'efectivo';

export interface Order {
  id: number;
  total: number;
  estado: OrderStatus;
  fecha: string;
  metodoPago: PaymentMethod | null;
  productos?: number;
  direccionEnvio?: string | null;
  telefonoContacto?: string | null;
}

export interface OrderItem {
  id: number;
  nombre: string;
  imagen: string | null;
  cantidad: number;
  precio: number;
  subtotal: number;
}

export interface OrderDetail extends Order {
  items: OrderItem[];
}

// --- Administración ---

export interface Metrics {
  totalProductos: number;
  productosActivos: number;
  stockBajo: number;
  valorInventario: number;
  pedidosPendientes: number;
  ventasMes: number;
}

export interface AdminProduct {
  id: number;
  nombre: string;
  codigoBarras: string | null;
  imagen: string | null;
  precio: number;
  descripcion: string;
  marca: string | null;
  color: string | null;
  stock: number;
  estado: 'activo' | 'inactivo';
  fechaCreacion: string;
  idCategoria: number | null;
  categoria: string | null;
  idFamilia: number | null;
  familia: string | null;
}

export interface AdminOrder extends Order {
  cliente: string;
  correo: string;
}

export interface AdminOrderDetail extends AdminOrder {
  rut: string;
  items: OrderItem[];
}

export interface AdminCustomer extends Profile {
  pedidos: number;
}

export interface AdminCategory {
  id: number;
  nombre: string;
  fechaCreacion: string;
  productos: number;
  familias: number;
}

export interface AdminFamily {
  id: number;
  nombre: string;
  idCategoria: number;
  categoria: string;
  productos: number;
}
