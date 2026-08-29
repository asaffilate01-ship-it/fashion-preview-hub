"use client";

import { useState } from "react";

export default function ShareButtons({ title, url }: { title: string; url: string }) {
  const [copied, setCopied] = useState(false);
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const copy = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };
  return <div className="journal-share" aria-label="Share this article">
    <span>Share</span>
    <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`} target="_blank" rel="noreferrer">Facebook</a>
    <a href={`https://x.com/intent/post?url=${encodedUrl}&text=${encodedTitle}`} target="_blank" rel="noreferrer">X</a>
    <a href={`mailto:?subject=${encodedTitle}&body=${encodedUrl}`}>Email</a>
    <button type="button" onClick={copy}>{copied ? "Copied" : "Copy link"}</button>
  </div>;
}
