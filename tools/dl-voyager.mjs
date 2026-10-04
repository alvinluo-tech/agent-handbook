import { writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
(async () => {
  const res = await fetch('https://raw.githubusercontent.com/MineDojo/Voyager/main/images/pull.png');
  console.log('status', res.status);
  const buf = Buffer.from(await res.arrayBuffer());
  console.log('size', buf.length);
  writeFileSync(join(ROOT, 'public/figures/2305-16291-f1.png'), buf);
  console.log('saved');
})();
