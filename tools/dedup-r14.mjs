import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const p = join(ROOT, 'WORKLOG.md');
let t = readFileSync(p, 'utf8');
const marker = '### R14 按 32 项审查报告全面修复';
const first = t.indexOf(marker);
const second = t.indexOf(marker, first + 1);
// 第二个块的结束 = 它后面第一个 '\n### ' 或 '\n## '(R15/终态核验标题)
let end = t.length;
for (const h of ['\n### ', '\n## ']) {
  const i = t.indexOf(h, second + marker.length);
  if (i > 0 && i < end) end = i + 1;
}
t = t.slice(0, second) + t.slice(end);
writeFileSync(p, t);
console.log('removed second R14 block;', marker, 'count now:', (t.match(/### R14 /g) || []).length);
