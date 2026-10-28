/** Datos centrales del sitio. Dominio, correo, redes y videos se cambian aquí y en ningún otro lugar. */
export const SITE = {
  url: 'https://4techlabs.com', // dominio corporativo (Cloudflare Registrar, 18-sep-2026), sin barra final
  name: '4Tech Labs', // el sitio es de la empresa; cada producto tiene su página (ver PRODUCT y CATALOG)
  title: 'Desarrollo de software a la medida en Colombia | 4Tech Labs',
  description:
    'Empresa colombiana de desarrollo de software a la medida: aplicaciones web, móviles y soluciones con inteligencia artificial. Cuéntanos tu proyecto.',
  lang: 'es',
  locale: 'es_CO',
  email: 'hola@4techlabs.com', // reenviado a fourtechlabs@gmail.com con Cloudflare Email Routing
  /** Agendador de reuniones (enlace recurrente de Notion Calendar). Vacío = el botón de Agenda abre un correo. */
  bookingUrl: 'https://calendar.notion.com/meet/4techlabs/demo',
  themeColor: '#0040a3',
  ogImage: '/og.jpg', // 1200×630 en public/ (se genera desde la página /og, ver README)
};

/** StudIApp, el primer producto del catálogo. Su landing vive en `path` y usa estos textos para título, descripción y JSON-LD. */
export const PRODUCT = {
  name: 'StudIApp',
  path: '/studiapp',
  title: 'Planea el año escolar con IA en minutos | StudIApp',
  description:
    'Planea el año escolar en minutos con IA. Planeaciones en las plantillas de tu colegio, con contexto institucional, DUA y PIAR. Agenda una reunión.',
  tagline: 'Planeaciones escolares con IA, en las plantillas de tu colegio.',
};

export interface CatalogItem {
  name: string;
  /** Categoría corta que va sobre el nombre. */
  category: string;
  description: string;
  /** Tres o cuatro puntos fuertes, una línea cada uno. */
  highlights: string[];
  /** Página del producto dentro del sitio. */
  href: string;
  /** Logo cuadrado del producto (ruta en public/). */
  logo: string;
  /** Imagen de vista previa (ruta en public/, 16:9). */
  preview: string;
}

/** Catálogo de productos del home, en orden. Detrás del último se muestra una tarjeta de "Próximamente". */
export const CATALOG: CatalogItem[] = [
  {
    name: PRODUCT.name,
    category: 'Planeación escolar con IA',
    description:
      'El copiloto que planea el año escolar en minutos: genera planeaciones anuales, periódicas y semanales en las plantillas de cada colegio, con su contexto institucional.',
    highlights: ['Copiloto con IA para cada etapa', 'Contexto institucional y currículo del MEN', 'DUA y PIAR sin trabajo doble', 'Trabajo en equipo docente'],
    href: PRODUCT.path,
    logo: '/logo.webp',
    preview: '/videos/copiloto-con-ia-v1-poster.webp',
  },
];

/** URLs reales de redes. Vacío = el icono no se muestra. */
export const SOCIAL = {
  instagram: '',
  linkedin: 'https://www.linkedin.com/company/4techlabs/',
  youtube: 'https://www.youtube.com/@4techlabs',
};

export interface VideoSources {
  /** URL absoluta del WebM (VP9). Se ofrece primero: pesa menos. */
  webm?: string;
  /** URL absoluta del MP4 (H.264). Fallback universal. */
  mp4?: string;
  /** Imagen que se ve antes de reproducir. Es lo que pinta el LCP en el hero. */
  poster?: string;
}

/**
 * Hero. `media: 'video'` usa HERO.video; mientras no haya archivos se muestra el placeholder del diseño.
 * Con solo `poster` (sin webm/mp4) se muestra la imagen estática. `media: 'mock'` muestra la maqueta del panel.
 * Ejemplo con R2:
 *   video: { webm: 'https://media.<dominio>/videos/hero-v1.webm', mp4: 'https://media.<dominio>/videos/hero-v1.mp4', poster: 'https://media.<dominio>/videos/hero-v1-poster.webp' }
 */
export const HERO: { media: 'video' | 'mock'; autoplay: boolean; video: VideoSources } = {
  media: 'video',
  autoplay: true,
  video: { webm: '', mp4: '/videos/hero-v1.mp4', poster: '/videos/hero-v1-poster.webp' },
};

export const FEATURES_DEFAULT_TAB = 0;

export interface Feature {
  tab: string;
  label: string;
  title: string;
  text: string;
  video: VideoSources;
}

export const FEATURES: Feature[] = [
  {
    tab: 'Copiloto con IA',
    label: 'copiloto con ia',
    title: 'Copiloto con IA',
    text: 'Recibe apoyo en cada etapa de tu planeación. Mejora, ajusta y completa tus plantillas de forma ágil, manteniendo siempre el contexto y los objetivos pedagógicos de tu institución.',
    video: { mp4: '/videos/copiloto-con-ia-v1.mp4', poster: '/videos/copiloto-con-ia-v1-poster.webp' },
  },
  {
    tab: 'Contexto institucional',
    label: 'contexto institucional',
    title: 'El contexto de tu institución, dentro de la IA.',
    text: 'El copiloto integra tus referentes institucionales, el currículo del Ministerio de Educación y estándares internacionales para asegurar la coherencia y alineación de tu planeación curricular.',
    video: { mp4: '/videos/contexto-institucional-v1.mp4', poster: '/videos/contexto-institucional-v1-poster.webp' },
  },
  {
    tab: 'Planeaciones organizadas',
    label: 'planeaciones organizadas',
    title: 'Todas tus etapas en un mismo lugar.',
    text: 'Centraliza y estandariza el trabajo de tu equipo docente en un solo lugar. Todas las planeaciones mantienen un mismo formato estandarizado y se guardan de manera organizada, con acceso rápido y seguro.',
    video: { mp4: '/videos/planeaciones-organizadas-v1.mp4', poster: '/videos/planeaciones-organizadas-v1-poster.webp' },
  },
  {
    tab: 'Trabajo en equipo',
    label: 'trabajo en equipo',
    title: 'Construye tu plan en equipo.',
    text: 'Cero esfuerzo duplicado. La plataforma permite que los docentes colaboren en una misma planeación, compartan ideas al instante y construyan planeaciones en la mitad del tiempo.',
    video: { mp4: '/videos/trabajo-en-equipo-v1.mp4', poster: '/videos/trabajo-en-equipo-v1-poster.webp' },
  },
  {
    tab: 'DUA y PIAR',
    label: 'dua y piar',
    title: 'Cada grupo es distinto. Tu plan también.',
    text: 'Inclusión real, sin doble esfuerzo. Nuestro copiloto inteligente recibe el contexto de tu grupo y te ayuda a aplicar DUA y PIAR al instante. Adapta tus clases a cada necesidad sin tener que trabajar de más.',
    video: { mp4: '/videos/dua-y-piar-v1.mp4', poster: '/videos/dua-y-piar-v1-poster.webp' },
  },
];

export interface FaqItem {
  question: string;
  answer: string;
}

/** Preguntas frecuentes, en el orden en que se muestran. Vacío = no se muestra la sección ni su enlace en el footer. Con los mismos textos se genera el JSON-LD FAQPage. */
// TODO: preguntas de ejemplo armadas con el copy actual; reemplazar por las definitivas.
export const FAQ: FaqItem[] = [
  {
    question: '¿StudIApp funciona con las plantillas de mi colegio?',
    answer: 'Sí. Subes el formato que ya usa tu institución y cada planeación se genera directamente en él, sin cambiar procesos ni volver a capacitar al equipo.',
  },
  {
    question: '¿Qué tipo de planeaciones puedo generar?',
    answer: 'Planeaciones anuales, periódicas y semanales, todas con el contexto de tu institución y en el mismo formato.',
  },
  {
    question: '¿Cómo tiene en cuenta el contexto de mi institución?',
    answer: 'El copiloto integra tus referentes institucionales, el currículo del Ministerio de Educación y estándares internacionales para que cada planeación sea coherente con tu propuesta curricular.',
  },
  {
    question: '¿Varios docentes pueden trabajar en la misma planeación?',
    answer: 'Sí. Los docentes colaboran en una misma planeación, comparten ideas al instante y todo queda guardado de forma organizada.',
  },
  {
    question: '¿Cómo me ayuda con DUA y PIAR?',
    answer: 'Le das al copiloto el contexto de tu grupo y te ayuda a aplicar DUA y PIAR para adaptar tus clases a cada necesidad, sin trabajo doble.',
  },
  {
    question: '¿Cómo empiezo?',
    answer: 'Agenda una reunión de 30 minutos y te mostramos cómo funciona con las plantillas de tu colegio.',
  },
];

export const LEGAL_LINKS = [
  { href: '/terminos-y-condiciones', label: 'Términos y condiciones' },
  { href: '/politica-de-privacidad', label: 'Política de privacidad' },
  { href: '/tratamiento-de-datos', label: 'Tratamiento de datos' },
  { href: '/politica-de-cookies', label: 'Política de cookies' },
];

/** Empresa responsable del sitio y del tratamiento de datos personales. Se muestra en Quiénes somos, el footer, las páginas legales y el JSON-LD. */
export const COMPANY = {
  name: '4Tech Labs', // nombre comercial; la razón social es legalName
  legalName: '4TECH LABS S.A.S.',
  /** NIT con dígito de verificación, como en el certificado de la Cámara de Comercio. Vacío = no se muestra. */
  taxId: '902.004.485-9',
  /** Fecha de matrícula mercantil (AAAA-MM-DD): la S.A.S. existe desde su inscripción. Vacía = no se muestra. */
  foundingDate: '2025-10-31',
  domicile: 'Cali, Valle del Cauca, Colombia',
  address: 'Cl. 34 #96-79, Cali',
  phone: '+57 320 551 8633',
  /** La misma dirección por campos, para el JSON-LD (schema.org PostalAddress). Se cambia junto con domicile y address. */
  postalAddress: { streetAddress: 'Cl. 34 #96-79', addressLocality: 'Cali', addressRegion: 'Valle del Cauca', addressCountry: 'CO' },
};

export interface TeamMember {
  name: string;
  role: string;
  /** URL pública del perfil de LinkedIn. Vacía = no se muestra el enlace. */
  linkedin?: string;
  /** Nombre del archivo de la foto en src/assets/team/ (retrato vertical, idealmente 1200 px de alto o más). Vacío = iniciales. */
  photo?: string;
  /** Biografía corta (2 a 4 frases) que aparece al pasar el mouse o tocar la tarjeta. Vacía = solo el enlace a LinkedIn. */
  bio?: string;
}

/** Equipo de la sección Equipo y del JSON-LD. Google for Startups pide que el sitio describa al equipo o a los fundadores. */
export const TEAM: TeamMember[] = [
  { name: 'Kaner Murillo Conrado', role: 'Cofundador & CEO', linkedin: 'https://www.linkedin.com/in/kaner-murillo/', photo: 'kaner-murillo.jpg' },
  { name: 'Robin Quintero', role: 'Cofundador & CISO', linkedin: 'https://www.linkedin.com/in/robin-hafid/', photo: 'robin-quintero.jpg' },
  { name: 'Juan Camilo Dorado', role: 'Cofundador & CTO', linkedin: 'https://www.linkedin.com/in/camilodorado/' },
  { name: 'Josue Ruano', role: 'Cofundador & CPO', linkedin: 'https://www.linkedin.com/in/josue-ruano-958a38219/' },
];

/** Parámetros compartidos por las cuatro páginas legales. */
export const LEGAL = {
  /**
   * Fecha de entrada en vigencia (AAAA-MM-DD): el día en que se publican. Se cambia también al publicar una versión nueva.
   * Vacía = las páginas muestran "[fecha por definir]", llevan noindex y no entran al sitemap.
   */
  effectiveDate: '', // TODO: fecha de publicación
  /** Meses que se conservan los datos de contacto desde la última comunicación. */
  retentionMonths: 24,
};
