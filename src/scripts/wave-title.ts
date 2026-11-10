// Respaldo de la ola de color de los titulares (WaveTitle.astro) para navegadores sin animation-timeline: mismo rango
// que en CSS, calculado con un listener de scroll que solo existe mientras el titular está en pantalla y escribe una
// variable por cuadro. Lo carga Base.astro al final del body.
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (!reduceMotion && !CSS.supports('animation-timeline: view()')) {
  for (const title of document.querySelectorAll<HTMLElement>('[data-wave-title]')) {
    let frame = 0;
    const update = () => {
      frame = 0;
      const { top } = title.getBoundingClientRect();
      const vh = window.innerHeight;
      const start = vh * 0.92;
      const end = vh * 0.38;
      const p = Math.min(1, Math.max(0, (start - top) / (start - end)));
      title.style.setProperty('--wave-p', p.toFixed(3));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting) window.addEventListener('scroll', onScroll, { passive: true });
      else window.removeEventListener('scroll', onScroll);
      update();
    }).observe(title);
  }
}
