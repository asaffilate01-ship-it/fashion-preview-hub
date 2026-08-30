import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Shop Standard Colourways",
  description: "Shop finished KALËTHON sportswear colourways in clear international sizes.",
  robots: { index: false, follow: true },
};

export default function CustomisePage() {
  redirect("/#pieces");
}
