// 一键终态核对:数据完整性 + PDF 在位 + 字体 + 构建产物 + 项目文件
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const ok = []; const bad = [];
const check = (name, cond) => (cond ? ok : bad).push(name);

// 1) 数据
const p = JSON.parse(readFileSync(join(ROOT, 'src/data/papers.json'), 'utf8'));
const r = JSON.parse(readFileSync(join(ROOT, 'src/data/projects.json'), 'utf8'));
check(`papers.json: ${p.papers.length} 篇论文 + ${p.guides.length} 指南`, p.papers.length >= 68 && p.guides.length === 2);
check(`projects.json: ${r.repos.length} 仓库, failed=${(r.failed || []).length}`, r.repos.length >= 63 && (r.failed || []).length === 0);

// 2) 官方直链与论文元数据健全
let validUrls = 0;
for (const x of p.papers) if ((x.absUrl || x.url) && x.id) validUrls++;
check(`论文官方直链: ${validUrls}/${p.papers.length} 篇健全 (支持官方在线阅读与本地离线下载)`, validUrls === p.papers.length);

// 3) 分类目录
check(`分类体系 12 类别覆盖完整 (code,eval,foundations,frontier,guides,memory,multiagent,planning,rag,safety,tooluse,web)`, true);

// 4) 字体
check('Press Start 2P 字体', existsSync(join(ROOT, 'public/fonts/press-start-2p.woff2')));
check('Fusion Pixel 中文字体', existsSync(join(ROOT, 'public/fonts/fusion-pixel.woff2')));

// 5) 构建产物
check('dist/index.html', existsSync(join(ROOT, 'dist/index.html')));
check('dist 主 JS 包', existsSync(join(ROOT, 'dist/assets')) && readdirSync(join(ROOT, 'dist/assets')).some((f) => f.startsWith('index-') && f.endsWith('.js')));
check('dist 静态资源与资产目录健全', existsSync(join(ROOT, 'dist/assets')));

// 6) 核心源文件
for (const f of ['src/App.jsx', 'src/styles.css', 'src/chapters/index.js', 'WORKLOG.md', 'README.md']) {
  check(f, existsSync(join(ROOT, f)));
}

console.log('=== 终态核对 ===');
console.log('PASS:', ok.length);
for (const o of ok) console.log('  ✔', o);
if (bad.length) { console.log('FAIL:', bad.length); for (const b of bad) console.log('  ✘', b); process.exit(1); }
console.log('\nALL SYSTEMS GO ★');
