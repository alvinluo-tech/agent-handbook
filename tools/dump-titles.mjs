// 全量标题 dump:人工核对 81 篇是否有学科误收
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const p = JSON.parse(readFileSync(join(ROOT, 'src/data/papers.json'), 'utf8'));
for (const x of p.papers) console.log(`${x.cat.padEnd(11)} ${x.id} ${x.title.slice(0, 90)}`);
