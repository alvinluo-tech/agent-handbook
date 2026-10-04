import { readdirSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
let total = 0, count = 0;
const walk = (d) => {
  for (const f of readdirSync(d)) {
    const p = join(d, f);
    const s = statSync(p);
    if (s.isDirectory()) walk(p);
    else if (f.endsWith('.pdf')) { total += s.size; count++; }
  }
};
walk(join(ROOT, 'public', 'papers'));
console.log('PDF count:', count, '| total size:', (total / 1048576).toFixed(1), 'MB');
