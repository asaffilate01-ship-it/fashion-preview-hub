import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import SiteNavigation from "@/components/site-navigation";
import { getCustomerProof } from "@/db/proof-workflow";
import ProofDecisionForm from "./proof-decision-form";
import styles from "./proof-page.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Private Team & Pro Artwork Review",
  description: "Private KALËTHON Team & Pro proof review; customer confirmation is required.",
  robots: { index: false, follow: false, nocache: true },
  referrer: "no-referrer",
};

export default async function CustomerProofPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const proof = await getCustomerProof(token);
  if (!proof) notFound();
  return (
    <main className={styles.page}>
      <SiteNavigation />
      <div className={styles.layout}>
        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
          <Link href="/">KALËTHON</Link><span aria-hidden="true">/</span><span>Private proof review</span>
        </nav>
        <div className={styles.intro}>
          <p className={styles.kicker}>KALËTHON / Team & Pro</p>
          <h1>Review your <em>production proof.</em></h1>
          <p>Review the specifications and any attached artwork carefully. Your response is logged against this version and can be submitted only once.</p>
        </div>
        <div className={styles.columns}>
          <article className={styles.proof} aria-labelledby="proof-title">
            <div className={styles.proofMeta}><span>Private proof · Version {proof.version}</span><span>Expires {new Date(proof.expiresAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</span></div>
            <h2 id="proof-title">{proof.title}</h2>
            <p className={styles.linkedQuote}>{proof.quoteTitle}</p>
            {proof.artworkPath ? (
              <div className={styles.artwork}><Image src={proof.artworkPath} alt="Artwork supplied for this private review" fill unoptimized sizes="(max-width: 850px) 100vw, 50vw" style={{ objectFit: "contain" }} /></div>
            ) : (
              <div className={styles.noArtwork}><strong>No artwork attached</strong><p>This review covers the written specifications below, not artwork or final production files.</p></div>
            )}
            <h3>Specifications to review</h3>
            <pre className={styles.specification}>{proof.specification}</pre>
            <p className={styles.disclaimer}>This proof review is not a payment, order acceptance, delivery guarantee, safety certification or a substitute for signed manufacturing terms. Contact us to discuss changes or outstanding materials before approving.</p>
          </article>
          <ProofDecisionForm token={token} hasArtwork={Boolean(proof.artworkPath)} />
        </div>
      </div>
    </main>
  );
}
