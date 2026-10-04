// 全篇候选表达检索；历史年份/模型不自动判为过时。
import { readdirSync, readFileSync } from 'node:fs'
import { join, dirname, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const patterns = [
  /gpt-[\w.-]+|claude[\s-]?\d[\w.-]*|gemini[\s-]?\d[\w.-]*/i,
  /deepseek|qwen|glm[- ]?\d[\w.-]*|kimi|sonnet|opus|haiku/i,
  /\b20\d{2}\b|\bV\d+(\.\d+)?\b|\$\d|每百万|定价/i,
  /MCP|A2A|OWASP|SDK|FastMCP|Responses|Chat Completions/i,
  /最新|首选|必然|100%|零幻觉|零误报|硬上限|永久|实时|已归档|维护模式/,
]
const files = []
function scan(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) scan(path)
    else if (/\.(jsx?|json)$/.test(entry.name)) files.push(path)
  }
}
scan(join(root, 'src'))
files.push(join(root, 'README.md'), join(root, 'WORKLOG.md'))
let hits = 0
for (const file of files.sort()) {
  const label = relative(root, file).replaceAll('\\', '/')
  readFileSync(file, 'utf8').split(/\r?\n/).forEach((line, i) => {
    if (patterns.some(pattern => pattern.test(line))) {
      console.log(label + ':' + (i + 1) + ': ' + line.trim())
      hits++
    }
  })
}
console.log('扫描 ' + files.length + ' 个文件，' + hits + ' 行待人工核对；WORKLOG 是历史记录，日期不应批量替换。')
