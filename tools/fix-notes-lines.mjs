import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const p = join(ROOT, 'src/chapters/PapersPage.jsx');
let t = readFileSync(p, 'utf8');
const fixes = [
  [/^  2310\.10501': 'eMo/m, "  '2310.10501': 'NeMo Guardrails(NVIDIA):可编程护栏工具箱,把输入/输出/对话流的安全策略写成 Colang 规则——生产护栏的早期标准实现(CH.16)。',"],
  [/^  2212\.10496': 'yDE/m, "  '2212.10496': 'HyDE:先让模型生成「假设性答案文档」再做向量检索,零样本即超越普通查询嵌入——CH.10 查询改写的代表技术。',"],
  [/^  2511\.15759': '软/m, "  '2511.15759': '微软的注入防御实证:分层防御在其实验设置下把攻击成功率 73.2% 压到 8.7%——CH.16「分层防御」的数据源,注意是特定设置结果。',"],
];
let n = 0;
for (const [re, good] of fixes) {
  if (re.test(t)) { t = t.replace(re, good); n++; }
}
writeFileSync(p, t);
console.log('fixed lines:', n);
