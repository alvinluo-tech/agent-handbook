// 扫描 styles.css 中所有与链接相关的规则
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const css = readFileSync(join(ROOT, 'src/styles.css'), 'utf8');
const lines = css.split('\n');
const hits = [];
lines.forEach((l, i) => {
  if (/a\s*[{,]|a:|text-decoration|\.toc-item|repo-name a|paper-fig-link|chapter a|\.foot a|breadcrumb|\.paper-links a|\.chip/.test(l) && !l.includes('/*')) {
    hits.push(`${i + 1}: ${l.trim().slice(0, 120)}`);
  }
});
console.log(hits.join('\n'));
