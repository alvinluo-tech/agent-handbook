// 从 ar5iv 提取论文原图 v2:按 figcaption 前缀精确匹配 figure 块
import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUTDIR = join(ROOT, 'public', 'figures');
const UA = { 'User-Agent': 'Mozilla/5.0 (educational handbook figure extraction)' };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const clean = (s) => (s || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
const abs = (u, id) => (u.startsWith('http') ? u : u.startsWith('/') ? `https://ar5iv.labs.arxiv.org${u}` : `https://ar5iv.labs.arxiv.org/html/${id}/${u}`);

// [arxivId, 图号, 中文说明, 章节]
const PICKS = process.argv.includes('--failed')
  ? null // 运行时从 json 里找 !ok 的
  : [
    ['2210.03629', 1, 'ReAct 经典对比图:Standard / CoT / Act-only / ReAct 四种提示方式在 HotpotQA 与 AlfWorld 上的求解轨迹', 'ch03'],
    ['2201.11903', 1, 'Chain-of-Thought 原始论文的思维链示例:模型先写出中间推理步骤再给出答案', 'ch11'],
    ['2302.04761', 1, 'Toolformer:自监督采样「哪些 API 调用值得插入文本」的流程示意', 'ch05'],
    ['2307.03172', 1, 'Lost in the Middle 的 U 型曲线:关键信息放在上下文开头或结尾效果最好,埋在中部最差', 'ch04'],
    ['2310.08560', 1, 'MemGPT:把 LLM 当操作系统——主上下文与外部存储之间的中断驱动分页', 'ch09'],
    ['2304.03442', 1, 'Generative Agents:小镇里 25 个 agent 的记忆/反思/规划驱动拟真社会行为', 'ch12'],
    ['2305.16291', 1, 'Voyager 总览:自动课程、可执行代码技能库与迭代提示三件套(Minecraft 终身学习)', 'ch19'],
    ['2405.15793', 1, 'SWE-agent 的 agent-computer interface:为模型设计的终端/文件查看器/编辑器', 'ch14'],
    ['2503.09516', 1, 'Search-R1:RL 训练模型在推理中途多次调用搜索引擎', 'ch10'],
    ['2504.03767', 1, 'MCP Safety Audit:对 MCP 工具流的系统化攻击面与实验设计', 'ch06'],
  ];

async function getTargets() {
  if (PICKS) return PICKS;
  const prev = JSON.parse(await readFile(join(ROOT, 'src/data/paper-figures.json'), 'utf8'));
  return prev.figures.filter((f) => !f.ok).map((f) => [f.id, f.figN, f.note, f.chapter]);
}

async function extractOne([id, figN, note, chapter]) {
  const out = { id, figN, note, chapter, ok: false };
  const html = await (await fetch(`https://ar5iv.labs.arxiv.org/html/${id}`, { headers: UA })).text();
  const blocks = [...html.matchAll(/<figure[^>]*>([\s\S]*?)<\/figure>/g)];
  const headRe = new RegExp(`^Figure\\s*${figN}\\s*[:.]`);
  let block = null, caption = null;
  for (const b of blocks) {
    const capEl = b[1].match(/<figcaption[^>]*>([\s\S]*?)<\/figcaption>/);
    if (!capEl) continue;
    const text = clean(capEl[1]);
    if (headRe.test(text) || new RegExp(`Figure\\s*${figN}\\s*[:.]`).test(text)) { block = b[0]; caption = text.slice(0, 500); break; }
  }
  if (!block) { out.err = `figure ${figN} block not found`; return out; }
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
    const res = await fetch(abs(asset, id), { headers: UA });
    if (!res.ok) { out.err = `asset HTTP ${res.status}`; return out; }
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length < 500) { out.err = 'asset too small'; return out; }
    await writeFile(dest, buf);
  }
  return { ...out, ok: true, file: `/figures/${file}`, caption, kind };
}

async function main() {
  await mkdir(OUTDIR, { recursive: true });
  const targets = await getTargets();
  let store = { figures: [] };
  try { store = JSON.parse(await readFile(join(ROOT, 'src/data/paper-figures.json'), 'utf8')); } catch { }
  const byKey = new Map(store.figures.map((f) => [f.id + '#' + f.figN, f]));
  for (const pick of targets) {
    const key = pick[0] + '#' + pick[1];
    try {
      const r = await extractOne(pick);
      if (r.ok) { byKey.set(key, r); console.log(`OK   ${r.id} Fig.${r.figN} -> ${r.file} (${r.kind})`); }
      else { console.error(`FAIL ${r.id} Fig.${r.figN}: ${r.err}`); }
    } catch (e) { console.error(`FAIL ${pick[0]}: ${e.message.slice(0, 80)}`); }
    await sleep(1500);
  }
  const figures = [...byKey.values()];
  figures.sort((a, b) => (a.chapter || '').localeCompare(b.chapter || '') || a.id.localeCompare(b.id));
  await writeFile(join(ROOT, 'src/data/paper-figures.json'), JSON.stringify({ updatedAt: new Date().toISOString(), figures }, null, 2));
  const ok = figures.filter((f) => f.ok).length;
  console.log(`DONE. ok=${ok} total=${figures.length}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
