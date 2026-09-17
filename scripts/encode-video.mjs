#!/usr/bin/env node
// Comprime un video para la web con ffmpeg (binario del paquete ffmpeg-static, sin instalar nada en el sistema).
// Uso: node scripts/encode-video.mjs "<video.mov|mp4>" [carpetaSalida=media] [nombre]
// Genera: <nombre>.mp4 (H.264, crf 28, faststart), <nombre>.webm (VP9, crf 34), <nombre>-poster.jpg y <nombre>-poster.webp (frame del segundo 1, 1280 px).
import ffmpegPath from 'ffmpeg-static';
import sharp from 'sharp';
import { spawnSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { basename, extname, join } from 'node:path';

const [, , input, outDir = 'media', customName] = process.argv;
if (!input) {
  console.error('Uso: node scripts/encode-video.mjs "<video>" [carpetaSalida] [nombre]');
  process.exit(1);
}
if (!ffmpegPath) {
  console.error('ffmpeg-static no trae binario para esta plataforma. Instala ffmpeg y ajusta ffmpegPath.');
  process.exit(1);
}
mkdirSync(outDir, { recursive: true });

const slug = (s) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
const name = slug(customName ?? basename(input, extname(input)));
// Solo reduce (nunca amplía) a 1280 px de ancho; la altura queda par para H.264.
const scale = 'scale=w=min(1280\\,iw):h=-2';

const run = (label, args) => {
  console.log(`→ ${label}`);
  const r = spawnSync(ffmpegPath, ['-y', '-hide_banner', '-loglevel', 'error', ...args], { stdio: 'inherit' });
  if (r.status !== 0) {
    console.error(`ffmpeg falló en: ${label}`);
    process.exit(r.status ?? 1);
  }
};

const mp4 = join(outDir, `${name}.mp4`);
const webm = join(outDir, `${name}.webm`);
const posterJpg = join(outDir, `${name}-poster.jpg`);
const posterWebp = join(outDir, `${name}-poster.webp`);

run('MP4 H.264', ['-i', input, '-vf', scale, '-c:v', 'libx264', '-profile:v', 'high', '-pix_fmt', 'yuv420p', '-crf', '28', '-preset', 'slow', '-movflags', '+faststart', '-c:a', 'aac', '-b:a', '96k', mp4]);
run('WebM VP9', ['-i', input, '-vf', scale, '-c:v', 'libvpx-vp9', '-crf', '34', '-b:v', '0', '-row-mt', '1', '-c:a', 'libopus', '-b:a', '64k', webm]);
run('Poster', ['-ss', '1', '-i', input, '-frames:v', '1', '-vf', scale, '-q:v', '3', posterJpg]);
await sharp(posterJpg).webp({ quality: 78 }).toFile(posterWebp);

console.log(`
Listo en ${outDir}/:
  ${name}.mp4  ${name}.webm  ${name}-poster.jpg  ${name}-poster.webp

Subir a Cloudflare R2 (una vez hecho "npx wrangler login" y creado el bucket studiapp-media):
  npx wrangler r2 object put studiapp-media/videos/${name}-v1.webm --file "${webm}" --content-type video/webm --cache-control "public, max-age=31536000, immutable"
  npx wrangler r2 object put studiapp-media/videos/${name}-v1.mp4 --file "${mp4}" --content-type video/mp4 --cache-control "public, max-age=31536000, immutable"
  npx wrangler r2 object put studiapp-media/videos/${name}-v1-poster.webp --file "${posterWebp}" --content-type image/webp --cache-control "public, max-age=31536000, immutable"

Luego apunta src/data/site.ts a https://media.<tu-dominio>/videos/${name}-v1.{webm,mp4} y al poster.
Si cambias el video, sube con -v2 (los nombres son inmutables en caché).
`);
