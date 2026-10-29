// Genera los iconos del sitio.
// Empresa (home y páginas legales): el "4" del logo 4TL (src/assets/4techlabs-logo-4tl.png), aislado como la figura
// conexa que contiene su travesaño; "TL" y la estela no se leen a 16-32 px y el "TL" negro desaparece en pestañas oscuras.
//   public/favicon.ico            16, 32 y 48 px (PNG dentro de un contenedor ICO), fondo transparente
//   public/favicon-96.png         96×96, fondo transparente
//   public/apple-touch-icon.png   180×180 sobre blanco (iOS no admite transparencia y la rellenaría de negro)
// StudIApp (/studiapp): el robot del logo (scripts/logo-src.png = frame 0 del Lottie rasterizado a 3×) sobre un
// cuadrado redondeado con el degradado de la marca.
//   public/studiapp-favicon.ico (32×32), public/studiapp-favicon-96.png, public/studiapp-apple-touch-icon.png
//   public/logo.webp              placeholder del logo en nav y footer (66×93, con transparencia)
// Uso: node scripts/make-icons.mjs
import sharp from 'sharp';
import { existsSync, writeFileSync } from 'node:fs';

const SRC = 'scripts/logo-src.png';
const LOGO_4TL = 'src/assets/4techlabs-logo-4tl.png';
for (const file of [SRC, LOGO_4TL]) {
  if (!existsSync(file)) {
    console.error(`Falta ${file} (ver README) antes de ejecutar este script.`);
    process.exit(1);
  }
}

// favicon.ico: una entrada PNG por tamaño
function ico(entries) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(entries.length, 4);
  let offset = 6 + 16 * entries.length;
  const dir = entries.map(({ size, png }) => {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(size, 0);
    entry.writeUInt8(size, 1);
    entry.writeUInt8(0, 2);
    entry.writeUInt8(0, 3);
    entry.writeUInt16LE(1, 4);
    entry.writeUInt16LE(32, 6);
    entry.writeUInt32LE(png.length, 8);
    entry.writeUInt32LE(offset, 12);
    offset += png.length;
    return entry;
  });
  return Buffer.concat([header, ...dir, ...entries.map((e) => e.png)]);
}

// --- Empresa: el "4" del logo 4TL ---

// Relleno por inundación desde el primer píxel opaco a media altura (el travesaño del 4); se copia solo esa figura,
// con 2 px de margen para conservar el antialias del borde.
async function companyMark() {
  const { data, info } = await sharp(LOGO_4TL).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: W, height: H } = info;
  const opaque = (p) => data[p * 4 + 3] > 40;
  const midY = Math.round(H / 2);
  let seed = midY * W;
  while (!opaque(seed)) seed++;
  const seen = new Uint8Array(W * H);
  const stack = [seed];
  seen[seed] = 1;
  let [left, top, right, bottom] = [W, H, 0, 0];
  while (stack.length) {
    const p = stack.pop();
    const x = p % W;
    const y = (p - x) / W;
    left = Math.min(left, x);
    top = Math.min(top, y);
    right = Math.max(right, x);
    bottom = Math.max(bottom, y);
    for (const [nx, ny] of [[x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]]) {
      const n = ny * W + nx;
      if (nx >= 0 && nx < W && ny >= 0 && ny < H && !seen[n] && opaque(n)) {
        seen[n] = 1;
        stack.push(n);
      }
    }
  }
  const out = Buffer.alloc(data.length);
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      let keep = false;
      for (let dy = -2; dy <= 2 && !keep; dy++) {
        for (let dx = -2; dx <= 2 && !keep; dx++) {
          const nx = x + dx;
          const ny = y + dy;
          keep = nx >= 0 && nx < W && ny >= 0 && ny < H && seen[ny * W + nx] === 1;
        }
      }
      if (keep) data.copy(out, (y * W + x) * 4, (y * W + x) * 4, (y * W + x) * 4 + 4);
    }
  }
  const pad = 3;
  const box = { left: Math.max(left - pad, 0), top: Math.max(top - pad, 0) };
  box.width = Math.min(right + pad + 1, W) - box.left;
  box.height = Math.min(bottom + pad + 1, H) - box.top;
  return sharp(out, { raw: { width: W, height: H, channels: 4 } }).extract(box).png().toBuffer();
}

// El "4" centrado en un cuadrado, con un margen relativo al lado
async function markIcon(mark, size, margin, background) {
  const inner = Math.round(size * (1 - 2 * margin));
  const m = await sharp(mark).resize({ width: inner, height: inner, fit: 'inside', kernel: 'lanczos3' }).png().toBuffer();
  const { width, height } = await sharp(m).metadata();
  return sharp({ create: { width: size, height: size, channels: 4, background } })
    .composite([{ input: m, left: Math.round((size - width) / 2), top: Math.round((size - height) / 2) }])
    .png()
    .toBuffer();
}

const mark = await companyMark();
const clear = { r: 0, g: 0, b: 0, alpha: 0 };
const white = { r: 255, g: 255, b: 255, alpha: 1 };
const sizes = [16, 32, 48];
writeFileSync('public/favicon.ico', ico(await Promise.all(sizes.map(async (size) => ({ size, png: await markIcon(mark, size, 0.04, clear) })))));
writeFileSync('public/favicon-96.png', await markIcon(mark, 96, 0.04, clear));
writeFileSync('public/apple-touch-icon.png', await markIcon(mark, 180, 0.18, white));

// --- StudIApp: el robot sobre el degradado de la marca ---

const bgSvg = (size) =>
  Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="${size}" height="${size}">` +
      `<defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3d7fd9"/><stop offset=".62" stop-color="#0040a3"/><stop offset="1" stop-color="#003083"/></linearGradient></defs>` +
      `<rect width="64" height="64" rx="16" fill="url(#g)"/></svg>`,
  );

async function robotIcon(size) {
  const robot = await sharp(SRC).resize({ height: Math.round(size * 0.74), fit: 'inside' }).png().toBuffer();
  const { width, height } = await sharp(robot).metadata();
  return sharp(bgSvg(size))
    .composite([{ input: robot, left: Math.round((size - width) / 2), top: Math.round((size - height) / 2) }])
    .png()
    .toBuffer();
}

writeFileSync('public/studiapp-favicon.ico', ico([{ size: 32, png: await robotIcon(32) }]));
writeFileSync('public/studiapp-favicon-96.png', await robotIcon(96));
writeFileSync('public/studiapp-apple-touch-icon.png', await robotIcon(180));
await sharp(SRC).resize({ height: 93, fit: 'inside' }).webp({ quality: 90, alphaQuality: 90 }).toFile('public/logo.webp');
console.log('Generados: favicon.ico, favicon-96.png, apple-touch-icon.png (4TL); studiapp-favicon.ico, studiapp-favicon-96.png, studiapp-apple-touch-icon.png, logo.webp (StudIApp)');
