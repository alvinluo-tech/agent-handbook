// C13/C14/C15 修复状态检查
import { readFileSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const rd = (f) => readFileSync(join(ROOT, f), 'utf8');
const mt = (f) => statSync(join(ROOT, f)).mtime.toISOString().slice(5, 16).replace('T', ' ');

const probes = [
  ['C13 Ch09「80%」残留', 'src/chapters/Ch09.jsx', (t) => t.includes('80% 的「记住我」')],
  ['C13 Ch11「零成本」残留', 'src/chapters/Ch11.jsx', (t) => t.includes('零成本,收益立现')],
  ['C13 Ch12「必炸」残留', 'src/chapters/Ch12.jsx', (t) => t.includes('窗口必炸')],
  ['C13 Ch17「全量」残留', 'src/chapters/Ch17.jsx', (t) => t.includes('线上故障复现需要全量')],
  ['C13 Ch12「对半砍」残留', 'src/chapters/Ch12.jsx', (t) => t.includes('延迟对半砍')],
  ['C14 Roadmap「15 个点」残留', 'src/chapters/RoadmapPage.jsx', (t) => t.includes('提升 15 个点')],
  ['C14 FAQ「CH.05 代码」残留', 'src/chapters/GlossaryPage.jsx', (t) => t.includes('从 CH.05 开始出现代码')],
  ['C14 术语「一晚上读完」残留', 'src/chapters/GlossaryPage.jsx', (t) => t.includes('一晚上能读完')],
];
for (const [name, f, test] of probes) console.log(`${name}: ${test(rd(f)) ? 'YES(需修)' : 'no'}`);

const g = rd('tools/gh-projects.mjs');
console.log('C15 gh-projects merge 模式:', /merge|preserve|resource-summary/i.test(g) ? 'has' : 'NO');
console.log('C15 REPOS 条目数:', (g.match(/\['[a-zA-Z0-9_-]+\/[\w.-]+',/g) || []).length);
for (const f of ['src/chapters/Ch09.jsx', 'src/chapters/Ch12.jsx', 'src/chapters/RoadmapPage.jsx', 'tools/gh-projects.mjs', 'src/data/resource-summary.json']) {
  console.log('mtime', f, mt(f));
}
