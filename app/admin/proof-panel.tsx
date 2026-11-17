"use client";

import { useCallback, useEffect, useState } from "react";
import type { CommerceQuestion } from "@/lib/commerce-types";
import type { ProProof, ProProofEvent } from "@/lib/proof-workflow";
import styles from "./proof-panel.module.css";

type ProofResponse = { proofs: ProProof[]; events: ProProofEvent[] };
type ApiResponse = { ok?: boolean; message?: string; reviewUrl?: string; expiresAt?: string };

function label(status: string) {
  return status.replace(/_/g, " ");
}

export default function ProofPanel({ quotes }: { quotes: CommerceQuestion[] }) {
  const [proofs, setProofs] = useState<ProProof[]>([]);
  const [events, setEvents] = useState<ProProofEvent[]>([]);
  const [quoteQuestionId, setQuoteQuestionId] = useState("");
  const [title, setTitle] = useState("");
  const [specification, setSpecification] = useState("");
  const [artworkPath, setArtworkPath] = useState("");
  const [message, setMessage] = useState("");
  const [reviewUrl, setReviewUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/proofs", { cache: "no-store" });
      const result = await response.json() as ProofResponse & { message?: string };
      if (!response.ok) throw new Error(result.message || "Proofs could not be loaded.");
      setProofs(result.proofs);
      setEvents(result.events);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Proofs could not be loaded.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => { void load(); }, 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  const invoke = async (body: Record<string, unknown>) => {
    const response = await fetch("/api/admin/proofs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const result = await response.json() as ApiResponse;
    if (!response.ok || result.ok !== true) throw new Error(result.message || "The proof action was not saved.");
    return result;
  };

  const create = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setReviewUrl("");
    setMessage("");
    try {
      await invoke({ action: "create", quoteQuestionId, title, specification, artworkPath });
      setMessage("Draft saved. Review it carefully before issuing a private approval link.");
      setTitle(""); setSpecification(""); setArtworkPath("");
      await load();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to save draft.");
    } finally { setBusy(false); }
  };

  const issue = async (proofId: string) => {
    if (busy) return;
    setBusy(true);
    setReviewUrl("");
    setMessage("");
    try {
      const response = await invoke({ action: "issue", proofId });
      setReviewUrl(response.reviewUrl ?? "");
      setMessage("Private review link generated. Share it directly with the customer. Only this session displays the link.");
      await load();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to issue proof.");
    } finally { setBusy(false); }
  };

  const copyReviewLink = async () => {
    if (!reviewUrl) return;
    try {
      await navigator.clipboard.writeText(reviewUrl);
      setMessage("Private link copied. Share it only with the intended customer.");
    } catch {
      setMessage("Select the link in the field and copy it manually.");
    }
  };

  const quote = quotes.find((entry) => entry.id === quoteQuestionId);

  return (
    <section className={styles.panel} aria-label="Professional proof approvals workspace">
      <header className={styles.heading}>
        <div>
          <p>Team & Pro / Version-controlled artwork review</p>
          <h2>Private production proofs</h2>
          <small>Create numbered proofs for real quotation enquiries. Approval is recorded only when the customer uses a private review link.</small>
        </div>
        <button type="button" className={styles.refresh} onClick={() => void load()} disabled={loading || busy}>Refresh proofs</button>
      </header>

      <form className={styles.form} onSubmit={create}>
        <h3>01 / Prepare an internal proof</h3>
        <label>Trade quotation
          <select value={quoteQuestionId} onChange={(e) => setQuoteQuestionId(e.target.value)} required>
            <option value="">Select an existing Pro enquiry</option>
            {quotes.filter((entry) => entry.subject.startsWith("[PRO QUOTE]")).map((entry) =>
              <option key={entry.id} value={entry.id}>{entry.customerName} — {entry.subject}</option>
            )}
          </select>
        </label>
        {quote && <details className={styles.quoteDetail}>
          <summary>Review original quotation brief</summary>
          <pre>{quote.message}</pre>
        </details>}
        <label>Proof title
          <input value={title} onChange={(e) => setTitle(e.target.value)} minLength={5} maxLength={120} required placeholder="Football home kit / version for approval" />
        </label>
        <label>Specification for customer review
          <textarea value={specification} onChange={(e) => setSpecification(e.target.value)} rows={8} minLength={20} maxLength={3500} required
            placeholder="List cut, colours, names, numbers, artwork dimensions, fabrics, size run, decoration, quantities and any open issues." />
        </label>
        <label>Optional artwork image path
          <input value={artworkPath} onChange={(e) => setArtworkPath(e.target.value)} maxLength={200} placeholder="/proofs/approved-design-v1.webp" />
        </label>
        <p className={styles.helper}>Upload final artwork to the same-origin <code>/proofs/</code> asset directory before adding its path. Concept previews and external image links are not approved artwork.</p>
        <button className={styles.submit} type="submit" disabled={busy || !quoteQuestionId}>{busy ? "Saving…" : "Create numbered proof draft"}</button>
      </form>

      {reviewUrl && <div className={styles.privateLink} role="status">
        <strong>Private, single-use customer link</strong>
        <p>It expires after seven days. Copy it now; KALËTHON stores only its hash and cannot display it again.</p>
        <input aria-label="Private customer review URL" value={reviewUrl} readOnly onFocus={(event) => event.currentTarget.select()} />
        <button type="button" onClick={() => void copyReviewLink()}>Copy review link</button>
      </div>}
      {message && <p role="status" className={styles.message}>{message}</p>}

      <section className={styles.history} aria-labelledby="proofs-heading">
        <div className={styles.historyHeader}>
          <h3 id="proofs-heading">02 / Version history and customer decisions</h3>
          <span>{proofs.length} proofs</span>
        </div>
        {loading && <p>Loading proofs…</p>}
        {!loading && proofs.length === 0 && <p>No proof drafts have been created yet.</p>}
        {proofs.map((proof) => {
          const related = events.filter((event) => event.proofId === proof.id);
          return <article key={proof.id} className={styles.proofCard}>
            <div className={styles.proofTop}>
              <div><small>Version {proof.version} · {new Date(proof.createdAt).toLocaleDateString("en-GB")}</small><h4>{proof.title}</h4></div>
              <span className={styles.proofStatus}>{label(proof.status)}</span>
            </div>
            <p className={styles.details}>Created by {proof.createdBy} · Enquiry {proof.quoteQuestionId.slice(0, 8)}…</p>
            <details className={styles.quoteDetail}>
              <summary>Show proof specifications and audit history</summary>
              <pre>{proof.specification}</pre>
              {proof.artworkPath && <p>Artwork asset: <code>{proof.artworkPath}</code></p>}
              <ol>{related.map((event) => <li key={event.id}>{new Date(event.createdAt).toLocaleString("en-GB")}: {label(event.kind)} — {event.actor}{event.message ? " · " + event.message : ""}</li>)}</ol>
            </details>
            {proof.customerDecidedAt && <p className={styles.decision}>
              Recorded customer response: {proof.customerName || "Customer"} on {new Date(proof.customerDecidedAt).toLocaleDateString("en-GB")}.
              {proof.customerDecisionNote && " Notes: " + proof.customerDecisionNote}
            </p>}
            {proof.status === "draft" && <button className={styles.issue} type="button" disabled={busy}
              onClick={() => void issue(proof.id)}>Issue private customer review</button>}
          </article>;
        })}
      </section>
      <p className={styles.helper}>Customer approval verifies only the displayed proof version. Pricing, licensing, protective-equipment compliance, payment and factory release remain separate operational checks.</p>
    </section>
  );
}
