// Genera los iconos del sitio a partir del robot del logo (scripts/logo-src.png = frame 0 del Lottie rasterizado a 3×):
//   public/logo.webp          placeholder del logo en nav y footer (66×93, con transparencia)
//   public/favicon.ico        32×32 (PNG dentro de un contenedor ICO)
//   public/favicon-96.png     96×96
//   public/apple-touch-icon.png 180×180
// Los iconos ponen el robot sobre un cuadrado redondeado con el degradado de la marca.
// Uso: node scripts/make-icons.mjs
import sharp from 'sharp';
import { existsSync, writeFileSync } from 'node:fs';

const SRC = 'scripts/logo-src.png';
if (!existsSync(SRC)) {
  console.error(`Falta ${SRC}. Genera el PNG del robot (ver README) antes de ejecutar este script.`);
  process.exit(1);
}

const bgSvg = (size) =>
  Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="${size}" height="${size}">` +
      `<defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3d7fd9"/><stop offset=".62" stop-color="#0040a3"/><stop offset="1" stop-color="#003083"/></linearGradient></defs>` +
      `<rect width="64" height="64" rx="16" fill="url(#g)"/></svg>`,
  );

async function icon(size) {
  const robot = await sharp(SRC).resize({ height: Math.round(size * 0.74), fit: 'inside' }).png().toBuffer();
  const { width, height } = await sharp(robot).metadata();
  return sharp(bgSvg(size))
    .composite([{ input: robot, left: Math.round((size - width) / 2), top: Math.round((size - height) / 2) }])
    .png()
    .toBuffer();
}

// favicon.ico: una entrada PNG de 32×32
const p32 = await icon(32);
const header = Buffer.alloc(6);
header.writeUInt16LE(0, 0);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(1, 4);
const entry = Buffer.alloc(16);
entry.writeUInt8(32, 0);
entry.writeUInt8(32, 1);
entry.writeUInt8(0, 2);
entry.writeUInt8(0, 3);
entry.writeUInt16LE(1, 4);
entry.writeUInt16LE(32, 6);
entry.writeUInt32LE(p32.length, 8);
entry.writeUInt32LE(22, 12);
writeFileSync('public/favicon.ico', Buffer.concat([header, entry, p32]));
writeFileSync('public/favicon-96.png', await icon(96));
writeFileSync('public/apple-touch-icon.png', await icon(180));
await sharp(SRC).resize({ height: 93, fit: 'inside' }).webp({ quality: 90, alphaQuality: 90 }).toFile('public/logo.webp');
console.log('Generados: public/logo.webp, favicon.ico, favicon-96.png, apple-touch-icon.png');
