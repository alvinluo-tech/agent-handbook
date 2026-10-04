// 在 PapersPage NOTES 末尾追加两篇替换论文的导读
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const p = join(ROOT, 'src/chapters/PapersPage.jsx');
let t = readFileSync(p, 'utf8');
if (!t.includes("'2406.09187'")) {
  const anchor = "'2504.03767'";
  const i = t.indexOf(anchor);
  if (i < 0) throw new Error('anchor not found');
  const lineEnd = t.indexOf('\n', i);
  const insert = `  '2406.09187': 'GuardAgent(ICML 2025):用一个「守卫 agent」+ 可执行检查逻辑保护目标 agent——护栏从「过滤层」进化为「推理层」(CH.16)。',
  '2303.16434': 'TaskMatrix.AI:把基础模型与百万级 API 连接完成任务的早期蓝图,工具生态编排的思想先驱(CH.05)。',\n`;
  t = t.slice(0, lineEnd + 1) + insert + t.slice(lineEnd + 1);
  writeFileSync(p, t);
  console.log('notes appended');
} else console.log('already present');
