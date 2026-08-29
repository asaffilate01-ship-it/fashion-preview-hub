import TryOnClient from "./try-on/try-on-client";
import HeroCarousel from "./hero-carousel";
import CustomisePoloClient from "./customise/customise-polo-client";
import Link from "next/link";
import SocialLinks from "@/components/social-links";

const pieces = [
  { name: "The Court Polo", detail: "Mercerised cotton piqué", signature: "K embroidery", colours: "Bone / Ink / Sage / Oxblood", price: "£85", tone: "bone" },
  { name: "The Form Tee", detail: "300gsm compact jersey", signature: "Wordmark print", colours: "Ink / Bone / Stone / Oxblood", price: "£58", tone: "ink" },
  { name: "The Poise Hoodie", detail: "Loopback cotton fleece", signature: "K embroidery", colours: "Sage / Ink / Bone", price: "£125", tone: "sage" },
  { name: "The Track Jacket", detail: "Matte technical twill", signature: "K embroidery", colours: "Oxblood / Ink / Stone", price: "£145", tone: "oxblood" },
  { name: "The Motion Jogger", detail: "Structured double-knit", signature: "K embroidery", colours: "Stone / Ink / Sage / Navy", price: "£110", tone: "stone" },
  { name: "The Court Long-Sleeve Polo", detail: "Mercerised cotton piqué", signature: "Bone K embroidery", colours: "Ink / Navy / Oxblood", price: "£95", tone: "ink" },
  { name: "The Links Long-Sleeve Polo", detail: "Performance interlock jersey", signature: "Ink K embroidery", colours: "Bone / Sage / Stone", price: "£98", tone: "sage" },
  { name: "The Heritage Long-Sleeve Polo", detail: "Fine-gauge cotton knit", signature: "Oxblood K embroidery", colours: "Stone / Bone / Ink", price: "£105", tone: "bone" },
  { name: "The Club Jogging Suit", detail: "Coordinated 480gsm brushed fleece", signature: "K embroidery", colours: "Bone / Stone / Sage / Ink", price: "£225", tone: "stone" },
  { name: "The Performance Tracksuit", detail: "Matte technical twill two-piece", signature: "K embroidery", colours: "Oxblood / Ink / Navy", price: "£245", tone: "oxblood" },
  { name: "The Links Trouser", detail: "Four-way stretch woven cloth", signature: "Discreet K tab", colours: "Ink / Stone / Navy / Bone", price: "£135", tone: "ink" },
  { name: "The Baseline Tennis Set", detail: "Court polo with full-length trouser", signature: "K embroidery", colours: "Bone / Ink / Oxblood", price: "£185", tone: "bone" },
  { name: "The Glass Court Padel Set", detail: "Performance top with full-length jogger", signature: "K embroidery", colours: "Ink / Sage / Stone", price: "£178", tone: "sage" },
  { name: "The Rally Pickleball Set", detail: "Compact jersey tee with full-length jogger", signature: "Wordmark print", colours: "Stone / Ink / Oxblood", price: "£168", tone: "stone" },
];

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
    <svg className={className} viewBox="0 0 64 64" role="img" aria-label="Kalëthon Kinetic K mark">
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
        <a className="brand" href="#top" aria-label="Kalëthon home">
          <Mark className="brand-mark" />
          <span>KALËTHON</span>
        </a>
        <nav className="primary-nav" aria-label="Primary navigation">
          <a href="#collections">Collections</a>
          <a href="#pieces">New edit</a>
          <a href="#design-yours">Bespoke studio</a>
          <Link href="/measurements">Measurements</Link>
          <Link href="/journal">Journal</Link>
          <a href="#hoodies">Hoodies</a>
          <a href="#graphic-tees">Graphic tees</a>
          <a href="#try-on">Try on</a>
          <a href="#story">Our standard</a>
        </nav>
        <div className="header-actions" aria-label="Shop shortcuts">
          <a href="#pieces">Search</a>
          <a href="#pieces">Bag <span className="bag-count">0</span></a>
        </div>
      </header>

      <nav className="collection-rail" aria-label="Shop by collection">
        <span>Shop by sport</span>
        {collections.map((collection) => <Link href={`/sport/${collection.id}`} key={collection.id}>{collection.name}</Link>)}
      </nav>

      <HeroCarousel />

      <section className="intro" id="collection">
        <p className="eyebrow">Kalëthon / London</p>
        <h2>Relaxed in feel.<br /><em>Resolved in form.</em></h2>
        <p className="intro-copy">
          Elevated essentials that hold their shape, move naturally and wear with quiet confidence—from the court to the city.
        </p>
      </section>

      <section className="collections" id="collections" aria-labelledby="collections-title">
        <div className="collections-heading">
          <div>
            <p className="eyebrow">Kalëthon sport / 2026</p>
            <h2 id="collections-title">Made for every<br /><em>kind of court.</em></h2>
          </div>
          <p>Five distinct edits. One standard of cloth, movement and restraint—from the first serve to the final round, then back into everyday life.</p>
        </div>
        <div className="collection-grid">
          {collections.map((collection, index) => (
            <article className={`collection-card ${collection.image}`} id={collection.id} key={collection.id}>
              <div className="collection-card-shade" />
              <div className="collection-card-top">
                <span>0{index + 1}</span>
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

      <section className="pieces" id="pieces" aria-labelledby="pieces-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Core collection / 01</p>
            <h2 id="pieces-title">The first edit</h2>
          </div>
          <a className="text-link" href="#all-pieces">View all pieces <Arrow /></a>
        </div>

        <div className="piece-grid" id="all-pieces">
          {pieces.map((piece, index) => (
            <article className={`piece-card tone-${piece.tone}`} key={piece.name}>
              <div className="piece-number">0{index + 1}</div>
              <div className="piece-symbol" aria-hidden="true"><Mark /></div>
              <div className="piece-info">
                <div>
                  <h3>{piece.name}</h3>
                  <p>{piece.detail}</p>
                  <small>{piece.signature}</small>
                  <small className="piece-colour-note">{piece.colours}</small>
                </div>
                <span>{piece.price}</span>
              </div>
              <a className="piece-try-link" href="#design-yours">Customise in the studio <Arrow /></a>
            </article>
          ))}
        </div>
      </section>

      <section className="customiser" id="design-yours" aria-labelledby="customiser-title">
        <div className="customiser-heading">
          <div>
            <p className="eyebrow">Kalëthon studio / Live customiser</p>
            <h2 id="customiser-title">Your garment, precisely.<br /><em>Made to move.</em></h2>
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
            <p>Select a Kalëthon piece, add a portrait or capture a live camera frame, then enter the private AI fitting room.</p>
            <span><b>Private by design.</b> Your portrait is processed only to create the preview and is not stored by Kalëthon.</span>
          </div>
        </div>
        <TryOnClient />
      </section>

      <section className="graphic-story" id="graphic-tees" aria-labelledby="graphic-title">
        <div className="graphic-image" role="img" aria-label="Kalëthon graphic wordmark and Kinetic K T-shirts in Milan" />
        <div className="graphic-copy">
          <p className="eyebrow light">Graphic series / 01</p>
          <h2 id="graphic-title">The wordmark,<br /><em>set in motion.</em></h2>
          <p>
            On selected tees, the full KALËTHON name becomes the artwork—scaled, angled and cut through with the collection palette. Premium essentials keep only the embroidered K.
          </p>
          <div className="signature-rules" aria-label="Kalëthon signature system">
            <div><Mark /><span><strong>Kinetic K</strong>Polos, hoodies, tracksuits and joggers</span></div>
            <div><b>KALËTHON</b><span><strong>Full wordmark</strong>Statement tees and selected editions</span></div>
          </div>
          <a className="button button-light" href="#pieces">Explore graphic tees <Arrow /></a>
        </div>
      </section>

      <section className="editorial" aria-label="Kalëthon collection stories">
        <article className="editorial-card editorial-men">
          <div className="editorial-image image-men" role="img" aria-label="Kalëthon embroidered hoodie and tracksuit look in London" />
          <div className="editorial-caption">
            <p className="eyebrow light">Look 04 / London</p>
            <h2>Layers,<br />without limits.</h2>
            <a href="#hoodies">Shop hoodies <Arrow /></a>
          </div>
        </article>
        <article className="editorial-card editorial-women">
          <div className="editorial-image image-women" role="img" aria-label="Kalëthon embroidered tracksuits in the Alps" />
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
          <p className="eyebrow">The Kalëthon standard</p>
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
        <a className="button button-light" href="#pieces">Explore Kalëthon <Arrow /></a>
      </section>

      <footer>
        <div className="footer-brand">
          <Mark />
          <span>KALËTHON</span>
        </div>
        <div className="footer-links">
          <div><p>Shop</p><a href="#design-yours">Bespoke studio</a><a href="#collections">Sport collections</a><a href="#hoodies">Hoodies</a>{collections.map((collection) => <Link href={`/sport/${collection.id}`} key={collection.id}>{collection.name}</Link>)}</div>
          <div><p>Kalëthon</p><a href="#story">Our standard</a><a href="#story">Materials</a><a href="#story">Care</a><Link href="/journal">Journal</Link></div>
          <div><p>Client service</p><a href="mailto:concierge@kalethon.com">Contact</a><a href="#pieces">Delivery & returns</a><Link href="/measurements">Measurements & size guide</Link><SocialLinks /></div>
        </div>
        <div className="footer-bottom"><span>© 2026 Kalëthon</span><span>London, United Kingdom</span></div>
      </footer>
    </main>
  );
}
