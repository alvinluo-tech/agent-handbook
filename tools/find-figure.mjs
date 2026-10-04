import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const hits = [];
const walk = (d) => {
  for (const f of readdirSync(d)) {
    const p = join(d, f);
    const s = statSync(p);
    if (s.isDirectory()) { if (!p.includes('node_modules')) walk(p); }
    else if (/\.(jsx|js|css)$/.test(f)) {
      const t = readFileSync(p, 'utf8');
      if (t.includes('下载 SVG') || t.includes('展开图解')) hits.push(p);
    }
  }
};
walk(join(ROOT, 'src'));
console.log(hits.join('\n') || 'none found');
