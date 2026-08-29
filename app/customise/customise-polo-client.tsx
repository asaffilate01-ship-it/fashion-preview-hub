"use client";

import { ChangeEvent, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const colours = [
  { name: "Bone", hex: "#e8dfd1", dark: false },
  { name: "Ink", hex: "#171816", dark: true },
  { name: "Navy", hex: "#18283c", dark: true },
  { name: "Oxblood", hex: "#67202d", dark: true },
  { name: "Sage", hex: "#788171", dark: true },
  { name: "Stone", hex: "#aca397", dark: false },
] as const;

const brandingOptions = ["K mark", "Kalëthon wordmark"] as const;
const sizes = ["XS", "S", "M", "L", "XL", "2XL", "3XL"] as const;
const womenBottomSizes = ["UK 6", "UK 8", "UK 10", "UK 12", "UK 14", "UK 16", "UK 18", "UK 20", "UK 22", "UK 24"] as const;
const menBottomSizes = ["28S", "28R", "30S", "30R", "30L", "32S", "32R", "32L", "34S", "34R", "34L", "36S", "36R", "36L", "38S", "38R", "38L", "40R", "40L", "42R", "44R"] as const;
const fits = ["Athletic", "Regular", "Relaxed"] as const;
const sizeChart = [
  ["XS", "84–89", "33–35", "44", "34", "34", "XS", "44", "XS"],
  ["S", "90–95", "35½–37½", "46", "36", "36", "S", "46", "S"],
  ["M", "96–101", "38–40", "48", "38", "38", "M", "48", "M"],
  ["L", "102–107", "40–42", "50", "40", "40", "L", "50", "L"],
  ["XL", "108–113", "42½–44½", "52", "42", "42", "XL", "52", "XL"],
  ["2XL", "114–121", "45–47½", "54–56", "44–46", "44–46", "2XL", "54–56", "2XL"],
  ["3XL", "122–129", "48–51", "58–60", "48–50", "48–50", "3XL", "58–60", "3XL"],
] as const;

const womenBottomChart = [
  ["6", "62–64", "86–88", "34", "2", "2", "6", "34", "6"],
  ["8", "65–67", "89–91", "36", "4", "4", "8", "36", "8"],
  ["10", "68–71", "92–95", "38", "6", "6", "10", "38", "10"],
  ["12", "72–76", "96–100", "40", "8", "8", "12", "40", "12"],
  ["14", "77–82", "101–106", "42", "10", "10", "14", "42", "14"],
  ["16", "83–89", "107–113", "44", "12", "12", "16", "44", "16"],
  ["18", "90–94", "114–118", "46", "14", "14", "18", "46", "18"],
  ["20", "95–98", "119–122", "48", "16", "16", "20", "48", "20"],
  ["22", "99–103", "123–127", "50", "18", "18", "22", "50", "22"],
  ["24", "104–108", "128–132", "52", "20", "20", "24", "52", "24"],
] as const;

const menBottomChart = [
  ["28", "71", "44", "28", "28", "28", "44", "28"],
  ["30", "76", "46", "30", "30", "30", "46", "30"],
  ["32", "81", "48", "32", "32", "32", "48", "32"],
  ["34", "86", "50", "34", "34", "34", "50", "34"],
  ["36", "91", "52", "36", "36", "36", "52", "36"],
  ["38", "97", "54", "38", "38", "38", "54", "38"],
  ["40", "102", "56", "40", "40", "40", "56", "40"],
  ["42", "107", "58", "42", "42", "42", "58", "42"],
  ["44", "112", "60", "44", "44", "44", "60", "44"],
] as const;

const productTemplates = [
  {
    key: "court-polo",
    apiId: "custom-polo",
    name: "Court Polo",
    shortName: "Polo",
    description: "Classic polo shirt",
    image: "/customise/polo-short.webp",
    price: 85,
    sleeves: ["Short sleeve", "Long sleeve"],
    collar: true,
    cuffs: true,
    sizeMode: "top",
    material: "220 GSM mercerised cotton piqué · 95% compact cotton / 5% elastane",
    standard: "Shrinkage ≤3% · pilling ≥4 · wash colourfastness ≥4",
  },
  {
    key: "performance-tee",
    apiId: "form-tee",
    name: "Performance Tee",
    shortName: "Tee",
    description: "Short or long sleeve top",
    image: "/customise/performance-tee-short.png",
    price: 68,
    sleeves: ["Short sleeve", "Long sleeve"],
    collar: false,
    cuffs: true,
    sizeMode: "top",
    material: "240 GSM compact performance jersey · cotton / recycled poly stretch",
    standard: "Moisture spread target ≤4 seconds · recovery ≥90%",
  },
  {
    key: "performance-tank",
    apiId: "performance-tank",
    name: "Performance Tank",
    shortName: "Tank / vest",
    description: "Sleeveless full-length top",
    image: "/customise/performance-tank.png",
    price: 64,
    sleeves: ["Sleeveless"],
    collar: false,
    cuffs: false,
    sizeMode: "top",
    material: "240 GSM compact performance interlock · full-length modest cut",
    standard: "Bound armholes · shape recovery ≥90% · no crop fit",
  },
  {
    key: "poise-hoodie",
    apiId: "poise-hoodie",
    name: "Poise Hoodie",
    shortName: "Hoodie",
    description: "Pullover with ribbed cuffs",
    image: "/try-on/poise-hoodie.jpg",
    price: 125,
    sleeves: ["Long sleeve"],
    collar: false,
    cuffs: true,
    sizeMode: "top",
    material: "420 GSM loopback cotton · structured hood · ribbed hem and cuffs",
    standard: "Low-twist fleece · reinforced pocket · shrinkage ≤3%",
  },
  {
    key: "track-jacket",
    apiId: "track-jacket",
    name: "Track Jacket",
    shortName: "Track jacket",
    description: "Full-zip sports jacket",
    image: "/try-on/track-jacket.jpg",
    price: 145,
    sleeves: ["Long sleeve"],
    collar: true,
    cuffs: true,
    sizeMode: "top",
    material: "Matte technical twill · four-way stretch · two-way front zip",
    standard: "Abrasion target ≥30k cycles · colourfastness ≥4",
  },
  {
    key: "motion-jogger",
    apiId: "motion-jogger",
    name: "Motion Jogger",
    shortName: "Jogger",
    description: "Full-length cuffed trouser",
    image: "/try-on/motion-jogger.jpg",
    price: 110,
    sleeves: [],
    collar: false,
    cuffs: true,
    sizeMode: "men-bottom",
    material: "Structured double-knit · articulated knee · secure zipped pockets",
    standard: "Knee recovery ≥90% · seam strength ≥180 N",
  },
  {
    key: "club-tracksuit",
    apiId: "club-tracksuit",
    name: "Club Tracksuit",
    shortName: "Tracksuit",
    description: "Jacket and jogger set",
    image: "/campaign-hoodie-track.png",
    price: 225,
    sleeves: ["Long sleeve"],
    collar: true,
    cuffs: true,
    sizeMode: "top",
    material: "Coordinated 480 GSM brushed fleece jacket and jogger",
    standard: "Matched dye lot · paired garment tolerance ±5 mm",
  },
  {
    key: "court-short",
    apiId: "court-short",
    name: "Court Short",
    shortName: "Short",
    description: "Full-coverage sports short",
    image: "/try-on/court-short.jpg",
    price: 78,
    sleeves: [],
    collar: false,
    cuffs: false,
    sizeMode: "women-bottom",
    material: "Four-way stretch woven shell · integrated modest liner",
    standard: "Full coverage · fast-dry target ≤45 minutes",
  },
  {
    key: "court-skirt",
    apiId: "court-skirt",
    name: "Court Skort",
    shortName: "Skort",
    description: "Skirt with built-in short",
    image: "/try-on/court-skirt.jpg",
    price: 92,
    sleeves: [],
    collar: false,
    cuffs: false,
    sizeMode: "women-bottom",
    material: "Stretch woven overskirt · full-coverage integrated short",
    standard: "No bare midriff · secure ball pocket · opaque under stretch",
  },
] as const;

type ColourName = (typeof colours)[number]["name"];
type Sleeve = "Not applicable" | "Sleeveless" | "Short sleeve" | "Long sleeve";
type Branding = (typeof brandingOptions)[number];
type Fit = (typeof fits)[number];
type ProductKey = (typeof productTemplates)[number]["key"];
type CaptureMode = "upload" | "camera";
type TryOnStage = "idle" | "preparing" | "queued" | "processing" | "complete" | "error";

function loadImage(source: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("That image could not be prepared."));
    image.src = source;
  });
}

function dataUrlFromBlob(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("That image could not be read."));
    reader.readAsDataURL(blob);
  });
}

async function compressPortrait(source: string) {
  const image = await loadImage(source);
  const scale = Math.min(1, 1600 / Math.max(image.naturalWidth, image.naturalHeight));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
  canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
  const context = canvas.getContext("2d");
  if (!context) throw new Error("This browser could not prepare the portrait.");
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", 0.86);
}

function colour(name: ColourName) {
  return colours.find((option) => option.name === name) ?? colours[0];
}

function stageCopy(stage: TryOnStage) {
  if (stage === "preparing") return "Preparing your custom garment…";
  if (stage === "queued") return "Your look is in the studio queue…";
  if (stage === "processing") return "Draping your exact garment design…";
  if (stage === "complete") return "Your custom Kalëthon look is ready.";
  return "Your portrait is processed only to create this preview.";
}

export default function CustomisePoloClient() {
  const [productKey, setProductKey] = useState<ProductKey>("court-polo");
  const [bodyColour, setBodyColour] = useState<ColourName>("Bone");
  const [collarColour, setCollarColour] = useState<ColourName>("Oxblood");
  const [cuffColour, setCuffColour] = useState<ColourName>("Oxblood");
  const [sleeve, setSleeve] = useState<Sleeve>("Short sleeve");
  const [branding, setBranding] = useState<Branding>("K mark");
  const [size, setSize] = useState<string>("M");
  const [fit, setFit] = useState<Fit>("Regular");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [sizeOpen, setSizeOpen] = useState(false);
  const [mode, setMode] = useState<CaptureMode>("upload");
  const [portrait, setPortrait] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [consent, setConsent] = useState(false);
  const [tryOnStage, setTryOnStage] = useState<TryOnStage>("idle");
  const [message, setMessage] = useState("");
  const [cameraReady, setCameraReady] = useState(false);
  const [checkoutBusy, setCheckoutBusy] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [marketingConsent, setMarketingConsent] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const product = productTemplates.find((template) => template.key === productKey) ?? productTemplates[0];
  const availableSizes = product.sizeMode === "women-bottom" ? womenBottomSizes : product.sizeMode === "men-bottom" ? menBottomSizes : sizes;
  const price = product.price + (sleeve === "Long sleeve" && product.sleeves.length > 1 ? 10 : 0) + (branding === "Kalëthon wordmark" ? 8 : 0);
  const logoColour = colour(bodyColour).dark ? "#f1eadf" : "#10110f";
  const working = ["preparing", "queued", "processing"].includes(tryOnStage);
  const hasLiveColourPreview = product.key === "court-polo" || product.key === "performance-tee" || product.key === "performance-tank";

  const chooseProduct = (nextKey: ProductKey) => {
    const nextProduct = productTemplates.find((template) => template.key === nextKey) ?? productTemplates[0];
    setProductKey(nextKey);
    setSleeve((nextProduct.sleeves[0] ?? "Not applicable") as Sleeve);
    setSize(nextProduct.sizeMode === "women-bottom" ? "UK 12" : nextProduct.sizeMode === "men-bottom" ? "34R" : "M");
    setResult(null);
    setTryOnStage("idle");
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setCameraReady(false);
  };

  useEffect(() => () => stopCamera(), []);

  useEffect(() => {
    let active = true;
    const draw = async () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const context = canvas.getContext("2d");
      if (!context) return;
      try {
        const isPolo = product.key === "court-polo";
        const garmentSource = isPolo
          ? (sleeve === "Long sleeve" ? "/customise/polo-long.webp" : "/customise/polo-short.webp")
          : product.key === "performance-tee"
            ? (sleeve === "Long sleeve" ? "/customise/performance-tee-long.png" : "/customise/performance-tee-short.png")
            : product.image;
        const garment = await loadImage(garmentSource);
        if (!active) return;
        canvas.width = 800;
        canvas.height = 920;
        context.clearRect(0, 0, canvas.width, canvas.height);

        const tintedGarment = (selectedColour: ColourName) => {
          const layer = document.createElement("canvas");
          layer.width = canvas.width;
          layer.height = canvas.height;
          const layerContext = layer.getContext("2d");
          if (!layerContext) return layer;
          const selected = colour(selectedColour);
          const removeDarkMatte = () => {
            if (product.key !== "performance-tee" && product.key !== "performance-tank") return;
            const pixels = layerContext.getImageData(0, 0, 800, 920);
            for (let index = 0; index < pixels.data.length; index += 4) {
              const luminance = (pixels.data[index] * .2126) + (pixels.data[index + 1] * .7152) + (pixels.data[index + 2] * .0722);
              const matte = Math.max(0, Math.min(1, (luminance - 28) / 96));
              pixels.data[index + 3] = Math.round(pixels.data[index + 3] * matte);
            }
            layerContext.putImageData(pixels, 0, 0);
          };
          if (isPolo) {
            layerContext.drawImage(garment, 32, 0, 736, 920);
          } else {
            const scale = Math.min(700 / garment.naturalWidth, 840 / garment.naturalHeight);
            const width = garment.naturalWidth * scale;
            const height = garment.naturalHeight * scale;
            layerContext.drawImage(garment, (800 - width) / 2, (920 - height) / 2, width, height);
          }
          removeDarkMatte();
          layerContext.globalCompositeOperation = "source-atop";
          layerContext.globalAlpha = selected.dark ? 0.94 : 0.72;
          layerContext.fillStyle = selected.hex;
          layerContext.fillRect(0, 0, 800, 920);
          layerContext.globalCompositeOperation = "multiply";
          layerContext.globalAlpha = selected.dark ? 0.48 : 0.34;
          if (isPolo) {
            layerContext.drawImage(garment, 32, 0, 736, 920);
          } else {
            const scale = Math.min(700 / garment.naturalWidth, 840 / garment.naturalHeight);
            const width = garment.naturalWidth * scale;
            const height = garment.naturalHeight * scale;
            layerContext.drawImage(garment, (800 - width) / 2, (920 - height) / 2, width, height);
          }
          removeDarkMatte();
          layerContext.globalCompositeOperation = "source-over";
          layerContext.globalAlpha = 1;
          return layer;
        };

        const drawMaskedLayer = (layer: HTMLCanvasElement, mask: HTMLImageElement) => {
          const maskedLayer = document.createElement("canvas");
          maskedLayer.width = canvas.width;
          maskedLayer.height = canvas.height;
          const maskedContext = maskedLayer.getContext("2d");
          if (!maskedContext) return;
          maskedContext.drawImage(layer, 0, 0);
          maskedContext.globalCompositeOperation = "destination-in";
          maskedContext.drawImage(mask, 32, 0, 736, 920);
          maskedContext.globalCompositeOperation = "source-over";
          context.drawImage(maskedLayer, 0, 0);
        };

        if (hasLiveColourPreview) {
          context.drawImage(tintedGarment(bodyColour), 0, 0);
        } else {
          context.fillStyle = "#eee9e1";
          context.fillRect(0, 0, canvas.width, canvas.height);
          const scale = Math.min(760 / garment.naturalWidth, 880 / garment.naturalHeight);
          const width = garment.naturalWidth * scale;
          const height = garment.naturalHeight * scale;
          context.drawImage(garment, (800 - width) / 2, (920 - height) / 2, width, height);
        }
        if (isPolo) {
          const maskPrefix = sleeve === "Long sleeve" ? "polo-long" : "polo-short";
          const [collarMask, cuffMask] = await Promise.all([
            loadImage(`/customise/${maskPrefix}-collar-mask.svg`),
            loadImage(`/customise/${maskPrefix}-cuff-mask.svg`),
          ]);
          if (!active) return;
          const collarLayer = tintedGarment(collarColour);
          drawMaskedLayer(collarLayer, collarMask);
          const cuffLayer = tintedGarment(cuffColour);
          drawMaskedLayer(cuffLayer, cuffMask);
        }

        if (!hasLiveColourPreview) return;
        const mark = await loadImage(branding === "K mark" ? "/kalethon-mark.svg" : "/kalethon-logo.svg");
        if (!active) return;
        const isKMark = branding === "K mark";
        const markWidth = isKMark ? 26 : 82;
        const markHeight = isKMark ? 26 : 13;
        const markLayer = document.createElement("canvas");
        markLayer.width = markWidth;
        markLayer.height = markHeight;
        const markContext = markLayer.getContext("2d");
        if (markContext) {
          if (isKMark) {
            markContext.drawImage(mark, 0, 0, markWidth, markHeight);
          } else {
            markContext.drawImage(mark, 145, 45, 685, 85, 0, 0, markWidth, markHeight);
          }
          markContext.globalCompositeOperation = "source-in";
          markContext.fillStyle = logoColour;
          markContext.fillRect(0, 0, markWidth, markHeight);
          const markX = product.key === "court-polo" ? (isKMark ? 490 : 466) : (isKMark ? 500 : 460);
          const markY = product.key === "court-polo" ? (isKMark ? 319 : 327) : 350;
          context.drawImage(markLayer, markX, markY);
        }
      } catch {
        setMessage("The product preview could not be rendered.");
      }
    };
    void draw();
    return () => { active = false; };
  }, [bodyColour, branding, collarColour, cuffColour, hasLiveColourPreview, logoColour, product, sleeve]);

  const setCaptureMode = (nextMode: CaptureMode) => {
    if (nextMode !== "camera") stopCamera();
    setMode(nextMode);
    setPortrait(null);
    setResult(null);
    setMessage("");
    setTryOnStage("idle");
  };

  const startCamera = async () => {
    setMessage("");
    if (!navigator.mediaDevices?.getUserMedia) {
      setTryOnStage("error");
      setMessage("Camera access is unavailable here. Upload a portrait instead.");
      return;
    }
    try {
      stopCamera();
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 1600 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraReady(true);
    } catch {
      setTryOnStage("error");
      setMessage("Camera permission was not granted. Upload a portrait instead.");
    }
  };

  const captureFrame = () => {
    const video = videoRef.current;
    if (!video || !video.videoWidth || !video.videoHeight) return;
    const scale = Math.min(1, 1600 / Math.max(video.videoWidth, video.videoHeight));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(video.videoWidth * scale);
    canvas.height = Math.round(video.videoHeight * scale);
    const context = canvas.getContext("2d");
    if (!context) return;
    context.translate(canvas.width, 0);
    context.scale(-1, 1);
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    setPortrait(canvas.toDataURL("image/jpeg", 0.86));
    setResult(null);
    setTryOnStage("idle");
    stopCamera();
  };

  const handleFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!/^image\/(jpeg|png|webp)$/i.test(file.type) || file.size > 10 * 1024 * 1024) {
      setTryOnStage("error");
      setMessage("Choose a JPG, PNG or WebP portrait under 10 MB.");
      return;
    }
    try {
      setTryOnStage("preparing");
      setPortrait(await compressPortrait(await dataUrlFromBlob(file)));
      setResult(null);
      setMessage("");
      setTryOnStage("idle");
    } catch (error) {
      setTryOnStage("error");
      setMessage(error instanceof Error ? error.message : "That portrait could not be prepared.");
    } finally {
      event.target.value = "";
    }
  };

  const runTryOn = async () => {
    if (!portrait || !consent || working || !canvasRef.current) return;
    setTryOnStage("preparing");
    setResult(null);
    setMessage("");
    try {
      const response = await fetch("/api/try-on", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.apiId,
          modelImage: portrait,
          productImage: canvasRef.current.toDataURL("image/png"),
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        if (data.code === "not_configured") throw new Error("Virtual try-on is ready; the FASHN API key still needs to be connected.");
        throw new Error(data.message || "The virtual studio could not start.");
      }
      setTryOnStage("queued");
      for (let attempt = 0; attempt < 36; attempt += 1) {
        await new Promise((resolve) => window.setTimeout(resolve, 2500));
        const statusResponse = await fetch(`/api/try-on/status?id=${encodeURIComponent(data.id)}`, { cache: "no-store" });
        const statusData = await statusResponse.json();
        if (!statusResponse.ok) throw new Error(statusData.message || "The virtual studio connection was interrupted.");
        if (statusData.status === "completed" && statusData.output?.[0]) {
          setResult(statusData.output[0]);
          setTryOnStage("complete");
          return;
        }
        if (["failed", "canceled", "time_out"].includes(statusData.status)) {
          throw new Error(statusData.message || "This preview could not be completed. Try a clearer, full-length portrait.");
        }
        setTryOnStage(statusData.status === "processing" ? "processing" : "queued");
      }
      throw new Error("This preview is taking longer than expected. Please try again.");
    } catch (error) {
      setTryOnStage("error");
      setMessage(error instanceof Error ? error.message : "The virtual studio could not complete this preview.");
    }
  };

  const checkout = async () => {
    if (checkoutBusy) return;
    if (!termsAccepted) {
      setMessage("Please confirm the order terms and personalised-item returns notice before checkout.");
      return;
    }
    setCheckoutBusy(true);
    setMessage("");
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.key, bodyColour, branding, collarColour, cuffColour, fit, size, sleeve, termsAccepted, marketingConsent }),
      });
      const data = await response.json();
      if (!response.ok || typeof data.url !== "string") throw new Error(data.message || "Secure checkout could not start.");
      window.location.assign(data.url);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Secure checkout could not start.");
      setCheckoutBusy(false);
    }
  };

  const colourGroup = (label: string, value: ColourName, setter: (value: ColourName) => void) => (
    <fieldset className="custom-colour-group">
      <legend><span>{label}</span><b>{value}</b></legend>
      <RadioGroup className="custom-colour-row" value={value} onValueChange={(next) => setter(next as ColourName)}>
        {colours.map((option) => (
          <label className={value === option.name ? "is-selected" : ""} key={option.name}>
            <RadioGroupItem className="sr-only" value={option.name} aria-label={option.name} />
            <span style={{ backgroundColor: option.hex }} />
            <small>{option.name}</small>
          </label>
        ))}
      </RadioGroup>
    </fieldset>
  );

  return (
    <>
      <div className="custom-product-picker">
        <div className="custom-product-picker-heading">
          <div><span>Step 1</span><h3>Choose your garment</h3></div>
          <p>Select one product, then personalise its colour, finish, fit and size.</p>
        </div>
        <div className="bespoke-base-picker" role="group" aria-label="Choose a product to customise">
          {productTemplates.map((template) => (
            <button className={productKey === template.key ? "is-selected" : ""} type="button" key={template.key} onClick={() => chooseProduct(template.key)} aria-pressed={productKey === template.key}>
              <span className="bespoke-picker-image"><img className={template.key === "performance-tee" || template.key === "performance-tank" ? "has-dark-matte" : ""} src={template.image} alt="" aria-hidden="true" /></span>
              <span className="bespoke-picker-copy"><b>{template.shortName}</b><small>{template.description}</small><strong>From £{template.price}</strong></span>
            </button>
          ))}
        </div>
      </div>

      <div className="customiser-shell">
        <div className="customiser-preview">
          <div className="customiser-preview-top">
            <span>{hasLiveColourPreview ? "Live colour preview" : "Construction preview"}</span>
            <b>{product.shortName} · {product.sleeves.length > 0 ? `${sleeve} · ` : ""}{bodyColour}</b>
          </div>
          <div className="customiser-canvas-frame"><canvas ref={canvasRef} aria-label={`Custom ${bodyColour} ${product.name} preview`} /></div>
          <div className="customiser-preview-footer">
            <div><i style={{ background: colour(bodyColour).hex }} /><span>Body<br /><b>{bodyColour}</b></span></div>
            {product.collar && <div><i style={{ background: colour(collarColour).hex }} /><span>Collar<br /><b>{collarColour}</b></span></div>}
            {product.cuffs && <div><i style={{ background: colour(cuffColour).hex }} /><span>{product.sizeMode === "men-bottom" ? "Ankle trim" : "Cuff trim"}<br /><b>{cuffColour}</b></span></div>}
          </div>
          <p>{hasLiveColourPreview ? "Colours shown on screen are indicative; final colour is confirmed before production." : "This image shows the garment construction. Your selected colours and finishes are recorded in the specification beside it."}</p>
        </div>

        <div className="customiser-configurator">
          <header className="custom-product-header">
            <p>Made to order</p>
            <div><h3>Custom {product.name}</h3><strong>£{price}</strong></div>
            <span>{product.description}. Choose each detail below; only suitable options are shown.</span>
          </header>

          <div className="custom-config-progress" aria-label="Customisation progress"><span className="is-active">Colour</span><span>Style</span><span>Fit</span><span>Size</span></div>

          <div className="custom-config-section">
            <span className="custom-config-number">01</span>
            <div>{colourGroup("Main colour", bodyColour, setBodyColour)}</div>
          </div>
          {(product.collar || product.cuffs) && <div className="custom-config-section">
            <span className="custom-config-number">02</span>
            <div>
              {product.collar && colourGroup("Collar colour", collarColour, setCollarColour)}
              {product.cuffs && colourGroup(product.sizeMode === "men-bottom" ? "Ankle trim colour" : "Cuff colour", cuffColour, setCuffColour)}
            </div>
          </div>}
          <div className="custom-config-section">
            <span className="custom-config-number">03</span>
            <div>
              {product.sleeves.length > 0 && <fieldset className="custom-choice-group">
                <legend>Sleeve style</legend>
                <RadioGroup className="custom-choice-row" value={sleeve} onValueChange={(next) => setSleeve(next as Sleeve)}>
                  {product.sleeves.map((option) => <label className={sleeve === option ? "is-selected" : ""} key={option}><RadioGroupItem className="sr-only" value={option} />{option}</label>)}
                </RadioGroup>
              </fieldset>}
              <fieldset className="custom-choice-group">
                <legend>Logo style</legend>
                <RadioGroup className="custom-choice-row custom-signature-row" value={branding} onValueChange={(next) => setBranding(next as Branding)}>
                  {brandingOptions.map((option) => <label className={branding === option ? "is-selected" : ""} key={option}><RadioGroupItem className="sr-only" value={option} /><b>{option === "K mark" ? "Small K mark" : "Kalëthon name"}</b><small>{option === "K mark" ? "Discreet chest embroidery" : "Full wordmark finish"}</small></label>)}
                </RadioGroup>
              </fieldset>
            </div>
          </div>
          <div className="custom-config-section">
            <span className="custom-config-number">04</span>
            <div>
              <fieldset className="custom-choice-group">
                <legend>Choose your fit</legend>
                <RadioGroup className="custom-choice-row custom-fit-row" value={fit} onValueChange={(next) => setFit(next as Fit)}>
                  {fits.map((option) => <label className={fit === option ? "is-selected" : ""} key={option}><RadioGroupItem className="sr-only" value={option} /><b>{option}</b><small>{option === "Athletic" ? "Closer through the body" : option === "Regular" ? "Balanced everyday fit" : "More room and ease"}</small></label>)}
                </RadioGroup>
              </fieldset>
            </div>
          </div>
          <div className="custom-config-section">
            <span className="custom-config-number">05</span>
            <div className="custom-size-row">
              <div className="custom-size-heading"><span>Choose your size</span><button type="button" onClick={() => setSizeOpen(true)}>Size guide & measurements</button></div>
              <RadioGroup className="custom-size-grid" value={size} onValueChange={setSize}>
                {availableSizes.map((option) => <label className={size === option ? "is-selected" : ""} key={option}><RadioGroupItem className="sr-only" value={option} />{option}</label>)}
              </RadioGroup>
            </div>
          </div>

          <details className="custom-specification" open>
            <summary>Your selected specification</summary>
            <dl>
              <div><dt>Garment</dt><dd>{product.name}</dd></div>
              <div><dt>Main colour</dt><dd>{bodyColour}</dd></div>
              {product.collar && <div><dt>Collar</dt><dd>{collarColour}</dd></div>}
              {product.cuffs && <div><dt>{product.sizeMode === "men-bottom" ? "Ankle trim" : "Cuffs"}</dt><dd>{cuffColour}</dd></div>}
              {product.sleeves.length > 0 && <div><dt>Sleeve</dt><dd>{sleeve}</dd></div>}
              <div><dt>Logo</dt><dd>{branding}</dd></div><div><dt>Fit</dt><dd>{fit}</dd></div><div><dt>Size</dt><dd>{size}</dd></div>
            </dl>
          </details>
          <details className="custom-product-details">
            <summary>Materials & performance</summary>
            <p>{product.material}.</p><small>{product.standard}.</small>
          </details>

          <button className="custom-primary" type="button" onClick={() => setDialogOpen(true)}>See this design on you</button>
          <div className="custom-order-consent">
            <label><input type="checkbox" checked={termsAccepted} onChange={(event) => setTermsAccepted(event.target.checked)} /><span>I have checked my specification and agree to the <Link href="/legal/terms-and-conditions" target="_blank">terms</Link> and <Link href="/legal/returns-and-refunds" target="_blank">personalised-item returns notice</Link>. <b>Required</b></span></label>
            <label><input type="checkbox" checked={marketingConsent} onChange={(event) => setMarketingConsent(event.target.checked)} /><span>I would like occasional Kalëthon news by email. Optional; unsubscribe at any time.</span></label>
          </div>
          <button className="custom-checkout" type="button" disabled={checkoutBusy || !termsAccepted} onClick={checkout}>{checkoutBusy ? "Opening secure checkout…" : `Purchase custom design · £${price}`}</button>
          {message && <p className="custom-message" role="alert">{message}</p>}
          <div className="custom-service-notes"><span>Secure checkout</span><span>Made-to-order tracking</span><span>Final specification saved</span></div>
          <small className="custom-lead-time">Lead time and final delivery date are confirmed at checkout.</small>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) stopCamera(); }}>
        <DialogContent className="custom-try-dialog">
          <DialogHeader>
            <DialogTitle>See your design on you</DialogTitle>
            <DialogDescription>Upload a clear portrait or capture one now. We send your selected {product.name.toLowerCase()}, colour, fit and signature preview to the private virtual fitting service.</DialogDescription>
          </DialogHeader>
          <div className="custom-try-grid">
            <div className="custom-portrait-panel">
              <div className="custom-portrait-tabs" role="tablist">
                <button type="button" role="tab" aria-selected={mode === "upload"} onClick={() => setCaptureMode("upload")}>Upload photo</button>
                <button type="button" role="tab" aria-selected={mode === "camera"} onClick={() => setCaptureMode("camera")}>Use camera</button>
              </div>
              <div className="custom-portrait-frame">
                {portrait ? (
                  <><img src={portrait} alt="Your selected portrait" /><button className="custom-retake" type="button" onClick={() => { setPortrait(null); setResult(null); setTryOnStage("idle"); }}>Retake</button></>
                ) : mode === "upload" ? (
                  <label><b>Select a full-length portrait</b><small>JPG, PNG or WebP · up to 10 MB</small><input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFile} /></label>
                ) : (
                  <>
                    <video ref={videoRef} className={cameraReady ? "is-ready" : ""} playsInline muted />
                    {!cameraReady && <button type="button" onClick={startCamera}>Enable camera</button>}
                    {cameraReady && <button className="custom-capture" type="button" onClick={captureFrame}>Capture portrait</button>}
                  </>
                )}
              </div>
            </div>
            <div className={`custom-try-result ${working ? "is-working" : ""}`}>
              {result ? <img src={result} alt={`Virtual try-on result for your custom ${product.name}`} /> : <div><b>K</b><p>{stageCopy(tryOnStage)}</p></div>}
            </div>
          </div>
          <label className="custom-consent"><input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} />I consent to this portrait being processed by FASHN solely to create my virtual try-on result.</label>
          <div className="custom-dialog-actions">
            {result ? <a href={result} download={`kalethon-${product.key}-try-on.jpg`}>Download result</a> : <button type="button" disabled={!portrait || !consent || working} onClick={runTryOn}>{working ? stageCopy(tryOnStage) : "Create my preview"}</button>}
            <button className="secondary" type="button" onClick={() => setDialogOpen(false)}>Return to design</button>
          </div>
          {message && <p className="custom-message" role="alert">{message}</p>}
          <p className="custom-disclaimer">Virtual try-on is a style visualisation, not a guarantee of fit or exact colour. Use the size guide before purchasing.</p>
        </DialogContent>
      </Dialog>

      <Dialog open={sizeOpen} onOpenChange={setSizeOpen}>
        <DialogContent className="custom-size-dialog">
          <DialogHeader>
            <DialogTitle>{product.name} measurements and international sizes</DialogTitle>
            <DialogDescription>Measure your body first. Country labels are references only because manufacturers grade sizes differently.</DialogDescription>
          </DialogHeader>
          <div className="custom-measurement-points">
            <div><span>01</span><b>Chest / bust</b><small>Level around the fullest point.</small></div>
            <div><span>02</span><b>Natural waist</b><small>Narrowest point; keep the tape relaxed.</small></div>
            <div><span>03</span><b>Hip / seat</b><small>Level around the fullest point.</small></div>
            <div><span>04</span><b>Sleeve</b><small>Shoulder point to wrist over a bent elbow.</small></div>
            <div><span>05</span><b>Inside leg</b><small>Crotch seam to the selected hem.</small></div>
            <div><span>06</span><b>Outside leg</b><small>Natural waist to ankle finish.</small></div>
          </div>
          <div className="custom-size-table-wrap">
            {product.sizeMode === "women-bottom" ? (
              <table className="custom-size-table">
                <thead><tr><th>UK</th><th>Waist cm</th><th>Hip cm</th><th>EU</th><th>US</th><th>Canada</th><th>AU / NZ</th><th>UAE</th><th>Pakistan</th></tr></thead>
                <tbody>{womenBottomChart.map((row) => <tr key={row[0]}>{row.map((value, index) => index === 0 ? <th scope="row" key={index}>{value}</th> : <td key={index}>{value}</td>)}</tr>)}</tbody>
              </table>
            ) : product.sizeMode === "men-bottom" ? (
              <table className="custom-size-table">
                <thead><tr><th>UK waist</th><th>Waist cm</th><th>EU</th><th>US</th><th>Canada</th><th>AU / NZ</th><th>UAE</th><th>Pakistan</th></tr></thead>
                <tbody>{menBottomChart.map((row) => <tr key={row[0]}>{row.map((value, index) => index === 0 ? <th scope="row" key={index}>{value}</th> : <td key={index}>{value}</td>)}</tr>)}</tbody>
              </table>
            ) : (
              <table className="custom-size-table">
                <thead><tr><th>Kalëthon</th><th>Chest cm</th><th>Chest in</th><th>EU</th><th>UK</th><th>US / Canada</th><th>AU / NZ</th><th>UAE</th><th>Pakistan</th></tr></thead>
                <tbody>{sizeChart.map((row) => <tr key={row[0]}>{row.map((value, index) => index === 0 ? <th scope="row" key={index}>{value}</th> : <td key={index}>{value}</td>)}</tr>)}</tbody>
              </table>
            )}
          </div>
          {product.sizeMode === "men-bottom" && <p className="custom-size-note"><b>Leg code:</b> S = 30 in / 76 cm, R = 32 in / 81 cm, L = 34 in / 86 cm. Example: <b>34R</b> means a 34-inch waist with regular leg.</p>}
          <p className="custom-size-note"><b>How to measure:</b> keep the tape level and do not pull it tight. If you fall between sizes, choose the larger size for a relaxed fit.</p>
          <p className="custom-disclaimer">Use body measurements as the source of truth. <a href="/measurements">Open the complete men, women and children illustrated 20-point guide.</a></p>
        </DialogContent>
      </Dialog>
    </>
  );
}
