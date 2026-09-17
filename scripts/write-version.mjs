// Escribe public/version.txt con el commit y la fecha del build. Sirve para confirmar qué commit está publicado:
//   curl https://<sitio>/version.txt
import { writeFileSync } from 'node:fs';
import { execSync } from 'node:child_process';

let sha = process.env.WORKERS_CI_COMMIT_SHA || process.env.GITHUB_SHA || '';
if (!sha) {
  try {
    sha = execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();
  } catch {
    sha = 'unknown';
  }
}
const line = `${sha.slice(0, 12)} ${new Date().toISOString()}`;
writeFileSync('public/version.txt', line + String.fromCharCode(10));
console.log('version.txt:', line);
