import { kalethonDepartments } from "@/lib/kalethon-departments";

export const proQuoteDepartments = kalethonDepartments;
export const proQuoteBranding = [
  "Not decided",
  "None / undecorated",
  "Embroidery",
  "Sublimation",
  "Debossing",
  "Printed branding",
] as const;
export const proQuoteTimelines = [
  "Exploring options",
  "Within 4 weeks",
  "1–3 months",
  "More than 3 months",
] as const;

export type ProQuoteRequest = {
  department: string;
  category: string;
  product: string;
  quantity: number;
  branding: (typeof proQuoteBranding)[number];
  timeline: (typeof proQuoteTimelines)[number];
  customerName: string;
  customerEmail: string;
  organisation: string;
  phone: string;
  country: string;
  notes: string;
  privacyAcknowledged: true;
};

export class QuoteValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "QuoteValidationError";
  }
}

function field(input: Record<string, unknown>, key: string, max = 160): string {
  const value = input[key];
  if (typeof value !== "string" || value.length > max * 2) {
    throw new QuoteValidationError("Please review your enquiry details and try again.");
  }
  return value.trim().replace(/\s+/g, " ").slice(0, max + 1);
}

export function getProQuoteSelection(input: { department?: string; category?: string; product?: string }) {
  const department = proQuoteDepartments.find((entry) => entry.slug === input.department) ?? proQuoteDepartments.find((entry) => entry.slug === "team-pro")!;
  const category = department.categories.find((entry) => entry.title === input.category) ?? department.categories[0];
  const product = category.products.includes(input.product ?? "") ? input.product! : "";
  return { department: department.slug, category: category.title, product };
}

export function parseProQuoteRequest(input: unknown): ProQuoteRequest {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new QuoteValidationError("Please complete the quotation form.");
  }
  const data = input as Record<string, unknown>;
  const department = field(data, "department", 32);
  const category = field(data, "category", 100);
  const product = field(data, "product", 120);
  const selectedDepartment = proQuoteDepartments.find((entry) => entry.slug === department);
  const selectedCategory = selectedDepartment?.categories.find((entry) => entry.title === category);
  if (!selectedDepartment || !selectedCategory || (product && !selectedCategory.products.includes(product))) {
    throw new QuoteValidationError("Please select a valid product range and category.");
  }

  const quantity = Number(data.quantity);
  if (!Number.isSafeInteger(quantity) || quantity < 1 || quantity > 10000) {
    throw new QuoteValidationError("Please enter a quantity between 1 and 10,000.");
  }

  const branding = field(data, "branding", 40);
  const timeline = field(data, "timeline", 40);
  if (!proQuoteBranding.some((option) => option === branding) || !proQuoteTimelines.some((option) => option === timeline)) {
    throw new QuoteValidationError("Please select a valid decoration method and timeframe.");
  }

  const customerName = field(data, "customerName", 100);
  const customerEmail = field(data, "customerEmail", 160).toLowerCase();
  const organisation = field(data, "organisation", 120);
  const phone = field(data, "phone", 30);
  const country = field(data, "country", 80);
  const notesValue = data.notes;
  const notes = typeof notesValue === "string" && notesValue.length <= 1500 ? notesValue.trim() : "";
  if (customerName.length < 2 || customerName.length > 100 || customerEmail.length > 160 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) {
    throw new QuoteValidationError("Please provide your name and a valid email address.");
  }
  if (organisation.length > 120 || country.length > 80 || (phone && !/^[+0-9() .\-]{7,30}$/.test(phone))) {
    throw new QuoteValidationError("Please check the organisation, country or phone number.");
  }
  if (typeof notesValue !== "string" || notesValue.length > 1500) {
    throw new QuoteValidationError("Additional information must be under 1,500 characters.");
  }
  if (data.privacyAcknowledged !== true) {
    throw new QuoteValidationError("Please acknowledge the privacy information.");
  }
  return {
    department,
    category,
    product,
    quantity,
    branding: branding as ProQuoteRequest["branding"],
    timeline: timeline as ProQuoteRequest["timeline"],
    customerName,
    customerEmail,
    organisation,
    phone,
    country,
    notes,
    privacyAcknowledged: true,
  };
}

export function formatProQuoteForInbox(quote: ProQuoteRequest) {
  const department = proQuoteDepartments.find((entry) => entry.slug === quote.department)!;
  return {
    customerName: quote.customerName,
    customerEmail: quote.customerEmail,
    subject: `[PRO QUOTE] ${department.title} / ${quote.category}`,
    message: [
      "KALËTHON Pro — quotation enquiry (not a confirmed order)",
      `Division: ${department.title}`,
      `Category: ${quote.category}`,
      `Product: ${quote.product || "Please advise"}`,
      `Estimated quantity: ${quote.quantity}`,
      `Branding: ${quote.branding}`,
      `Needed: ${quote.timeline}`,
      `Organisation: ${quote.organisation || "Not provided"}`,
      `Phone / WhatsApp: ${quote.phone || "Not provided"}`,
      `Destination: ${quote.country || "Not specified"}`,
      "Requirements:",
      quote.notes || "Customer requests information on this range.",
    ].join("\n"),
  };
}
