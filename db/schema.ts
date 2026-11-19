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

// Versioned proofs are bound to trade enquiries; review tokens are stored only as hashes.
export const commerceProProofs = sqliteTable("commerce_pro_proofs", {
  id: text("id").primaryKey(),
  quoteQuestionId: text("quote_question_id").notNull().references(() => commerceQuestions.id, { onDelete: "cascade" }),
  version: integer("version").notNull(),
  title: text("title").notNull(),
  specification: text("specification").notNull(),
  artworkPath: text("artwork_path").notNull().default(""),
  status: text("status").notNull().default("draft"),
  tokenHash: text("token_hash"),
  tokenExpiresAt: text("token_expires_at"),
  createdBy: text("created_by").notNull(),
  customerName: text("customer_name").notNull().default(""),
  customerDecisionNote: text("customer_decision_note").notNull().default(""),
  customerDecidedAt: text("customer_decided_at"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
}, (table) => [
  uniqueIndex("commerce_pro_proofs_quote_version_unique").on(table.quoteQuestionId, table.version),
  uniqueIndex("commerce_pro_proofs_token_unique").on(table.tokenHash),
  index("commerce_pro_proofs_quote_idx").on(table.quoteQuestionId, table.version),
]);

export const commerceProProofEvents = sqliteTable("commerce_pro_proof_events", {
  id: text("id").primaryKey(),
  proofId: text("proof_id").notNull().references(() => commerceProProofs.id, { onDelete: "cascade" }),
  kind: text("kind").notNull(),
  actor: text("actor").notNull(),
  message: text("message").notNull().default(""),
  createdAt: text("created_at").notNull(),
}, (table) => [
  index("commerce_pro_proof_events_proof_idx").on(table.proofId, table.createdAt),
]);

export const commerceProductionPlans = sqliteTable("commerce_production_plans", {
  id: text("id").primaryKey(),
  quoteQuestionId: text("quote_question_id").notNull().references(() => commerceQuestions.id, { onDelete: "restrict" }),
  proofId: text("proof_id").notNull().references(() => commerceProProofs.id, { onDelete: "restrict" }),
  reference: text("reference").notNull(),
  plannedQuantity: integer("planned_quantity").notNull(),
  supplier: text("supplier").notNull().default(""),
  targetDate: text("target_date").notNull(),
  notes: text("notes").notNull().default(""),
  status: text("status").notNull().default("draft"),
  supplierConfirmed: integer("supplier_confirmed", { mode: "boolean" }).notNull().default(false),
  technicalChecked: integer("technical_checked", { mode: "boolean" }).notNull().default(false),
  commercialChecked: integer("commercial_checked", { mode: "boolean" }).notNull().default(false),
  qualityChecked: integer("quality_checked", { mode: "boolean" }).notNull().default(false),
  version: integer("version").notNull().default(1),
  createdBy: text("created_by").notNull(),
  updatedBy: text("updated_by").notNull(),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
}, (table) => [
  uniqueIndex("commerce_production_plans_quote_unique").on(table.quoteQuestionId),
  uniqueIndex("commerce_production_plans_proof_unique").on(table.proofId),
  uniqueIndex("commerce_production_plans_reference_unique").on(table.reference),
  index("commerce_production_plans_status_idx").on(table.status, table.targetDate),
]);

export const commerceProductionEvents = sqliteTable("commerce_production_events", {
  id: text("id").primaryKey(),
  planId: text("plan_id").notNull().references(() => commerceProductionPlans.id, { onDelete: "cascade" }),
  action: text("action").notNull(),
  actor: text("actor").notNull(),
  detail: text("detail").notNull().default(""),
  createdAt: text("created_at").notNull(),
}, (table) => [index("commerce_production_events_plan_idx").on(table.planId, table.createdAt)]);

export const commerceTradePrices = sqliteTable("commerce_trade_prices", {
  id: text("id").primaryKey(),
  quoteQuestionId: text("quote_question_id").notNull().references(() => commerceQuestions.id, { onDelete: "restrict" }),
  reference: text("reference").notNull(),
  revision: integer("revision").notNull(),
  status: text("status").notNull().default("draft"),
  linesJson: text("lines_json").notNull(),
  shippingPence: integer("shipping_pence").notNull(),
  discountBps: integer("discount_bps").notNull(),
  taxRateBps: integer("tax_rate_bps").notNull(),
  subtotalPence: integer("subtotal_pence").notNull(),
  discountPence: integer("discount_pence").notNull(),
  taxPence: integer("tax_pence").notNull(),
  totalPence: integer("total_pence").notNull(),
  costPence: integer("cost_pence").notNull(),
  validUntil: text("valid_until").notNull(),
  notes: text("notes").notNull().default(""),
  costReviewed: integer("cost_reviewed", { mode: "boolean" }).notNull().default(false),
  taxReviewed: integer("tax_reviewed", { mode: "boolean" }).notNull().default(false),
  createdBy: text("created_by").notNull(),
  updatedAt: text("updated_at").notNull(),
  createdAt: text("created_at").notNull(),
}, (table) => [
  uniqueIndex("commerce_trade_prices_question_version_unique").on(table.quoteQuestionId, table.revision),
  uniqueIndex("commerce_trade_prices_reference_unique").on(table.reference),
  index("commerce_trade_prices_question_idx").on(table.quoteQuestionId, table.revision),
  index("commerce_trade_prices_status_idx").on(table.status, table.validUntil),
]);

export const commerceTradePriceEvents = sqliteTable("commerce_trade_price_events", {
  id: text("id").primaryKey(),
  priceId: text("price_id").notNull().references(() => commerceTradePrices.id, { onDelete: "cascade" }),
  action: text("action").notNull(),
  actor: text("actor").notNull(),
  detail: text("detail").notNull().default(""),
  createdAt: text("created_at").notNull(),
}, (table) => [
  index("commerce_trade_price_events_price_idx").on(table.priceId, table.createdAt),
]);

export const commerceTradePriceReviews = sqliteTable("commerce_trade_price_reviews", {
  id: text("id").primaryKey(),
  priceId: text("price_id").notNull().references(() => commerceTradePrices.id, { onDelete: "restrict" }),
  tokenHash: text("token_hash"),
  tokenExpiresAt: text("token_expires_at"),
  status: text("status").notNull().default("issued"),
  customerName: text("customer_name").notNull().default(""),
  customerNote: text("customer_note").notNull().default(""),
  respondedAt: text("responded_at"),
  issuedBy: text("issued_by").notNull(),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
}, (table) => [
  uniqueIndex("commerce_trade_price_reviews_price_unique").on(table.priceId),
  uniqueIndex("commerce_trade_price_reviews_token_unique").on(table.tokenHash),
  index("commerce_trade_price_reviews_status_idx").on(table.status, table.tokenExpiresAt),
]);

export const commerceTradeReviewEvents = sqliteTable("commerce_trade_review_events", {
  id: text("id").primaryKey(),
  reviewId: text("review_id").notNull().references(() => commerceTradePriceReviews.id, { onDelete: "cascade" }),
  action: text("action").notNull(),
  actor: text("actor").notNull(),
  message: text("message").notNull().default(""),
  createdAt: text("created_at").notNull(),
}, (table) => [
  index("commerce_trade_review_events_review_idx").on(table.reviewId, table.createdAt),
]);
