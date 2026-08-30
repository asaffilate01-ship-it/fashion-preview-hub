import TryOnClient from "./try-on/try-on-client";
import HeroCarousel from "./hero-carousel";
import CustomisePoloClient from "./customise/customise-polo-client";
import Link from "next/link";
import BagLink from "@/components/bag-link";
import SocialLinks from "@/components/social-links";
import { CookieSettingsButton } from "@/components/cookie-consent";
import RetailCollection from "@/components/retail-collection";

const hoodies = [
  {
    name: "Poise Hoodie",
    detail: "420gsm loopback cotton",
    fit: "Relaxed architectural fit",
    signature: "Bone K embroidery",
    price: "£125",
    tone: "ink",
    colors: ["Ink", "Bone", "Oxblood"],
  },
  {
    name: "Club Hoodie",
    detail: "480gsm brushed fleece",
    fit: "Structured oversized fit",
    signature: "Ink K embroidery",
    price: "£135",
    tone: "bone",
    colors: ["Bone", "Stone", "Sage"],
  },
  {
    name: "Court Zip Hoodie",
    detail: "Double-face cotton jersey",
    fit: "Clean athletic fit",
    signature: "Bone K embroidery",
    price: "£145",
    tone: "oxblood",
    colors: ["Oxblood", "Ink", "Navy"],
  },
  {
    name: "Travel Hoodie",
    detail: "Compact technical fleece",
    fit: "Easy travel fit",
    signature: "Ink K embroidery",
    price: "£150",
    tone: "sage",
    colors: ["Sage", "Stone", "Ink"],
  },
  {
    name: "Graphic Hoodie",
    detail: "Heavy compact cotton",
    fit: "Boxed contemporary fit",
    signature: "Oxblood wordmark print",
    price: "£140",
    tone: "stone",
    colors: ["Stone", "Bone", "Ink"],
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

export default function Home() {
  return (
    <main>
      <div className="announcement">Complimentary UK delivery on orders over £150</div>

      <header className="site-header">
        <a className="brand" href="#top" aria-label="KALËTHON home">
          <Mark className="brand-mark" />
          <span>KALËTHON</span>
        </a>
        <nav className="primary-nav" aria-label="Primary navigation">
          <a href="#collections">Collections</a>
          <a href="#pieces">Shop</a>
          <Link href="/customise">Customise</Link>
          <Link href="/measurements">Measurements</Link>
          <Link href="/journal">Journal</Link>
          <a href="#hoodies">Hoodies</a>
          <a href="#graphic-tees">Graphic tees</a>
          <Link href="/try-on">Try on</Link>
          <a href="#story">Our standard</a>
        </nav>
        <div className="header-actions" aria-label="Shop shortcuts">
          <Link href="/search">Search</Link>
          <BagLink />
        </div>
      </header>

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

      <section className="customiser" id="design-yours" aria-labelledby="customiser-title">
        <div className="customiser-heading">
          <div>
            <p className="eyebrow">Design your KALËTHON garment</p>
            <h2 id="customiser-title">Choose your garment.<br /><em>Make it yours.</em></h2>
          </div>
          <p>Customise polos, performance tees, a full-length tank, hoodies, jackets, joggers, tracksuits, shorts and a court skort. Product-appropriate short, long and sleeveless options appear automatically, with international sizing inside the studio.</p>
        </div>
        <CustomisePoloClient />
      </section>

      <section className="hoodies" id="hoodies" aria-labelledby="hoodies-title">
        <div className="hoodies-heading">
          <div>
            <p className="eyebrow light">The hoodie edit / 01</p>
            <h2 id="hoodies-title">Weight, warmth<br /><em>and restraint.</em></h2>
          </div>
          <div className="hoodies-heading-copy">
            <p>Five considered constructions, from substantial cotton fleece to a lighter travel layer. Dark cloth carries lighter embroidery; light cloth carries the mark in ink.</p>
            <span>Five forms / fifteen colourways</span>
          </div>
        </div>

        <div className="hoodie-grid">
          {hoodies.map((hoodie, index) => (
            <article className={`hoodie-card hoodie-${hoodie.tone}`} key={hoodie.name}>
              <div className="hoodie-card-top">
                <span>H / 0{index + 1}</span>
                <span>{hoodie.signature}</span>
              </div>
              <div className="hoodie-visual" aria-hidden="true">
                {hoodie.name === "Graphic Hoodie" ? <b>KALËTHON</b> : <Mark />}
              </div>
              <div className="hoodie-card-copy">
                <div>
                  <h3>{hoodie.name}</h3>
                  <p>{hoodie.detail}</p>
                  <small>{hoodie.fit}</small>
                </div>
                <strong>{hoodie.price}</strong>
              </div>
              <div className="hoodie-colors" aria-label={`${hoodie.name} colours`}>
                {hoodie.colors.map((color) => <span key={color}>{color}</span>)}
              </div>
              <a href="#try-on">Try this hoodie <Arrow /></a>
            </article>
          ))}
        </div>
      </section>

      <section className="tryon" id="try-on" aria-labelledby="tryon-title">
        <div className="tryon-intro">
          <div>
            <p className="eyebrow light">Virtual fitting room / Powered by FASHN</p>
            <h2 id="tryon-title">Your look.<br /><em>In motion.</em></h2>
          </div>
          <div className="tryon-intro-copy">
            <p>Select a KALËTHON piece, add a portrait or capture a live camera frame, then enter the private AI fitting room.</p>
            <span><b>Private by design.</b> Your portrait is processed only to create the preview and is not stored by KALËTHON.</span>
          </div>
        </div>
        <TryOnClient />
      </section>

      <section className="graphic-story" id="graphic-tees" aria-labelledby="graphic-title">
        <div className="graphic-image" role="img" aria-label="KALËTHON graphic wordmark and Kinetic K T-shirts in Milan" />
        <div className="graphic-copy">
          <p className="eyebrow light">Graphic series / 01</p>
          <h2 id="graphic-title">The wordmark,<br /><em>set in motion.</em></h2>
          <p>
            On selected tees, the full KALËTHON name becomes the artwork—scaled, angled and cut through with the collection palette. Premium essentials keep only the embroidered K.
          </p>
          <div className="signature-rules" aria-label="KALËTHON signature system">
            <div><Mark /><span><strong>Kinetic K</strong>Polos, hoodies, tracksuits and joggers</span></div>
            <div><b>KALËTHON</b><span><strong>Full wordmark</strong>Statement tees and selected editions</span></div>
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
          <div><p>Shop</p><a href="#design-yours">Bespoke studio</a><a href="#collections">Sport collections</a><a href="#hoodies">Hoodies</a>{collections.map((collection) => <Link href={`/sport/${collection.id}`} key={collection.id}>{collection.name}</Link>)}</div>
          <div><p>KALËTHON</p><a href="#story">Our standard</a><a href="#story">Materials</a><a href="#story">Care</a><Link href="/journal">Journal</Link></div>
          <div><p>Client service</p><a href="mailto:hello@kalethon.com">hello@kalethon.com</a><Link href="/legal/delivery">Delivery</Link><Link href="/legal/returns-and-refunds">Returns & refunds</Link><Link href="/measurements">Measurements & size guide</Link><SocialLinks /></div>
          <div><p>Legal & privacy</p><Link href="/legal/terms-and-conditions">Terms</Link><Link href="/legal/privacy-policy">Privacy</Link><Link href="/legal/cookie-policy">Cookies</Link><Link href="/legal/accessibility">Accessibility</Link><CookieSettingsButton /></div>
        </div>
        <div className="footer-bottom"><span>© 2026 KALËTHON</span><span>London, United Kingdom</span></div>
      </footer>
    </main>
  );
}
