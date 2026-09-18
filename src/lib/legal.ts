import { LEGAL } from '../data/site';

/** Sección numerada de un documento legal. `n` es "3" en el nivel principal y "3.1" en una subsección. */
export interface LegalSectionItem {
  id: string;
  n: string;
  title: string;
}

export interface TocItem extends LegalSectionItem {
  subsections: LegalSectionItem[];
}

type Entry = readonly [id: string, title: string, subsections?: readonly (readonly [id: string, title: string])[]];

/**
 * Numera las secciones de un documento legal a partir de su orden. Encabezados, índice y referencias
 * ("sección 3.1") salen de aquí, así que reordenar la lista renumera todo el documento.
 */
export function toc(entries: readonly Entry[]) {
  const items: TocItem[] = entries.map(([id, title, subsections = []], i) => ({
    id,
    n: `${i + 1}`,
    title,
    subsections: subsections.map(([subId, subTitle], j) => ({ id: subId, n: `${i + 1}.${j + 1}`, title: subTitle })),
  }));

  const byId = new Map<string, LegalSectionItem>();
  for (const { id, n, title, subsections } of items) {
    for (const section of [{ id, n, title }, ...subsections]) {
      if (byId.has(section.id)) throw new Error(`Sección legal repetida: "${section.id}"`);
      byId.set(section.id, section);
    }
  }

  return {
    items,
    get(id: string): LegalSectionItem {
      const section = byId.get(id);
      if (!section) throw new Error(`Sección legal inexistente: "${id}"`);
      return section;
    },
  };
}

/** Fecha de vigencia de las páginas legales, o null mientras LEGAL.effectiveDate esté vacía. */
export const effectiveDate = parseEffectiveDate(LEGAL.effectiveDate);

function parseEffectiveDate(iso: string) {
  if (!iso) {
    console.warn('[legal] LEGAL.effectiveDate está vacía (src/data/site.ts): las páginas legales se generan sin fecha de vigencia y con noindex.');
    return null;
  }
  const date = new Date(`${iso}T00:00:00Z`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso) || date.toISOString().slice(0, 10) !== iso) {
    throw new Error(`LEGAL.effectiveDate debe ser una fecha válida AAAA-MM-DD (recibido: "${iso}")`);
  }
  // En UTC: con la zona de Colombia (UTC-5), la medianoche UTC se mostraría como el día anterior.
  const text = new Intl.DateTimeFormat('es-CO', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(date);
  return { iso, text };
}
