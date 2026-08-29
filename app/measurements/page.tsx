import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Measurement Guide | Kalëthon",
  description: "Illustrated made-to-measure guide for Kalëthon menswear, womenswear and childrenswear.",
};

const measurements = [
  ["01", "Height", "Barefoot, from the crown of the head straight down to the floor."],
  ["02", "Neck", "Around the base of the neck where a collar naturally sits; keep one finger beneath the tape."],
  ["03", "Shoulder width", "Across the back from one shoulder point to the other, following the natural curve."],
  ["04", "Upper chest", "Around the upper torso, under the armpits and above the fullest chest or bust point."],
  ["05", "Chest / bust", "Level around the fullest part of the chest or bust, with arms relaxed."],
  ["06", "Stomach", "Level around the fullest part of the abdomen without drawing the stomach in."],
  ["07", "Natural waist", "Around the narrowest point, usually just above the navel; do not use the trouser waistband."],
  ["08", "Hips / seat", "Level around the fullest part of the hips and seat, with feet together."],
  ["09", "Garment length", "From the high shoulder point beside the neck, over the chest, to the preferred hem."],
  ["10", "Sleeve length", "From the shoulder point, over a slightly bent elbow, to the wrist bone."],
  ["11", "Upper arm", "Around the fullest bicep with the arm relaxed."],
  ["12", "Wrist", "Around the wrist bone where the finished cuff will sit."],
  ["13", "Outside leg", "From the natural waist at the side, over the hip, straight down to the chosen ankle finish."],
  ["14", "Inside leg", "From the crotch seam straight down the inside leg to the chosen hem."],
  ["15", "Thigh", "Around the fullest upper thigh, keeping the tape level."],
  ["16", "Knee", "Around the knee at its widest point with the leg straight."],
  ["17", "Ankle", "Around the ankle where the trouser or jogger opening should finish."],
  ["18", "Rise / crotch depth", "Seated upright, measure vertically from the natural waist to the chair surface."],
  ["19", "Lower collar height", "From the base neck seam vertically to the preferred finished lower edge of the collar."],
  ["20", "Head circumference", "For hood fit, level around the forehead and the fullest point at the back of the head."],
] as const;

function Mark() {
  return <svg className="measure-brand-mark" viewBox="0 0 64 64" aria-hidden="true"><path d="M8 8h11v48H8z" fill="currentColor"/><path d="m22 30 24-22h13L33 32z" fill="currentColor"/><path d="m22 34 12-4 25 26H45z" fill="currentColor"/></svg>;
}

function MeasurementFigure({ view }: { view: "front" | "back" | "side" }) {
  const isSide = view === "side";
  return <svg className="measurement-figure" viewBox="0 0 320 620" role="img" aria-label={`${view} body measurement diagram`}>
    <defs><marker id={`arrow-${view}`} markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto-start-reverse"><path d="M0 0 8 4 0 8Z" fill="#6e1f2d"/></marker></defs>
    <g className="figure-body" fill="none" stroke="#171914" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="160" cy="68" r="38" />
      <path d={isSide ? "M155 106c-22 25-23 67-18 106l5 93-17 128 8 143h28l8-143 3-94c14-44 17-88 6-127-7-27-7-62-23-106Z" : "M122 115c-31 28-42 90-36 148l24 58-11 128 24 127h30l7-199 7 199h30l24-127-11-128 24-58c6-58-5-120-36-148-17 16-49 16-66 0Z"} />
      {!isSide && <><path d="M86 175 55 302l22 12 33-90"/><path d="m234 175 31 127-22 12-33-90"/></>}
    </g>
    <g className="figure-measures" fill="none" stroke="#6e1f2d" strokeWidth="2" markerStart={`url(#arrow-${view})`} markerEnd={`url(#arrow-${view})`}>
      {view === "front" && <><path d="M90 159H230"/><path d="M82 205H238"/><path d="M89 250H231"/><path d="M104 297H216"/><path d="M103 338H217"/><path d="M86 391H234"/><path d="M98 449H222"/><path d="M112 555H148"/></>}
      {view === "back" && <><path d="M118 128Q160 150 202 128"/><path d="M68 159H252"/><path d="M74 168 54 309"/><path d="M160 322 160 571"/><path d="M99 327 80 571"/></>}
      {view === "side" && <><path d="M214 30V571"/><path d="M185 207H235"/><path d="M178 250H231"/><path d="M181 337H226"/><path d="M190 391H225"/><path d="M198 105V158"/></>}
    </g>
    <g className="figure-labels" fill="#6e1f2d" fontFamily="Arial, sans-serif" fontSize="14" fontWeight="700">
      {view === "front" && <><text x="238" y="164">04</text><text x="246" y="210">05</text><text x="239" y="255">06</text><text x="224" y="302">07</text><text x="225" y="343">08</text><text x="242" y="396">15</text><text x="230" y="454">16</text><text x="154" y="560">17</text></>}
      {view === "back" && <><text x="209" y="129">02</text><text x="257" y="164">03</text><text x="44" y="315">10</text><text x="166" y="450">14</text><text x="70" y="578">13</text></>}
      {view === "side" && <><text x="240" y="308">01</text><text x="239" y="212">04</text><text x="235" y="255">05</text><text x="230" y="342">18</text><text x="230" y="396">13</text><text x="204" y="101">19</text></>}
    </g>
  </svg>;
}

const profileNotes = [
  { id: "men", title: "Men", note: "Wear a thin T-shirt and the underwear normally worn beneath the garment. Keep the stance natural and shoulders relaxed." },
  { id: "women", title: "Women", note: "Wear the bra and light underlayer intended beneath the garment. Measure bust and hips at their fullest points without compressing the tape." },
  { id: "children", title: "Children", note: "An adult should take every measurement. The child should stand naturally; do not add growing room—the atelier applies the selected allowance." },
] as const;

const unisexTopSizes = [
  ["XS", "84–89", "33–35", "69–74", "27–29", "44", "34"],
  ["S", "90–95", "35½–37½", "75–80", "29½–31½", "46", "36"],
  ["M", "96–101", "38–40", "81–86", "32–34", "48", "38"],
  ["L", "102–107", "40–42", "87–92", "34–36", "50", "40"],
  ["XL", "108–113", "42½–44½", "93–98", "36½–38½", "52", "42"],
  ["2XL", "114–121", "45–47½", "99–106", "39–41½", "54–56", "44–46"],
  ["3XL", "122–129", "48–51", "107–114", "42–45", "58–60", "48–50"],
] as const;

const womenBottomSizes = [
  ["XS", "62–66", "24½–26", "86–90", "34–35½", "6–8", "34–36", "2–4", "6–8"],
  ["S", "67–71", "26½–28", "91–95", "36–37½", "10", "38", "6", "10"],
  ["M", "72–76", "28½–30", "96–100", "38–39½", "12", "40", "8", "12"],
  ["L", "77–82", "30½–32½", "101–106", "40–41½", "14", "42", "10", "14"],
  ["XL", "83–89", "32½–35", "107–113", "42–44½", "16", "44", "12", "16"],
  ["2XL", "90–98", "35½–38½", "114–122", "45–48", "18–20", "46–48", "14–16", "18–20"],
  ["3XL", "99–108", "39–42½", "123–132", "48½–52", "22–24", "50–52", "18–20", "22–24"],
] as const;

export default function MeasurementsPage() {
  return <main className="measure-page">
    <header className="measure-header"><a href="/" className="measure-brand"><Mark/><span>KALËTHON</span></a><a href="/#design-yours">Return to bespoke studio</a></header>
    <section className="measure-hero"><p className="eyebrow">Kalëthon made to measure</p><h1>Measure once.<br/><em>Move without compromise.</em></h1><p>Use a flexible tape, measure in centimetres over light clothing, and keep the tape level without pulling it tight. For best results, ask another person to measure you.</p></section>
    <nav className="measure-profile-nav" aria-label="Measurement guides">{profileNotes.map((profile) => <a href={`#${profile.id}`} key={profile.id}>{profile.title}</a>)}</nav>
    <section className="measure-diagrams" aria-labelledby="diagram-title"><div className="measure-section-heading"><div><p className="eyebrow">Vector guide / Measurement points</p><h2 id="diagram-title">Where the tape starts<br/><em>and where it finishes.</em></h2></div><p>The numbered lines correspond to the complete measurement list below. Circumference measurements must stay horizontal and parallel with the floor.</p></div><div className="measure-figure-grid"><article><span>Front / Circumference</span><MeasurementFigure view="front"/></article><article><span>Back / Length</span><MeasurementFigure view="back"/></article><article><span>Side / Height & rise</span><MeasurementFigure view="side"/></article></div></section>
    <section className="measure-list" aria-labelledby="measure-list-title"><div className="measure-section-heading"><div><p className="eyebrow">Complete list / 20 points</p><h2 id="measure-list-title">What to measure.</h2></div><p>Record body measurements, not the dimensions of a favourite garment. Add a note in the bespoke studio if you want an unusually close or generous fit.</p></div><div className="measure-list-grid">{measurements.map(([number, name, instruction]) => <article key={number}><span>{number}</span><div><h3>{name}</h3><p>{instruction}</p></div></article>)}</div></section>
    <section className="measure-profiles">{profileNotes.map((profile) => <article id={profile.id} key={profile.id}><span>{profile.title.slice(0, 1)}</span><div><p className="eyebrow">Guide for</p><h2>{profile.title}</h2><p>{profile.note}</p><ol><li>Stand barefoot with feet together.</li><li>Keep the tape flat and level.</li><li>Breathe normally; never hold the stomach in.</li><li>Repeat every measurement once.</li></ol><a href="/#design-yours">Enter {profile.title.toLowerCase()} measurements ↗</a></div></article>)}</section>
    <section className="international-sizes" aria-labelledby="international-sizes-title">
      <div className="measure-section-heading"><div><p className="eyebrow">Body first / International reference</p><h2 id="international-sizes-title">One Kalëthon size.<br/><em>Measured consistently.</em></h2></div><p>An S is not the same in every country. Use chest, waist and hip measurements as the deciding values; EU, UK, US and AU/NZ numbers are reference points only.</p></div>
      <article className="size-chart-card"><div><span>01</span><h3>Unisex tops and polos</h3><p>Regular premium fit with approximately 8–10 cm of positive chest ease.</p></div><div className="size-chart-scroll"><table><thead><tr><th rowSpan={2}>Kalëthon</th><th colSpan={2}>Chest / bust</th><th colSpan={2}>Waist</th><th colSpan={2}>Top reference</th></tr><tr><th>cm</th><th>in</th><th>cm</th><th>in</th><th>EU</th><th>UK / US chest</th></tr></thead><tbody>{unisexTopSizes.map((row) => <tr key={row[0]}>{row.map((value, index) => index === 0 ? <th scope="row" key={index}>{value}</th> : <td key={index}>{value}</td>)}</tr>)}</tbody></table></div></article>
      <article className="size-chart-card"><div><span>02</span><h3>Women’s shorts, skirts and skorts</h3><p>Choose by natural waist and fullest hip. Movement and coverage are confirmed during fit testing.</p></div><div className="size-chart-scroll"><table><thead><tr><th>Kalëthon</th><th>Waist cm</th><th>Waist in</th><th>Hip cm</th><th>Hip in</th><th>UK</th><th>EU</th><th>US</th><th>AU / NZ</th></tr></thead><tbody>{womenBottomSizes.map((row) => <tr key={row[0]}>{row.map((value, index) => index === 0 ? <th scope="row" key={index}>{value}</th> : <td key={index}>{value}</td>)}</tr>)}</tbody></table></div></article>
      <p className="international-size-note"><b>Source of truth:</b> Kalëthon body measurements and the product’s finished-garment chart. Never grade a pattern from country conversions. If you are between ranges, choose the larger size for a relaxed fit or contact the concierge.</p>
    </section>
    <section className="measure-collar-detail"><div><p className="eyebrow light">Collar detail / 19</p><h2>Lower collar height.</h2><p>Place the tape at the base neck seam and measure vertically to the preferred lower finished edge. Record the exact centimetres—do not include seam allowance.</p></div><svg viewBox="0 0 420 260" role="img" aria-label="Lower collar height measurement detail"><path d="M90 210c34-86 54-124 120-124s86 38 120 124M136 128c28 32 120 32 148 0M160 82c8 48 92 48 100 0" fill="none" stroke="white" strokeWidth="4"/><path d="M302 92v90" stroke="#d0b06c" strokeWidth="3" markerStart="url(#collar-arrow)" markerEnd="url(#collar-arrow)"/><defs><marker id="collar-arrow" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto-start-reverse"><path d="M0 0 8 4 0 8Z" fill="#d0b06c"/></marker></defs><text x="317" y="142" fill="#d0b06c" fontFamily="Arial" fontSize="18" fontWeight="700">19</text></svg></section>
    <footer className="measure-footer"><a href="/">KALËTHON</a><p>Poise in motion.</p><a href="mailto:concierge@kalethon.com">Need help measuring?</a></footer>
  </main>;
}
