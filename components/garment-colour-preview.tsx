"use client";

import Image from "next/image";
import type { CSSProperties } from "react";
import type { StoreColour } from "@/lib/store";
import { garmentColourValues, garmentToneStrength, livePreviewAssets } from "@/lib/garment-preview";

type PreviewProps = {
  productId: string;
  name: string;
  bodyColour: StoreColour;
  collarColour: StoreColour;
  cuffColour: StoreColour;
  className?: string;
};

function maskStyle(mask: string, colour: StoreColour, layer: "neutral" | "pigment"): CSSProperties {
  return {
    backgroundColor: layer === "neutral" ? "#fff" : garmentColourValues[colour],
    WebkitMaskImage: `url(${mask})`,
    maskImage: `url(${mask})`,
    opacity: garmentToneStrength[colour][layer],
  };
}

function ColourPart({ mask, colour, part }: { mask: string; colour: StoreColour; part: string }) {
  return <>
    <i className={`garment-tone-layer garment-neutral-layer ${part}`} style={maskStyle(mask, colour, "neutral")} />
    <i className={`garment-tone-layer garment-pigment-layer ${part}`} style={maskStyle(mask, colour, "pigment")} />
  </>;
}

export default function GarmentColourPreview({ productId, name, bodyColour, collarColour, cuffColour, className = "" }: PreviewProps) {
  const asset = livePreviewAssets[productId];
  if (!asset) return null;
  const label = `${name} in ${bodyColour}${collarColour !== bodyColour ? ` with ${collarColour} collar` : ""}${cuffColour !== bodyColour ? ` and ${cuffColour} trim` : ""}`;

  return <div className={`garment-colour-preview ${className}`} key={`${productId}-${bodyColour}-${collarColour}-${cuffColour}`} role="img" aria-label={label} data-body-colour={bodyColour.toLowerCase()}>
    <Image src={asset.base} alt="" aria-hidden="true" fill sizes="(max-width: 640px) 100vw, (max-width: 960px) 50vw, 33vw" unoptimized />
    <ColourPart mask={asset.bodyMask} colour={bodyColour} part="body-part" />
    {asset.collarMask && <ColourPart mask={asset.collarMask} colour={collarColour} part="trim-part" />}
    {asset.cuffMask && <ColourPart mask={asset.cuffMask} colour={cuffColour} part="trim-part" />}
  </div>;
}
