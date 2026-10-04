import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const UA = { 'User-Agent': 'Mozilla/5.0' };
const ids = ['2304.03442', '2305.16291', '2405.15793', '2504.03767'];
for (const id of ids) {
  for (const base of [`https://ar5iv.labs.arxiv.org/html/${id}`, `https://arxiv.org/html/${id}`]) {
    try {
      const res = await fetch(base, { headers: UA });
      const t = res.ok ? await res.text() : '';
      const hasFig = /Figure\s*1\s*[:.]/.test(t);
      const objs = (t.match(/<object[^>]*data="([^"]+)"/g) || []).length;
      const imgs = (t.match(/<img[^>]*src="([^"]+)"/g) || []).length;
      console.log(`${res.status} ${base.includes('ar5iv') ? 'ar5iv' : 'arxiv '} ${id} | len=${t.length} fig1=${hasFig} obj=${objs} img=${imgs}`);
    } catch (e) { console.log(`ERR ${base} ${id}: ${e.message.slice(0, 50)}`); }
    await new Promise((r) => setTimeout(r, 1200));
  }
}
