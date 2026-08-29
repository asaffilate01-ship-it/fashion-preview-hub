"use client";

import Link from "next/link";
import { useBag } from "./bag-provider";

export default function BagLink({ className = "" }: { className?: string }) {
  const { count, ready } = useBag();
  return <Link className={className} href="/bag" aria-label={`Bag with ${ready ? count : 0} items`}>Bag <span className="bag-count" aria-live="polite">{ready ? count : 0}</span></Link>;
}
