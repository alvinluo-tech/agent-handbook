// R19 链接样式统一(追加块)
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const p = join(ROOT, 'src/styles.css');
let t = readFileSync(p, 'utf8');
if (t.includes('链接样式统一')) { console.log('already present'); process.exit(0); }
t += `
/* ===================== 链接样式统一(R19) ===================== */
a { color: inherit; text-decoration: none; }
/* 正文与页脚:语义色 + hover 荧光笔(替代丑下划线) */
.chapter a, .foot a {
  color: #21647e;
  padding: 0 2px;
  transition: background-color .08s steps(3), color .08s steps(3);
}
.chapter a:hover, .foot a:hover {
  background: rgba(242, 183, 5, .45);
  color: var(--ink);
}
.chapter a:active { background: var(--gold); color: var(--ink); }
/* 外链:像素风小箭头提示 */
.chapter a[target="_blank"]::after, .foot a[target="_blank"]::after {
  content: '\\2197';
  font-size: .82em;
  margin-left: 2px;
  opacity: .55;
}
/* 例外:按钮型/图卡链接不加箭头 */
.chapter a.paper-fig-link::after { content: none; }
/* 深色 BOSS 卡:保持青色系,hover 用青色荧光 */
.card.boss a { color: var(--term-cyan); }
.card.boss a:hover { background: rgba(126, 242, 157, .18); color: var(--term-cyan); }
.card.boss a[target="_blank"]::after { opacity: .8; }
/* 仓库卡:去掉 3px 底线,hover 金色高亮已在,补 padding 手感 */
.repo-name a { border-bottom: none; padding: 0 3px; }
/* 原著图卡链接:去掉青色底线,hover 高亮 */
.paper-fig-link { border-bottom: none; padding: 1px 4px; border: 2px solid transparent; }
.paper-fig-link:hover { border-color: var(--term-cyan); background: rgba(126, 242, 157, .12); }
/* 侧栏 logo 标题链接 */
.logo-title { color: var(--ink); }
`;
writeFileSync(p, t);
console.log('link styles appended');
