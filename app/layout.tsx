import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://kalethon.com"),
  title: {
    default: "Kalëthon | Premium British Sportswear & Custom Clothing",
    template: "%s | Kalëthon",
  },
  description: "Shop and customise premium British sportswear for tennis, golf, padel, pickleball, training and everyday city life. Polos, performance tops, tanks, hoodies, tracksuits, joggers and modest courtwear with private virtual try-on.",
  keywords: [
    "Kalethon", "Kalëthon", "premium British sportswear", "custom sportswear UK", "custom polo shirt", "personalised polo shirt",
    "tennis clothing", "golf clothing", "padel clothing", "pickleball clothing", "performance clothing", "sports lifestyle clothing",
    "premium hoodies", "custom tracksuits", "performance joggers", "sleeveless performance tank", "modest sportswear women",
    "men's sportswear UK", "women's sportswear UK", "international clothing size guide", "virtual try on clothing", "London sportswear brand",
  ],
  applicationName: "Kalëthon",
  category: "Sportswear and fashion",
  alternates: { canonical: "/" },
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
  openGraph: {
    type: "website",
    url: "https://kalethon.com",
    siteName: "Kalëthon",
    title: "Kalëthon | Premium British Sportswear & Custom Clothing",
    description: "Premium sport-to-city clothing, garment customisation, international sizing and private virtual try-on.",
    locale: "en_GB",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Kalëthon — Poise in motion" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Kalëthon | Premium British Sportswear & Custom Clothing",
    description: "Premium sport-to-city clothing, garment customisation and private virtual try-on.",
    images: ["/og.png"],
  },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 } },
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Kalëthon",
  alternateName: "Kalethon",
  url: "https://kalethon.com",
  logo: "https://kalethon.com/kalethon-mark.svg",
  description: "Premium British sportswear and custom sport-to-city clothing.",
  areaServed: "Worldwide",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
        {children}
      </body>
    </html>
  );
}
