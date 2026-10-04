import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readdirSync } from 'node:fs';
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const src = readFileSync(join(ROOT, 'src/components/Diag.jsx'), 'utf8');
console.log('src has y={338}:', src.includes('y={338}'));
console.log('src has y={310}:', src.includes('y={310}'));
console.log('src vb 352:', src.includes('0 0 780 352'));
// 找 dist 里的 Diag chunk,查内容
const assets = join(ROOT, 'dist/assets');
for (const f of readdirSync(assets)) {
  if (f.startsWith('Diag-') && f.endsWith('.js')) {
    const t = readFileSync(join(assets, f), 'utf8');
    console.log('dist', f, '| 338:', t.includes('338'), '| 控制流预定义:', t.includes('控制流:代码预定义'));
  }
}
const idx = readFileSync(join(ROOT, 'dist/index.html'), 'utf8');
console.log('index js ref:', (idx.match(/assets\/index-[\w-]+\.js/) || [])[0]);
