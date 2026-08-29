import { ChangeEvent, useEffect, useRef, useState } from "react";

const products = [
  {
    id: "court-polo",
    name: "The Court Polo",
    detail: "Bone / oxblood K",
    price: "£85",
    image: "/try-on/court-polo.jpg",
  },
  {
    id: "form-tee",
    name: "The Form Tee",
    detail: "Ink / wordmark print",
    price: "£58",
    image: "/try-on/form-tee.jpg",
  },
  {
    id: "poise-hoodie",
    name: "The Poise Hoodie",
    detail: "Bone / oxblood K",
    price: "£125",
    image: "/try-on/poise-hoodie.jpg",
  },
  {
    id: "track-jacket",
    name: "The Track Jacket",
    detail: "Ink / bone K",
    price: "£145",
    image: "/try-on/track-jacket.jpg",
  },
  {
    id: "motion-jogger",
    name: "The Motion Jogger",
    detail: "Stone / ink K",
    price: "£110",
    image: "/try-on/motion-jogger.jpg",
  },
] as const;

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
    const image = new Image();
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
  if (stage === "complete") return "Your Kalëthon look is ready.";
  return "Usually ready in around 10–30 seconds.";
}

export default function TryOnClient() {
  const [mode, setMode] = useState<CaptureMode>("camera");
  const [selectedId, setSelectedId] = useState<(typeof products)[number]["id"]>("court-polo");
  const [personImage, setPersonImage] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [consent, setConsent] = useState(false);
  const [stage, setStage] = useState<TryOnStage>("idle");
  const [message, setMessage] = useState("");
  const [cameraReady, setCameraReady] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const selected = products.find((product) => product.id === selectedId) ?? products[0];
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
      const productResponse = await fetch(selected.image);
      if (!productResponse.ok) throw new Error("The selected piece could not be prepared.");
      const productData = await dataUrlFromBlob(await productResponse.blob());

      const runResponse = await fetch("/api/try-on", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: selected.id,
          modelImage: personImage,
          productImage: productData,
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
      const startedAt = Date.now();
      while (Date.now() - startedAt < 90_000) {
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
    <div className="tryon-studio">
      <div className="tryon-products" aria-label="Choose a Kalëthon piece">
        <div className="tryon-step-heading"><span>01</span><h3>Select a piece</h3></div>
        <div className="tryon-product-grid">
          {products.map((product) => (
            <button
              type="button"
              className={`tryon-product ${selectedId === product.id ? "is-selected" : ""}`}
              key={product.id}
              onClick={() => {
                setSelectedId(product.id);
                setResultImage(null);
                if (stage === "complete") setStage("idle");
              }}
              aria-pressed={selectedId === product.id}
            >
              <img src={product.image} alt={product.name} />
              <span><strong>{product.name}</strong><small>{product.detail}</small></span>
              <b>{product.price}</b>
            </button>
          ))}
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
            <img src={personImage} alt="Your selected portrait" className="portrait-preview" />
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
            <img src={resultImage} alt={`AI preview wearing ${selected.name}`} />
          ) : (
            <div className="result-placeholder">
              <span className="result-mark" aria-hidden="true">K</span>
              <p>{working ? stageCopy(stage) : "Your private try-on preview will appear here."}</p>
              {working && <span className="progress-line" aria-hidden="true"><i /></span>}
            </div>
          )}
        </div>

        {message && <p className="tryon-message" role="alert">{message}</p>}
        {!message && <p className="tryon-timing" aria-live="polite">{stageCopy(stage)}</p>}

        <label className="consent-row">
          <input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} />
          <span>I agree that my image is sent securely to FASHN to create this preview. Kalëthon does not store it.</span>
        </label>

        {resultImage ? (
          <div className="result-actions">
            <a className="studio-button" href={resultImage} download={`kalethon-${selected.id}-try-on.jpg`}>Save look</a>
            <button type="button" className="studio-button secondary" onClick={() => { setResultImage(null); setStage("idle"); }}>Try another piece</button>
          </div>
        ) : (
          <button type="button" className="studio-button create-button" disabled={!personImage || !consent || working} onClick={createTryOn}>
            {working ? "Creating your look…" : `Try on ${selected.name.replace("The ", "")}`}
          </button>
        )}
        <p className="camera-disclaimer">Camera-assisted AI preview—not a continuous AR overlay. Results are illustrative and may vary from actual fit.</p>
      </div>
    </div>
  );
}
