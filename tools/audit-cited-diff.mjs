// 遗漏检查:正文(章节+组件)引用的 arXiv 链接 vs 库内 ID 差集
import { readdirSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

const lib = JSON.parse(readFileSync(join(ROOT, 'src/data/papers.json'), 'utf8'));
const libIds = new Set(lib.papers.map((x) => x.id));

const dirs = ['src/chapters', 'src/chapters/labs', 'src/components'];
const cited = new Map(); // id -> [files]
for (const d of dirs) {
  for (const f of readdirSync(join(ROOT, d))) {
    if (!/\.(jsx|js)$/.test(f)) continue;
    const t = readFileSync(join(ROOT, d, f), 'utf8');
    for (const m of t.matchAll(/arxiv\.org\/abs\/(\d{4}\.\d{4,5})/g)) {
      const id = m[1];
      if (!cited.has(id)) cited.set(id, []);
      cited.get(id).push(f);
    }
  }
}
const missing = [...cited.entries()].filter(([id]) => !libIds.has(id));
console.log('正文引用的 arXiv ID 总数:', cited.size, '| 库内:', libIds.size);
console.log('\n== 正文引用但库内缺失 ==');
if (!missing.length) console.log('(无)');
for (const [id, files] of missing) console.log(`${id} <- ${[...new Set(files)].join(', ')}`);

// 反向:库内但正文从未引用(不算问题,仅信息)
const libNotCited = [...libIds].filter((id) => !cited.has(id));
console.log('\n== 库内有、正文未直接链接(正常,仅参考) ==', libNotCited.length, '篇:', libNotCited.join(', '));
