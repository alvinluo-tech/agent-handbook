// 追加 WORKLOG R14(用户按 32 项审查报告驱动的主会话修复记录)
import { appendFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

const entry = `
### R14 按 32 项审查报告全面修复(主会话,与审查会话并行协作)
用户确认审查报告(17 内容 + 15 UI)并要求全面修复;检测到报告作者会话同时在实施,双方按文件自然分工,互不覆盖。

**主会话完成项**
- [x] C01(最高优先):全量核对 81 篇论文标题(dump-titles.mjs),确认恰好 2 篇学科误收——
  2310.03021 实为星暴星系天文论文(被当 NeMo Guardrails)、2303.16462 实为夸克物质论文(被当 TaskMatrix.AI)。
  实时检索正确 ID 后替换:TaskMatrix.AI=2303.16434(原 ID 差 28)、GuardAgent(ICML 2025)=2406.09187 替代 NeMo 论文位;
  删除 2 个错误 PDF,重新采集 81 篇 0 失败,补两篇中文导读
- [x] 卡片标签重叠(用户截图指出):.card-tag 从绝对定位改为文档流内(负上边距保持「骑缝」视觉),长标签换行不再压住正文——全局生效
- [x] C15(报告点名未修):gh-projects.mjs 重写为合并模式——REPOS manifest 补齐 OpenClaw/Hermes/DSH/pi-mono/oh-my-pi/MCP 规范 6 项(63→69);抓取失败/限流保留旧记录并标 stale,不再覆写历史;实测限流场景 68 条全保(53 fresh + 15 stale);完成后自动同步 resource-summary;ProjectsPage 显示「快照沿用」标记
- [x] PapersPage NOTES 补 GuardAgent/TaskMatrix 导读

**审查会话同期完成(经探针验证,本会话未重复劳动)**
U01(共享 progress.js)/U02(原生 checkbox+details)/U03(hash 路由+单章阅读器)/U04(抽屉焦点陷阱+inert)/
U06/U07/U08/U13(UX CSS+sr-only+对比度)/U10(章节导航/小节目录/分享)/U11(aria)/U12(章节级代码分割,主包 618KB→248KB)/
C02-C09(labs:webhook 语义/归属校验/路径安全/引用闸门/类型统一/队列状态机/HTTP 状态/commit 绑定——探针全过)/
C13/C14(绝对化表达清零,探针全阴性)/C16(resource-summary.json 单一计数源+prebuild 同步)/C17(代码分级标注)

**终态**
- build 833ms 通过,主包 248KB(81KB gzip);资源核对 ALL SYSTEMS GO(81 论文/68 项目/0 缺失)
- 浏览器验收:首页新版式 ✔,#ch02 直达单章 ✔,2.3 重写版无重叠且表达更严谨 ✔
- 分工确认方式:修复前逐一探测报告各项现状,只做未修项,避免双写冲突
`;
appendFileSync(join(ROOT, 'WORKLOG.md'), entry);
console.log('R14 appended');
