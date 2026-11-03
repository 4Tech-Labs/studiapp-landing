import { createHash } from 'node:crypto';

/**
 * Script inline de la nav (Nav.astro): en celular y en la landing de StudIApp la nav es siempre el notch. Se marca antes
 * de pintar para que no se vea primero la versión desplegada.
 * Astro no calcula el hash de los scripts is:inline para la CSP, y uno agregado desde el componente llega tarde (el
 * <meta> del <head> ya se escribió). Por eso el texto vive aquí y astro.config.ts declara su hash.
 */
export const NOTCH_SCRIPT = `(function () {
  var cn = document.querySelector('[data-cn]');
  if (cn.hasAttribute('data-cn-notch') || matchMedia('(max-width: 899px)').matches) cn.setAttribute('data-scrolled', '');
})();`;

export const NOTCH_SCRIPT_HASH = `sha256-${createHash('sha256').update(NOTCH_SCRIPT).digest('base64')}` as const;
