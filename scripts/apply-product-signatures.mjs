import sharp from "sharp";

const K_PATHS = `
  <path d="M8 8h11v48H8z" fill="currentColor"/>
  <path d="m22 30 24-22h13L33 32z" fill="currentColor"/>
  <path d="m22 34 12-4 25 26H45z" fill="currentColor"/>
`;

function kMark(colour, size = 70) {
  return Buffer.from(`
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 64 64" style="color:${colour}">
      <g opacity=".2" transform="translate(1 1)">${K_PATHS}</g>
      <g>${K_PATHS}</g>
    </svg>
  `);
}

function wordmark(colour) {
  return Buffer.from(`
    <svg xmlns="http://www.w3.org/2000/svg" width="270" height="46" viewBox="0 0 270 46">
      <text x="135" y="31" fill="${colour}" font-family="Arial,Helvetica,sans-serif" font-size="22" font-weight="700" letter-spacing="4" text-anchor="middle">KALËTHON</text>
    </svg>
  `);
}

const jobs = [
  {
    input: "design/product-masters/court-polo-blank.png",
    output: "public/catalog/court-polo-k.webp",
    overlays: [{ input: kMark("#692f38"), left: 718, top: 430 }],
  },
  {
    input: "design/product-masters/poise-pullover-hoodie-blank.png",
    output: "public/catalog/poise-pullover-hoodie.webp",
    overlays: [{ input: kMark("#692f38"), left: 716, top: 455 }],
  },
  {
    input: "design/product-masters/club-zip-hoodie-blank.png",
    output: "public/catalog/club-zip-hoodie.webp",
    overlays: [{ input: wordmark("#f4eee4"), left: 690, top: 470 }],
  },
  {
    input: "design/product-masters/court-short-original.webp",
    output: "public/try-on/court-short-photo.webp",
    patches: [{ sourceLeft: 930, sourceTop: 830, left: 986, top: 830, width: 52, height: 58 }],
    overlays: [
      { input: kMark("#f4eee4", 42), left: 991, top: 838 },
    ],
  },
  {
    input: "design/product-masters/court-skort-original.webp",
    output: "public/try-on/court-skort-photo.webp",
    patches: [{ sourceLeft: 960, sourceTop: 815, left: 1020, top: 815, width: 52, height: 58 }],
    overlays: [
      { input: kMark("#f4eee4", 42), left: 1025, top: 823 },
    ],
  },
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
