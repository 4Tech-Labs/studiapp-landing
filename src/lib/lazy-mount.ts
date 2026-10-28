/** Montaje de un efecto de src/lib: recibe el contenedor y sus opciones, y devuelve la función que lo libera. */
type Mount = (container: HTMLElement, options: Record<string, unknown>) => () => void;

/**
 * Monta el efecto de cada elemento de `selector` cuando se acerca a la pantalla, con las opciones del JSON en
 * data-options. `load` importa el módulo del efecto con import() dinámico: su JavaScript (shaders incluidos) se
 * descarga recién ahí, y un efecto oculto con display: none (p. ej. en celular) nunca se descarga ni se monta.
 */
export function lazyMount(selector: string, load: () => Promise<Mount>, rootMargin = '300px') {
  const elements = document.querySelectorAll<HTMLElement>(selector);
  if (!elements.length) return;
  const observer = new IntersectionObserver(
    (entries) => {
      for (const { target, isIntersecting } of entries) {
        if (!isIntersecting) continue;
        observer.unobserve(target);
        const el = target as HTMLElement;
        // Si el módulo no carga, queda el fondo CSS del contenedor
        load()
          .then((mount) => mount(el, JSON.parse(el.dataset.options || '{}')))
          .catch((err) => console.warn(`[${selector}]`, err));
      }
    },
    { rootMargin },
  );
  elements.forEach((el) => observer.observe(el));
}
