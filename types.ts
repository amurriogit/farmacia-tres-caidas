
export enum UserRole {
  ADMIN = 'ADMIN',
  PHARMACIST = 'PHARMACIST',
  CASHIER = 'CASHIER'
}

export enum MovementType {
  IN = 'INGRESO',
  OUT = 'SALIDA',
  SALE = 'VENTA',
  ADJUSTMENT = 'AJUSTE'
}

export interface User {
  id: string;
  name: string;
  lastName: string; // Mapped to last_name in DB
  documentId: string; // Mapped to document_id in DB
  username: string;
  password?: string;
  role: UserRole;
  permissions: string[];
  allowedModules: string[]; // Mapped to allowed_modules
  active: boolean;
}

export interface Product {
  id: string;
  name: string;
  form: string;
  content: string;
  line: string;
  price: number;
  cost: number;
  quantity: number;
  batch: string;
  expiryDate: string; // mapped to expiry_date
  location: string;
  barcode: string;
  minStock: number; // mapped to min_stock
  maxStock: number; // mapped to max_stock
}

export interface CartItem extends Product {
  saleQuantity: number;
  subtotal: number;
}

export interface Client {
  name: string;
  lastName: string;
  documentId: string;
  nit?: string;
}

export interface Sale {
  id: string;
  timestamp: string;
  items: CartItem[];
  total: number;
  client: Client;
  userId: string; // user_id
  userName: string; // user_name
}

export interface Movement {
  id: string;
  type: MovementType;
  productId: string; // product_id
  productName: string; // product_name
  quantity: number;
  timestamp: string;
  userId: string; // user_id
  userName: string; // user_name
  reason?: string;
  clientInfo?: string; // client_info
}

export interface PharmacyConfig {
  id?: number;
  name: string;
  address: string;
  phone: string;
  email: string;
  nit: string;
  socials: string;
}

export interface AppState {
  users: User[];
  products: Product[];
  sales: Sale[];
  movements: Movement[];
  config: PharmacyConfig;
  currentUser: User | null;
  loading: boolean;
}

// Helper interfaces for DB mapping
export interface DBUser {
  id: string;
  name: string;
  last_name: string;
  document_id: string;
  username: string;
  password?: string;
  role: string;
  permissions: string[];
  allowed_modules: string[];
  active: boolean;
}

export interface DBProduct {
  id: string;
  name: string;
  form: string;
  content: string;
  line: string;
  price: number;
  cost: number;
  quantity: number;
  batch: string;
  expiry_date: string;
  location: string;
  barcode: string;
  min_stock: number;
  max_stock: number;
}
