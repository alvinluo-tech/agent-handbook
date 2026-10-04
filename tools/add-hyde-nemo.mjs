import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const p = join(ROOT, 'tools/papers.mjs');
let t = readFileSync(p, 'utf8');
const changes = [];
if (!t.includes('2212.10496')) {
  const a = "'2503.09516', 'rag'";
  const i = t.lastIndexOf('\n', t.indexOf(a)) + 1;
  t = t.slice(0, i) + "  ['2212.10496', 'rag'], // HyDE 假设性文档嵌入(CH10 查询改写)\n" + t.slice(i);
  changes.push('HyDE');
}
if (!t.includes('2310.10501')) {
  const a = "'2511.15759', 'safety'";
  const i = t.lastIndexOf('\n', t.indexOf(a)) + 1;
  t = t.slice(0, i) + "  ['2310.10501', 'safety'], // NeMo Guardrails(正确 ID;CH16 防御工具箱点名)\n" + t.slice(i);
  changes.push('NeMo Guardrails');
}
writeFileSync(p, t);
console.log('added:', changes.join(', ') || 'none');
