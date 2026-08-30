import { index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const commerceProducts = sqliteTable("commerce_products", {
  id: text("id").primaryKey(),
  sku: text("sku").notNull(),
  slug: text("slug").notNull(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  productType: text("product_type").notNull(),
  description: text("description").notNull().default(""),
  image: text("image").notNull(),
  price: integer("price").notNull(),
  compareAtPrice: integer("compare_at_price"),
  cost: integer("cost").notNull().default(0),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
  featured: integer("featured", { mode: "boolean" }).notNull().default(false),
  trackInventory: integer("track_inventory", { mode: "boolean" }).notNull().default(true),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
}, (table) => [
  uniqueIndex("commerce_products_sku_unique").on(table.sku),
  uniqueIndex("commerce_products_slug_unique").on(table.slug),
  index("commerce_products_active_idx").on(table.active),
  index("commerce_products_category_idx").on(table.category),
]);

export const commerceInventory = sqliteTable("commerce_inventory", {
  id: text("id").primaryKey(),
  productId: text("product_id").notNull().references(() => commerceProducts.id, { onDelete: "cascade" }),
  sku: text("sku").notNull(),
  optionName: text("option_name").notNull().default("Standard"),
  size: text("size").notNull().default("All sizes"),
  colour: text("colour").notNull().default("Standard"),
  stockOnHand: integer("stock_on_hand").notNull().default(0),
  stockReserved: integer("stock_reserved").notNull().default(0),
  reorderPoint: integer("reorder_point").notNull().default(4),
  updatedAt: text("updated_at").notNull(),
}, (table) => [
  uniqueIndex("commerce_inventory_sku_unique").on(table.sku),
  index("commerce_inventory_product_idx").on(table.productId),
]);

export const commerceInventoryMovements = sqliteTable("commerce_inventory_movements", {
  id: text("id").primaryKey(),
  inventoryId: text("inventory_id").notNull().references(() => commerceInventory.id, { onDelete: "cascade" }),
  movementType: text("movement_type").notNull(),
  quantity: integer("quantity").notNull(),
  reference: text("reference"),
  note: text("note").notNull().default(""),
  createdAt: text("created_at").notNull(),
}, (table) => [index("commerce_inventory_movements_inventory_idx").on(table.inventoryId)]);

export const commerceOrders = sqliteTable("commerce_orders", {
  id: text("id").primaryKey(),
  orderNumber: text("order_number").notNull(),
  stripeSessionId: text("stripe_session_id").notNull(),
  status: text("status").notNull().default("new"),
  paymentStatus: text("payment_status").notNull().default("paid"),
  fulfilmentStatus: text("fulfilment_status").notNull().default("unfulfilled"),
  customerName: text("customer_name").notNull().default(""),
  customerEmail: text("customer_email").notNull().default(""),
  currency: text("currency").notNull().default("gbp"),
  subtotal: integer("subtotal").notNull().default(0),
  shipping: integer("shipping").notNull().default(0),
  tax: integer("tax").notNull().default(0),
  total: integer("total").notNull().default(0),
  shippingAddress: text("shipping_address").notNull().default("{}"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
}, (table) => [
  uniqueIndex("commerce_orders_number_unique").on(table.orderNumber),
  uniqueIndex("commerce_orders_stripe_unique").on(table.stripeSessionId),
  index("commerce_orders_created_idx").on(table.createdAt),
  index("commerce_orders_status_idx").on(table.status),
]);

export const commerceOrderItems = sqliteTable("commerce_order_items", {
  id: text("id").primaryKey(),
  orderId: text("order_id").notNull().references(() => commerceOrders.id, { onDelete: "cascade" }),
  productId: text("product_id").references(() => commerceProducts.id, { onDelete: "set null" }),
  sku: text("sku").notNull().default(""),
  name: text("name").notNull(),
  quantity: integer("quantity").notNull(),
  unitAmount: integer("unit_amount").notNull(),
  totalAmount: integer("total_amount").notNull(),
  specification: text("specification").notNull().default(""),
}, (table) => [index("commerce_order_items_order_idx").on(table.orderId)]);

export const commerceQuestions = sqliteTable("commerce_questions", {
  id: text("id").primaryKey(),
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email").notNull(),
  orderNumber: text("order_number"),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  status: text("status").notNull().default("open"),
  priority: text("priority").notNull().default("normal"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
}, (table) => [
  index("commerce_questions_status_idx").on(table.status),
  index("commerce_questions_created_idx").on(table.createdAt),
]);

export const commerceWebhookEvents = sqliteTable("commerce_webhook_events", {
  id: text("id").primaryKey(),
  eventType: text("event_type").notNull(),
  processedAt: text("processed_at").notNull(),
});
