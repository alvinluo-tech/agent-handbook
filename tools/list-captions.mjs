import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const UA = { 'User-Agent': 'Mozilla/5.0' };
const clean = (s) => (s || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
for (const id of ['2305.16291', '2405.15793']) {
  const html = await (await fetch(`https://ar5iv.labs.arxiv.org/html/${id}`, { headers: UA })).text();
  console.log(`\n== ${id} ==`);
  const caps = [...html.matchAll(/<figcaption[^>]*>([\s\S]*?)<\/figcaption>/g)]
    .map((m) => clean(m[1]).slice(0, 100));
  caps.slice(0, 6).forEach((c, i) => console.log(`[${i}]`, c));
  // 第一个 figure 块的资产
  const firstFig = html.indexOf('<figure');
  const block = html.slice(firstFig, html.indexOf('</figure>', firstFig) + 9);
  const obj = block.match(/<object[^>]*data="([^"]+)"/);
  const img = block.match(/<img[^>]*src="([^"]+)"/);
  console.log('first asset:', (obj?.[1] || img?.[1] || 'none').slice(0, 90));
  await new Promise((r) => setTimeout(r, 1200));
}
