import { readFileSync, appendFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const p = join(ROOT, 'WORKLOG.md');
const t = readFileSync(p, 'utf8');
if (t.includes('### R19b 像素图标系统')) { console.log('already'); }
else {
  appendFileSync(p, `
### R19b 像素图标系统(侧聊需求:替换 emoji 图标方案)
- [x] 新增 PixelIcon 组件:30 个 16×16 手绘像素图标(crispEdges,currentColor 随导航态变化)
- [x] 替换位:侧栏 19 章 + 5 支线图标、章节头 meta、首页选章卡、汉堡按钮、循环演示四按钮(play/step/pause/reset)
- [x] 正文与图解内的 emoji 属插画内容,保留不动
`);
  console.log('R19b noted');
}
