import type { CommerceInventoryRow, CommerceOrder, CommerceOverview, CommerceProduct, CommerceQuestion, StorefrontProduct } from "@/lib/commerce-types";

const seedProducts = [
  ["court-polo-bone", "KAL-POLO-BONE", "court-polo-bone", "Court Polo", "Polos", "Sport-to-city polo", "/catalog/court-polo-k.webp", 8500, 3600],
  ["court-polo-oxblood", "KAL-POLO-OXB", "court-polo-oxblood", "Court Polo — Oxblood", "Polos", "Sport-to-city polo", "/catalog/court-polo-oxblood.webp", 8500, 3600],
  ["casual-contrast-polo", "KAL-CASUAL-OXB", "casual-contrast-polo", "Casual Contrast Polo", "Polos", "Relaxed lifestyle polo", "/campaign-polo.png", 8500, 3500],
  ["links-golf-polo", "KAL-GOLF-SAGE", "links-golf-polo", "Links Golf Polo", "Polos", "Technical golf shirt", "/collections/golf.jpg", 8500, 3700],
  ["baseline-tennis-polo", "KAL-TENNIS-BONE", "baseline-tennis-polo", "Baseline Tennis Polo", "Polos", "Lightweight tennis shirt", "/collections/tennis.jpg", 8500, 3600],
  ["performance-tee-ink", "KAL-TEE-INK", "performance-tee-ink", "Performance Tee", "Tops", "Technical T-shirt", "/try-on/form-tee.jpg", 7600, 2900],
  ["poise-hoodie-bone", "KAL-HOOD-BONE", "poise-hoodie-bone", "Poise Pullover Hoodie", "Layers", "Pullover hoodie", "/catalog/poise-pullover-hoodie.webp", 12500, 5200],
  ["poise-hoodie-sage", "KAL-HOOD-SAGE", "poise-hoodie-sage", "Poise Pullover Hoodie — Sage", "Layers", "Pullover hoodie", "/catalog/poise-pullover-hoodie-sage.webp", 12500, 5200],
  ["club-hoodie-bone", "KAL-CLUB-HOOD", "club-hoodie-bone", "Club Pullover Hoodie", "Layers", "Heavyweight pullover", "/campaign-hoodie-track.png", 12500, 5400],
  ["club-zip-hoodie", "KAL-ZIP-NAVY", "club-zip-hoodie", "Club Zip Hoodie", "Layers", "Heavyweight full-zip hoodie", "/catalog/club-zip-hoodie-clean.png", 13300, 5800],
  ["club-zip-hoodie-stone", "KAL-ZIP-STONE", "club-zip-hoodie-stone", "Club Zip Hoodie — Stone", "Layers", "Heavyweight full-zip hoodie", "/catalog/club-zip-hoodie-stone.webp", 13300, 5800],
  ["motion-jogger-stone", "KAL-JOG-STONE", "motion-jogger-stone", "Motion Jogger", "Bottoms", "Full-length jogger", "/try-on/motion-jogger.jpg", 11000, 4400],
  ["court-short-navy", "KAL-SHORT-NAVY", "court-short-navy", "Court Short", "Bottoms", "Lined technical short", "/try-on/court-short-photo.webp", 7800, 3100],
  ["court-skirt-oxblood", "KAL-SKORT-OXB", "court-skirt-oxblood", "Court Skort", "Bottoms", "Tennis skirt and short", "/try-on/court-skort-photo.webp", 9200, 3800],
  ["club-tracksuit-ink", "KAL-SET-INK", "club-tracksuit-ink", "Club Tracksuit", "Sets", "Jacket and jogger set", "/campaign-hoodie-track.png", 22500, 9800],
] as const;

async function db() {
  const { env } = await import("cloudflare:workers");
  if (!env.DB) throw new Error("Commerce database is not configured.");
  return env.DB;
}

function rows<T>(result: D1Result<T>) {
  return result.results ?? [];
}

export async function seedCommerceCatalogue() {
  const database = await db();
  const count = await database.prepare("SELECT COUNT(*) AS count FROM commerce_products").first<{ count: number }>();
  if (Number(count?.count ?? 0) > 0) return;
  const now = new Date().toISOString();
  const statements = seedProducts.flatMap(([id, sku, slug, name, category, productType, image, price, cost], index) => [
    database.prepare("INSERT OR IGNORE INTO commerce_products (id, sku, slug, name, category, product_type, description, image, price, cost, active, featured, track_inventory, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, 1, ?, ?)").bind(id, sku, slug, name, category, productType, `${productType} from the finished KALËTHON edit.`, image, price, cost, index < 6 ? 1 : 0, now, now),
    database.prepare("INSERT OR IGNORE INTO commerce_inventory (id, product_id, sku, option_name, size, colour, stock_on_hand, stock_reserved, reorder_point, updated_at) VALUES (?, ?, ?, 'Core run', 'All sizes', 'Standard', 12, 0, 4, ?)").bind(`inv-${id}`, id, sku, now),
  ]);
  await database.batch(statements);
}

export async function getCommerceOverview(): Promise<CommerceOverview> {
  await seedCommerceCatalogue();
  const database = await db();
  const [productsResult, inventoryResult, ordersResult, questionsResult, metrics, salesResult] = await Promise.all([
    database.prepare("SELECT id, sku, slug, name, category, product_type AS productType, description, image, price, compare_at_price AS compareAtPrice, cost, active, featured, track_inventory AS trackInventory, created_at AS createdAt, updated_at AS updatedAt FROM commerce_products ORDER BY active DESC, category, name").all<CommerceProduct>(),
    database.prepare("SELECT i.id, i.product_id AS productId, p.name AS productName, i.sku, i.option_name AS optionName, i.size, i.colour, i.stock_on_hand AS stockOnHand, i.stock_reserved AS stockReserved, (i.stock_on_hand - i.stock_reserved) AS available, i.reorder_point AS reorderPoint, i.updated_at AS updatedAt FROM commerce_inventory i JOIN commerce_products p ON p.id = i.product_id ORDER BY available ASC, p.name").all<CommerceInventoryRow>(),
    database.prepare("SELECT id, order_number AS orderNumber, stripe_session_id AS stripeSessionId, status, payment_status AS paymentStatus, fulfilment_status AS fulfilmentStatus, customer_name AS customerName, customer_email AS customerEmail, currency, subtotal, shipping, tax, total, created_at AS createdAt, updated_at AS updatedAt FROM commerce_orders ORDER BY created_at DESC LIMIT 100").all<CommerceOrder>(),
    database.prepare("SELECT id, customer_name AS customerName, customer_email AS customerEmail, order_number AS orderNumber, subject, message, status, priority, created_at AS createdAt, updated_at AS updatedAt FROM commerce_questions ORDER BY CASE status WHEN 'open' THEN 0 WHEN 'waiting' THEN 1 ELSE 2 END, created_at DESC LIMIT 100").all<CommerceQuestion>(),
    database.prepare("SELECT COALESCE(SUM(CASE WHEN created_at >= datetime('now','-30 days') AND payment_status = 'paid' THEN total ELSE 0 END),0) AS revenue30, SUM(CASE WHEN created_at >= datetime('now','-30 days') AND payment_status = 'paid' THEN 1 ELSE 0 END) AS orders30, SUM(CASE WHEN status NOT IN ('completed','cancelled') THEN 1 ELSE 0 END) AS openOrders FROM commerce_orders").first<{ revenue30: number; orders30: number; openOrders: number }>(),
    database.prepare("SELECT substr(created_at,1,10) AS date, SUM(total) AS revenue, COUNT(*) AS orders FROM commerce_orders WHERE created_at >= datetime('now','-30 days') AND payment_status = 'paid' GROUP BY substr(created_at,1,10) ORDER BY date").all<{ date: string; revenue: number; orders: number }>(),
  ]);
  const products = rows(productsResult).map((item) => ({ ...item, active: Boolean(item.active), featured: Boolean(item.featured), trackInventory: Boolean(item.trackInventory) }));
  const inventory = rows(inventoryResult);
  const orders = rows(ordersResult);
  const questions = rows(questionsResult);
  const revenue30 = Number(metrics?.revenue30 ?? 0);
  const orders30 = Number(metrics?.orders30 ?? 0);
  const productCost = new Map(products.map((product) => [product.id, product.cost]));
  const grossCostResult = await database.prepare("SELECT oi.product_id AS productId, SUM(oi.quantity) AS quantity FROM commerce_order_items oi JOIN commerce_orders o ON o.id = oi.order_id WHERE o.created_at >= datetime('now','-30 days') AND o.payment_status = 'paid' GROUP BY oi.product_id").all<{ productId: string; quantity: number }>();
  const cost30 = rows(grossCostResult).reduce((sum, item) => sum + (productCost.get(item.productId) ?? 0) * Number(item.quantity), 0);
  return {
    kpis: {
      revenue30,
      orders30,
      averageOrder: orders30 ? Math.round(revenue30 / orders30) : 0,
      grossProfit30: Math.max(0, revenue30 - cost30),
      openOrders: Number(metrics?.openOrders ?? 0),
      openQuestions: questions.filter((item) => item.status !== "closed").length,
      lowStock: inventory.filter((item) => item.available > 0 && item.available <= item.reorderPoint).length,
      outOfStock: inventory.filter((item) => item.available <= 0).length,
    },
    sales: rows(salesResult), products, inventory, orders, questions,
  };
}

export async function getPublishedCatalogue(): Promise<StorefrontProduct[]> {
  await seedCommerceCatalogue();
  const database = await db();
  const result = await database.prepare("SELECT p.id, p.sku, p.slug, p.name, p.category, p.product_type AS productType, p.description, p.image, p.price, p.featured, p.track_inventory AS tracked, COALESCE(SUM(i.stock_on_hand - i.stock_reserved), 0) AS available FROM commerce_products p LEFT JOIN commerce_inventory i ON i.product_id = p.id WHERE p.active = 1 GROUP BY p.id ORDER BY p.featured DESC, p.category, p.created_at").all<StorefrontProduct>();
  return rows(result).map((product) => ({ ...product, featured: Boolean(product.featured), tracked: Boolean(product.tracked), available: Number(product.available) }));
}

export async function getCommerceProductForCheckout(reference: string) {
  await seedCommerceCatalogue();
  const database = await db();
  return database.prepare("SELECT p.id, p.sku, p.name, p.image, p.price, p.track_inventory AS tracked, COALESCE(SUM(i.stock_on_hand - i.stock_reserved), 0) AS available FROM commerce_products p LEFT JOIN commerce_inventory i ON i.product_id = p.id WHERE p.active = 1 AND (p.id = ? OR p.sku = ? OR p.slug = ?) GROUP BY p.id LIMIT 1").bind(reference, reference, reference).first<{ id: string; sku: string; name: string; image: string; price: number; tracked: number; available: number }>();
}

export async function saveCommerceProduct(input: Partial<CommerceProduct>) {
  const database = await db();
  const now = new Date().toISOString();
  const id = input.id?.trim() || crypto.randomUUID();
  const sku = String(input.sku ?? "").trim().toUpperCase();
  const name = String(input.name ?? "").trim();
  const slug = String(input.slug ?? name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")).trim();
  if (!sku || !name || !slug || !Number.isInteger(input.price) || Number(input.price) < 0) throw new Error("Product name, SKU, slug and price are required.");
  await database.prepare("INSERT INTO commerce_products (id, sku, slug, name, category, product_type, description, image, price, compare_at_price, cost, active, featured, track_inventory, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET sku=excluded.sku, slug=excluded.slug, name=excluded.name, category=excluded.category, product_type=excluded.product_type, description=excluded.description, image=excluded.image, price=excluded.price, compare_at_price=excluded.compare_at_price, cost=excluded.cost, active=excluded.active, featured=excluded.featured, track_inventory=excluded.track_inventory, updated_at=excluded.updated_at").bind(id, sku, slug, name, input.category || "Other", input.productType || "Garment", input.description || "", input.image || "/catalog/court-polo-k.webp", Number(input.price), input.compareAtPrice ?? null, Number(input.cost ?? 0), input.active === false ? 0 : 1, input.featured ? 1 : 0, input.trackInventory === false ? 0 : 1, input.createdAt || now, now).run();
  await database.prepare("INSERT OR IGNORE INTO commerce_inventory (id, product_id, sku, option_name, size, colour, stock_on_hand, stock_reserved, reorder_point, updated_at) VALUES (?, ?, ?, 'Core run', 'All sizes', 'Standard', 0, 0, 4, ?)").bind(`inv-${id}`, id, sku, now).run();
  return id;
}

export async function archiveCommerceProduct(id: string) {
  const database = await db();
  await database.prepare("UPDATE commerce_products SET active = 0, updated_at = ? WHERE id = ?").bind(new Date().toISOString(), id).run();
}

export async function adjustCommerceInventory(inventoryId: string, quantity: number, note = "Manual adjustment") {
  if (!Number.isInteger(quantity) || quantity === 0 || Math.abs(quantity) > 10000) throw new Error("Stock adjustment is not valid.");
  const database = await db();
  const now = new Date().toISOString();
  await database.batch([
    database.prepare("UPDATE commerce_inventory SET stock_on_hand = MAX(0, stock_on_hand + ?), updated_at = ? WHERE id = ?").bind(quantity, now, inventoryId),
    database.prepare("INSERT INTO commerce_inventory_movements (id, inventory_id, movement_type, quantity, note, created_at) VALUES (?, ?, 'manual', ?, ?, ?)").bind(crypto.randomUUID(), inventoryId, quantity, note.slice(0, 300), now),
  ]);
}

export async function updateCommerceOrder(id: string, status: string, fulfilmentStatus: string) {
  const allowedStatuses = new Set(["new", "confirmed", "in_production", "completed", "cancelled", "refunded"]);
  const allowedFulfilment = new Set(["unfulfilled", "processing", "packed", "shipped", "delivered", "returned"]);
  if (!allowedStatuses.has(status) || !allowedFulfilment.has(fulfilmentStatus)) throw new Error("Order status is not valid.");
  const database = await db();
  await database.prepare("UPDATE commerce_orders SET status = ?, fulfilment_status = ?, updated_at = ? WHERE id = ?").bind(status, fulfilmentStatus, new Date().toISOString(), id).run();
}

export async function updateCommerceQuestion(id: string, status: string, priority: string) {
  if (!["open", "waiting", "closed"].includes(status) || !["low", "normal", "high", "urgent"].includes(priority)) throw new Error("Question status is not valid.");
  const database = await db();
  await database.prepare("UPDATE commerce_questions SET status = ?, priority = ?, updated_at = ? WHERE id = ?").bind(status, priority, new Date().toISOString(), id).run();
}

export async function createCommerceQuestion(input: { customerName: string; customerEmail: string; orderNumber?: string; subject: string; message: string }) {
  const name = input.customerName.trim();
  const email = input.customerEmail.trim().toLowerCase();
  const subject = input.subject.trim();
  const message = input.message.trim();
  if (name.length < 2 || name.length > 100 || !/^\S+@\S+\.\S+$/.test(email) || subject.length < 3 || subject.length > 160 || message.length < 10 || message.length > 4000) throw new Error("Please complete every required field.");
  const database = await db();
  const recent = await database.prepare("SELECT COUNT(*) AS count FROM commerce_questions WHERE customer_email = ? AND created_at >= datetime('now','-10 minutes')").bind(email).first<{ count: number }>();
  if (Number(recent?.count ?? 0) >= 3) throw new Error("Please wait before sending another question.");
  const now = new Date().toISOString();
  await database.prepare("INSERT INTO commerce_questions (id, customer_name, customer_email, order_number, subject, message, status, priority, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, 'open', 'normal', ?, ?)").bind(crypto.randomUUID(), name, email, input.orderNumber?.trim().slice(0, 80) || null, subject, message, now, now).run();
}

type PaidSession = {
  id: string;
  amount_total?: number;
  amount_subtotal?: number;
  total_details?: { amount_shipping?: number; amount_tax?: number };
  currency?: string;
  customer_details?: { email?: string; name?: string };
  shipping_details?: { name?: string; address?: Record<string, string | null> };
  line_items?: { data?: Array<{ description?: string; quantity?: number; amount_total?: number; price?: { unit_amount?: number; product?: { name?: string; metadata?: Record<string, string> } } }> };
};

export async function recordPaidStripeOrder(eventId: string, eventType: string, session: PaidSession) {
  const database = await db();
  const seen = await database.prepare("SELECT id FROM commerce_webhook_events WHERE id = ?").bind(eventId).first<{ id: string }>();
  if (seen) return;
  const now = new Date().toISOString();
  const orderId = crypto.randomUUID();
  const orderNumber = `KAL-${now.slice(2, 10).replace(/-/g, "")}-${session.id.slice(-6).toUpperCase()}`;
  const items = session.line_items?.data ?? [];
  const statements = [
    database.prepare("INSERT INTO commerce_orders (id, order_number, stripe_session_id, status, payment_status, fulfilment_status, customer_name, customer_email, currency, subtotal, shipping, tax, total, shipping_address, created_at, updated_at) VALUES (?, ?, ?, 'new', 'paid', 'unfulfilled', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").bind(orderId, orderNumber, session.id, session.customer_details?.name ?? session.shipping_details?.name ?? "", session.customer_details?.email ?? "", session.currency ?? "gbp", Number(session.amount_subtotal ?? session.amount_total ?? 0), Number(session.total_details?.amount_shipping ?? 0), Number(session.total_details?.amount_tax ?? 0), Number(session.amount_total ?? 0), JSON.stringify(session.shipping_details?.address ?? {}), now, now),
    database.prepare("INSERT INTO commerce_webhook_events (id, event_type, processed_at) VALUES (?, ?, ?)").bind(eventId, eventType, now),
  ];
  for (const item of items) {
    const quantity = Number(item.quantity ?? 1);
    const total = Number(item.amount_total ?? 0);
    const unitAmount = Number(item.price?.unit_amount ?? Math.round(total / Math.max(1, quantity)));
    const metadata = item.price?.product?.metadata ?? {};
    const sku = metadata.sku ?? "";
    const product = sku ? await database.prepare("SELECT id FROM commerce_products WHERE sku = ?").bind(sku).first<{ id: string }>() : null;
    statements.push(database.prepare("INSERT INTO commerce_order_items (id, order_id, product_id, sku, name, quantity, unit_amount, total_amount, specification) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)").bind(crypto.randomUUID(), orderId, product?.id ?? null, sku, item.price?.product?.name ?? item.description ?? "KALËTHON garment", quantity, unitAmount, total, metadata.specification ?? ""));
    if (product?.id) statements.push(database.prepare("UPDATE commerce_inventory SET stock_on_hand = MAX(0, stock_on_hand - ?), updated_at = ? WHERE product_id = ?").bind(quantity, now, product.id));
  }
  await database.batch(statements);
}
