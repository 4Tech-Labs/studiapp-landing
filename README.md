# StudIApp · landing

Landing estática construida con **Astro 7**. Cero JavaScript de framework en el cliente: la interactividad (nav, tabs, reproductor, mosaico, logo Lottie) son scripts vanilla de unos pocos KB.

## Comandos

```bash
npm install          # dependencias
npm run dev          # desarrollo en http://localhost:4321
npm run build        # genera dist/
npm run preview      # sirve dist/ como en producción
npm run check        # tipos y diagnósticos de Astro
npm run deploy       # build + wrangler deploy (requiere npx wrangler login)
```

## Dónde se cambia cada cosa

| Qué | Dónde |
|---|---|
| Dominio, correo, título, descripción, OG | `src/data/site.ts` → `SITE` |
| Redes sociales (vacío = no se muestra el icono) | `src/data/site.ts` → `SOCIAL` |
| Hero: modo `video`/`mock`, autoplay, URLs del video y poster | `src/data/site.ts` → `HERO` |
| Textos y videos de las 5 pestañas de Características | `src/data/site.ts` → `FEATURES` |
| Preguntas frecuentes (pregunta y respuesta, en orden; vacío = no se muestra la sección) | `src/data/site.ts` → `FAQ` |
| Textos legales (términos, privacidad, tratamiento de datos, cookies) | `src/pages/*.astro`. Empresa, fecha de vigencia y plazo de conservación: `src/data/site.ts` → `COMPANY` y `LEGAL`. Mientras `LEGAL.effectiveDate` esté vacía, las cuatro páginas llevan `noindex` y no entran al sitemap |
| Imagen de fondo del hero | `src/assets/hero-2560.webp` (Astro genera AVIF/WebP/JPG en 5 anchos) |
| Animación del logo | `public/lottie/robot.json` |
| Imagen para compartir en redes (1200×630) | `public/og.jpg` (se captura de la página `/og` con Chrome headless, ver `src/pages/og.astro`) |
| Logo estático y favicons | `scripts/logo-src.png` (frame 0 del Lottie rasterizado a 3×) → `node scripts/make-icons.mjs` regenera `public/logo.webp`, `favicon.ico`, `favicon-96.png` y `apple-touch-icon.png` |
| Cabeceras de caché y seguridad | `public/_headers` |

## Videos (hero y pestañas)

Los videos **no van en el repo**: se comprimen y se suben a Cloudflare R2 (10 GB gratis, sin costo de egreso, soporta reproducción por rangos).

> Estado actual: R2 no está habilitado en la cuenta, así que el video del hero (`mXfWQiBKKGs` de YouTube, descargado con yt-dlp y comprimido con el script de abajo) se sirve como asset estático desde `public/videos/hero-v1.mp4` (5,2 MB; el límite por asset en Workers es 25 MiB). `public/_headers` le da caché inmutable, así que un video nuevo debe subirse como `hero-v2`. Cuando se habilite R2, basta mover los archivos y cambiar las URLs en `HERO`.

1. Comprimir (usa el ffmpeg del paquete `ffmpeg-static`, no hay que instalar nada):
   ```bash
   node scripts/encode-video.mjs "C:/ruta/al/demo.mov" media hero
   ```
   Genera `media/hero.mp4`, `media/hero.webm`, `media/hero-poster.jpg` y `media/hero-poster.webp` (1280 px de ancho).
2. Subir a R2 con los comandos que imprime el script (`npx wrangler r2 object put …`), o arrastrando los archivos en el panel de Cloudflare (R2 → bucket → Upload).
3. Apuntar `src/data/site.ts` a las URLs públicas (`https://media.<dominio>/videos/hero-v1.webm`, `.mp4` y `-poster.webp`).
4. `npm run build` y desplegar. Si cambias un video, súbelo con `-v2`: los nombres son inmutables en caché.

Mientras no haya archivos, el hero y las pestañas muestran el placeholder del diseño. Con solo `poster` (sin webm/mp4) se muestra la imagen estática.

## Despliegue gratuito en Cloudflare

1. Crear cuenta en <https://dash.cloudflare.com> (plan Free, sin tarjeta).
2. Subir el repo a GitHub (`gh repo create studiapp-landing --private --source=. --push`).
3. En Cloudflare: **Workers & Pages → Create → Workers → Import a repository** → elegir el repo. Preset *Astro*: build `npm run build`, deploy `npx wrangler deploy`. Cada push a `main` publica; las ramas generan URLs de preview.
   - Alternativa sin Git: `npx wrangler login` y luego `npm run deploy`.
4. El sitio queda en `https://studiapp-landing.<cuenta>.workers.dev` y, con dominio propio, en <https://4techlabs.com> (la URL <https://studiapp-landing.studiapp-landing.workers.dev> sigue activa).

### Dominio

- `4techlabs.com` se compró en **Cloudflare Registrar** el 18-sep-2026 (precio al costo, igual al renovar). `studiapp.co` no estaba disponible: lo usa otra empresa de tecnología educativa.
- Conectado al Worker como dominio personalizado (apex y `www`) mediante `routes` en `wrangler.jsonc`: Wrangler crea los registros DNS y el certificado en cada `deploy`. Para cambiar de dominio basta editar esas dos entradas y `SITE.url` en `src/data/site.ts`.
- El dominio del producto (pendiente de elegir la marca) se puede añadir como tercer `route` o sustituir al actual; el canonical sale de `SITE.url`.

### Correo con dominio propio

El contacto es `hola@4techlabs.com` (`SITE.email`). Cloudflare Email Routing está activo en la zona: `hola@` y cualquier otro buzón del dominio (regla catch-all) se reenvían a `fourtechlabs@gmail.com`. Se administra en Cloudflare → `4techlabs.com` → Email → Email Routing.

Si más adelante se contrata **Google Workspace** con el dominio, hay que desactivar Email Routing (usa los registros MX del dominio) y actualizar `SITE.email` y la sección de proveedores de `src/pages/tratamiento-de-datos.astro` y `src/pages/politica-de-privacidad.astro`. Para Google for Startups, no activar Workspace de pago antes de la aprobación.

### Bucket de videos (R2)

1. R2 Object Storage → Create bucket → `studiapp-media`.
2. Bucket → Settings → Public access → **Custom domains → Connect domain** → `media.<dominio>` (el dominio debe estar en Cloudflare). Con esto los videos pasan por la CDN y se cachean.
3. Subir los archivos en `videos/` (ver sección Videos).

## Verificación de rendimiento

```bash
npm run build && npm run preview
npx lighthouse http://127.0.0.1:4321 --preset=desktop --view
```

Cada push a `main` dispara un build en Cloudflare (Workers Builds, conectado el 17-sep-2026) que publica en 1 a 2 minutos. Para saber qué commit está en producción:

```bash
curl https://4techlabs.com/version.txt
```

Tras el deploy, revisar en <https://pagespeed.web.dev> y comprobar cabeceras:

```bash
curl -I https://<dominio>/_astro/<archivo>.woff2   # cache-control: immutable, content-encoding: br
curl -I -H "Range: bytes=0-99" https://media.<dominio>/videos/hero-v1.mp4   # HTTP 206
```

## Origen

Portado desde el bundle `Nexora Hero.html` (React + Babel en el navegador, 2,3 MB). `scripts/extract-bundle.mjs` extrae sus assets; los componentes originales quedan como referencia en `.extracted/` (ignorado por git).

## Estado actual (18-sep-2026)

- Dominio: `4techlabs.com` y `www.4techlabs.com` conectados al Worker como dominios personalizados (`routes` en `wrangler.jsonc`); la URL `*.workers.dev` sigue activa y el canonical apunta a `https://4techlabs.com`.
- Correo: Cloudflare Email Routing activo en la zona. `hola@4techlabs.com` y cualquier otro buzón (catch-all) reenvían a `fourtechlabs@gmail.com`.
- Pendiente: nombre definitivo del producto (StudIApp y EduPlanea chocan con marcas registradas en Colombia; ver historial de la sesión) y radicar la marca en la SIC.
