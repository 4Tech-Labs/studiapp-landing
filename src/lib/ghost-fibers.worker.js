// @ts-nocheck
// Worker de GhostFibers: recibe el canvas de la página como OffscreenCanvas y dibuja las fibras aquí, fuera del
// hilo principal. Cada mensaje trae el `input` vigente (tamaño, puntero, si se ve) y el aviso para las fibras.
import { createGhostFibers } from './ghost-fibers.js';

let fibers = null;
const input = {};

self.onmessage = ({ data }) => {
  Object.assign(input, data.input);
  if (data.type === 'init') {
    // Safari 16.4 tiene OffscreenCanvas pero sin WebGL en workers: entonces la página dibuja en el hilo principal.
    if (!('WebGL2RenderingContext' in self)) {
      self.postMessage('unsupported');
      return;
    }
    fibers = createGhostFibers(data.canvas, data.options, input);
    return;
  }
  fibers?.[data.type](...data.args);
};
