import type { Metadata } from "next";
import "./globals.css";
import CookieConsent from "@/components/cookie-consent";
import BagProvider from "@/components/bag-provider";

export const metadata: Metadata = {
  metadataBase: new URL("https://kalethon.com"),
  title: {
    default: "KALËTHON | Premium British Sportswear & Custom Clothing",
    template: "%s | KALËTHON",
  },
  description: "Premium British sport-to-city clothing with made-to-order customisation, international sizing and private virtual try-on.",
  keywords: [
    "KALETHON", "KALËTHON", "premium British sportswear", "custom sportswear UK", "custom polo shirt", "personalised polo shirt",
    "tennis clothing", "golf clothing", "padel clothing", "pickleball clothing", "performance clothing", "sports lifestyle clothing",
    "premium hoodies", "custom tracksuits", "performance joggers", "sleeveless performance tank", "modest sportswear women",
    "men's sportswear UK", "women's sportswear UK", "international clothing size guide", "virtual try on clothing", "London sportswear brand",
  ],
  applicationName: "KALËTHON",
  category: "Sportswear and fashion",
  alternates: { canonical: "/" },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    shortcut: "/favicon.ico",
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  openGraph: {
    type: "website",
    url: "https://kalethon.com",
    siteName: "KALËTHON",
    title: "KALËTHON | Premium British Sportswear & Custom Clothing",
    description: "Premium sport-to-city clothing, garment customisation, international sizing and private virtual try-on.",
    locale: "en_GB",
    images: [{ url: "/og.jpg", width: 1200, height: 630, alt: "KALËTHON — Poise in motion" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "KALËTHON | Premium British Sportswear & Custom Clothing",
    description: "Premium sport-to-city clothing, garment customisation and private virtual try-on.",
    images: ["/og.jpg"],
  },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 } },
};

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://kalethon.com/#organization",
      name: "KALËTHON",
      alternateName: "KALETHON",
      url: "https://kalethon.com",
      logo: "https://kalethon.com/kalethon-mark.svg",
      description: "Premium British sportswear and custom sport-to-city clothing.",
      areaServed: "Worldwide",
      email: "hello@kalethon.com",
      contactPoint: { "@type": "ContactPoint", email: "hello@kalethon.com", contactType: "customer service", availableLanguage: "English" },
    },
    {
      "@type": "WebSite",
      "@id": "https://kalethon.com/#website",
      url: "https://kalethon.com",
      name: "KALËTHON",
      publisher: { "@id": "https://kalethon.com/#organization" },
      potentialAction: {
        "@type": "SearchAction",
        target: { "@type": "EntryPoint", urlTemplate: "https://kalethon.com/search?q={search_term_string}" },
        "query-input": "required name=search_term_string",
      },
    },
  ],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
        <BagProvider>
          {children}
          <CookieConsent />
        </BagProvider>
      </body>
    </html>
  );
}
