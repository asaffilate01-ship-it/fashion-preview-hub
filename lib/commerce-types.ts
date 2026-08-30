export type CommerceProduct = {
  id: string;
  sku: string;
  slug: string;
  name: string;
  category: string;
  productType: string;
  description: string;
  image: string;
  price: number;
  compareAtPrice: number | null;
  cost: number;
  active: boolean;
  featured: boolean;
  trackInventory: boolean;
  createdAt: string;
  updatedAt: string;
};

export type StorefrontProduct = Pick<CommerceProduct, "id" | "sku" | "slug" | "name" | "category" | "productType" | "description" | "image" | "price" | "featured"> & {
  available: number;
  tracked: boolean;
};

export type CommerceInventoryRow = {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  optionName: string;
  size: string;
  colour: string;
  stockOnHand: number;
  stockReserved: number;
  available: number;
  reorderPoint: number;
  updatedAt: string;
};

export type CommerceOrder = {
  id: string;
  orderNumber: string;
  stripeSessionId: string;
  status: string;
  paymentStatus: string;
  fulfilmentStatus: string;
  customerName: string;
  customerEmail: string;
  currency: string;
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  createdAt: string;
  updatedAt: string;
};

export type CommerceQuestion = {
  id: string;
  customerName: string;
  customerEmail: string;
  orderNumber: string | null;
  subject: string;
  message: string;
  status: string;
  priority: string;
  createdAt: string;
  updatedAt: string;
};

export type CommerceOverview = {
  kpis: {
    revenue30: number;
    orders30: number;
    averageOrder: number;
    grossProfit30: number;
    openOrders: number;
    openQuestions: number;
    lowStock: number;
    outOfStock: number;
  };
  sales: Array<{ date: string; revenue: number; orders: number }>;
  products: CommerceProduct[];
  inventory: CommerceInventoryRow[];
  orders: CommerceOrder[];
  questions: CommerceQuestion[];
};
