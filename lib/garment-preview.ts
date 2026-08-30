import type { StoreColour } from "@/lib/store";

export type GarmentPreviewAsset = {
  base: string;
  bodyMask: string;
  collarMask?: string;
  cuffMask?: string;
};

export const garmentColourValues: Record<StoreColour, string> = {
  Bone: "#eee7d8",
  Ink: "#141513",
  Navy: "#1e2b43",
  Oxblood: "#712536",
  Sage: "#7c8573",
  Stone: "#aaa092",
};

export const livePreviewAssets: Record<string, GarmentPreviewAsset> = {
  "court-polo": { base: "/customise/polo-short.webp", bodyMask: "/customise/polo-short.webp", collarMask: "/customise/polo-short-collar-mask.svg", cuffMask: "/customise/polo-short-cuff-mask.svg" },
  "casual-polo": { base: "/customise/polo-short.webp", bodyMask: "/customise/polo-short.webp", collarMask: "/customise/polo-short-collar-mask.svg", cuffMask: "/customise/polo-short-cuff-mask.svg" },
  "golf-polo": { base: "/customise/polo-short.webp", bodyMask: "/customise/polo-short.webp", collarMask: "/customise/polo-short-collar-mask.svg", cuffMask: "/customise/polo-short-cuff-mask.svg" },
  "tennis-polo": { base: "/customise/polo-short.webp", bodyMask: "/customise/polo-short.webp", collarMask: "/customise/polo-short-collar-mask.svg", cuffMask: "/customise/polo-short-cuff-mask.svg" },
  "performance-tee": { base: "/customise/performance-tee-short.png", bodyMask: "/customise/performance-tee-short.png", cuffMask: "/customise/performance-tee-short-cuff-mask.svg" },
  "poise-hoodie": { base: "/try-on/poise-hoodie.jpg", bodyMask: "/customise/poise-hoodie-body-mask.svg", cuffMask: "/customise/poise-hoodie-cuff-mask.svg" },
  "club-zip-hoodie": { base: "/try-on/track-jacket.jpg", bodyMask: "/customise/track-jacket-body-mask.svg", collarMask: "/customise/track-jacket-collar-mask.svg", cuffMask: "/customise/track-jacket-cuff-mask.svg" },
  "motion-jogger": { base: "/try-on/motion-jogger.jpg", bodyMask: "/customise/motion-jogger-body-mask.svg", cuffMask: "/customise/motion-jogger-cuff-mask.svg" },
  "court-short": { base: "/try-on/court-short.svg", bodyMask: "/customise/court-short-body-mask.svg" },
  "court-skirt": { base: "/try-on/court-skirt.svg", bodyMask: "/customise/court-skirt-body-mask.svg" },
  "club-tracksuit": { base: "/try-on/track-jacket.jpg", bodyMask: "/customise/track-jacket-body-mask.svg", collarMask: "/customise/track-jacket-collar-mask.svg", cuffMask: "/customise/track-jacket-cuff-mask.svg" },
};

export const garmentToneStrength: Record<StoreColour, { neutral: number; pigment: number }> = {
  Bone: { neutral: 0.74, pigment: 0.3 },
  Stone: { neutral: 0.54, pigment: 0.48 },
  Sage: { neutral: 0.38, pigment: 0.68 },
  Oxblood: { neutral: 0.24, pigment: 0.82 },
  Navy: { neutral: 0.18, pigment: 0.88 },
  Ink: { neutral: 0.08, pigment: 0.94 },
};

function loadCanvasImage(source: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new window.Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("The selected colour preview could not be prepared."));
    image.src = source;
  });
}

function maskedColourLayer(width: number, height: number, mask: HTMLImageElement, colour: string) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("This browser could not prepare the selected colour.");
  context.drawImage(mask, 0, 0, width, height);
  context.globalCompositeOperation = "source-in";
  context.fillStyle = colour;
  context.fillRect(0, 0, width, height);
  return canvas;
}

async function paintMaskedColour(context: CanvasRenderingContext2D, width: number, height: number, maskSource: string, colour: StoreColour) {
  const mask = await loadCanvasImage(maskSource);
  const strength = garmentToneStrength[colour];
  const neutral = maskedColourLayer(width, height, mask, "#ffffff");
  const pigment = maskedColourLayer(width, height, mask, garmentColourValues[colour]);

  context.save();
  context.globalCompositeOperation = "screen";
  context.globalAlpha = strength.neutral;
  context.drawImage(neutral, 0, 0);
  context.globalCompositeOperation = "multiply";
  context.globalAlpha = strength.pigment;
  context.drawImage(pigment, 0, 0);
  context.restore();
}

export async function createGarmentColourDataUrl(productId: string, bodyColour: StoreColour, collarColour: StoreColour, cuffColour: StoreColour) {
  const asset = livePreviewAssets[productId];
  if (!asset) throw new Error("A live colour preview is not available for this piece.");
  const base = await loadCanvasImage(asset.base);
  const canvas = document.createElement("canvas");
  canvas.width = base.naturalWidth;
  canvas.height = base.naturalHeight;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("This browser could not prepare the selected colour.");
  context.drawImage(base, 0, 0);
  await paintMaskedColour(context, canvas.width, canvas.height, asset.bodyMask, bodyColour);
  if (asset.collarMask) await paintMaskedColour(context, canvas.width, canvas.height, asset.collarMask, collarColour);
  if (asset.cuffMask) await paintMaskedColour(context, canvas.width, canvas.height, asset.cuffMask, cuffColour);
  return canvas.toDataURL("image/jpeg", 0.9);
}
