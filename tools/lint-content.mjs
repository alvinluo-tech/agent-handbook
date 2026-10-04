// 文本质量扫描:标记符 / 重复标点 / 花括号配对
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const dir = join(process.cwd(), 'src', 'chapters');
const files = readdirSync(dir).filter((f) => f.endsWith('.jsx'));
const issues = [];
for (const f of files) {
  const t = readFileSync(join(dir, f), 'utf8');
  t.split('\n').forEach((ln, i) => {
    if (/TODO|FIXME|XXX|待补|占位|placeholder/i.test(ln)) issues.push(`${f}:${i + 1} [marker] ${ln.trim().slice(0, 90)}`);
    if (/[，,]\s*[，,]|。。|！！|？？|;;/.test(ln)) issues.push(`${f}:${i + 1} [punct] ${ln.trim().slice(0, 90)}`);
  });
  const open = (t.match(/\{/g) || []).length;
  const close = (t.match(/\}/g) || []).length;
  if (open !== close) issues.push(`${f} [braces] open=${open} close=${close}`);
  const po = (t.match(/\(/g) || []).length;
  const pc = (t.match(/\)/g) || []).length;
  if (Math.abs(po - pc) > 2) issues.push(`${f} [parens?] open=${po} close=${pc} (中文括号会误报,仅提示)`);
}
console.log(issues.length ? issues.join('\n') : 'CLEAN');
