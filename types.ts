
export enum OrderStatus {
  PENDING = 'Pending',
  PROCESSING = 'Processing',
  SHIPPED = 'Shipped',
  DELIVERED = 'Delivered',
  CANCELLED = 'Cancelled'
}

export type PaymentMethod = 'COD' | 'bKash' | 'Nagad' | 'Card';

export interface Category {
  id: string;
  name: string;
  subcategories: Subcategory[];
}

export interface Subcategory {
  id: string;
  name: string;
  parentId: string;
}

export interface ProductVariant {
  id: string;
  size: string;
  color: string;
  stock: number;
  sku: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  discountPrice?: number;
  categoryId: string;
  subcategoryId: string;
  brand: string;
  rating: number;
  reviewsCount: number;
  images: string[];
  variants: ProductVariant[];
  isNewArrival?: boolean;
  isBestSeller?: boolean;
}

export interface CartItem extends Product {
  selectedVariant: ProductVariant;
  quantity: number;
}

export interface Order {
  id: string;
  customerName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  items: CartItem[];
  totalAmount: number;
  status: OrderStatus;
  createdAt: string;
  paymentMethod: PaymentMethod;
  paymentStatus: 'Paid' | 'Unpaid';
  transactionId?: string;
}

export interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  activeUsers: number;
  lowStockItems: number;
}
