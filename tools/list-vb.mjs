import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const t = readFileSync(join(ROOT, 'src/chapters/labs/diag.jsx'), 'utf8');
const m = [...t.matchAll(/vb="([^"]+)"/g)].map((x) => x[1]);
console.log('viewBoxes:', m.join(' , '));
// 顺便:FIG 编号
console.log('figs:', [...t.matchAll(/no="(FIG\.\d+)"/g)].map((x) => x[1]).join(','));
