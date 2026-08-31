import HeroCarousel from "./hero-carousel";
import Image from "next/image";
import Link from "next/link";
import SiteNavigation from "@/components/site-navigation";
import SocialLinks from "@/components/social-links";
import { CookieSettingsButton } from "@/components/cookie-consent";
import RetailCollection from "@/components/retail-collection";
import ResponsiveProductImage from "@/components/responsive-product-image";

const standardColourways = [
  {
    name: "Court Polo",
    detail: "Bone body / navy trim / Kinetic K",
    use: "Court and city",
  },
  {
    name: "Court Polo — Oxblood",
    detail: "Oxblood body / bone trim / Kinetic K",
    use: "Court and city",
  },
  {
    name: "Poise Pullover Hoodie",
    detail: "Bone loopback / Kinetic K",
    use: "Recovery and everyday",
  },
  {
    name: "Club Zip Hoodie",
    detail: "Navy loopback / full wordmark",
    use: "Training and travel",
  },
  {
    name: "Club Zip Hoodie — Stone",
    detail: "Stone loopback / ink wordmark",
    use: "Training and travel",
  },
  {
    name: "Performance Tee",
    detail: "Ink jersey / full wordmark",
    use: "Studio and city",
  },
  {
    name: "Court Short",
    detail: "Navy woven shell / Kinetic K",
    use: "Court and training",
  },
];

const collections = [
  {
    id: "tennis",
    name: "Tennis",
    note: "The court collection",
    copy: "Mercerised polos, clean track layers and considered warm-ups for play before and beyond the baseline.",
    pieces: "Polos / long-sleeve polos / track jackets / shorts",
    image: "collection-tennis",
  },
  {
    id: "golf",
    name: "Golf",
    note: "The fairway collection",
    copy: "Quietly structured layers with stretch, breathability and a silhouette composed from first tee to clubhouse.",
    pieces: "Polos / long-sleeve polos / quarter-zips / trousers",
    image: "collection-golf",
  },
  {
    id: "padel",
    name: "Padel",
    note: "The glass-court collection",
    copy: "Technical essentials cut for fast turns, sharp exchanges and an easy transition back into the city.",
    pieces: "Performance tees / jackets / shorts",
    image: "collection-padel",
  },
  {
    id: "pickleball",
    name: "Pickleball",
    note: "The USA court collection",
    copy: "A lighter, expressive court edit balancing graphic tees, refined polos and relaxed post-match layers.",
    pieces: "Polos / graphic tees / joggers",
    image: "collection-pickleball",
  },
  {
    id: "running",
    name: "Running",
    note: "The movement collection",
    copy: "Breathable layers designed for steady miles, recovery walks and a composed return to the city.",
    pieces: "Performance tops / tanks / shorts / joggers",
    image: "collection-running",
  },
  {
    id: "training",
    name: "Training",
    note: "The studio collection",
    copy: "Full-coverage performance essentials for strength, mobility and every considered session between.",
    pieces: "Tanks / training tops / shorts / tracksuits",
    image: "collection-training",
  },
];

function Mark({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 64 64" role="img" aria-label="KALËTHON Kinetic K mark">
      <path d="M8 8h11v48H8z" fill="currentColor" />
      <path d="m22 30 24-22h13L33 32z" fill="currentColor" />
      <path d="m22 34 12-4 25 26H45z" fill="currentColor" />
    </svg>
  );
}

function Arrow() {
  return <span aria-hidden="true">↗</span>;
}

function WordmarkOverlay() {
  return <span className="exact-wordmark" aria-hidden="true">KALËTHON</span>;
}

export default function Home() {
  return (
    <main>
      <div className="announcement">Complimentary UK delivery on orders over £150</div>

      <SiteNavigation home />

      <nav className="collection-rail" aria-label="Shop by collection">
        <span>Shop by sport</span>
        {collections.map((collection) => <Link href={`/sport/${collection.id}`} key={collection.id}>{collection.name}</Link>)}
      </nav>

      <HeroCarousel />

      <section className="intro" id="collection">
        <p className="eyebrow">KALËTHON / London</p>
        <h2>Relaxed in feel.<br /><em>Resolved in form.</em></h2>
        <p className="intro-copy">
          Elevated essentials that hold their shape, move naturally and wear with quiet confidence—from the court to the city.
        </p>
      </section>

      <section className="collections" id="collections" aria-labelledby="collections-title">
        <div className="collections-heading">
          <div>
            <p className="eyebrow">KALËTHON sport / 2026</p>
            <h2 id="collections-title">Made for every<br /><em>kind of movement.</em></h2>
          </div>
          <p>Six easy-to-shop sports collections—from tennis and golf to running and training—with the clothing for each activity clearly grouped together.</p>
        </div>
        <div className="collection-grid">
          {collections.map((collection) => (
            <article className={`collection-card ${collection.image}`} id={collection.id} key={collection.id}>
              <div className="collection-card-shade" />
              <div className="collection-card-top">
                <span>Sport collection</span>
                <p>{collection.note}</p>
              </div>
              <div className="collection-card-copy">
                <h3>{collection.name}</h3>
                <p>{collection.copy}</p>
                <small>{collection.pieces}</small>
                <Link href={`/sport/${collection.id}`}>Shop {collection.name} clothing <Arrow /></Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <RetailCollection />

      <section className="standard-colourways" id="hoodies" aria-labelledby="colourways-title">
        <div className="standard-colourways-image">
          <div><Image src="/catalog/court-polo-k.webp" alt="KALËTHON Court Polo with exact Kinetic K" fill sizes="(max-width: 900px) 100vw, 38vw" unoptimized /></div>
          <div><Image src="/catalog/poise-pullover-hoodie.webp" alt="KALËTHON pullover hoodie with exact Kinetic K" fill sizes="(max-width: 900px) 50vw, 19vw" unoptimized /></div>
          <div className="has-exact-wordmark"><ResponsiveProductImage src="/media/club-zip-hoodie-960.webp" alt="Navy KALËTHON zip hoodie with aligned full wordmark" sizes="(max-width: 900px) 50vw, 19vw" /><WordmarkOverlay /></div>
        </div>
        <div className="standard-colourways-copy">
          <p className="eyebrow">Finished designs / Ready to choose</p>
          <h2 id="colourways-title">Contrast, already<br /><em>considered.</em></h2>
          <p>Distinctive collars, cuffs and piping are now offered as complete KALËTHON colourways. No design tools, no guesswork—just resolved garments in clear sizes.</p>
          <div className="standard-colourways-list">
            {standardColourways.map((colourway, index) => (
              <div key={colourway.name}>
                <span>0{index + 1}</span>
                <b>{colourway.name}</b>
                <small>{colourway.detail}</small>
                <em>{colourway.use}</em>
              </div>
            ))}
          </div>
          <a className="button dark" href="#pieces">Shop the standard colourways <Arrow /></a>
        </div>
      </section>

      <section className="hoodie-constructions" aria-labelledby="hoodie-constructions-title">
        <div className="hoodie-constructions-heading">
          <p className="eyebrow">Core layers / Two constructions</p>
          <h2 id="hoodie-constructions-title">Pullover or zip-up.<br /><em>The same standard.</em></h2>
          <p>Both are built in substantial loopback cloth. The pullover carries the exact Kinetic K; the zip hoodie carries the full KALËTHON wordmark.</p>
        </div>
        <div className="hoodie-constructions-grid">
          <Link href="#product-poise-hoodie-bone">
            <span className="hoodie-construction-image"><Image src="/catalog/poise-pullover-hoodie.webp" alt="Bone KALËTHON pullover hoodie with the exact Kinetic K chest mark" fill sizes="(max-width: 760px) 100vw, 50vw" unoptimized /></span>
            <span className="hoodie-construction-copy"><small>01 / K Icon line</small><b>Poise Pullover Hoodie</b><em>420 GSM loopback · £125</em></span>
          </Link>
          <Link href="#product-club-zip-hoodie">
            <span className="hoodie-construction-image has-exact-wordmark"><ResponsiveProductImage src="/media/club-zip-hoodie-960.webp" alt="Navy KALËTHON full-zip hoodie with the complete aligned wordmark" sizes="(max-width: 760px) 100vw, 50vw" /><WordmarkOverlay /></span>
            <span className="hoodie-construction-copy"><small>02 / Wordmark line</small><b>Club Zip Hoodie</b><em>450 GSM loopback · £133</em></span>
          </Link>
        </div>
      </section>

      <section className="tryon-entry" id="try-on" aria-labelledby="tryon-title">
        <div className="tryon-entry-image" aria-hidden="true" />
        <div className="tryon-entry-copy">
          <p className="eyebrow light">Virtual Viewing Room / Powered by FASHN</p>
          <h2 id="tryon-title">See the piece.<br /><em>On you.</em></h2>
          <p>Choose a real KALËTHON garment photo, add a clear portrait and receive a private AI style preview in three guided steps.</p>
          <ul><li>Real garment photography</li><li>Camera or photo upload</li><li>Private, temporary result</li></ul>
          <Link className="button" href="/try-on">Enter the Virtual Viewing Room <Arrow /></Link>
        </div>
      </section>

      <section className="graphic-story" id="graphic-tees" aria-labelledby="graphic-title">
        <div className="graphic-image" role="img" aria-label="KALËTHON graphic wordmark and Kinetic K T-shirts in Milan" />
        <div className="graphic-copy">
          <p className="eyebrow light">Graphic series / 01</p>
          <h2 id="graphic-title">The wordmark,<br /><em>set in motion.</em></h2>
          <p>
            Two signatures define the collection. Core polos, pullovers and performance pieces use the exact Kinetic K; selected tees, zip hoodies, golf shirts and tracksuits carry the full KALËTHON wordmark.
          </p>
          <div className="signature-rules" aria-label="KALËTHON signature system">
            <div><Mark /><span><strong>Kinetic K</strong>Core polos, pullovers and performance pieces</span></div>
            <div><b>KALËTHON</b><span><strong>Full wordmark</strong>Tees, zip hoodies and selected editions</span></div>
          </div>
          <a className="button" href="#pieces">Explore graphic tees <Arrow /></a>
        </div>
      </section>

      <section className="editorial" aria-label="KALËTHON collection stories">
        <article className="editorial-card editorial-men">
          <div className="editorial-image image-men" role="img" aria-label="KALËTHON embroidered hoodie and tracksuit look in London" />
          <div className="editorial-caption">
            <p className="eyebrow light">Look 04 / London</p>
            <h2>Layers,<br />without limits.</h2>
            <a href="#hoodies">Shop hoodies <Arrow /></a>
          </div>
        </article>
        <article className="editorial-card editorial-women">
          <div className="editorial-image image-women" role="img" aria-label="KALËTHON embroidered tracksuits in the Alps" />
          <div className="editorial-caption">
            <p className="eyebrow light">Look 09 / The Alps</p>
            <h2>Composed<br />at altitude.</h2>
            <a href="#pieces">Shop tracksuits <Arrow /></a>
          </div>
        </article>
      </section>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "ItemList",
        name: "The essential KALËTHON edit",
        url: "https://kalethon.com/#pieces",
        itemListElement: [
          ["Court Polo", "court-polo-bone", "/catalog/court-polo-k.webp", "85.00"],
          ["Court Polo — Oxblood", "court-polo-oxblood", "/catalog/court-polo-oxblood.webp", "85.00"],
          ["Casual Contrast Polo", "casual-contrast-polo", "/media/campaign-polo-960.webp", "85.00"],
          ["Links Golf Polo", "links-golf-polo", "/collections/golf.jpg", "85.00"],
          ["Baseline Tennis Polo", "baseline-tennis-polo", "/collections/tennis.jpg", "85.00"],
          ["Performance Tee", "performance-tee-ink", "/try-on/form-tee.jpg", "76.00"],
          ["Poise Pullover Hoodie", "poise-hoodie-bone", "/catalog/poise-pullover-hoodie.webp", "125.00"],
          ["Poise Pullover Hoodie — Sage", "poise-hoodie-sage", "/catalog/poise-pullover-hoodie-sage.webp", "125.00"],
          ["Club Pullover Hoodie", "club-hoodie-bone", "/media/campaign-hoodie-track-960.webp", "125.00"],
          ["Club Zip Hoodie", "club-zip-hoodie", "/media/club-zip-hoodie-960.webp", "133.00"],
          ["Club Zip Hoodie — Stone", "club-zip-hoodie-stone", "/catalog/club-zip-hoodie-stone.webp", "133.00"],
          ["Motion Jogger", "motion-jogger-stone", "/try-on/motion-jogger.jpg", "110.00"],
          ["Court Short", "court-short-navy", "/try-on/court-short-photo.webp", "78.00"],
          ["Court Skort", "court-skirt-oxblood", "/try-on/court-skort-photo.webp", "92.00"],
          ["Club Tracksuit", "club-tracksuit-ink", "/media/campaign-hoodie-track-960.webp", "225.00"],
        ].map(([name, id, image, price], index) => ({
          "@type": "ListItem",
          position: index + 1,
          item: {
            "@type": "Product",
            name,
            image: `https://kalethon.com${image}`,
            brand: { "@type": "Brand", name: "KALËTHON" },
            url: `https://kalethon.com/#product-${id}`,
            offers: { "@type": "Offer", priceCurrency: "GBP", price, availability: "https://schema.org/PreOrder", url: `https://kalethon.com/#product-${id}` },
          },
        })),
      }) }} />

      <section className="standard" id="story">
        <div className="standard-mark"><Mark /></div>
        <div className="standard-copy">
          <p className="eyebrow">The KALËTHON standard</p>
          <h2>Made for the space<br />between sport and life.</h2>
        </div>
        <div className="principles">
          <div><span>01</span><h3>Considered cloth</h3><p>Substantial natural fibres, technical stretch only where movement needs it.</p></div>
          <div><span>02</span><h3>Architected fit</h3><p>Clean lines, balanced proportions and ease through every point of motion.</p></div>
          <div><span>03</span><h3>Quiet signatures</h3><p>Refined trims and the Kinetic K mark—recognisable, never overstated.</p></div>
        </div>
      </section>

      <section className="closing">
        <p className="eyebrow light">KALËTHON / POISE IN MOTION</p>
        <h2>Built to move.<br />Designed to remain.</h2>
        <a className="button button-light" href="#pieces">Explore KALËTHON <Arrow /></a>
      </section>

      <footer>
        <div className="footer-brand">
          <Mark />
          <span>KALËTHON</span>
        </div>
        <div className="footer-links">
          <div><p>Shop</p><a href="#pieces">Finished colourways</a><a href="#collections">Sport collections</a><a href="#hoodies">Hoodies</a>{collections.map((collection) => <Link href={`/sport/${collection.id}`} key={collection.id}>{collection.name}</Link>)}</div>
          <div><p>KALËTHON</p><a href="#story">Our standard</a><a href="#story">Materials</a><a href="#story">Care</a><Link href="/journal">Journal</Link></div>
          <div><p>Client service</p><Link href="/contact">Contact and questions</Link><a href="mailto:hello@kalethon.com">hello@kalethon.com</a><Link href="/legal/delivery">Delivery</Link><Link href="/delivery-to">Where we deliver</Link><Link href="/legal/returns-and-refunds">Returns & refunds</Link><Link href="/measurements">Measurements & size guide</Link><SocialLinks /></div>
          <div><p>Legal & privacy</p><Link href="/legal/terms-and-conditions">Terms</Link><Link href="/legal/privacy-policy">Privacy</Link><Link href="/legal/cookie-policy">Cookies</Link><Link href="/legal/accessibility">Accessibility</Link><CookieSettingsButton /></div>
        </div>
        <div className="footer-bottom"><span>© 2026 KALETHON</span><span>Powered by MERQANO</span><span>London, United Kingdom</span></div>
      </footer>
    </main>
  );
}
