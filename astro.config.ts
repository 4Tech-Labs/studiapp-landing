import { defineConfig, fontProviders } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { SITE } from './src/data/site';

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
  // Fonts API: Astro descarga las fuentes en build, las sirve desde /_astro con hash y genera fallbacks con size-adjust (CLS ≈ 0).
  // Solo subset latin: el español cabe completo en U+0000-00FF.
  fonts: [
    {
      provider: fontProviders.google(),
      name: 'Inter',
      cssVariable: '--font-inter',
      weights: ['400 700'],
      styles: ['normal'],
      subsets: ['latin'],
      fallbacks: ['Arial', 'sans-serif'],
    },
    {
      provider: fontProviders.google(),
      name: 'Inter Tight',
      cssVariable: '--font-inter-tight',
      weights: ['400 600'],
      styles: ['normal'],
      subsets: ['latin'],
      fallbacks: ['Arial', 'sans-serif'],
    },
    {
      provider: fontProviders.google(),
      name: 'Outfit',
      cssVariable: '--font-outfit',
      weights: ['500 600'],
      styles: ['normal'],
      subsets: ['latin'],
      fallbacks: ['Arial', 'sans-serif'],
    },
    {
      provider: fontProviders.google(),
      name: 'Instrument Serif',
      cssVariable: '--font-instrument-serif',
      weights: [400],
      styles: ['italic'],
      subsets: ['latin'],
      fallbacks: ['Georgia', 'serif'],
    },
  ],
  integrations: [
    sitemap({
      // /og solo existe para generar la imagen Open Graph
      filter: (page) => !/\/og(\.html)?$/.test(page),
      // URLs públicas sin .html (ver build.format)
      serialize: (item) => {
        item.url = item.url.replace(/\/index\.html$/, '/').replace(/\.html$/, '');
        return item;
      },
    }),
  ],
});
