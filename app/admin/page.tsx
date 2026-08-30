import type { Metadata } from "next";
import { requireAdminPage } from "@/lib/admin-auth";
import AdminDashboard from "./admin-dashboard";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Commerce Administration",
  description: "KALËTHON product, order, stock and sales administration.",
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  const user = await requireAdminPage("/admin");
  return <AdminDashboard user={user} />;
}
