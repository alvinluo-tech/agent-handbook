// 链接样式优化:去掉丑下划线,改为底边渐显下划线 + 平滑过渡(悬停反色块)
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const p = join(ROOT, 'src/styles.css');
let t = readFileSync(p, 'utf8');
if (t.includes('LINK-STYLE-FIX')) { console.log('already patched'); process.exit(0); }

// 1) 替换旧的下划线规则
t = t.replace(
  '.chapter a { color: var(--blue); text-decoration-thickness: 2px; text-underline-offset: 3px; }',
  '/* LINK-STYLE-FIX: 内联链接——默认无下划线,悬停画出 */\n.chapter a {\n  color: var(--blue);\n  text-decoration: none;\n  border-bottom: 2px solid transparent;\n  transition: color .12s, border-color .12s, background-color .12s;\n}',
);

// 2) 附加块
t += `
/* ===================== LINK-STYLE-FIX:链接与跳转样式的最佳实践 ===================== */
/* 正文内联链接:墨蓝色文字,悬停时画出 2px 金色底边;不必再猜下划线颜色 */
.chapter a { padding-bottom: 1px; }
.chapter a:hover, .chapter a:focus-visible {
  border-bottom-color: var(--gold);
  color: var(--ink);
}
.chapter a:visited { color: #4a6d86; } /* visited 稍浅,可区分但不出戏 */

/* 页脚与深底区域的链接(青色文字在深底上):悬停变亮金 */
.foot a, .card.boss a {
  text-decoration: none;
  border-bottom: 2px solid rgba(122, 229, 242, .45);
  transition: border-color .12s, color .12s;
}
.foot a:hover, .foot a:focus-visible, .card.boss a:hover, .card.boss a:focus-visible {
  color: var(--gold);
  border-bottom-color: var(--gold);
}

/* 侧栏目录链接是导航,不是正文——下划线一律去掉,active 态已由背景表达 */
.sidebar a { text-decoration: none; }
.toc-item { border-bottom: none !important; }

/* 引用性跳转(章节导航 / 上一章 / 下一章 / 本章目录):做像素风「按钮化」弱化下划线 */
.chapter-nav a, .section-toc nav a {
  text-decoration: none;
  border-bottom: 2px solid transparent;
  padding: 1px 4px;
  transition: border-color .12s, background-color .12s;
}
.chapter-nav a:hover, .chapter-nav a:focus-visible,
.section-toc nav a:hover, .section-toc nav a:focus-visible {
  border-bottom-color: var(--gold);
  background: rgba(242, 183, 5, .14);
}

/* 表格/术语内的裸链接:同样不按下划线 */
.glossary dd a, table.tbl td a, .paper-fig-src a, .repo-meta a {
  text-decoration: none;
  border-bottom: 2px solid transparent;
  transition: border-color .12s;
}
.glossary dd a:hover, .glossary dd a:focus-visible,
table.tbl td a:hover, table.tbl td a:focus-visible,
.paper-fig-src a:hover, .paper-fig-src a:focus-visible {
  border-bottom-color: var(--gold);
}

/* 代码块内 <code>/a 的下划线全部清零(内联 code 已有底色区分) */
.chapter a code, .paper-body a { text-decoration: none; }

/* 尊重减少动效偏好 */
@media (prefers-reduced-motion: reduce) {
  .chapter a, .foot a, .card.boss a, .chapter-nav a, .section-toc nav a { transition: none; }
}
`;
writeFileSync(p, t);
console.log('link styles patched');
