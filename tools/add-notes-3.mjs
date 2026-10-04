import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const p = join(ROOT, 'src/chapters/PapersPage.jsx');
let t = readFileSync(p, 'utf8');
const notes = [
  ["'2511.15759': '", "微软的注入防御实证:分层防御在其实验设置下把攻击成功率 73.2% 压到 8.7%——CH.16「分层防御」的数据源,注意是特定设置结果。'"],
  ["'2212.10496': '", "HyDE:先让模型生成「假设性答案文档」再做向量检索,零样本即超越普通查询嵌入——CH.10 查询改写的代表技术。'"],
  ["'2310.10501': '", "NeMo Guardrails(NVIDIA):可编程护栏工具箱,把输入/输出/对话流的安全策略写成 Colang 规则——生产护栏的早期标准实现(CH.16)。'"],
];
let added = 0;
for (const [key, val] of notes) {
  const id = key.match(/'(\d+\.\d+)'/)[1];
  if (t.includes(`'${id}':`)) continue;
  // 插到 NOTES 对象最后一行前
  const anchor = "'2504.03767'";
  const i = t.indexOf(anchor);
  if (i < 0) throw new Error('anchor missing');
  const lineEnd = t.indexOf('\n', i);
  t = t.slice(0, lineEnd + 1) + `  ${key.slice(1)}${val.slice(1)}\n` + t.slice(lineEnd + 1);
  added++;
}
if (added) { const fs = await import('node:fs'); fs.writeFileSync(p, t); }
console.log('notes added:', added);
