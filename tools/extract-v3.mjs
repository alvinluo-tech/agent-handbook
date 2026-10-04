// v3:figcaption 定位 + 标签平衡回溯(处理嵌套子图);支持 arxiv.org 资产回退
import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUTDIR = join(ROOT, 'public', 'figures');
const UA = { 'User-Agent': 'Mozilla/5.0 (educational handbook figure extraction)' };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const clean = (s) => (s || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
const abs = (u) => (u.startsWith('http') ? u : `https://ar5iv.labs.arxiv.org${u}`);

const PICKS = process.argv.includes('--retry')
  ? null
  : [
    ['2305.16291', 1, 'Voyager 总览:自动课程、可执行代码技能库与迭代提示三件套(Minecraft 终身学习)', 'ch19'],
    ['2504.03767', 1, 'MCP Safety Audit:对 MCP 工具流的系统化攻击面与实验设计', 'ch06'],
  ];

function findFigureStart(html, capStart) {
  let pos = capStart;
  for (let guard = 0; guard < 12; guard++) {
    const s = html.lastIndexOf('<figure', pos - 1);
    if (s < 0) return -1;
    const between = html.slice(s, capStart);
    const opens = (between.match(/<figure\b/g) || []).length;
    const closes = (between.match(/<\/figure>/g) || []).length;
    if (opens > closes) return s; // 该起点在 capStart 处仍开放
    pos = s; // 这个起点已闭合,继续向前找更外层
  }
  return -1;
}

async function extractOne([id, figN, note, chapter]) {
  const out = { id, figN, note, chapter, ok: false };
  const html = await (await fetch(`https://ar5iv.labs.arxiv.org/html/${id}`, { headers: UA })).text();
  // 收集所有 figcaption(含位置),找文本含 Figure N 的
  const caps = [...html.matchAll(/<figcaption[^>]*>([\s\S]*?)<\/figcaption>/g)];
  let capStart = -1, caption = null;
  const headRe = new RegExp(`^Figure\\s*${figN}\\s*[:.]`);
  const looseRe = new RegExp(`Figure\\s*${figN}\\s*[:.]`);
  for (const c of caps) {
    const text = clean(c[1]);
    if (headRe.test(text) || looseRe.test(text)) { capStart = c.index; caption = text.slice(0, 500); break; }
  }
  if (capStart < 0) { out.err = `figcaption ${figN} not found`; return out; }
  const s = findFigureStart(html, capStart);
  if (s < 0) { out.err = 'figure start not found'; return out; }
  const capEnd = capStart + html.slice(capStart).indexOf('</figcaption>') + 13;
  const block = html.slice(s, capEnd);
  let asset = null, kind = null;
  const obj = block.match(/<object[^>]*data="([^"]+)"/);
  const img = block.match(/<img[^>]*src="([^"]+)"/);
  if (obj) { asset = obj[1]; kind = asset.endsWith('.svg') ? 'svg' : 'img'; }
  else if (img && !img[1].startsWith('data:')) { asset = img[1]; kind = 'img'; }
  else if (img) { asset = img[1]; kind = 'base64'; }
  if (!asset) { out.err = 'no asset'; return out; }
  const ext = kind === 'svg' ? 'svg' : (asset.match(/\.(png|jpe?g|gif)/i)?.[1]?.toLowerCase() || 'png');
  const file = `${id.replace(/\./g, '-')}-f${figN}.${ext}`;
  const dest = join(OUTDIR, file);
  if (kind === 'base64') {
    await writeFile(dest, Buffer.from(asset.replace(/^data:image\/\w+;base64,/, ''), 'base64'));
  } else {
    let res = await fetch(abs(asset), { headers: UA });
    if (!res.ok) {
      const alt = abs(asset).replace('https://ar5iv.labs.arxiv.org/html', 'https://arxiv.org/html');
      try { res = await fetch(alt, { headers: UA }); } catch { /* ignore */ }
    }
    if (!res.ok) { out.err = `asset HTTP ${res.status}`; return out; }
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length < 500) { out.err = 'asset too small'; return out; }
    await writeFile(dest, buf);
  }
  return { ...out, ok: true, file: `/figures/${file}`, caption, kind };
}

async function main() {
  await mkdir(OUTDIR, { recursive: true });
  const targets = PICKS || await (async () => {
    const prev = JSON.parse(await readFile(join(ROOT, 'src/data/paper-figures.json'), 'utf8'));
    return prev.figures.filter((f) => !f.ok).map((f) => [f.id, f.figN, f.note, f.chapter]);
  })();
  let store = { figures: [] };
  try { store = JSON.parse(await readFile(join(ROOT, 'src/data/paper-figures.json'), 'utf8')); } catch { }
  const byKey = new Map(store.figures.map((f) => [f.id + '#' + f.figN, f]));
  for (const pick of targets) {
    const key = pick[0] + '#' + pick[1];
    try {
      const r = await extractOne(pick);
      if (r.ok) { byKey.set(key, r); console.log(`OK   ${r.id} Fig.${r.figN} -> ${r.file} (${r.kind})`); }
      else console.error(`FAIL ${r.id} Fig.${r.figN}: ${r.err}`);
    } catch (e) { console.error(`FAIL ${pick[0]}: ${e.message.slice(0, 80)}`); }
    await sleep(2000);
  }
  const figures = [...byKey.values()];
  figures.sort((a, b) => (a.chapter || '').localeCompare(b.chapter || '') || a.id.localeCompare(b.id));
  await writeFile(join(ROOT, 'src/data/paper-figures.json'), JSON.stringify({ updatedAt: new Date().toISOString(), figures }, null, 2));
  console.log(`DONE. ok=${figures.filter((f) => f.ok).length}/${figures.length}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
