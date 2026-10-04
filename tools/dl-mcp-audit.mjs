import { writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const UA = { 'User-Agent': 'Mozilla/5.0' };
const id = '2504.03767v2';
const base = `https://arxiv.org/html/${id}`;
(async () => {
  const html = await (await fetch(base, { headers: UA })).text();
  console.log('len', html.length);
  // 定位 Figure 1 的 figure 块
  const caps = [...html.matchAll(/<figcaption[^>]*>([\s\S]*?)<\/figcaption>/g)];
  let capStart = -1, capEnd = -1;
  for (const c of caps) {
    const text = c[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
    if (/^Figure\s*1\s*[:.]/.test(text)) { capStart = c.index; capEnd = c.index + c[0].length; break; }
  }
  if (capStart < 0) { console.log('fig1 caption not found'); return; }
  // 向前回溯找 figure 开标签(简单平衡)
  let s = capStart;
  for (let g = 0; g < 12; g++) {
    s = html.lastIndexOf('<figure', s - 1);
    const between = html.slice(s, capStart);
    const o = (between.match(/<figure\b/g) || []).length;
    const c2 = (between.match(/<\/figure>/g) || []).length + 1;
    if (o >= c2) break;
  }
  const block = html.slice(s, capEnd);
  const srcs = [...block.matchAll(/<img[^>]*src="([^"]+)"/g)].map((m) => m[1]);
  console.log('imgs in fig1:', srcs);
  mkdirSync(join(ROOT, 'public/figures'), { recursive: true });
  let i = 0;
  for (const src of srcs.slice(0, 2)) {
    const u = src.startsWith('http') ? src : `https://arxiv.org/html/${src.replace(/^\.?\//, '')}`;
    const name = `2504-03767-f1${srcs.length > 1 ? String.fromCharCode(97 + i) : ''}.png`;
    const res = await fetch(u, { headers: UA });
    console.log(res.status, u.slice(0, 100));
    if (res.ok) {
      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.length > 3000) {
        writeFileSync(join(ROOT, 'public/figures', name), buf);
        console.log('saved', name, (buf.length / 1024).toFixed(0) + 'KB');
        i++;
      }
    }
    await new Promise((r) => setTimeout(r, 500));
  }
})();
