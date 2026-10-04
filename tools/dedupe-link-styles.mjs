// 清理链接样式双补丁冲突:保留 R19 荧光笔方案,移除本会话冗余的 border 方案,保留互补规则
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const p = join(ROOT, 'src/styles.css');
let t = readFileSync(p, 'utf8');

// 1) 摘掉我的 .chapter a border/padding 规则(与 R19 高亮方案冗余)
t = t.replace(
  /\/\* LINK-STYLE-FIX: 内联链接——默认无下划线,悬停画出 \*\/\n\.chapter a \{[^}]*\}/,
  '/* LINK-STYLE-FIX: 内联链接基础态已由下方 R19 荧光笔方案统管 */',
);
t = t.replace(
  /\.chapter a \{ padding-bottom: 1px; \}\n\.chapter a:hover, \.chapter a:focus-visible \{\n  border-bottom-color: var\(--gold\);\n  color: var\(--ink\);\n\}\n\.chapter a:visited \{ color: #4a6d86; \} \/\* visited 稍浅,可区分但不出戏 \*\//,
  '/* 悬停态由 R19 荧光笔规则统一处理 */',
);

// 2) 我的附加块里去掉与 R19 冲突的 border-hover(保留互补选择器)
t = t.replace(
  /\.glossary dd a:hover, \.glossary dd a:focus-visible,\ntable\.tbl td a:hover, table\.tbl td a:focus-visible,\n\.paper-fig-src a:hover, \.paper-fig-src a:focus-visible \{\n  border-bottom-color: var\(--gold\);\n\}/,
  `.glossary dd a:hover, .glossary dd a:focus-visible,
table.tbl td a:hover, table.tbl td a:focus-visible,
.paper-fig-src a:hover, .paper-fig-src a:focus-visible {
  background: rgba(242, 183, 5, .25);
}`,
);
// chapter-nav 悬停的 border 改为高亮(与全局一致)
t = t.replace(
  /\.chapter-nav a:hover, \.chapter-nav a:focus-visible,\n\.section-toc nav a:hover, \.section-toc nav a:focus-visible \{\n  border-bottom-color: var\(--gold\);\n  background: rgba\(242, 183, 5, \.14\);\n\}/,
  `.chapter-nav a:hover, .chapter-nav a:focus-visible,
.section-toc nav a:hover, .section-toc nav a:focus-visible {
  background: rgba(242, 183, 5, .22);
}`,
);
// foot/boss 链接:去掉 border,统一高亮
t = t.replace(
  /\.foot a:hover, \.foot a:focus-visible, \.card\.boss a:hover, \.card\.boss a:focus-visible \{\n  color: var\(--gold\);\n  border-bottom-color: var\(--gold\);\n\}/,
  `.foot a:hover, .foot a:focus-visible, .card.boss a:hover, .card.boss a:focus-visible {
  color: var(--gold);
}`,
);
t = t.replace(
  /\.foot a, \.card\.boss a \{\n  text-decoration: none;\n  border-bottom: 2px solid rgba\(122, 229, 242, \.45\);\n  transition: border-color \.12s, color \.12s;\n\}/,
  `.foot a, .card.boss a {
  text-decoration: none;
  transition: color .12s;
}`,
);
// 目录/术语/表格默认态的 border 声明去掉(无需 border 占位)
t = t.replace(
  /\.chapter-nav a, \.section-toc nav a \{\n  text-decoration: none;\n  border-bottom: 2px solid transparent;\n  padding: 1px 4px;\n  transition: border-color \.12s, background-color \.12s;\n\}/,
  `.chapter-nav a, .section-toc nav a {
  text-decoration: none;
  padding: 1px 4px;
  transition: background-color .12s;
}`,
);
t = t.replace(
  /\.glossary dd a, table\.tbl td a, \.paper-fig-src a, \.repo-meta a \{\n  text-decoration: none;\n  border-bottom: 2px solid transparent;\n  transition: border-color \.12s;\n\}/,
  `.glossary dd a, table.tbl td a, .paper-fig-src a, .repo-meta a {
  text-decoration: none;
  transition: background-color .12s;
}`,
);

writeFileSync(p, t);
console.log('dedup done. border-bottom refs remaining:', (t.match(/border-bottom-color: var\(--gold\)/g) || []).length);
