// 追加 paper-fig 样式(独立追加块,避免与并行整写冲突)
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const p = join(ROOT, 'src/styles.css');
let t = readFileSync(p, 'utf8');
if (!t.includes('.paper-fig {')) {
  t += `
/* ===================== 论文原图卡片(R16) ===================== */
.paper-fig {
  border: var(--border); background: #fffdf6;
  box-shadow: var(--px-shadow); margin: 26px 0;
}
.paper-fig-head {
  display: flex; align-items: center; justify-content: space-between; gap: 10px;
  background: var(--ink); padding: 8px 14px;
}
.paper-fig-badge {
  font-family: var(--font-pixel); font-size: 8px; color: var(--gold); letter-spacing: 1px;
}
.paper-fig-link {
  font-family: var(--font-mono); font-size: 12px; color: var(--term-cyan);
  text-decoration: none; border-bottom: 2px solid var(--term-cyan);
}
.paper-fig-media { background: #fff; padding: 14px; display: flex; justify-content: center; }
.paper-fig-media img { display: block; max-width: 100%; height: auto; }
.paper-fig-cap { border-top: 2px solid var(--ink); background: var(--paper-2); padding: 10px 14px; }
.paper-fig-note { font-size: 14px; color: var(--ink); margin-bottom: 6px; }
.paper-fig-src { font-size: 12px; color: var(--ink-soft); font-family: var(--font-mono); }
.paper-fig-src a { color: var(--blue); }
`;
  writeFileSync(p, t);
  console.log('paper-fig styles appended');
} else console.log('already present');
