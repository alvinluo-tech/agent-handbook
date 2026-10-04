// 直接下载 fontsource 上的 Fusion Pixel SC 全量 woff2(latin 命名但含全字形,视觉验证确认)
import { mkdir, writeFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIR = join(ROOT, 'public', 'fonts');
const URL1 = 'https://cdn.jsdelivr.net/npm/@fontsource/fusion-pixel-12px-proportional-sc/files/fusion-pixel-12px-proportional-sc-latin-400-normal.woff2';

(async () => {
  await mkdir(DIR, { recursive: true });
  const res = await fetch(URL1, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  if (!res.ok) throw new Error('HTTP ' + res.status);
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 100000) throw new Error('suspiciously small: ' + buf.length);
  await writeFile(join(DIR, 'fusion-pixel.woff2'), buf);
  console.log('SAVED fusion-pixel.woff2', (buf.length / 1e6).toFixed(2) + 'MB');
})().catch((e) => { console.error('FAIL', e.message); process.exit(1); });
