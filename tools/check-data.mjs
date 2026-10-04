// 数据完整性终检
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const p = JSON.parse(readFileSync(join(ROOT, 'src/data/papers.json'), 'utf8'));
const r = JSON.parse(readFileSync(join(ROOT, 'src/data/projects.json'), 'utf8'));
const bad = [];
for (const x of p.papers) {
  if (!/^https:\/\/arxiv\.org\/abs\/\d{4}\.\d{4,5}$/.test(x.absUrl)) bad.push('absUrl ' + x.id);
  if (x.pdf && !/^\/papers\/[a-z]+\/\d{4}\.\d{4,5}\.pdf$/.test(x.pdf)) bad.push('pdf ' + x.id);
  if (!x.title || !x.year || !x.abstract) bad.push('meta ' + x.id);
}
for (const x of r.repos) {
  if (typeof x.stars !== 'number' || !x.slug || !x.url) bad.push('repo ' + x.slug);
}
const cats = {};
p.papers.forEach((x) => { cats[x.cat] = (cats[x.cat] || 0) + 1; });
console.log('papers', p.papers.length, '| guides', p.guides.length, '| repos', r.repos.length, '| failed', (r.failed || []).length);
console.log('cats', JSON.stringify(cats));
console.log(bad.length ? 'ISSUES:\n' + bad.join('\n') : 'ALL CLEAN');
process.exitCode = bad.length ? 1 : 0;
