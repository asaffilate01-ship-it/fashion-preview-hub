import { NextResponse } from "next/server";

const colours = new Set(["Bone", "Ink", "Navy", "Oxblood", "Sage", "Stone"]);
const sizes = new Set(["XS", "S", "M", "L", "XL", "2XL", "3XL"]);
const sleeves = new Set(["Short sleeve", "Long sleeve"]);
const brandingOptions = new Set(["K mark", "Kalëthon wordmark"]);

export async function POST(request: Request) {
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) {
    return NextResponse.json(
      { code: "not_configured", message: "Secure checkout is ready; the Stripe live key still needs to be connected." },
      { status: 503 },
    );
  }

  try {
    const body = await request.json();
    const { bodyColour, branding, collarColour, cuffColour, size, sleeve } = body ?? {};
    if (
      !colours.has(bodyColour) ||
      !colours.has(collarColour) ||
      !colours.has(cuffColour) ||
      !sizes.has(size) ||
      !sleeves.has(sleeve) ||
      !brandingOptions.has(branding)
    ) {
      return NextResponse.json({ message: "The garment specification was not valid." }, { status: 400 });
    }

    const amount = 8500 + (sleeve === "Long sleeve" ? 1000 : 0) + (branding === "Kalëthon wordmark" ? 800 : 0);
    const origin = new URL(request.url).origin;
    const description = `${bodyColour} body / ${collarColour} collar / ${cuffColour} cuffs / ${sleeve} / ${branding} / ${size}`;
    const form = new URLSearchParams();
    form.set("mode", "payment");
    form.set("success_url", `${origin}/?checkout=success#design-yours`);
    form.set("cancel_url", `${origin}/?checkout=cancelled#design-yours`);
    form.set("billing_address_collection", "required");
    form.set("phone_number_collection[enabled]", "true");
    form.set("allow_promotion_codes", "true");
    form.set("shipping_address_collection[allowed_countries][0]", "GB");
    form.set("shipping_address_collection[allowed_countries][1]", "US");
    form.set("shipping_address_collection[allowed_countries][2]", "CA");
    form.set("shipping_address_collection[allowed_countries][3]", "AE");
    form.set("shipping_address_collection[allowed_countries][4]", "DE");
    form.set("shipping_address_collection[allowed_countries][5]", "FR");
    form.set("line_items[0][quantity]", "1");
    form.set("line_items[0][price_data][currency]", "gbp");
    form.set("line_items[0][price_data][unit_amount]", String(amount));
    form.set("line_items[0][price_data][product_data][name]", "Kalëthon Custom Court Polo");
    form.set("line_items[0][price_data][product_data][description]", description);
    form.set("metadata[body_colour]", bodyColour);
    form.set("metadata[collar_colour]", collarColour);
    form.set("metadata[cuff_colour]", cuffColour);
    form.set("metadata[sleeve]", sleeve);
    form.set("metadata[branding]", branding);
    form.set("metadata[size]", size);

    const stripeResponse = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${stripeKey}`,
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
