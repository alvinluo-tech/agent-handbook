// labs C02-C08 修复进度检查(按报告引用的关键代码特征)
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const rd = (f) => readFileSync(join(ROOT, 'src/chapters/labs/' + f), 'utf8');

const probes = [
  ['C02 webhook 自动重试错误表述', 'p3c.jsx', (t) => t.includes('GitHub 会自动重试') || t.includes('稍后重试')],
  ['C02 修复特征(显式说明不重试)', 'p3c.jsx', (t) => t.includes('不会自动重试')],
  ['C03 session_id 直接信任特征', 'p1c.jsx', (t) => /session_id[^\n]*历史|只读,放心放行/.test(t)],
  ['C03 修复特征(归属校验)', 'p1c.jsx', (t) => /owner|归属|authorize|auth_user|user_id/.test(t)],
  ['C04 路径拼接 session_id 特征', 'p1c.jsx', (t) => t.includes('traces/{session_id}.jsonl') || t.includes("traces/{")],
  ['C04 修复特征(安全任务ID/resolve 校验)', 'p1c.jsx', (t) => /resolve\(\)|task_id|sanitize/.test(t)],
  ['C05 空摘录放行特征(if quote and)', 'p1c.jsx', (t) => t.includes('if quote and')],
  ['C05 修复特征(完整摘录/映射校验)', 'p1c.jsx', (t) => /全文|完整摘录|exact|in cited_text|doc_id/.test(t)],
  ['C06 judge dict 下标特征', 'p1c.jsx', (t) => /c\['marker'\]/.test(t)],
  ['C06 修复特征(model_dump/对象字段)', 'p1c.jsx', (t) => /model_dump|\.marker/.test(t)],
  ['C07 先 record 后 enqueue 特征', 'p3c.jsx', (t) => /store\.record\([\s\S]{0,80}queue\.enqueue/.test(t)],
  ['C07 修复特征(任务状态机)', 'p3c.jsx', (t) => /pending\/running|状态.*pending|received/.test(t)],
  ['C08 raise_for_status 修复特征', 'p3c.jsx', (t) => t.includes('raise_for_status')],
  ['C09 commit_id 修复特征', 'p3c.jsx', (t) => t.includes('commit_id')],
];
for (const [name, f, test] of probes) console.log(`${name}: ${test(rd(f)) ? '特征在' : '无'}`);
