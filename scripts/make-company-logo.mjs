// Genera el logo de 4Tech Labs a partir del avatar de la organización en GitHub (scripts/4techlabs-logo-src.jpg, JPG 460×460 con fondo blanco):
//   src/assets/4techlabs-logo.png  sin fondo y recortado al contenido; Astro genera los WebP de Quiénes somos y del footer
//   public/4techlabs-logo.png      cuadrado sobre blanco, para el JSON-LD (Google muestra el logo de la organización sobre blanco)
// El logo son dos tintas planas sobre blanco: cada píxel se toma como mezcla de blanco con la tinta más cercana y la proporción
// de tinta pasa a ser la opacidad. Así el fondo desaparece, los bordes conservan el suavizado y se va el ruido del JPG.
// Uso: node scripts/make-company-logo.mjs
import sharp from 'sharp';

const SRC = 'scripts/4techlabs-logo-src.jpg';
const INKS = [
  [25, 58, 86], // #193a56, el 4 y el texto (mediana de los píxeles sólidos)
  [44, 137, 195], // #2c89c3, el chip
];
const PAD = 4; // px de margen alrededor del contenido recortado

const { data, info } = await sharp(SRC).removeAlpha().raw().toBuffer({ resolveWithObject: true });
const { width, height } = info;
const rgba = Buffer.alloc(width * height * 4);
let minX = width;
let minY = height;
let maxX = -1;
let maxY = -1;

for (let p = 0; p < width * height; p++) {
  const d = [data[p * 3] - 255, data[p * 3 + 1] - 255, data[p * 3 + 2] - 255];
  let best;
  for (const ink of INKS) {
    const v = ink.map((c) => c - 255);
    const a = Math.min(1, Math.max(0, (d[0] * v[0] + d[1] * v[1] + d[2] * v[2]) / (v[0] ** 2 + v[1] ** 2 + v[2] ** 2)));
    const err = (d[0] - a * v[0]) ** 2 + (d[1] - a * v[1]) ** 2 + (d[2] - a * v[2]) ** 2;
    if (!best || err < best.err) best = { ink, a, err };
  }
  // Los extremos son ruido del JPG: casi blanco es fondo y casi tinta es tinta sólida.
  const alpha = best.a < 0.04 ? 0 : best.a > 0.94 ? 1 : best.a;
  rgba.set([...best.ink, Math.round(alpha * 255)], p * 4);
  if (alpha > 0) {
    const x = p % width;
    const y = (p - x) / width;
    minX = Math.min(minX, x);
    maxX = Math.max(maxX, x);
    minY = Math.min(minY, y);
    maxY = Math.max(maxY, y);
  }
}

const raw = { raw: { width, height, channels: 4 } };
const left = Math.max(0, minX - PAD);
const top = Math.max(0, minY - PAD);
const box = { left, top, width: Math.min(width, maxX + PAD + 1) - left, height: Math.min(height, maxY + PAD + 1) - top };

await sharp(rgba, raw).extract(box).png({ compressionLevel: 9 }).toFile('src/assets/4techlabs-logo.png');
await sharp(rgba, raw).flatten({ background: '#ffffff' }).png({ compressionLevel: 9 }).toFile('public/4techlabs-logo.png');
console.log(`src/assets/4techlabs-logo.png ${box.width}×${box.height} (sin fondo) · public/4techlabs-logo.png ${width}×${height} (sobre blanco)`);
