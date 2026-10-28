import { defineConfig, fontProviders } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { SITE, LEGAL, LEGAL_LINKS } from './src/data/site';

export default defineConfig({
  site: SITE.url,
  trailingSlash: 'never',
  // Astro 7 usa 'jsx' por defecto y recorta espacios entre elementos inline; `true` conserva el comportamiento clásico.
  compressHTML: true,
  build: {
    // /terminos-y-condiciones.html → Cloudflare la sirve como /terminos-y-condiciones (igual que los enlaces del diseño)
    format: 'file',
    // Una sola página: el CSS va inline en el HTML y no hay request bloqueante.
    inlineStylesheets: 'always',
  },
  image: { responsiveStyles: false },
  vite: {
    build: {
      // Vite 8 compila el CSS para Safari 16.4+ y reescribe las media queries en sintaxis de rango (width<=899px),
      // que Safari 15 no entiende: en iPhones con iOS 15 (6s, 7) no se aplicaba ningún estilo de celular.
      // Con iOS 15 en la lista el CSS conserva min-width/max-width. El JavaScript sigue con el target de Vite.
      cssTarget: ['chrome111', 'edge111', 'firefox114', 'safari15', 'ios15'],
    },
  },
  // Fonts API: Astro descarga las fuentes en build, las sirve desde /_astro con hash y genera fallbacks con size-adjust (CLS ≈ 0).
  // Solo subset latin: el español cabe completo en U+0000-00FF.
  fonts: [
    {
      // Titulares y frases de peso (var(--font-display)). Inter Tight, licencia SIL Open Font.
      // Para cambiar de fuente basta con cambiar el bloque correspondiente.
      provider: fontProviders.google(),
      name: 'Inter Tight',
      cssVariable: '--font-display',
      weights: ['400 700'],
      styles: ['normal'],
      subsets: ['latin'],
      fallbacks: ['Arial', 'sans-serif'],
    },
    {
      // Texto: párrafos, interfaz y botones (var(--font-sans)). DM Sans, licencia SIL Open Font.
      provider: fontProviders.google(),
      name: 'DM Sans',
      cssVariable: '--font-sans',
      weights: ['400 700'],
      styles: ['normal'],
      subsets: ['latin'],
      fallbacks: ['Arial', 'sans-serif'],
    },
  ],
  integrations: [
    sitemap({
      // /og solo existe para generar la imagen Open Graph. Las páginas legales entran cuando tienen fecha de vigencia (antes llevan noindex).
      filter: (page) => {
        const path = new URL(page).pathname.replace(/\.html$/, '');
        if (path === '/og') return false;
        return Boolean(LEGAL.effectiveDate) || !LEGAL_LINKS.some((l) => l.href === path);
      },
      // URLs públicas sin .html (ver build.format)
      serialize: (item) => {
        item.url = item.url.replace(/\/index\.html$/, '/').replace(/\.html$/, '');
        return item;
      },
    }),
  ],
});
