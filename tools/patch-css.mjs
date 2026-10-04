// 一次性 CSS 修补:paper-title 收缩 + a11y/motion 附加块
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const p = join(ROOT, 'src/styles.css');
let t = readFileSync(p, 'utf8');
t = t.replace(
  '.paper-title { font-weight: 700; font-size: 15.5px; line-height: 1.5; flex: 1; min-width: 260px; }',
  '.paper-title { font-weight: 700; font-size: 15.5px; line-height: 1.5; flex: 1 1 260px; min-width: 0; overflow-wrap: anywhere; }',
);
if (!t.includes('可访问性与动效偏好')) {
  t += `
/* ===================== 可访问性与动效偏好(审查修复) ===================== */
input:focus-visible, textarea:focus-visible, button:focus-visible, a:focus-visible, [tabindex]:focus-visible {
  outline: 3px solid var(--blue); outline-offset: 2px;
}
/* 通关清单:原生复选框保持可聚焦,仅视觉隐藏 */
.vh-check { position: absolute; width: 1px; height: 1px; opacity: 0; margin: 0; padding: 0; }
.quest-item { position: relative; }
.quest-item:focus-within .box { outline: 3px solid var(--blue); outline-offset: 2px; }
/* FAQ 按钮 */
.faq .faq-q {
  display: block; width: 100%; text-align: left; cursor: pointer;
  padding: 12px 16px; font-weight: 700; background: var(--paper-2);
  border-bottom: 2px dashed var(--ink); font-family: var(--font-body); font-size: 15px; color: var(--ink);
}
.faq .faq-body { padding: 12px 16px; font-size: 14.5px; }
/* 小字对比度提升(faint 4.5:1 目标 / 链链接 / 红按钮) */
:root { --ink-faint: #6d5e4b; }
.chapter a { color: #21647e; }
.px-btn.red { background: var(--accent-dark); color: #fff; }
.px-btn.red:hover { background: #93300f; }
@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
  *, *::before, *::after { transition-duration: 0.01ms !important; animation-duration: 0.01ms !important; }
}
`;
}
writeFileSync(p, t);
console.log('css patch done, paper-title fixed:', t.includes('flex: 1 1 260px'), ', a11y block:', t.includes('可访问性与动效偏好'));
