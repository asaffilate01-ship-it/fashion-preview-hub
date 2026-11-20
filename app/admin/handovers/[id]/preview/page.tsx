import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireAdminPage } from "@/lib/admin-auth";
import InvoiceWorksheetViewer from "./worksheet-viewer";
import styles from "./worksheet.module.css";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const metadata: Metadata = {
  title: "Internal Invoice-Preparation Worksheet | KALËTHON",
  description: "Private accounting preparation worksheet. Not an invoice or payment request.",
  robots: { index: false, follow: false, nocache: true },
  referrer: "no-referrer",
};

export default async function InvoicePreparationPage({
  params,
}: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await requireAdminPage("/admin");
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) notFound();
  return (
    <main className={styles.screen}>
      <InvoiceWorksheetViewer handoverId={id} />
    </main>
  );
}
