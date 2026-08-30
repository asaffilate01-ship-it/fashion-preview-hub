import { NextResponse } from "next/server";
import {
  customProductCatalog,
  storeBranding,
  storeColours,
  storeFinishes,
  storeFits,
  storeSleeves,
  unitAmountFor,
  type BagItem,
  type CustomProductId,
} from "@/lib/store";
import { getCommerceProductForCheckout } from "@/db/commerce";

const sizes = /^(XS|S|M|L|XL|2XL|3XL|UK (6|8|10|12|14|16|18|20|22|24)|(28|30|32|34|36|38|40|42|44)[SRL])$/;
const colours = new Set<string>(storeColours);
const sleeves = new Set<string>(storeSleeves);
const brandingOptions = new Set<string>(storeBranding);
const fits = new Set<string>(storeFits);
const finishes = new Set<string>(storeFinishes);

function stripeConnection(): { endpoint: string; headers: Record<string, string> } | null {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (secretKey && /^(sk|rk)_(test|live)_/.test(secretKey)) {
    return { endpoint: "https://api.stripe.com/v1/checkout/sessions", headers: { Authorization: `Bearer ${secretKey}` } };
  }
  const environment = process.env.PAYMENTS_ENVIRONMENT === "sandbox" ? "sandbox" : "live";
  const connectionKey = environment === "sandbox" ? process.env.STRIPE_SANDBOX_API_KEY : process.env.STRIPE_LIVE_API_KEY;
  const lovableKey = process.env.LOVABLE_API_KEY;
  if (!connectionKey || !lovableKey) return null;
  return {
    endpoint: "https://connector-gateway.lovable.dev/stripe/v1/checkout/sessions",
    headers: { Authorization: `Bearer ${connectionKey}`, "X-Connection-Api-Key": connectionKey, "Lovable-API-Key": lovableKey },
  };
}

function storefrontOrigin(request: Request) {
  const configured = process.env.SITE_URL?.trim();
  if (configured) {
    const url = new URL(configured);
    if (url.protocol !== "https:" && url.hostname !== "localhost") throw new Error("SITE_URL must use HTTPS");
    return url.origin;
  }
  const requestUrl = new URL(request.url);
  return requestUrl.hostname === "localhost" ? requestUrl.origin : "https://kalethon.com";
}

function validItem(value: unknown): value is BagItem {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<BagItem>;
  return Boolean(
    typeof item.productId === "string" && item.productId.length > 0 && item.productId.length <= 100 &&
    (item.sku === undefined || (typeof item.sku === "string" && item.sku.length <= 100)) &&
    colours.has(String(item.bodyColour)) && colours.has(String(item.collarColour)) && colours.has(String(item.cuffColour)) &&
    sleeves.has(String(item.sleeve)) && brandingOptions.has(String(item.branding)) && fits.has(String(item.fit)) && finishes.has(String(item.finish)) &&
    typeof item.size === "string" && sizes.test(item.size) &&
    Number.isInteger(item.quantity) && Number(item.quantity) >= 1 && Number(item.quantity) <= 5
  );
}

type ResolvedProduct = { name: string; image: string; amount: number; sku: string };

async function resolveProduct(item: BagItem): Promise<ResolvedProduct | null> {
  if (item.sku) {
    try {
      const managed = await getCommerceProductForCheckout(item.sku);
      if (managed) {
        if (Boolean(managed.tracked) && Number(managed.available) < item.quantity) return null;
        return { name: managed.name, image: managed.image, amount: Number(managed.price), sku: managed.sku };
      }
    } catch {
      // The static catalogue remains available before the commerce database is provisioned.
    }
  }
  const fallback = customProductCatalog[item.productId as CustomProductId];
  return fallback ? { name: fallback.name, image: fallback.image, amount: unitAmountFor({ ...item, unitAmount: undefined }), sku: item.sku ?? item.productId } : null;
}

function singleItem(body: Record<string, unknown>): BagItem {
  const productId = body.productId as CustomProductId;
  const product = customProductCatalog[productId];
  return {
    id: "buy-now", productId, name: product?.name ?? "KALËTHON garment", image: product?.image ?? "", quantity: 1,
    bodyColour: body.bodyColour as BagItem["bodyColour"], collarColour: body.collarColour as BagItem["collarColour"], cuffColour: body.cuffColour as BagItem["cuffColour"],
    sleeve: body.sleeve as BagItem["sleeve"], branding: body.branding as BagItem["branding"], fit: body.fit as BagItem["fit"],
    finish: (body.finish ?? "Clean") as BagItem["finish"], size: String(body.size ?? ""),
  };
}

export async function POST(request: Request) {
  const stripe = stripeConnection();
  if (!stripe) return NextResponse.json({ code: "not_configured", message: "Secure checkout is temporarily unavailable while the live payment connection is completed." }, { status: 503 });
  try {
    const body = await request.json() as Record<string, unknown>;
    const submittedItems = Array.isArray(body.items) ? body.items : [singleItem(body)];
    if (body.termsAccepted !== true || typeof body.marketingConsent !== "boolean" || submittedItems.length < 1 || submittedItems.length > 12 || !submittedItems.every(validItem)) {
      return NextResponse.json({ message: "The bag or garment specification was not valid." }, { status: 400 });
    }
    const items = submittedItems as BagItem[];
    const resolvedProducts = await Promise.all(items.map(resolveProduct));
    if (resolvedProducts.some((product) => !product)) return NextResponse.json({ message: "One of these pieces is unavailable or does not have enough stock." }, { status: 409 });
    const origin = storefrontOrigin(request);
    const form = new URLSearchParams();
    form.set("mode", "payment");
    form.set("success_url", `${origin}/bag?checkout=success&session_id={CHECKOUT_SESSION_ID}`);
    form.set("cancel_url", `${origin}/bag?checkout=cancelled`);
    form.set("submit_type", "pay");
    form.set("customer_creation", "always");
    form.set("billing_address_collection", "required");
    form.set("phone_number_collection[enabled]", "true");
    form.set("allow_promotion_codes", "true");
    form.set("consent_collection[terms_of_service]", "required");
    ["GB", "US", "CA", "AE", "DE", "FR", "IE", "IT", "ES", "NL", "AU", "NZ", "PK"].forEach((country, index) => form.set(`shipping_address_collection[allowed_countries][${index}]`, country));
    items.forEach((item, index) => {
      const product = resolvedProducts[index]!;
      const description = `${item.bodyColour} / ${item.finish} / ${item.sleeve} / ${item.fit} fit / ${item.branding} / ${item.size}`;
      form.set(`line_items[${index}][quantity]`, String(item.quantity));
      form.set(`line_items[${index}][price_data][currency]`, "gbp");
      form.set(`line_items[${index}][price_data][unit_amount]`, String(product.amount));
      form.set(`line_items[${index}][price_data][product_data][name]`, `KALËTHON ${product.name}`);
      form.set(`line_items[${index}][price_data][product_data][description]`, description);
      form.set(`line_items[${index}][price_data][product_data][images][0]`, `${origin}${product.image}`);
      form.set(`line_items[${index}][price_data][product_data][metadata][specification]`, description);
      form.set(`line_items[${index}][price_data][product_data][metadata][product_id]`, item.productId);
      form.set(`line_items[${index}][price_data][product_data][metadata][sku]`, product.sku);
    });
    form.set("metadata[item_count]", String(items.reduce((total, item) => total + item.quantity, 0)));
    form.set("metadata[site_terms_accepted]", "true");
    form.set("metadata[marketing_consent]", body.marketingConsent ? "yes" : "no");
    form.set("metadata[consent_recorded_at]", new Date().toISOString());
    form.set("payment_intent_data[description]", `KALËTHON order · ${items.reduce((total, item) => total + item.quantity, 0)} garment(s)`);
    form.set("payment_intent_data[metadata][order_source]", "kalethon.com");
    const stripeResponse = await fetch(stripe.endpoint, { method: "POST", headers: { ...stripe.headers, "Content-Type": "application/x-www-form-urlencoded" }, body: form });
    const data = await stripeResponse.json().catch(() => ({}));
    if (!stripeResponse.ok || typeof data.url !== "string") return NextResponse.json({ message: "Secure checkout could not start. Please try again." }, { status: 502 });
    return NextResponse.json({ url: data.url });
  } catch {
    return NextResponse.json({ message: "Secure checkout could not read this order." }, { status: 400 });
  }
}
