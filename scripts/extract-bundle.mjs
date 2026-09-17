#!/usr/bin/env node
// Extrae los assets del bundle "Nexora Hero.html" (manifest base64 + gzip) a archivos normales.
// Uso: node scripts/extract-bundle.mjs "<ruta al bundle .html>" [<carpeta del proyecto>]
//   src/assets/        imágenes del hero (fuente para <Picture>)
//   public/lottie/     animación del logo
//   .extracted/        referencia (plantilla decodificada, componentes originales, fuentes) — ignorado por git
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
import { join, relative } from 'node:path';

const [, , htmlPath, projectDir = process.cwd()] = process.argv;
if (!htmlPath) {
  console.error('Uso: node scripts/extract-bundle.mjs <bundle.html> [carpetaProyecto]');
  process.exit(1);
}
const html = readFileSync(htmlPath, 'utf8');

const block = (type) => {
  // indexOf en vez de regex: el manifest mide 2,3 MB y una regex perezosa no lo aguanta.
  const open = `<script type="__bundler/${type}">`;
  const start = html.indexOf(open);
  if (start === -1) throw new Error(`No se encontró el bloque ${type}`);
  const end = html.indexOf("</script>", start + open.length);
  return JSON.parse(html.slice(start + open.length, end).trim());
};
const manifest = block('manifest');
const extResources = block('ext_resources');
const template = block('template');

const decode = (entry) => {
  const raw = Buffer.from(entry.data, 'base64');
  return entry.compressed ? gunzipSync(raw) : raw;
};

const out = {
  assets: join(projectDir, 'src', 'assets'),
  lottie: join(projectDir, 'public', 'lottie'),
  ref: join(projectDir, '.extracted'),
  fonts: join(projectDir, '.extracted', 'fonts'),
};
for (const d of Object.values(out)) mkdirSync(d, { recursive: true });

// uuid -> [carpeta, nombre]. null = no se necesita (React, ReactDOM, Babel)
const names = new Map();

const imgSrc = /<img src="([0-9a-f-]{36})"/.exec(template)?.[1];
if (imgSrc) names.set(imgSrc, ['assets', 'hero.jpg']);
const srcset = /src-set="([^"]+)"/.exec(template)?.[1] ?? '';
for (const part of srcset.split(',')) {
  const [uuid, w] = part.trim().split(/\s+/);
  if (uuid) names.set(uuid, ['assets', `hero-${(w ?? '').replace('w', '')}.webp`]);
}
for (const { id, uuid } of extResources) {
  if (id === 'lottieRobot') names.set(uuid, ['lottie', 'robot.json']);
  else if (/^https?:/.test(id)) names.set(uuid, null);
  else names.set(uuid, ['ref', id.replace(/^\.\//, '')]);
}
const headScript = /<head>[\s\S]*?<script src="([0-9a-f-]{36})">/.exec(template)?.[1];
if (headScript) names.set(headScript, ['ref', 'dc-runtime.js']);
const helmetScript = /<helmet>[\s\S]*?<script src="([0-9a-f-]{36})">/.exec(template)?.[1];
if (helmetScript) names.set(helmetScript, ['ref', 'lottie_light.min.js']);
const mosaic = /from="([0-9a-f-]{36})#\/([^"]+)"/.exec(template);
if (mosaic) names.set(mosaic[1], ['ref', mosaic[2]]);

// Fuentes: nombre a partir del CSS @font-face (familia-estilo-peso-subset). Las variables se repiten por peso: gana la primera.
const faceRe = /\/\*\s*([\w-]+)\s*\*\/\s*@font-face\s*\{([^}]*)\}/g;
let fm;
while ((fm = faceRe.exec(template))) {
  const [, subset, body] = fm;
  const family = /font-family:\s*'([^']+)'/.exec(body)?.[1] ?? 'font';
  const style = /font-style:\s*(\w+)/.exec(body)?.[1] ?? 'normal';
  const weight = /font-weight:\s*(\d+)/.exec(body)?.[1] ?? '400';
  const uuid = /url\("([0-9a-f-]{36})"\)/.exec(body)?.[1];
  if (uuid && !names.has(uuid)) {
    names.set(uuid, ['fonts', `${family.toLowerCase().replace(/\s+/g, '-')}-${style}-${weight}-${subset}.woff2`]);
  }
}

const extFromMime = (mime) => ({ 'image/jpeg': 'jpg', 'image/webp': 'webp', 'image/png': 'png', 'application/json': 'json', 'font/woff2': 'woff2', 'text/html': 'html' })[mime] ?? (mime.includes('javascript') ? 'js' : 'bin');

let total = 0;
for (const [uuid, entry] of Object.entries(manifest)) {
  const target = names.has(uuid) ? names.get(uuid) : ['ref', `${uuid}.${extFromMime(entry.mime)}`];
  if (target === null) { console.log(`${uuid.slice(0, 8)}  ${entry.mime.padEnd(22)} omitido (dependencia de React/Babel)`); continue; }
  const bytes = decode(entry);
  const file = join(out[target[0]], target[1]);
  writeFileSync(file, bytes);
  total += bytes.length;
  console.log(`${uuid.slice(0, 8)}  ${entry.mime.padEnd(22)} ${(bytes.length / 1024).toFixed(1).padStart(7)} KB  ${relative(projectDir, file)}`);
}
writeFileSync(join(out.ref, 'template.html'), template);
console.log(`\nTotal escrito: ${(total / 1024).toFixed(0)} KB. Plantilla decodificada en ${relative(projectDir, join(out.ref, 'template.html'))}`);
