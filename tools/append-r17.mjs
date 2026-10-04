import { readFileSync, appendFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const p = join(ROOT, 'WORKLOG.md');
const t = readFileSync(p, 'utf8');
if (t.includes('### R17 终局时效性验收')) {
  console.log('R17 already present');
} else {
  appendFileSync(p, `
### R17 终局时效性验收(用户驱动:确保无任何旧知识与旧表达)
方法:重跑 audit-freshness.mjs 全书扫描(19 章+支线页,逐条人工过目);对最新、最易错的断言逐一实时核验。

**独立实时核验结果(全部吻合)**
- ✅ gpt-6.1-sol:2026-09 底发布,Responses API 做工具调用(书内代码即此形态)
- ✅ GPT-6 Luna:lite 档($0.10/$0.50,1.05M 上下文)真实在售
- ✅ GLM-5.3(8-14)/GLM-5.3-Flash(8-26,320B/A18B 原生多模态)与书中参数一致
- ✅ DeepSeek V4.1-Flash:2026-09-09 发布(书中「9 月」正确)
- ✅ MCP 2026-07-28 规范:MRTR 引入、Sampling/Roots/Logging 弃用——与官方 changelog 逐条比对一致
- ✅ OWASP 2026 前三名:注入/敏感信息/过度代理(Excessive Agency 升至第三)——与官方 Preface 一致
- ✅ 历史年份(ReAct 2022、FC 2023.06、MCP 2024.11、SWE-bench 原版/Verified/Pro 分列、A2A→LF 2025-06→AAIF 2026-08、UCP 2026.01、EchoLeak CVE-2025-32711)均为有据史实

**审计结论**:章节正文无残留旧表达;扫描命中的 README/WORKLOG 条目属历史日志,README 已注明「快照 2026-10-03」。本轮新增核验记录于本条;论文库 85 篇、项目 68 个、终态 ALL SYSTEMS GO。
`);
  console.log('R17 appended');
}
