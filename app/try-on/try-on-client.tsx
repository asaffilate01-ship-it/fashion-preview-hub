"use client";

import { ChangeEvent, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import GarmentColourPreview from "@/components/garment-colour-preview";
import { createGarmentColourDataUrl } from "@/lib/garment-preview";
import type { StoreColour } from "@/lib/store";

type TryOnColourway = {
  key: string;
  label: string;
  body: StoreColour;
  collar: StoreColour;
  cuff: StoreColour;
  image?: string;
  modelPhotography?: boolean;
};

type TryOnProduct = {
  id: string;
  name: string;
  detail: string;
  price: string;
  image: string;
  colourways: TryOnColourway[];
};

function colour(key: string, label: string, body: StoreColour, collar: StoreColour = body, cuff: StoreColour = collar, image?: string, modelPhotography = false): TryOnColourway {
  return { key, label, body, collar, cuff, image, modelPhotography };
}

const products: TryOnProduct[] = [
  {
    id: "court-polo",
    name: "The Court Polo",
    detail: "Mercerised cotton piqué / contrast trim",
    price: "£85",
    image: "/catalog/court-polo-k.webp",
    colourways: [
      colour("bone-navy", "Bone / Navy", "Bone", "Navy", "Navy", "/catalog/court-polo-k.webp"),
      colour("oxblood-bone", "Oxblood / Bone", "Oxblood", "Bone", "Bone", "/catalog/court-polo-oxblood.webp"),
      colour("navy-bone", "Navy / Bone", "Navy", "Bone", "Bone"),
      colour("sage-navy", "Sage / Navy", "Sage", "Navy", "Navy"),
      colour("stone-oxblood", "Stone / Oxblood", "Stone", "Oxblood", "Oxblood"),
    ],
  },
  {
    id: "casual-polo",
    name: "The Casual Contrast Polo",
    detail: "Soft cotton piqué / relaxed drape",
    price: "£85",
    image: "/campaign-polo.png",
    colourways: [
      colour("oxblood", "Oxblood", "Oxblood", "Oxblood", "Oxblood", "/campaign-polo.png", true),
      colour("bone", "Bone", "Bone", "Bone", "Bone", "/catalog/colourways/casual-polo-bone.webp", true),
      colour("navy", "Navy", "Navy", "Navy", "Navy", "/catalog/colourways/casual-polo-navy.webp", true),
      colour("sage", "Sage", "Sage", "Sage", "Sage", "/catalog/colourways/casual-polo-sage.webp", true),
      colour("stone", "Stone", "Stone", "Stone", "Stone", "/catalog/colourways/casual-polo-stone.webp", true),
    ],
  },
  {
    id: "golf-polo",
    name: "The Links Golf Polo",
    detail: "Stretch performance piqué / golf cut",
    price: "£85",
    image: "/collections/golf.jpg",
    colourways: [
      colour("sage", "Sage", "Sage", "Sage", "Sage", "/collections/golf.jpg", true),
      colour("navy-bone", "Navy / Bone", "Navy", "Navy", "Bone", "/catalog/colourways/golf-navy-bone.webp", true),
      colour("bone-sage", "Bone / Sage", "Bone", "Sage", "Sage", "/catalog/colourways/golf-bone-sage.webp", true),
      colour("oxblood-bone", "Oxblood / Bone", "Oxblood", "Oxblood", "Bone", "/catalog/colourways/golf-oxblood-bone.webp", true),
      colour("stone-navy", "Stone / Navy", "Stone", "Stone", "Navy", "/catalog/colourways/golf-stone-navy.webp", true),
    ],
  },
  {
    id: "tennis-polo",
    name: "The Baseline Tennis Polo",
    detail: "Recycled stretch jersey / court cut",
    price: "£85",
    image: "/collections/tennis.jpg",
    colourways: [
      colour("bone-oxblood", "Bone / Oxblood", "Bone", "Oxblood", "Oxblood", "/collections/tennis.jpg", true),
      colour("navy-bone", "Navy / Bone", "Navy", "Bone", "Bone", "/catalog/colourways/tennis-navy-bone.webp", true),
      colour("oxblood-bone", "Oxblood / Bone", "Oxblood", "Bone", "Bone", "/catalog/colourways/tennis-oxblood-bone.webp", true),
      colour("sage-bone", "Sage / Bone", "Sage", "Bone", "Bone", "/catalog/colourways/tennis-sage-bone.webp", true),
      colour("stone-navy", "Stone / Navy", "Stone", "Navy", "Navy", "/catalog/colourways/tennis-stone-navy.webp", true),
    ],
  },
  {
    id: "performance-tee",
    name: "The Form Tee",
    detail: "Performance jersey / KALËTHON wordmark",
    price: "£76",
    image: "/try-on/form-tee.jpg",
    colourways: [colour("ink", "Ink", "Ink", "Ink", "Ink", "/try-on/form-tee.jpg"), colour("bone", "Bone", "Bone"), colour("navy", "Navy", "Navy"), colour("oxblood", "Oxblood", "Oxblood"), colour("sage", "Sage", "Sage")],
  },
  {
    id: "poise-hoodie",
    name: "The Poise Pullover Hoodie",
    detail: "Loopback cotton / structured hood",
    price: "£125",
    image: "/catalog/poise-pullover-hoodie.webp",
    colourways: [colour("bone", "Bone", "Bone", "Bone", "Bone", "/catalog/poise-pullover-hoodie.webp"), colour("sage", "Sage", "Sage", "Sage", "Sage", "/catalog/poise-pullover-hoodie-sage.webp"), colour("navy", "Navy", "Navy"), colour("oxblood", "Oxblood", "Oxblood"), colour("stone", "Stone", "Stone")],
  },
  {
    id: "club-zip-hoodie",
    name: "The Club Zip Hoodie",
    detail: "Brushed loopback / two-way zip",
    price: "£133",
    image: "/catalog/club-zip-hoodie-clean.png",
    colourways: [colour("navy", "Navy", "Navy", "Navy", "Navy", "/catalog/club-zip-hoodie-clean.png"), colour("stone", "Stone", "Stone", "Stone", "Stone", "/catalog/club-zip-hoodie-stone.webp"), colour("ink", "Ink", "Ink"), colour("oxblood", "Oxblood", "Oxblood"), colour("sage", "Sage", "Sage")],
  },
  {
    id: "motion-jogger",
    name: "The Motion Jogger",
    detail: "Structured double-knit / articulated knee",
    price: "£110",
    image: "/try-on/motion-jogger.jpg",
    colourways: [colour("stone", "Stone", "Stone", "Stone", "Stone", "/try-on/motion-jogger.jpg"), colour("ink", "Ink", "Ink"), colour("navy", "Navy", "Navy"), colour("sage", "Sage", "Sage"), colour("oxblood", "Oxblood", "Oxblood")],
  },
  {
    id: "court-short",
    name: "The Women’s Court Short",
    detail: "Stretch woven shell / integrated liner",
    price: "£78",
    image: "/try-on/court-short-photo.webp",
    colourways: [colour("navy", "Navy", "Navy", "Navy", "Navy", "/try-on/court-short-photo.webp"), colour("ink", "Ink", "Ink"), colour("bone", "Bone", "Bone"), colour("sage", "Sage", "Sage"), colour("oxblood", "Oxblood", "Oxblood")],
  },
  {
    id: "court-skirt",
    name: "The Women’s Court Skort",
    detail: "Stretch woven shell / integrated short",
    price: "£92",
    image: "/try-on/court-skort-photo.webp",
    colourways: [colour("oxblood", "Oxblood", "Oxblood", "Oxblood", "Oxblood", "/try-on/court-skort-photo.webp"), colour("navy", "Navy", "Navy"), colour("bone", "Bone", "Bone"), colour("sage", "Sage", "Sage"), colour("ink", "Ink", "Ink")],
  },
  {
    id: "club-tracksuit",
    name: "The Club Tracksuit",
    detail: "Coordinated brushed fleece set",
    price: "£225",
    image: "/campaign-hoodie-track.png",
    colourways: [
      colour("ink", "Ink", "Ink", "Ink", "Ink", "/catalog/colourways/club-tracksuit-ink.webp", true),
      colour("navy", "Navy", "Navy", "Navy", "Navy", "/catalog/colourways/club-tracksuit-navy.webp", true),
      colour("stone", "Stone", "Stone", "Stone", "Stone", "/catalog/colourways/club-tracksuit-stone.webp", true),
      colour("sage", "Sage", "Sage", "Sage", "Sage", "/catalog/colourways/club-tracksuit-sage.webp", true),
      colour("oxblood", "Oxblood", "Oxblood", "Oxblood", "Oxblood", "/catalog/colourways/club-tracksuit-oxblood.webp", true),
    ],
  },
];

type CaptureMode = "camera" | "upload";
type TryOnStage = "idle" | "preparing" | "queued" | "processing" | "complete" | "error";

function dataUrlFromBlob(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("We could not read that image."));
    reader.readAsDataURL(blob);
  });
}

function loadImage(source: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new window.Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("We could not prepare that image."));
    image.src = source;
  });
}

async function compressImage(source: string, maxEdge = 1600, quality = 0.86) {
  const image = await loadImage(source);
  const scale = Math.min(1, maxEdge / Math.max(image.naturalWidth, image.naturalHeight));
  const width = Math.max(1, Math.round(image.naturalWidth * scale));
  const height = Math.max(1, Math.round(image.naturalHeight * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Your browser could not prepare the image.");
  context.drawImage(image, 0, 0, width, height);
  return canvas.toDataURL("image/jpeg", quality);
}

function stageCopy(stage: TryOnStage) {
  if (stage === "preparing") return "Preparing your private preview…";
  if (stage === "queued") return "Your look is in the studio queue…";
  if (stage === "processing") return "Draping the selected piece…";
  if (stage === "complete") return "Your KALËTHON look is ready.";
  return "Usually ready in around 10–30 seconds.";
}

export default function TryOnClient() {
  const searchParams = useSearchParams();
  const requestedProduct = products.find((option) => option.id === searchParams.get("product"));
  const requestedColourway = requestedProduct?.colourways.find((option) => option.body.toLowerCase() === searchParams.get("colour")?.toLowerCase());
  const [mode, setMode] = useState<CaptureMode>("upload");
  const [selectedId, setSelectedId] = useState(() => requestedProduct?.id ?? "court-polo");
  const [selectedColourKey, setSelectedColourKey] = useState(() => requestedColourway?.key ?? requestedProduct?.colourways[0].key ?? "bone-navy");
  const [personImage, setPersonImage] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [consent, setConsent] = useState(false);
  const [stage, setStage] = useState<TryOnStage>("idle");
  const [message, setMessage] = useState("");
  const [cameraReady, setCameraReady] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const selected = products.find((product) => product.id === selectedId) ?? products[0];
  const selectedColour = selected.colourways.find((option) => option.key === selectedColourKey) ?? selected.colourways[0];
  const working = ["preparing", "queued", "processing"].includes(stage);

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setCameraReady(false);
  };

  useEffect(() => () => stopCamera(), []);

  const switchMode = (nextMode: CaptureMode) => {
    if (nextMode !== "camera") stopCamera();
    setMode(nextMode);
    setPersonImage(null);
    setResultImage(null);
    setMessage("");
    setStage("idle");
  };

  const startCamera = async () => {
    setMessage("");
    if (!navigator.mediaDevices?.getUserMedia) {
      setStage("error");
      setMessage("Camera access is not available in this browser. Please upload a photo instead.");
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
      setStage("idle");
    } catch {
      setStage("error");
      setMessage("Camera permission was not granted. You can still upload a portrait.");
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
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    setPersonImage(canvas.toDataURL("image/jpeg", 0.86));
    setResultImage(null);
    setMessage("");
    setStage("idle");
    stopCamera();
  };

  const handleFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!/^image\/(jpeg|png|webp)$/i.test(file.type) || file.size > 10 * 1024 * 1024) {
      setStage("error");
      setMessage("Choose a JPG, PNG or WebP image under 10 MB.");
      return;
    }

    try {
      setStage("preparing");
      const source = await dataUrlFromBlob(file);
      setPersonImage(await compressImage(source));
      setResultImage(null);
      setMessage("");
      setStage("idle");
    } catch (error) {
      setStage("error");
      setMessage(error instanceof Error ? error.message : "We could not prepare that image.");
    } finally {
      event.target.value = "";
    }
  };

  const resetPortrait = () => {
    setPersonImage(null);
    setResultImage(null);
    setStage("idle");
    setMessage("");
  };

  const createTryOn = async () => {
    if (!personImage || !consent || working) return;
    setResultImage(null);
    setMessage("");
    setStage("preparing");

    try {
      let productData: string;
      if (selectedColour.image && !selectedColour.modelPhotography) {
        const productResponse = await fetch(selectedColour.image);
        if (!productResponse.ok) throw new Error("The selected piece could not be prepared.");
        productData = await dataUrlFromBlob(await productResponse.blob());
      } else {
        productData = await createGarmentColourDataUrl(selected.id, selectedColour.body, selectedColour.collar, selectedColour.cuff);
      }

      const runResponse = await fetch("/api/try-on", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: selected.id,
          modelImage: personImage,
          productImage: productData,
          colour: selectedColour.label,
        }),
      });
      const runData = await runResponse.json();
      if (!runResponse.ok) {
        if (runData.code === "not_configured") {
          throw new Error("Virtual try-on is ready; the secure FASHN API key still needs to be connected.");
        }
        throw new Error(runData.message || "The virtual studio could not start. Please try again.");
      }

      setStage("queued");
      for (let attempt = 0; attempt < 36; attempt += 1) {
        await new Promise((resolve) => window.setTimeout(resolve, 2_500));
        const statusResponse = await fetch(`/api/try-on/status?id=${encodeURIComponent(runData.id)}`, {
          cache: "no-store",
        });
        const statusData = await statusResponse.json();
        if (!statusResponse.ok) throw new Error(statusData.message || "We lost contact with the virtual studio.");

        if (statusData.status === "completed" && statusData.output?.[0]) {
          setResultImage(statusData.output[0]);
          setStage("complete");
          return;
        }
        if (["failed", "canceled", "time_out"].includes(statusData.status)) {
          throw new Error(statusData.message || "This preview could not be completed. Try a clearer, full-length image.");
        }
        setStage(statusData.status === "processing" ? "processing" : "queued");
      }
      throw new Error("The preview is taking longer than expected. Please try again in a moment.");
    } catch (error) {
      setStage("error");
      setMessage(error instanceof Error ? error.message : "The virtual studio could not complete this preview.");
    }
  };

  return (
    <>
      <div className="tryon-checklist" aria-label="How the Virtual Viewing Room works">
        <span><b>01</b>Choose a garment and colour</span>
        <span><b>02</b>Add a clear, full-length portrait</span>
        <span><b>03</b>Create and save your private preview</span>
      </div>
      <div className="tryon-studio">
      <div className="tryon-products" aria-label="Choose a KALËTHON piece">
        <div className="tryon-step-heading"><span>01</span><h3>Select a piece</h3></div>
        <div className="tryon-product-grid">
          {products.map((product) => (
            <button
              type="button"
              className={`tryon-product ${selectedId === product.id ? "is-selected" : ""}`}
              key={product.id}
              onClick={() => {
                setSelectedId(product.id);
                setSelectedColourKey(product.colourways[0].key);
                setResultImage(null);
                setMessage("");
                if (stage === "complete" || stage === "error") setStage("idle");
              }}
              aria-pressed={selectedId === product.id}
            >
              <Image src={product.image} alt={product.name} width={144} height={152} unoptimized />
              <span><strong>{product.name}</strong><small>{product.detail}</small></span>
              <b>{product.price}</b>
            </button>
          ))}
        </div>
        <div className="tryon-colour-picker" aria-label={`Choose a colour for ${selected.name}`}>
          <div><span>Selected colour</span><strong>{selectedColour.label}</strong><small>{selected.colourways.length} finished options</small></div>
          <div role="group" aria-label={`${selected.name} colours`}>
            {selected.colourways.map((option) => <button type="button" className={option.key === selectedColour.key ? "is-selected" : ""} aria-pressed={option.key === selectedColour.key} aria-label={option.label} title={option.label} onClick={() => { setSelectedColourKey(option.key); setResultImage(null); setMessage(""); if (stage === "complete" || stage === "error") setStage("idle"); }} key={option.key}><i className={`swatch-${option.body.toLowerCase()}`} /><i className={`swatch-${option.collar.toLowerCase()}`} /></button>)}
          </div>
        </div>
      </div>

      <div className="tryon-capture">
        <div className="tryon-step-heading"><span>02</span><h3>Add your portrait</h3></div>
        <div className="capture-tabs" role="tablist" aria-label="Portrait method">
          <button type="button" role="tab" aria-selected={mode === "camera"} onClick={() => switchMode("camera")}>Camera capture</button>
          <button type="button" role="tab" aria-selected={mode === "upload"} onClick={() => switchMode("upload")}>Upload photo</button>
        </div>

        <div className="capture-frame">
          {personImage ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element -- local portrait data URL must not be sent through image optimisation */}
              <img src={personImage} alt="Your selected portrait" className="portrait-preview" />
            </>
          ) : mode === "camera" ? (
            <>
              <video ref={videoRef} className={`camera-preview ${cameraReady ? "is-ready" : ""}`} playsInline muted />
              {!cameraReady && (
                <div className="camera-placeholder">
                  <span className="camera-icon" aria-hidden="true" />
                  <p>See yourself live, then capture one frame for your AI fitting.</p>
                  <button type="button" className="studio-button" onClick={startCamera}>Open camera</button>
                </div>
              )}
              {cameraReady && <button type="button" className="capture-button" onClick={captureFrame}><span />Capture look</button>}
            </>
          ) : (
            <label className="upload-placeholder">
              <input type="file" accept="image/jpeg,image/png,image/webp" capture="user" onChange={handleFile} />
              <span className="upload-plus" aria-hidden="true">+</span>
              <strong>Choose a portrait</strong>
              <small>JPG, PNG or WebP / up to 10 MB</small>
            </label>
          )}
          {personImage && <button type="button" className="retake-button" onClick={resetPortrait}>Choose another</button>}
        </div>
        <p className="capture-guidance">For the best result: face the camera, use even light and keep your full outfit visible.</p>
      </div>

      <div className="tryon-result">
        <div className="tryon-step-heading"><span>03</span><h3>Enter the fitting room</h3></div>
        <div className={`result-frame ${working ? "is-working" : ""}`}>
          {resultImage ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element -- FASHN returns a temporary result URL */}
              <img src={resultImage} alt={`AI preview wearing ${selected.name}`} />
            </>
          ) : (
            <div className="result-placeholder">
              {selectedColour.image ? <Image className="result-garment-preview" src={selectedColour.image} alt={`${selected.name} in ${selectedColour.label}`} fill sizes="(max-width: 640px) 100vw, 33vw" unoptimized /> : <GarmentColourPreview productId={selected.id} name={selected.name} bodyColour={selectedColour.body} collarColour={selectedColour.collar} cuffColour={selectedColour.cuff} className="result-garment-preview live-result-garment" />}
              <p>{working ? stageCopy(stage) : "Your private try-on preview will appear here."}</p>
              {working && <span className="progress-line" aria-hidden="true"><i /></span>}
            </div>
          )}
        </div>

        {message && <p className="tryon-message" role="alert">{message}</p>}
        {!message && <p className="tryon-timing" aria-live="polite">{stageCopy(stage)}</p>}

        <label className="consent-row">
          <input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} />
          <span>I agree that my image is sent securely to FASHN to create this preview. KALËTHON does not store it.</span>
        </label>

        {resultImage ? (
          <div className="result-actions">
            <a className="studio-button" href={resultImage} download={`kalethon-${selected.id}-try-on.jpg`}>Save look</a>
            <button type="button" className="studio-button secondary" onClick={() => { setResultImage(null); setStage("idle"); }}>Try another piece</button>
          </div>
        ) : (
          <button type="button" className="studio-button create-button" disabled={!personImage || !consent || working} onClick={createTryOn}>
            {working ? "Creating your look…" : `Try on ${selected.name.replace("The ", "")} · ${selectedColour.label}`}
          </button>
        )}
        <p className="camera-disclaimer">Camera-assisted AI preview—not a continuous AR overlay. Results are illustrative and may vary from actual fit.</p>
      </div>
      </div>
    </>
  );
}
