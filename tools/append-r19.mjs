import { readFileSync, appendFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const p = join(ROOT, 'WORKLOG.md');
const t = readFileSync(p, 'utf8');
if (t.includes('### R19 链接样式统一')) {
  console.log('R19 already present');
} else {
  appendFileSync(p, `
### R19 链接样式统一(用户驱动:下划线与默认色太丑)
- [x] 全局 a 去浏览器默认下划线;正文/页脚链接改为语义深青色(#21647e,4.5:1)+ hover 金色荧光笔背景(像素手册气质)+ active 实色
- [x] 外链统一右上角 ↗ 小标记(::after,按钮型链接与原著图卡除外)
- [x] 深色 BOSS 卡链接保持青色系,hover 青色荧光(避免 hover 色被通用规则覆盖后在深底不可读)
- [x] 仓库卡去 3px 底线、原著图卡去青色底线,统一为 hover 高亮;原著图卡 hover 加青色描边
- [x] focus-visible 全局可见性此前已有,保留
- [x] 浏览器验收:CH.04 正文外链 hover 荧光+↗ ✓;兵器谱仓库卡 hover 金色高亮 ✓;构建通过
`);
  console.log('R19 appended');
}
