import { writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const id = '2210.03629';
const html = await (await fetch(`https://ar5iv.labs.arxiv.org/html/${id}`, { headers: { 'User-Agent': 'Mozilla/5.0' } })).text();
// 抓 Figure 1 的 figure 块
const figIdx = html.indexOf('Figure 1:');
const figStart = html.lastIndexOf('<figure', figIdx);
const figEnd = html.indexOf('</figure>', figIdx) + 9;
const block = html.slice(figStart, figEnd);
console.log('block length:', block.length);
const imgs = [...block.matchAll(/<img[^>]*src="([^"]+)"/g)].map((m) => m[1]);
console.log('imgs in block:', imgs.map((s) => s.slice(0, 60)));
// 有没有 object/svg
console.log('has <svg:', block.includes('<svg'), '| has <object:', block.includes('<object'));
// 若有 base64,保存第一张
const b64 = imgs.find((s) => s.startsWith('data:image/png;base64,'));
if (b64) {
  const out = join(ROOT, 'tools', 'react-fig1.png');
  writeFileSync(out, Buffer.from(b64.replace('data:image/png;base64,', ''), 'base64'));
  console.log('saved react-fig1.png');
}
// 保存块 HTML 供检查
writeFileSync(join(ROOT, 'tools', 'react-fig1.html'), block);
