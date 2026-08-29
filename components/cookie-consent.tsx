"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Consent = { version: 1; essential: true; analytics: boolean; marketing: boolean; updatedAt: string };
const STORAGE_KEY = "kalethon-cookie-consent-v1";

function saveConsent(analytics: boolean, marketing: boolean) {
  const consent: Consent = { version: 1, essential: true, analytics, marketing, updatedAt: new Date().toISOString() };
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(consent));
  window.dispatchEvent(new CustomEvent("kalethon:consent", { detail: consent }));
}

export function CookieSettingsButton() {
  return <button className="cookie-settings-button" type="button" onClick={() => window.dispatchEvent(new Event("kalethon:open-cookie-settings"))}>Cookie settings</button>;
}

export default function CookieConsent() {
  const [open, setOpen] = useState(false);
  const [details, setDetails] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    const initialise = window.setTimeout(() => {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (!stored) setOpen(true);
      else {
        try {
          const consent = JSON.parse(stored) as Consent;
          setAnalytics(Boolean(consent.analytics));
          setMarketing(Boolean(consent.marketing));
        } catch { setOpen(true); }
      }
    }, 0);
    const show = () => { setDetails(true); setOpen(true); };
    window.addEventListener("kalethon:open-cookie-settings", show);
    return () => { window.clearTimeout(initialise); window.removeEventListener("kalethon:open-cookie-settings", show); };
  }, []);

  const choose = (nextAnalytics: boolean, nextMarketing: boolean) => {
    setAnalytics(nextAnalytics); setMarketing(nextMarketing);
    saveConsent(nextAnalytics, nextMarketing); setOpen(false);
  };

  if (!open) return null;
  return <aside className="cookie-consent" aria-label="Cookie consent" role="dialog" aria-modal="true">
    <div className="cookie-consent-copy"><p className="eyebrow light">Privacy choices</p><h2>Your visit, on your terms.</h2><p>Essential storage keeps the site secure and remembers this choice. Optional analytics and marketing technologies stay off unless you allow them. No optional tracker is currently installed.</p><Link href="/legal/cookie-policy">Read the cookie policy</Link></div>
    {details && <div className="cookie-consent-options">
      <label><span><b>Essential</b><small>Security, checkout and consent preference.</small></span><input type="checkbox" checked disabled /></label>
      <label><span><b>Analytics</b><small>Anonymous performance and usage measurement.</small></span><input type="checkbox" checked={analytics} onChange={(event) => setAnalytics(event.target.checked)} /></label>
      <label><span><b>Marketing</b><small>Advertising measurement and personalised campaigns.</small></span><input type="checkbox" checked={marketing} onChange={(event) => setMarketing(event.target.checked)} /></label>
    </div>}
    <div className="cookie-consent-actions">
      <button type="button" onClick={() => choose(false, false)}>Reject optional</button>
      {!details && <button type="button" onClick={() => setDetails(true)}>Manage choices</button>}
      {details && <button type="button" onClick={() => choose(analytics, marketing)}>Save choices</button>}
      <button className="is-primary" type="button" onClick={() => choose(true, true)}>Accept all</button>
    </div>
  </aside>;
}
