import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const p = join(ROOT, 'tools/papers.mjs');
let t = readFileSync(p, 'utf8');
if (t.includes('2511.15759')) { console.log('already in LIST'); process.exit(0); }
const anchor = "'2504.03767', 'safety'";
const i = t.indexOf(anchor);
if (i < 0) { console.log('ANCHOR NOT FOUND'); process.exit(1); }
const lineStart = t.lastIndexOf('\n', i) + 1;
const insert = "  ['2511.15759', 'safety'], // Securing AI Agents Against Prompt Injection(微软,分层防御 73.2%->8.7%)\n";
t = t.slice(0, lineStart) + insert + t.slice(lineStart);
writeFileSync(p, t);
console.log('added 2511.15759 to LIST');
