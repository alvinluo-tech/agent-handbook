import { readFileSync, writeFileSync } from 'node:fs'
const p = 'src/chapters/labs/p2b.jsx'
let s = readFileSync(p, 'utf8')
const before = s
// 把模板字符串里多余的 \" 转义改成普通引号(消除 oxlint no-useless-escape)
s = s.replace('只输出 JSON {\\"indices\\": [序号]}', '只输出 JSON {"indices": [序号]}')
if (s === before) { console.log('NO CHANGE'); process.exit(1) }
writeFileSync(p, s)
console.log('OK')
