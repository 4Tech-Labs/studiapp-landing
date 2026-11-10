import { execSync } from 'node:child_process';

// Fecha de la última modificación del sitio (ISO 8601): la del último commit, que es cuando cambió el contenido.
// La usan el sitemap (lastmod), og:updated_time y dateModified del JSON-LD, para que los buscadores sepan qué tan
// reciente es la página. Sin git (por ejemplo, al compilar desde un .zip) queda la fecha del build.
function lastCommitDate(): string {
  try {
    const iso = execSync('git log -1 --format=%cI', { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
    if (iso) return new Date(iso).toISOString();
  } catch {
    // sin git: se usa la fecha del build
  }
  return new Date().toISOString();
}

export const BUILD_DATE = lastCommitDate();
