"use client";

import { ChangeEvent, useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const colours = [
  { name: "Bone", hex: "#e8dfd1", dark: false },
  { name: "Ink", hex: "#171816", dark: true },
  { name: "Navy", hex: "#18283c", dark: true },
  { name: "Oxblood", hex: "#67202d", dark: true },
  { name: "Sage", hex: "#788171", dark: true },
  { name: "Stone", hex: "#aca397", dark: false },
] as const;

const sleeves = ["Short sleeve", "Long sleeve"] as const;
const brandingOptions = ["K mark", "Kalëthon wordmark"] as const;
const sizes = ["XS", "S", "M", "L", "XL", "2XL", "3XL"] as const;
const sizeChart = [
  ["XS", "84–89", "33–35", "69–74", "27–29", "44", "34"],
  ["S", "90–95", "35½–37½", "75–80", "29½–31½", "46", "36"],
  ["M", "96–101", "38–40", "81–86", "32–34", "48", "38"],
  ["L", "102–107", "40–42", "87–92", "34–36", "50", "40"],
  ["XL", "108–113", "42½–44½", "93–98", "36½–38½", "52", "42"],
  ["2XL", "114–121", "45–47½", "99–106", "39–41½", "54–56", "44–46"],
  ["3XL", "122–129", "48–51", "107–114", "42–45", "58–60", "48–50"],
] as const;

type ColourName = (typeof colours)[number]["name"];
type Sleeve = (typeof sleeves)[number];
type Branding = (typeof brandingOptions)[number];
type Size = (typeof sizes)[number];
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
  if (stage === "processing") return "Draping your exact polo design…";
  if (stage === "complete") return "Your custom Kalëthon look is ready.";
  return "Your portrait is processed only to create this preview.";
}

export default function CustomisePoloClient() {
  const [bodyColour, setBodyColour] = useState<ColourName>("Bone");
  const [collarColour, setCollarColour] = useState<ColourName>("Oxblood");
  const [cuffColour, setCuffColour] = useState<ColourName>("Oxblood");
  const [sleeve, setSleeve] = useState<Sleeve>("Short sleeve");
  const [branding, setBranding] = useState<Branding>("K mark");
  const [size, setSize] = useState<Size>("M");
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
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const price = 85 + (sleeve === "Long sleeve" ? 10 : 0) + (branding === "Kalëthon wordmark" ? 8 : 0);
  const logoColour = colour(bodyColour).dark ? "#f1eadf" : "#10110f";
  const working = ["preparing", "queued", "processing"].includes(tryOnStage);

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
        const garment = await loadImage(sleeve === "Short sleeve" ? "/customise/polo-short.webp" : "/customise/polo-long.webp");
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
          layerContext.drawImage(garment, 32, 0, 736, 920);
          layerContext.globalCompositeOperation = "source-atop";
          layerContext.globalAlpha = selected.dark ? 0.94 : 0.72;
          layerContext.fillStyle = selected.hex;
          layerContext.fillRect(0, 0, 800, 920);
          layerContext.globalCompositeOperation = "multiply";
          layerContext.globalAlpha = selected.dark ? 0.48 : 0.34;
          layerContext.drawImage(garment, 32, 0, 736, 920);
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

        context.drawImage(tintedGarment(bodyColour), 0, 0);
        const maskPrefix = sleeve === "Short sleeve" ? "polo-short" : "polo-long";
        const [collarMask, cuffMask] = await Promise.all([
          loadImage(`/customise/${maskPrefix}-collar-mask.svg`),
          loadImage(`/customise/${maskPrefix}-cuff-mask.svg`),
        ]);
        if (!active) return;
        const collarLayer = tintedGarment(collarColour);
        drawMaskedLayer(collarLayer, collarMask);
        const cuffLayer = tintedGarment(cuffColour);
        drawMaskedLayer(cuffLayer, cuffMask);

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
          context.drawImage(markLayer, isKMark ? 490 : 466, isKMark ? 319 : 327);
        }
      } catch {
        setMessage("The product preview could not be rendered.");
      }
    };
    void draw();
    setResult(null);
    setTryOnStage((current) => current === "complete" ? "idle" : current);
    return () => { active = false; };
  }, [bodyColour, branding, collarColour, cuffColour, logoColour, sleeve]);

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
          productId: "custom-polo",
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
      const startedAt = Date.now();
      while (Date.now() - startedAt < 90_000) {
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
    setCheckoutBusy(true);
    setMessage("");
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bodyColour, branding, collarColour, cuffColour, size, sleeve }),
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
      <legend>{label}<span>{value}</span></legend>
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
      <div className="customiser-shell">
        <div className="customiser-controls">
          <div className="customiser-step"><span>01</span><div><b>Compose your polo</b><p>Each choice updates the sample instantly.</p></div></div>
          {colourGroup("Body colour", bodyColour, setBodyColour)}
          {colourGroup("Collar colour", collarColour, setCollarColour)}
          {colourGroup("Cuff colour", cuffColour, setCuffColour)}
          <fieldset className="custom-choice-group">
            <legend>Sleeve</legend>
            <RadioGroup className="custom-choice-row" value={sleeve} onValueChange={(next) => setSleeve(next as Sleeve)}>
              {sleeves.map((option) => <label className={sleeve === option ? "is-selected" : ""} key={option}><RadioGroupItem className="sr-only" value={option} />{option}</label>)}
            </RadioGroup>
          </fieldset>
          <fieldset className="custom-choice-group">
            <legend>Signature</legend>
            <RadioGroup className="custom-choice-row custom-signature-row" value={branding} onValueChange={(next) => setBranding(next as Branding)}>
              {brandingOptions.map((option) => <label className={branding === option ? "is-selected" : ""} key={option}><RadioGroupItem className="sr-only" value={option} />{option}</label>)}
            </RadioGroup>
          </fieldset>
          <div className="custom-size-row">
            <label>Size</label>
            <Select value={size} onValueChange={(next) => setSize(next as Size)}>
              <SelectTrigger className="custom-size-trigger"><SelectValue /></SelectTrigger>
              <SelectContent>{sizes.map((option) => <SelectItem value={option} key={option}>{option}</SelectItem>)}</SelectContent>
            </Select>
            <button type="button" onClick={() => setSizeOpen(true)}>International size guide</button>
          </div>
        </div>

        <div className="customiser-preview">
          <div className="customiser-preview-top"><span>Live product sample</span><b>{bodyColour} / {collarColour} / {cuffColour}</b></div>
          <canvas ref={canvasRef} aria-label={`Custom ${bodyColour} polo preview`} />
          <p>Digital colour is indicative. Bulk production begins only after your approved lab dip and pre-production sample.</p>
        </div>

        <div className="customiser-summary">
          <p className="eyebrow">Your specification</p>
          <h3>Custom Court Polo</h3>
          <dl>
            <div><dt>Body</dt><dd>{bodyColour}</dd></div>
            <div><dt>Collar / cuff</dt><dd>{collarColour} / {cuffColour}</dd></div>
            <div><dt>Sleeve</dt><dd>{sleeve}</dd></div>
            <div><dt>Signature</dt><dd>{branding}</dd></div>
            <div><dt>Logo contrast</dt><dd>{colour(bodyColour).dark ? "Light" : "Dark"}</dd></div>
            <div><dt>Size</dt><dd>{size}</dd></div>
          </dl>
          <div className="customiser-standard">
            <span>Kalëthon cloth standard</span>
            <p>220 GSM mercerised cotton piqué · 95% compact cotton / 5% elastane · pre-shrunk.</p>
            <small>Target: shrinkage ≤3% · pilling ≥4 · wash colourfastness ≥4.</small>
          </div>
          <div className="customiser-total"><span>Made to your selected specification</span><strong>£{price}</strong></div>
          <button className="custom-primary" type="button" onClick={() => setDialogOpen(true)}>View it on you</button>
          <button className="custom-checkout" type="button" disabled={checkoutBusy} onClick={checkout}>{checkoutBusy ? "Opening secure checkout…" : "Purchase this design"}</button>
          {message && <p className="custom-message" role="alert">{message}</p>}
          <small>Made-to-order lead time and final delivery date are confirmed at checkout.</small>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) stopCamera(); }}>
        <DialogContent className="custom-try-dialog">
          <DialogHeader>
            <DialogTitle>See your design on you</DialogTitle>
            <DialogDescription>Upload a clear portrait or capture one now. We send your exact colour, sleeve and signature preview to the private virtual fitting service.</DialogDescription>
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
              {result ? <img src={result} alt="Virtual try-on result for your custom polo" /> : <div><b>K</b><p>{stageCopy(tryOnStage)}</p></div>}
            </div>
          </div>
          <label className="custom-consent"><input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} />I consent to this portrait being processed by FASHN solely to create my virtual try-on result.</label>
          <div className="custom-dialog-actions">
            {result ? <a href={result} download="kalethon-custom-polo-try-on.jpg">Download result</a> : <button type="button" disabled={!portrait || !consent || working} onClick={runTryOn}>{working ? stageCopy(tryOnStage) : "Create my preview"}</button>}
            <button className="secondary" type="button" onClick={() => setDialogOpen(false)}>Return to design</button>
          </div>
          {message && <p className="custom-message" role="alert">{message}</p>}
          <p className="custom-disclaimer">Virtual try-on is a style visualisation, not a guarantee of fit or exact colour. Use the size guide before purchasing.</p>
        </DialogContent>
      </Dialog>

      <Dialog open={sizeOpen} onOpenChange={setSizeOpen}>
        <DialogContent className="custom-size-dialog">
          <DialogHeader>
            <DialogTitle>Kalëthon international size guide</DialogTitle>
            <DialogDescription>Choose by your actual body measurement. Country numbers are references only because international letter sizes are not standardised.</DialogDescription>
          </DialogHeader>
          <div className="custom-size-table-wrap">
            <table className="custom-size-table">
              <thead><tr><th rowSpan={2}>Kalëthon</th><th colSpan={2}>Chest / bust</th><th colSpan={2}>Waist</th><th colSpan={2}>Top reference</th></tr><tr><th>cm</th><th>in</th><th>cm</th><th>in</th><th>EU</th><th>UK / US chest</th></tr></thead>
              <tbody>{sizeChart.map((row) => <tr key={row[0]}>{row.map((value, index) => index === 0 ? <th scope="row" key={index}>{value}</th> : <td key={index}>{value}</td>)}</tr>)}</tbody>
            </table>
          </div>
          <p className="custom-size-note"><b>How to measure:</b> keep the tape level around the fullest part of the chest/bust, then measure the natural waist without pulling the tape tight. If you fall between sizes, choose the larger size for a relaxed fit.</p>
          <p className="custom-disclaimer">The Court Polo is designed with approximately 8–10 cm of positive chest ease. Final finished-garment measurements will be locked after fit and size-set approval.</p>
        </DialogContent>
      </Dialog>
    </>
  );
}
