import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const p = join(ROOT, 'src/chapters/PapersPage.jsx');
const lines = readFileSync(p, 'utf8').split('\n');
let n = 0;
for (const id of ['2310.10501', '2212.10496', '2511.15759']) {
  const i = lines.findIndex((l) => l.trim().startsWith(`'${id}':`));
  if (i < 0) continue;
  const m = lines[i].match(/^(\s*'[^']+':\s*'[^']*\.?',)[\s\S]*$/);
  if (m) { lines[i] = m[1]; n++; }
}
writeFileSync(p, lines.join('\n'));
console.log('truncated lines:', n);
