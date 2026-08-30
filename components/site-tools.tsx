"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

export default function SiteTools() {
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const update = () => {
      const available = document.documentElement.scrollHeight - window.innerHeight;
      const next = available > 0 ? Math.min(1, Math.max(0, window.scrollY / available)) : 0;
      setProgress(next);
      setVisible(window.scrollY > Math.min(520, window.innerHeight * .55));
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update, { passive: true });
    return () => { window.removeEventListener("scroll", update); window.removeEventListener("resize", update); };
  }, []);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    const register = () => { void navigator.serviceWorker.register("/sw.js", { scope: "/" }); };
    window.addEventListener("load", register, { once: true });
    return () => window.removeEventListener("load", register);
  }, []);

  return <button className={`back-to-top ${visible ? "is-visible" : ""}`} type="button" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} aria-label={`Back to top. ${Math.round(progress * 100)} percent through this page`}>
    <svg viewBox="0 0 52 52" aria-hidden="true"><circle cx="26" cy="26" r="23"/><circle className="progress-ring" cx="26" cy="26" r="23" pathLength="1" style={{ strokeDashoffset: 1 - progress }}/></svg><ArrowUp aria-hidden="true"/>
  </button>;
}
