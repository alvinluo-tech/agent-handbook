import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const p = join(ROOT, 'src/styles.css');
let t = readFileSync(p, 'utf8');
const target = 'font-size: 12px; padding: 8px 18px; font-family: var(--font-body);';
const i = t.indexOf('.code-note');
if (i < 0) throw new Error('.code-note not found');
const j = t.indexOf(target, i);
if (j < 0) throw new Error('code-note body line not found');
if (t.slice(j, j + target.length + 40).includes('overflow-wrap')) {
  console.log('already patched');
} else {
  t = t.slice(0, j) + target + ' min-width: 0; max-width: 100%; overflow-wrap: anywhere;' + t.slice(j + target.length);
  writeFileSync(p, t);
  console.log('code-note patched (CRLF-safe)');
}
