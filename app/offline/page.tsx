import Link from "next/link";
import Image from "next/image";

export default function OfflinePage() {
  return <main className="offline-page"><Image src="/kalethon-mark.svg" width={48} height={48} alt=""/><p>KALËTHON / Offline</p><h1>You are temporarily<br/><em>off court.</em></h1><span>Reconnect to continue shopping, use the virtual viewing room or complete checkout.</span><Link href="/">Try the storefront again ↗</Link></main>;
}
