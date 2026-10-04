// 从章节 JSX 中抽取中文文案,便于人工审阅错别字
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const dir = join(process.cwd(), 'src', 'chapters');
const files = readdirSync(dir).filter((f) => f.endsWith('.jsx')).sort();
for (const f of files) {
  const t = readFileSync(join(dir, f), 'utf8');
  // 抓取所有含中文的文本片段(标签间内容/字符串)
  const pieces = [];
  for (const m of t.matchAll(/>\s*([^<>{}\n]*[\u4e00-\u9fa5][^<>{}\n]*)\s*</g)) pieces.push(m[1].trim());
  for (const m of t.matchAll(/'([^'\n]*[\u4e00-\u9fa5][^'\n]*)'/g)) pieces.push(m[1].trim());
  console.log(`\n===== ${f} =====`);
  for (const p of pieces) if (p.length > 3) console.log('· ' + p);
}
