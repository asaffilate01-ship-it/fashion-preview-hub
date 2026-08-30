import type { Metadata, Viewport } from "next";
import "./globals.css";
import CookieConsent from "@/components/cookie-consent";
import BagProvider from "@/components/bag-provider";
import SiteTools from "@/components/site-tools";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#10110f",
  colorScheme: "light",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://kalethon.com"),
  title: {
    default: "KALËTHON | Premium British Sport-to-City Clothing",
    template: "%s | KALËTHON",
  },
  description: "Premium British sport-to-city clothing in considered standard colourways, with international sizing and private virtual try-on.",
  keywords: [
    "luxury athleisure", "premium sportswear New York", "premium sportswear Boston", "premium sportswear Miami",
    "premium sportswear Washington DC", "premium sportswear Chicago", "premium sportswear Los Angeles", "premium sportswear Seattle",
    "British sportswear Europe", "padel clothing Spain", "tennis clothing France", "sportswear Germany",
    "premium sportswear Dubai", "padel clothing Dubai", "sportswear UAE", "worldwide sportswear delivery",
    "KALETHON", "KALËTHON", "premium British sportswear", "sport to city clothing", "contrast collar polo", "British polo shirt",
    "tennis clothing", "golf clothing", "padel clothing", "pickleball clothing", "performance clothing", "sports lifestyle clothing",
    "premium hoodies", "premium tracksuits", "performance joggers", "golf polo shirt", "tennis polo shirt", "modest sportswear women",
    "men's sportswear UK", "women's sportswear UK", "international clothing size guide", "virtual try on clothing", "London sportswear brand",
  ],
  applicationName: "KALËTHON",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "KALËTHON" },
  authors: [{ name: "KALËTHON", url: "https://kalethon.com" }],
  creator: "KALËTHON",
  publisher: "KALËTHON",
  category: "Sportswear and fashion",
  manifest: "/manifest.webmanifest",
  formatDetection: { email: false, address: false, telephone: false },
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
    title: "KALËTHON | Premium British Sport-to-City Clothing",
    description: "Premium sport-to-city clothing in considered standard colourways, with international sizing and private virtual try-on.",
    locale: "en_GB",
    images: [{ url: "/og.jpg", width: 1200, height: 630, alt: "KALËTHON — Poise in motion" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "KALËTHON | Premium British Sport-to-City Clothing",
    description: "Premium sport-to-city clothing, finished colourways and private virtual try-on.",
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
      description: "Premium British sportswear and considered sport-to-city clothing.",
      areaServed: "Worldwide",
      slogan: "Poise in motion.",
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
    {
      "@type": "Brand",
      "@id": "https://kalethon.com/#brand",
      name: "KALËTHON",
      alternateName: "KALETHON",
      slogan: "Poise in motion.",
      logo: "https://kalethon.com/kalethon-mark.svg",
      url: "https://kalethon.com",
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
          <SiteTools />
          <CookieConsent />
        </BagProvider>
      </body>
    </html>
  );
}
