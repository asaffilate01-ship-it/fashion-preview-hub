"use client";

import { useState } from "react";

type ResponsiveAsset = {
  avif: string;
  webp: string;
};

const responsiveAssets: Record<string, ResponsiveAsset> = {
  "/media/campaign-polo-960.webp": {
    avif: "/media/campaign-polo-480.avif 480w, /media/campaign-polo-960.avif 960w, /media/campaign-polo-1586.avif 1586w",
    webp: "/media/campaign-polo-480.webp 480w, /media/campaign-polo-960.webp 960w, /media/campaign-polo-1586.webp 1586w",
  },
  "/media/campaign-hoodie-track-960.webp": {
    avif: "/media/campaign-hoodie-track-480.avif 480w, /media/campaign-hoodie-track-960.avif 960w, /media/campaign-hoodie-track-1586.avif 1586w",
    webp: "/media/campaign-hoodie-track-480.webp 480w, /media/campaign-hoodie-track-960.webp 960w, /media/campaign-hoodie-track-1586.webp 1586w",
  },
  "/media/club-zip-hoodie-960.webp": {
    avif: "/media/club-zip-hoodie-480.avif 480w, /media/club-zip-hoodie-960.avif 960w, /media/club-zip-hoodie-1122.avif 1122w",
    webp: "/media/club-zip-hoodie-480.webp 480w, /media/club-zip-hoodie-960.webp 960w, /media/club-zip-hoodie-1122.webp 1122w",
  },
};

type ResponsiveProductImageProps = {
  src: string;
  alt: string;
  sizes: string;
  imgClassName?: string;
  priority?: boolean;
};

export default function ResponsiveProductImage({ src, alt, sizes, imgClassName, priority = false }: ResponsiveProductImageProps) {
  const [loadedSrc, setLoadedSrc] = useState<string | null>(null);
  const loaded = loadedSrc === src;
  const sources = responsiveAssets[src];

  return (
    <div className={`responsive-product-image${loaded ? " is-loaded" : ""}`} aria-busy={!loaded}>
      <span className="product-image-skeleton" aria-hidden="true" />
      <picture>
        {sources && <source type="image/avif" srcSet={sources.avif} sizes={sizes} />}
        {sources && <source type="image/webp" srcSet={sources.webp} sizes={sizes} />}
        <img
          className={imgClassName}
          src={src}
          alt={alt}
          sizes={sizes}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          fetchPriority={priority ? "high" : "auto"}
          onLoad={() => setLoadedSrc(src)}
          onError={() => setLoadedSrc(src)}
        />
      </picture>
    </div>
  );
}
