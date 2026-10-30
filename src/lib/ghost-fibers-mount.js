// @ts-nocheck
/**
 * Monta GhostFibers (src/lib/ghost-fibers.js) en un contenedor de la página. Si el navegador lo permite, el WebGL vive
 * en un worker con OffscreenCanvas: crear el contexto (cientos de ms con la GPU en frío), compilar los shaders y
 * dibujar cada cuadro no ocupan el hilo principal, que queda libre para el scroll y los clics. Si no, dibuja aquí
 * con el mismo código. Este lado solo mide el contenedor y avisa el tamaño, el puntero y si se ve.
 *
 * mountGhostFibers(container, options) devuelve una función que libera todo (listeners, worker, texturas, programas).
 */
export function mountGhostFibers(container, options) {
  let canvas = container.querySelector('canvas');
  if (!canvas) return () => {};
  const input = {
    width: container.clientWidth,
    height: container.clientHeight,
    dpr: window.devicePixelRatio || 1,
    pointer: { x: 0, y: 0, inside: false },
    visible: true,
    hidden: document.hidden,
    reduce: window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false,
  };

  let alive = true;
  let worker = null;
  let fibers = null; // solo cuando dibuja en el hilo principal
  const send = (type, ...args) => {
    if (worker) worker.postMessage({ type, input, args });
    else fibers?.[type](...args);
  };
  const drawHere = () =>
    import('./ghost-fibers.js')
      .then(({ createGhostFibers }) => {
        if (alive) fibers = createGhostFibers(canvas, options, input);
      })
      .catch((err) => console.warn('[ghost-fibers]', err));

  if (canvas.transferControlToOffscreen && typeof Worker !== 'undefined') {
    const offscreen = canvas.transferControlToOffscreen();
    worker = new Worker(new URL('./ghost-fibers.worker.js', import.meta.url), { type: 'module' });
    worker.onmessage = ({ data }) => {
      if (data !== 'unsupported' || !alive) return;
      // El canvas ya es del worker: se cambia por uno nuevo para dibujar aquí
      worker.terminate();
      worker = null;
      const fresh = canvas.cloneNode();
      canvas.replaceWith(fresh);
      canvas = fresh;
      drawHere();
    };
    worker.postMessage({ type: 'init', input, options, canvas: offscreen }, [offscreen]);
  } else {
    drawHere();
  }

  const resizeObserver = new ResizeObserver(() => {
    input.width = container.clientWidth;
    input.height = container.clientHeight;
    input.dpr = window.devicePixelRatio || 1;
    send('resize');
  });
  resizeObserver.observe(container);
  const intersection = new IntersectionObserver((entries) => {
    input.visible = entries.some((entry) => entry.isIntersecting);
    if (input.visible) send('show');
  });
  intersection.observe(container);

  const onPointerMove = (event) => {
    const rect = container.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    input.pointer = { x, y, inside: x >= 0 && y >= 0 && x <= rect.width && y <= rect.height };
    // Fuera de pantalla no avisa: el puntero viaja con el próximo `show`
    if (input.visible) send('wake');
  };
  const onPointerDown = (event) => {
    if (event.button !== 0) return;
    if (event.target instanceof Element && event.target.closest('a, button, input, textarea, select, label, [role="button"]')) return;
    const rect = container.getBoundingClientRect();
    send('pulse', event.clientX - rect.left, event.clientY - rect.top);
  };
  const onPointerLeave = () => {
    input.pointer = { ...input.pointer, inside: false };
    send('wake');
  };
  const onVisibility = () => {
    input.hidden = document.hidden;
    send('show');
  };
  window.addEventListener('pointermove', onPointerMove, { passive: true });
  window.addEventListener('pointerdown', onPointerDown);
  document.documentElement.addEventListener('pointerleave', onPointerLeave);
  document.addEventListener('visibilitychange', onVisibility);

  return () => {
    alive = false;
    resizeObserver.disconnect();
    intersection.disconnect();
    window.removeEventListener('pointermove', onPointerMove);
    window.removeEventListener('pointerdown', onPointerDown);
    document.documentElement.removeEventListener('pointerleave', onPointerLeave);
    document.removeEventListener('visibilitychange', onVisibility);
    // Al terminar el worker se van con él el contexto y todo lo que creó
    if (worker) worker.terminate();
    else fibers?.destroy();
  };
}
