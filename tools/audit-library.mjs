// 论文库全面审计:标题与分类归属逐条导出 + 分类统计
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const p = JSON.parse(readFileSync(join(ROOT, 'src/data/papers.json'), 'utf8'));
console.log('total:', p.papers.length, '+ guides:', p.guides.length);
const byCat = {};
for (const x of p.papers) {
  (byCat[x.cat] = byCat[x.cat] || []).push(x);
}
for (const [cat, arr] of Object.entries(byCat).sort()) {
  console.log(`\n===== ${cat} (${arr.length}) =====`);
  for (const x of arr) console.log(`${x.id} | ${x.year} | ${x.title.slice(0, 95)}`);
}
