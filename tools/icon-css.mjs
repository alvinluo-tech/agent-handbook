// 图标系统 CSS:toc-ico 尺寸对齐 + 按钮内图标对齐
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const p = join(ROOT, 'src/styles.css');
let t = readFileSync(p, 'utf8');
if (!t.includes('PIXEL-ICON-SYSTEM')) {
  t += `
/* ===================== PIXEL-ICON-SYSTEM(R19 图标优化) ===================== */
.toc-ico { display: flex; align-items: center; justify-content: center; width: 20px; }
.toc-item.active .toc-ico { color: var(--gold); }
.ch-mins { display: inline-flex; align-items: center; gap: 4px; }
.px-btn svg { flex: none; }
.nav-toggle svg { display: block; }
.chapter-card svg { color: var(--accent); }
`;
  writeFileSync(p, t);
  console.log('icon css appended');
} else console.log('css already present');
