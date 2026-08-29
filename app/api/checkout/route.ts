import { NextResponse } from "next/server";

const colours = new Set(["Bone", "Ink", "Navy", "Oxblood", "Sage", "Stone"]);
const sizes = /^(XS|S|M|L|XL|2XL|3XL|UK (6|8|10|12|14|16|18|20|22|24)|(28|30|32|34|36|38|40|42|44)[SRL])$/;
const sleeves = new Set(["Not applicable", "Sleeveless", "Short sleeve", "Long sleeve"]);
const brandingOptions = new Set(["K mark", "Kalëthon wordmark"]);
const fits = new Set(["Athletic", "Regular", "Relaxed"]);
const products = {
  "court-polo": { name: "Custom Court Polo", amount: 8500 },
  "performance-tee": { name: "Custom Performance Tee", amount: 6800 },
  "performance-tank": { name: "Custom Performance Tank", amount: 6400 },
  "poise-hoodie": { name: "Custom Poise Hoodie", amount: 12500 },
  "track-jacket": { name: "Custom Track Jacket", amount: 14500 },
  "motion-jogger": { name: "Custom Motion Jogger", amount: 11000 },
  "club-tracksuit": { name: "Custom Club Tracksuit", amount: 22500 },
  "court-short": { name: "Custom Court Short", amount: 7800 },
  "court-skirt": { name: "Custom Court Skort", amount: 9200 },
} as const;

function stripeConnection(): { endpoint: string; headers: Record<string, string> } | null {
  const directKey = process.env.STRIPE_SECRET_KEY;
  if (directKey) return { endpoint: "https://api.stripe.com/v1/checkout/sessions", headers: { Authorization: `Bearer ${directKey}` } };

  const environment = process.env.PAYMENTS_ENVIRONMENT === "sandbox" ? "sandbox" : "live";
  const connectionKey = environment === "sandbox" ? process.env.STRIPE_SANDBOX_API_KEY : process.env.STRIPE_LIVE_API_KEY;
  const lovableKey = process.env.LOVABLE_API_KEY;
  if (!connectionKey || !lovableKey) return null;
  return {
    endpoint: "https://connector-gateway.lovable.dev/stripe/v1/checkout/sessions",
    headers: {
      Authorization: `Bearer ${connectionKey}`,
      "X-Connection-Api-Key": connectionKey,
      "Lovable-API-Key": lovableKey,
    },
  };
}

export async function POST(request: Request) {
  const stripe = stripeConnection();
  if (!stripe) {
    return NextResponse.json(
      { code: "not_configured", message: "Secure checkout is temporarily unavailable while the live payment connection is completed." },
      { status: 503 },
    );
  }

  try {
    const body = await request.json();
    const { productId, bodyColour, branding, collarColour, cuffColour, fit, size, sleeve, termsAccepted, marketingConsent } = body ?? {};
    const product = products[productId as keyof typeof products];
    if (
      !product ||
      !colours.has(bodyColour) ||
      !colours.has(collarColour) ||
      !colours.has(cuffColour) ||
      typeof size !== "string" || !sizes.test(size) ||
      !sleeves.has(sleeve) ||
      !brandingOptions.has(branding) ||
      !fits.has(fit) ||
      termsAccepted !== true ||
      typeof marketingConsent !== "boolean"
    ) {
      return NextResponse.json({ message: "The garment specification was not valid." }, { status: 400 });
    }

    const hasSleeveUpgrade = sleeve === "Long sleeve" && ["court-polo", "performance-tee"].includes(productId);
    const amount = product.amount + (hasSleeveUpgrade ? 1000 : 0) + (branding === "Kalëthon wordmark" ? 800 : 0);
    const origin = new URL(request.url).origin;
    const description = `${bodyColour} body / ${collarColour} trim / ${cuffColour} cuff / ${sleeve} / ${fit} fit / ${branding} / ${size}`;
    const form = new URLSearchParams();
    form.set("mode", "payment");
    form.set("success_url", `${origin}/?checkout=success#design-yours`);
    form.set("cancel_url", `${origin}/?checkout=cancelled#design-yours`);
    form.set("billing_address_collection", "required");
    form.set("phone_number_collection[enabled]", "true");
    form.set("allow_promotion_codes", "true");
    form.set("consent_collection[terms_of_service]", "required");
    form.set("shipping_address_collection[allowed_countries][0]", "GB");
    form.set("shipping_address_collection[allowed_countries][1]", "US");
    form.set("shipping_address_collection[allowed_countries][2]", "CA");
    form.set("shipping_address_collection[allowed_countries][3]", "AE");
    form.set("shipping_address_collection[allowed_countries][4]", "DE");
    form.set("shipping_address_collection[allowed_countries][5]", "FR");
    form.set("shipping_address_collection[allowed_countries][6]", "IE");
    form.set("shipping_address_collection[allowed_countries][7]", "IT");
    form.set("shipping_address_collection[allowed_countries][8]", "ES");
    form.set("shipping_address_collection[allowed_countries][9]", "NL");
    form.set("shipping_address_collection[allowed_countries][10]", "AU");
    form.set("shipping_address_collection[allowed_countries][11]", "NZ");
    form.set("shipping_address_collection[allowed_countries][12]", "PK");
    form.set("line_items[0][quantity]", "1");
    form.set("line_items[0][price_data][currency]", "gbp");
    form.set("line_items[0][price_data][unit_amount]", String(amount));
    form.set("line_items[0][price_data][product_data][name]", `Kalëthon ${product.name}`);
    form.set("line_items[0][price_data][product_data][description]", description);
    form.set("metadata[product_id]", productId);
    form.set("metadata[body_colour]", bodyColour);
    form.set("metadata[collar_colour]", collarColour);
    form.set("metadata[cuff_colour]", cuffColour);
    form.set("metadata[sleeve]", sleeve);
    form.set("metadata[branding]", branding);
    form.set("metadata[fit]", fit);
    form.set("metadata[size]", size);
    form.set("metadata[site_terms_accepted]", "true");
    form.set("metadata[marketing_consent]", marketingConsent ? "yes" : "no");
    form.set("metadata[consent_recorded_at]", new Date().toISOString());

    const stripeResponse = await fetch(stripe.endpoint, {
      method: "POST",
      headers: {
        ...stripe.headers,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: form,
    });
    const data = await stripeResponse.json().catch(() => ({}));
    if (!stripeResponse.ok || typeof data.url !== "string") {
      return NextResponse.json({ message: "Secure checkout could not start. Please try again." }, { status: 502 });
    }
    return NextResponse.json({ url: data.url });
  } catch {
    return NextResponse.json({ message: "Secure checkout could not read this design." }, { status: 400 });
  }
}
