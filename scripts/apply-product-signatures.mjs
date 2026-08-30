import sharp from "sharp";

const K_PATHS = `
  <path d="M8 8h11v48H8z" fill="currentColor"/>
  <path d="m22 30 24-22h13L33 32z" fill="currentColor"/>
  <path d="m22 34 12-4 25 26H45z" fill="currentColor"/>
`;

function kMark(colour, size = 46) {
  return Buffer.from(`
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 64 64" style="color:${colour}">
      <g>${K_PATHS}</g>
    </svg>
  `);
}

function wordmark(colour) {
  return Buffer.from(`
    <svg xmlns="http://www.w3.org/2000/svg" width="200" height="40" viewBox="0 0 200 40">
      <text x="100" y="27" fill="${colour}" font-family="Helvetica Neue,Arial,sans-serif" font-size="18" font-weight="700" letter-spacing="3.3" text-anchor="middle">KALËTHON</text>
    </svg>
  `);
}

const jobs = [
  {
    input: "design/product-masters/court-polo-blank.png",
    output: "public/catalog/court-polo-k.webp",
    overlays: [{ input: kMark("#692f38"), left: 730, top: 442 }],
  },
  {
    input: "design/product-masters/poise-pullover-hoodie-blank.png",
    output: "public/catalog/poise-pullover-hoodie.webp",
    overlays: [{ input: kMark("#692f38"), left: 728, top: 467 }],
  },
  {
    input: "design/product-masters/club-zip-hoodie-blank.png",
    output: "public/catalog/club-zip-hoodie.webp",
    overlays: [{ input: wordmark("#f4eee4"), left: 730, top: 478 }],
  },
  // Court Short and Court Skort are intentionally excluded: their approved
  // 42 px K marks remain unchanged in the existing try-on photographs.
];

for (const job of jobs) {
  const patches = await Promise.all((job.patches ?? []).map(async (patch) => ({
    input: await sharp(job.input).extract({ left: patch.sourceLeft, top: patch.sourceTop, width: patch.width, height: patch.height }).toBuffer(),
    left: patch.left,
    top: patch.top,
  })));
  const pipeline = sharp(job.input).composite([...patches, ...job.overlays]);
  if (job.output.endsWith(".jpg")) {
    await pipeline.jpeg({ quality: 90, mozjpeg: true }).toFile(job.output);
  } else {
    await pipeline.webp({ quality: 88, effort: 5 }).toFile(job.output);
  }
}
