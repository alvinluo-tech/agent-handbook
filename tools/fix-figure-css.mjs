// 修复图解桌面端被裁切:min-width 960 仅窄屏生效(桌面按容器 100% 缩放)
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const p = join(ROOT, 'src/styles.css');
let t = readFileSync(p, 'utf8');
const OLD = '.figure-scroll { max-width:100%; overflow-x:auto; }\n.figure-scroll svg { min-width:960px; }';
const NEW = `.figure-scroll { max-width:100%; overflow-x:auto; }
.figure-scroll svg { width:100%; height:auto; min-width:0; }
@media(max-width:880px){ .figure-scroll svg { min-width:960px; } }`;
if (t.includes('.figure-scroll svg { min-width:960px; }') && !t.includes(NEW)) {
  t = t.replace(OLD, NEW);
  writeFileSync(p, t);
  console.log('figure-scroll patched');
} else if (t.includes(NEW)) {
  console.log('already patched');
} else {
  console.log('PATTERN NOT FOUND — dumping context');
  const i = t.indexOf('.figure-scroll');
  console.log(JSON.stringify(t.slice(i - 60, i + 220)));
}
