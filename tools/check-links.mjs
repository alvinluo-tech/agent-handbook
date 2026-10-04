import { readdirSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const dir = join(ROOT, 'src', 'chapters');
let hrefs = 0;
const urls = new Set();
for (const f of readdirSync(dir).filter((f) => f.endsWith('.jsx'))) {
  const t = readFileSync(join(dir, f), 'utf8');
  for (const m of t.matchAll(/href="([^"]+)"/g)) {
    hrefs++;
    if (m[1].startsWith('http')) urls.add(m[1]);
  }
}
console.log('href total:', hrefs, '| external:', urls.size);
console.log([...urls].join('\n'));
