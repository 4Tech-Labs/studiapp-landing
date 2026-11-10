/** Parte de un titular con ola de color (ver WaveTitle.astro). */
export interface WavePart {
  text: string;
  /** En el color de acento del tema. */
  accent?: boolean;
  /** Empieza en una línea nueva. */
  break?: boolean;
}

/**
 * Texto completo del titular, para el aria-label del h2 que lo contiene: WaveTitle pinta el texto letra por letra
 * (oculto a los lectores de pantalla), así que el nombre accesible del titular lo da el h2.
 */
export const waveLabel = (parts: WavePart[]) => parts.map((part) => part.text).join(' ');
