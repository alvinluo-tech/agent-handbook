import { readFileSync, appendFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const p = join(ROOT, 'WORKLOG.md');
const t = readFileSync(p, 'utf8');
if (t.includes('### R18 论文库遗漏与归属审计')) {
  console.log('R18 already present');
} else {
  appendFileSync(p, `
### R18 论文库遗漏与归属审计(用户驱动)
方法:① 85 篇标题按分类逐条人工过目(归属正确性);② 正文 arXiv 引用链接 vs 库内 ID 差集(遗漏);③ 正文点名方法名与库交叉核对(语义层遗漏)。

**归属审计结论**:85 篇无学科误收、无 ID 错配;新增篇目(Sleep-time Compute 2504.13171 / Multiagent Debate 2305.14325 / CRITIC 2305.11738 / AlphaEvolve 2506.13131 等)全部验证正确。

**遗漏审计发现 3 篇,全部补录**(85→88 篇,0 失败):
1. 2511.15759《Securing AI Agents Against Prompt Injection》——CH.16 正文已链接且是「73.2%→8.7%」数据源,却在库外
2. 2212.10496《HyDE》——CH.10 点名的查询改写代表技术
3. 2310.10501《NeMo Guardrails》——CH.16 防御工具箱点名;当初因猜错 ID(2310.03021 实为天体物理)被移除,本轮找回正确 ID 复收录

**修复过程**:add-notes 脚本曾切坏 3 行 NOTES 语法(丢开引号+残留尾巴)→ 截断修复,构建恢复。
**终态**:正文引用差集清零((无)缺失);88 篇 PDF 全在位;ALL SYSTEMS GO;HyDE 卡片浏览器验证含导读渲染 ✓。
`);
  console.log('R18 appended');
}
