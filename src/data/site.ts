/** Datos centrales del sitio. Dominio, correo, redes y videos se cambian aquí y en ningún otro lugar. */
export const SITE = {
  url: 'https://studiapp-landing.studiapp-landing.workers.dev', // TODO: dominio propio, sin barra final (studiapp.co no está disponible: lo usa otra empresa)
  name: 'StudIApp',
  title: 'Planea el año escolar con IA en minutos | StudIApp',
  description:
    'Planea el año escolar en minutos con IA. Planeaciones en las plantillas de tu colegio, con contexto institucional, DUA y PIAR. Agenda una reunión.',
  lang: 'es',
  locale: 'es_CO',
  email: 'fourtechlabs@gmail.com', // Contacto y canal para datos personales. TODO: correo con dominio propio (ver README)
  themeColor: '#0040a3',
  ogImage: '/og.jpg', // 1200×630 en public/ (se genera desde la página /og, ver README)
};

/** URLs reales de redes. Vacío = el icono no se muestra. */
export const SOCIAL = {
  instagram: '',
  linkedin: '',
  youtube: '',
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
    video: {},
  },
  {
    tab: 'Contexto institucional',
    label: 'contexto institucional',
    title: 'El contexto de tu institución, dentro de la IA.',
    text: 'El copiloto integra tus referentes institucionales, el currículo del Ministerio de Educación y estándares internacionales para asegurar la coherencia y alineación de tu planeación curricular.',
    video: {},
  },
  {
    tab: 'Planeaciones organizadas',
    label: 'planeaciones organizadas',
    title: 'Todas tus etapas en un mismo lugar.',
    text: 'Centraliza y estandariza el trabajo de tu equipo docente en un solo lugar. Todas las planeaciones mantienen un mismo formato estandarizado y se guardan de manera organizada, con acceso rápido y seguro.',
    video: {},
  },
  {
    tab: 'Trabajo en equipo',
    label: 'trabajo en equipo',
    title: 'Construye tu plan en equipo.',
    text: 'Cero esfuerzo duplicado. La plataforma permite que los docentes colaboren en una misma planeación, compartan ideas al instante y construyan planeaciones en la mitad del tiempo.',
    video: {},
  },
  {
    tab: 'DUA y PIAR',
    label: 'dua y piar',
    title: 'Cada grupo es distinto. Tu plan también.',
    text: 'Inclusión real, sin doble esfuerzo. Nuestro copiloto inteligente recibe el contexto de tu grupo y te ayuda a aplicar DUA y PIAR al instante. Adapta tus clases a cada necesidad sin tener que trabajar de más.',
    video: {},
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

/** Empresa responsable del sitio y del tratamiento de datos personales. Se muestra en las páginas legales. */
export const COMPANY = {
  legalName: '4TECH LABS S.A.S.',
  domicile: 'Cali, Valle del Cauca, Colombia',
  address: 'Cl. 34 #96-79, Cali',
  phone: '+57 320 551 8633',
};

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
