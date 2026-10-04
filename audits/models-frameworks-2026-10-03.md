> 修订前审阅快照：本轮已于 2026-10-03 更新正文，详见 [更新验收记录](update-completion-2026-10-03.md)。原句与行号保留用于追溯，不代表当前正文；GLM 5.3 的补充核查见 [来源表](update-sources-2026-10-03.md)。

# 模型、框架与代码智能体时效性审计

核验日期：2026-10-03（Asia/Shanghai）。范围：CH.08、CH.14、CH.19、术语表、路线图、实战工坊，并关联 CH.02 的模型/API 表述。仅新增审计文件，未修改正文。所有现状结论依据本次可读的官方文档、官方仓库或发布方模型卡；网页未显示发布日期时，注明“页面未标日期，本次访问 2026-10-03”。P1 为会导致示例失败或重要事实错误，P2 为选型/时效误导，P3 为建议限定措辞。

## 重点修改项

### F01 — AutoGen 选型描述遗漏维护模式（P2，已证实）

- 位置：[Ch08.jsx:30](/E:/code/github_project/auto-dev/agent-dev-guide/src/chapters/Ch08.jsx:30)；关联 [GlossaryPage.jsx:51](/E:/code/github_project/auto-dev/agent-dev-guide/src/chapters/GlossaryPage.jsx:51)。
- 原文：“微软系多 agent 对话框架,学术引用最多;0.4 版重构为事件驱动”。
- 问题：0.4 重构是历史事实，但“2026-10 主流框架货架”没有说明项目已进入维护模式。官方 README 明确表示不再新增功能，建议新项目使用 Microsoft Agent Framework，已有项目参考迁移指南。“学术引用最多”也未提供统计口径。
- 建议替换：“微软研究体系的多智能体框架；现已进入维护模式，适合理解既有项目与历史架构，新项目优先评估 Microsoft Agent Framework。”术语表中可保留 AutoGen，但标注历史/存量项目定位。
- 来源：[AutoGen 官方 README](https://github.com/microsoft/autogen)、[官方迁移指南](https://learn.microsoft.com/en-us/agent-framework/migration-guide/from-autogen/)。页面未标日期，本次访问 2026-10-03。

### F02 — DeepSeek Harness 语言写错（P2，已证实）

- 位置：[Ch08.jsx:38](/E:/code/github_project/auto-dev/agent-dev-guide/src/chapters/Ch08.jsx:38)。
- 原文：DeepSeek Harness 的“语言”列为“Py”。
- 问题：官方仓库使用 Node、pnpm、TypeScript 构建，SDK 客户端也是 TypeScript；把它归为 Python 会直接影响读者按语言栈选型。
- 建议替换：“TS / Node.js”。若要区分服务端、桌面和插件语言，可将列名改为“主要实现语言”。
- 来源：[官方 package.json](https://github.com/deepseek-ai/deepseek-harness/blob/master/package.json)、[官方 SDK 说明](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/sdk/README.md)。页面未标日期，本次访问 2026-10-03。

### F03 — Google ADK 语言支持落后（P2，已证实）

- 位置：[Ch08.jsx:34](/E:/code/github_project/auto-dev/agent-dev-guide/src/chapters/Ch08.jsx:34)。
- 原文：“Py/Java”。
- 问题：官方入口当前列出 Python、TypeScript、Go、Java、Kotlin。ADK 2.0 的特性支持也按语言区分，仅写 Py/Java 已经低估其对 TS/Go 团队的适用性。
- 建议替换：“Py / TS / Go / Java / Kotlin（功能支持以各语言版本为准）”。
- 来源：[Google ADK 官方文档](https://adk.dev/)、[ADK 2.0 官方说明](https://github.com/google/adk-docs/blob/main/docs/2.0/index.md)。2.0 文档标注 Python 2.0 GA 为 2026-05-19；其他页面未标日期，本次访问 2026-10-03。

### F04 — 国内模型“截至 2026-10”速览遗漏 DeepSeek 9 月更新（P2，已证实）

- 位置：[Ch08.jsx:64](/E:/code/github_project/auto-dev/agent-dev-guide/src/chapters/Ch08.jsx:64)；关联 [WORKLOG.md:123](/E:/code/github_project/auto-dev/agent-dev-guide/WORKLOG.md:123)。
- 原文：“V4 为现役旗舰……2026-04 发布、8 月更新”。
- 问题：V4 的 4 月发布和 V4-Pro 的 8 月更新仍然正确，但这不是完整的 10 月现状。官方 2026-09-10 已发布 V4.1-Flash，旧 V4-Flash / Vision Exp 已退休并临时重定向；V4-Pro 服务继续保留。不能把“现役旗舰”理解成“全系最新就是 V4”，也不能一律改成“V4-Pro 已下线”。
- 建议替换：“DeepSeek：V4-Pro 与 2026-09 发布的 V4.1-Flash 并存；Flash 最新 API 模型名为 deepseek-flash，V4-Pro 服务继续保留。V4 系列的参数规模、模态能力和调用标识需按具体变体区分。”
- 来源：[DeepSeek 官方更新记录](https://api-docs.deepseek.com/updates/)。源条目日期 2026-09-10；本次访问 2026-10-03。

### F05 — 将 GPT-5.x / Gemini 3.x / DeepSeek V4 一概列为“普通模型”不准确（P1，已证实）

- 位置：[Ch02.jsx:36](/E:/code/github_project/auto-dev/agent-dev-guide/src/chapters/Ch02.jsx:36)。
- 原文：“普通模型(GPT-5.x / Claude Sonnet 4.x-5.x / Gemini 3.x / DeepSeek V4 等)”；“直接吐答案,快、便宜”。
- 问题：这是把产品代际与推理配置混为一谈。官方 GPT-5 本身就是支持 reasoning effort 的推理模型；Gemini 3 系列使用 thinking；DeepSeek 系列存在不同思考模式。不能以系列名判断是否直接生成、固定成本或延迟。
- 建议替换章节分类：“低推理预算 / 可关闭思考的模式”与“高推理预算模式”；例子注明具体模型标识及 reasoning/thinking 设置。成本和速度应由评测决定。
- 来源：[GPT-5 官方模型页](https://developers.openai.com/api/docs/models/gpt-5)、[Gemini 官方 thinking 文档](https://ai.google.dev/gemini-api/docs/generate-content/thinking)、[DeepSeek 官方更新记录](https://api-docs.deepseek.com/updates/)。页面未统一标日期，本次访问 2026-10-03。

### F06 — 工坊默认模型已弃用，不能仅将旧名字换成 GPT-5（P2，已证实）

- 位置：[p1a.jsx:101](/E:/code/github_project/auto-dev/agent-dev-guide/src/chapters/labs/p1a.jsx:101)、[p2a.jsx:95](/E:/code/github_project/auto-dev/agent-dev-guide/src/chapters/labs/p2a.jsx:95)；同类 CH.02/05/13/15 示例需联动处理。
- 原文：“lite_model = gpt-5-mini”“main_model = gpt-5”。
- 问题：官方模型页已标 Deprecated，2026-06-11 公告说明对应 2025 快照将于 2026-12-11 关闭。当前仍可用不等于适合“最新入门”默认配置。旧模型本身可作历史实验，因此不应机械替换所有历史叙述。
- 建议：将默认模型做成环境配置，示例给出可验证的当前选型并固定快照/测试日期；若暂保留 GPT-5，明确注明“旧版可复现实验配置，需在下线前迁移”。迁移时同步处理参数、响应格式、工具 API 和价格，而不只改模型字符串。
- 来源：[OpenAI 官方弃用列表](https://developers.openai.com/api/docs/deprecations)、[GPT-5 mini 官方模型页](https://developers.openai.com/api/docs/models/gpt-5-mini)。公告日期 2026-06-11，计划关闭日期 2026-12-11；本次访问 2026-10-03。

### F07 — GPT-5 默认模型搭配 temperature 会报错（P1，已证实；与主审计交叉）

- 位置：[Ch02.jsx:66](/E:/code/github_project/auto-dev/agent-dev-guide/src/chapters/Ch02.jsx:66)、[p1b.jsx:178](/E:/code/github_project/auto-dev/agent-dev-guide/src/chapters/labs/p1b.jsx:178)、[p1b.jsx:286](/E:/code/github_project/auto-dev/agent-dev-guide/src/chapters/labs/p1b.jsx:286)；P2/P3 工坊各调用也传了 temperature。
- 原文：“temperature=0.2”；“路由/工具调用必须 temperature=0(要确定性)”。
- 问题：OpenAI 官方兼容性说明明确写旧 gpt-5、gpt-5-mini、gpt-5-nano 请求包含 temperature 等字段会报错。温度 0 也不等于端到端确定性，不能作为所有供应商统一规则。
- 建议替换：“先按模型能力表校验可用参数；不支持 temperature 的模型省略该字段，使用支持的 reasoning/verbosity 设置，并以固定评测集衡量稳定性。”网关集中做模型能力适配，不向每个模型无条件透传采样参数。
- 来源：[OpenAI 官方 GPT-5.4 参数兼容说明](https://developers.openai.com/api/docs/guides/latest-model?model=gpt-5.4)。页面未标日期，本次访问 2026-10-03。

### F08 — SWE-bench Verified 时间线混用原版基准（P1，已证实）

- 位置：[Ch14.jsx:25](/E:/code/github_project/auto-dev/agent-dev-guide/src/chapters/Ch14.jsx:25)、[Ch14.jsx:27](/E:/code/github_project/auto-dev/agent-dev-guide/src/chapters/Ch14.jsx:27)、[Ch14.jsx:28](/E:/code/github_project/auto-dev/agent-dev-guide/src/chapters/Ch14.jsx:28)。
- 原文：列名“SWE-bench Verified 最佳”，其下“2023.10(基准发布) ~4%”“2024 中 ~20%(SWE-agent)”。
- 问题：Verified 于 2024-08-13 才发布，不能将 2023 原版 SWE-bench 的分数放入 Verified 的连续进度条。官方同篇报告明确指出同一 GPT-4o + Agentless，原版 16% 与 Verified 33.2% 不同；变更子集本身就会改变分数。
- 建议：拆成“原版 SWE-bench 历史”和“Verified（2024-08 起）”两张表；每行列出具体子集、系统/模型、日期与来源。2023/2024 中的具体百分数需重新回溯原始实验，不能仅把列名放宽后继续当可比增长曲线。
- 来源：[OpenAI 与 SWE-bench 作者发布 Verified 的官方说明](https://openai.com/index/introducing-swe-bench-verified/)。发布日期 2024-08-13，页面更新 2025-02-24；本次访问 2026-10-03。

## 与主审计交叉的代码/技术描述

### F09 — gpt-5-mini 参考价格写错（P1，已证实）

- 位置：[p1b.jsx:67](/E:/code/github_project/auto-dev/agent-dev-guide/src/chapters/labs/p1b.jsx:67)。
- 原文：“gpt-5-mini: (0.20, 0.80)”美元/百万 token。
- 官方标准文本价为输入 $0.25、输出 $2.00。原价会显著低估输出成本，进而影响预算熔断；同表 GPT-5 $1.25/$10 无此价格差错。
- 建议：修正价格，并注明标准/缓存/Batch 等计费口径与核验日期；未知模型不能默认 $0 成本。
- 来源：[GPT-5 mini 官方模型页](https://developers.openai.com/api/docs/models/gpt-5-mini)。页面未标日期，本次访问 2026-10-03。

### F10 — prompt 中粘贴 schema 被写成原生强约束（P1，已证实）

- 位置：[p1b.jsx:101](/E:/code/github_project/auto-dev/agent-dev-guide/src/chapters/labs/p1b.jsx:101)、[p1b.jsx:103](/E:/code/github_project/auto-dev/agent-dev-guide/src/chapters/labs/p1b.jsx:103)。
- 原文：“模型侧 schema 约束管大格式”，代码仅把 JSON Schema 拼到 system prompt。
- 问题：当前代码是提示词约定 + 本地 Pydantic 校验，没有启用 API 原生 Structured Outputs。原生严格结构化输出需要相应的 response_format / text.format / SDK parse 等接口。二者不能以“模型侧强约束”混称。
- 建议：支持的供应商使用原生结构化输出；不支持时明确称为“提示词约定 + 解析/校验重试的退化路径”。
- 来源：[OpenAI 官方 Structured Outputs](https://developers.openai.com/api/docs/guides/structured-outputs)。页面未标日期，本次访问 2026-10-03。

### F11 — “本书所有代码可直接切换”兼容性承诺过强（P2，已证实）

- 位置：[Ch08.jsx:64](/E:/code/github_project/auto-dev/agent-dev-guide/src/chapters/Ch08.jsx:64)、[overview.jsx:55](/E:/code/github_project/auto-dev/agent-dev-guide/src/chapters/labs/overview.jsx:55)、[p1a.jsx:103](/E:/code/github_project/auto-dev/agent-dev-guide/src/chapters/labs/p1a.jsx:103)。
- 原文：“本书所有代码可直接切换”“任一家大模型 API Key……均可”“换厂商只改这里 + key”。
- 问题：Chat Completions 的兼容不代表模型 ID、采样参数、严格 schema、嵌入 API、思考字段、工具语义均兼容。官方 Anthropic 兼容层明确忽略 response_format 和 strict；工坊还硬编码 text-embedding-3-small，不能换一个聊天端点就保证完整检索项目可用。
- 建议替换：“可复用 OpenAI SDK 接入部分兼容聊天端点；切换供应商须配置模型名，并校验采样、思考、工具、结构化输出与嵌入能力，必要时使用厂商原生 SDK。”
- 来源：[Anthropic 官方 OpenAI SDK 兼容表](https://platform.claude.com/docs/en/cli-sdks-libraries/libraries/openai-sdk)。页面未标日期，本次访问 2026-10-03。

### F12 — AGENTS.md 通用支持应补充版本/设置条件（P3，限定，不判为过时错误）

- 位置：[Ch14.jsx:47](/E:/code/github_project/auto-dev/agent-dev-guide/src/chapters/Ch14.jsx:47)。
- 原文：“Codex/Cursor/Claude 系都认”“CLAUDE.md……只放各家增量”。
- 结论：截至本次官方文档，Claude Code 已通过内置 agents-md 支持直接读取 AGENTS.md，因此不能按旧印象批评其不支持。但官方写明旧于 v2.1.277、插件禁用、某些升级后首次会话及旧版本特殊环境有差异；与 CLAUDE.md 同存时也需看 Project instructions 设置。
- 建议限定：“AGENTS.md 可作为跨工具共享指令文件；Claude Code 等工具的自动加载行为依赖版本与设置，必要时用 CLAUDE.md 的 @AGENTS.md 导入共享规则。”
- 来源：[Claude Code 官方记忆文档](https://code.claude.com/docs/en/memory)。页面未标日期，本次访问 2026-10-03。

## 最新版本核验：不应凭旧知识认定为虚构

正文及 WORKLOG 出现的 2026 新版本多数确有第一方依据。模型更新应区分“版本存在”“具体参数/许可正确”“最新调用名称”三件事。

| 核验项 | 本次第一方证据 | 结论/边界 | 来源日期 |
| --- | --- | --- | --- |
| DeepSeek Harness 存在且官方开源 | [DeepSeek 官方介绍](https://www.deepseek.com/en/harness/)；[官方仓库](https://github.com/deepseek-ai/deepseek-harness) | 名称和插件化定位成立；语言错误见 F02；公开预览应按生产成熟度另行评估 | 页面未标日期，访问 2026-10-03 |
| V4-Pro-0813 更新 | [DeepSeek 官方更新记录](https://api-docs.deepseek.com/updates/) | 8 月更新成立；已遗漏 9 月 V4.1-Flash 变化，见 F04 | 2026-08-13 / 2026-09-10 |
| Kimi K3 开放权重、2.8T MoE、视觉、1M 上下文 | [Moonshot 官方模型卡](https://huggingface.co/moonshotai/Kimi-K3) | 模型卡列出上述规格；许可为 Kimi K3 License，不能默认为通用 MIT/无限制开源许可 | 评测快照标注截至 2026-07-23，访问 2026-10-03 |
| GLM-5.2 存在 | [Z.ai 官方发布页](https://z.ai/blog/glm-5.2) | 搜索可见官方发布内容含 1M 配置和 Coding Plan；网页动态正文未完整返回，744B 等细项本轮不据摘要判定 | 搜索显示约 3 个月前，未取到绝对发布时间，访问 2026-10-03 |
| Qwen3.8 存在 | [Qwen 官方 Omni-Flash 发布页](https://qwen.ai/blog?id=qwen3.8-omni-flash)、[Qwen 官方 LiveTranslate 页](https://qwen.ai/blog?id=qwen3.8-livetranslate) | “3.8 存在”有官方支持；不能用“3.8”概括所有变体为同一规格或同一迭代链。正文“3.6-Plus→3.8”细节需另查模型系列发布清单 | 搜索显示约 2 周前，未取到绝对发布时间，访问 2026-10-03 |
| Claude Opus / Sonnet 5.5 | [Anthropic 官方 Opus 5.5](https://www.anthropic.com/claude-opus-5-5)、[官方 Sonnet 5.5](https://www.anthropic.com/claude-sonnet-5-5) | 已有官方来源，不必仅靠 WORKLOG 所称第三方；正文大代际表述可以保留，但应解决推理分类问题 | 2026-09-22 / 2026-09-28 |
| 最新 OpenAI 代际不止 GPT-5.x | [OpenAI 官方更新日志](https://developers.openai.com/api/docs/changelog) | 2026-09-29 已发布 GPT-6.1 Sol；不要把 GPT-5.x 当截至 10 月的最新全系。历史论文/实验的 GPT-5 名称应保留 | 2026-09-29 |

CH.19、RoadmapPage 未发现必须因模型版本而直接更改的具体句子；其排名、费用、前沿论文日期及产业趋势结论由其他专项审计核验。诸如“生产案例最多”“上手最快”“最强”“现实最优解”属于缺乏口径的比较性断言，应改成可观察的能力/适用场景，并避免用 Star 数推出质量或生产成熟度。
