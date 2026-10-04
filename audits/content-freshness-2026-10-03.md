> 修订前审阅快照：本轮已于 2026-10-03 更新正文，详见 [更新验收记录](update-completion-2026-10-03.md)。原句与行号保留用于追溯，不代表当前正文；GLM 5.3 的补充核查见 [来源表](update-sources-2026-10-03.md)。

# 全篇时效性与技术表达审阅

核查日期：2026-10-03（Asia/Shanghai）。范围：19 章正文及清单、主线图解、术语/FAQ、路线图、论文导读、项目页、三个实战项目、首页、README 与 WORKLOG。只新增审阅报告，未改正文。

结论：核心知识组织仍可保留，但全文不能直接标为“已对齐 2026-10 最新情况”。存在协议版本滞后、模型更名后参数未迁移、框架维护状态变化、实验数据被泛化、以及实战教程把目标指标写成实测结果等问题。修订时应同时更新文字、代码、图解和清单，不能只替换模型名称。

本文把问题分成：**P1 应优先修正**（影响跟做、选型或安全理解）、**P2 应修订或补条件**（历史数据冒充当前结论、技术泛化、来源不足）、**P3 一致性与维护问题**。来源未标发布日期时，只表示本次访问到的官方页面现状；不据此补造发布日期。

## 最需要处理的内容

| 范围 | 主要问题 | 修订方向与依据 |
| --- | --- | --- |
| 模型与 API | GPT-5/mini 被当作当前默认型号，示例还无条件传入 temperature；mini 价格写成 $0.20/$0.80 | 标注弃用与计划下线日期，按模型能力调整参数；mini 普通输入/输出应为 $0.25/$2.00 每百万 token。[弃用公告](https://developers.openai.com/api/docs/deprecations)、[模型价格](https://developers.openai.com/api/docs/models/gpt-5-mini)。新模型不应只改名称后直接套旧端点。 |
| 国内模型 | “截至 2026-10”速览只写 DeepSeek 4 月发布、8 月更新 | 补充 9 月的 V4.1-Flash 与旧 Flash 退休情况，同时保留仍在服务的 V4-Pro。[官方更新记录](https://api-docs.deepseek.com/updates/)。Kimi K3、GLM-5.2、Qwen3.8 等名称已有官方依据，不能按旧知识直接判错；未完整取到的一手规格需继续保留核验边界。 |
| 框架选型 | AutoGen 未注明维护模式；DeepSeek Harness 语言写成 Py；ADK 只列 Py/Java | 更新维护状态与语言栈，避免读者按旧信息选型。[AutoGen](https://github.com/microsoft/autogen)、[Harness](https://github.com/deepseek-ai/deepseek-harness)、[ADK](https://adk.dev/)。 |
| MCP | 示例安装不锁版本，却使用 v1 FastMCP 导入；正文缺少 2026-07-28 的无状态核心；Sampling 时间线与状态有误 | 官方 SDK v2 使用 MCPServer，旧示例需迁移或锁 v1；按当前规范更新请求、状态与废弃能力说明。[SDK 迁移](https://py.sdk.modelcontextprotocol.io/migration/)、[规范变更](https://modelcontextprotocol.io/specification/2026-07-28/changelog)。弃用不等于立刻删除，应说明过渡窗口。 |
| A2A 与时间线 | Agent Card 仍用旧 agent.json 路径；UCP 写成 2025 年发布 | Card 当前路径为 `/.well-known/agent-card.json`；UCP 为 2026-01 发布。详细来源、治理归属及 AP2/x402 日期见协议专项。 |
| 基准与统计 | Verified 表中混入 2023 原版分数；WebArena/OSWorld 合成一条增长曲线；论文收益写成通用倍率 | 分开版本、任务、评测预算、样本和比较基线；Verified 于 2024-08 才发布。[Verified 首发](https://openai.com/index/introducing-swe-bench-verified/)。旧实验数字可保留，须标时间与条件。 |
| 实战技术与安全 | 提示词 JSON 被称为原生 Schema 约束，URL 可访问率被称为引用精度，分隔标记被称为物理隔离，规则被称为 100% 召回 | 按实际代码提供的保证重写；目标指标与实测结果分开。安全章同步 OWASP 当前版本，并准确区分令牌授权边界；机制问题见下文 F03–F07，安全来源见协议专项。 |
| 页面与资源快照 | 首页 72 篇、README 70 份 PDF/356MB，与当前数据不符；项目页把静态快照说成实时活跃列表 | 本地数据为 81 篇论文、2 份指南、68 个项目；83 份被引用 PDF，磁盘 84 份约 390.25MiB。统一自动计数、采集日期和归档项目口径，见 F22–F24。 |

## 模型、框架与协议专项

以下两份逐条报告包含原句、文件行号、替换建议和官方来源，属于本次全篇审阅的组成部分：

- [模型与框架专项](/E:/code/github_project/auto-dev/agent-dev-guide/audits/models-frameworks-2026-10-03.md)
- [协议、沙箱、Computer Use 与安全专项](/E:/code/github_project/auto-dev/agent-dev-guide/audits/protocols-security-2026-10-03.md)

## 其余正文与实战表达问题

### F01 · P1：模型参数不能跟着模型名机械迁移

位置：[Ch02.jsx:65](/E:/code/github_project/auto-dev/agent-dev-guide/src/chapters/Ch02.jsx:65)、[p1b.jsx:178](/E:/code/github_project/auto-dev/agent-dev-guide/src/chapters/labs/p1b.jsx:178)，以及所有复用 `chat/chat_json` 的实战调用。

原文：`model="gpt-5-mini", temperature=0.2, max_tokens=1024`；实战多处要求 `temperature=0`。

问题：原版 GPT-5/mini 的参数支持与之前的 GPT-4o 不同；只更名会导致不支持的采样参数错误。输出预算参数也应按 Chat Completions/Responses 区分。不能把“温度设零”写成所有 Agent 的通用要求或确定性保证。

建议：在配置中声明 provider、endpoint、model/snapshot 与能力；网关只发送该组合支持的参数。对保留的 GPT-5 示例删除不支持的采样参数并核对输出预算字段；若迁移到新模型，应连工具调用端点一起迁移。文字改为“支持采样参数的模型可从低温度起步，以评测确认稳定性”。参见 [OpenAI 历代模型兼容说明](https://developers.openai.com/api/docs/guides/latest-model?model=gpt-5.4)。模型状态与迁移方向详见专项报告。

### F02 · P1：小模型价格表错误，影响三项目的预算与成本叙事

位置：[p1b.jsx:65](/E:/code/github_project/auto-dev/agent-dev-guide/src/chapters/labs/p1b.jsx:65)，SCOUT/SENTINEL 复用此网关。

原文：`"gpt-5-mini": (0.20, 0.80)`，单位为美元/百万 token。

核查：[官方 GPT-5 Mini 页面](https://developers.openai.com/api/docs/models/gpt-5-mini)列普通输入 $0.25、缓存输入 $0.025、输出 $2.00。此处连非缓存基价都不符；旧价会低估输出成本，并使预算熔断晚于真实费用。`PRICES.get(model, (0, 0))` 还会把换模型后的未知价格记成免费。

建议：使用带核查日期的配置价格；未知模型报价应报错或明确标为未知。把缓存输入、普通输入、输出分开核算；重新计算教程中单会话/报告/PR成本，标明假设和样本。

### F03 · P1：提示词要求 JSON 不等于 API 原生 Schema 约束

位置：[p1b.jsx:98](/E:/code/github_project/auto-dev/agent-dev-guide/src/chapters/labs/p1b.jsx:98)、[p1a.jsx:128](/E:/code/github_project/auto-dev/agent-dev-guide/src/chapters/labs/p1a.jsx:128)。

原文：“附 JSON Schema 让模型约束生成”“模型侧 schema 约束管大格式”。实际 `chat_json` 只是将 schema 写进 system 文本，再用 Pydantic 校验与重试，未启用 `response_format`、`text.format` 或 SDK 的结构化解析接口。

建议：现有实现准确写成“提示词引导 JSON + 本地校验 + 失败重试”；要宣称约束生成，应实际接入支持的严格结构化输出，并处理拒绝、截断与支持的 schema 子集。[OpenAI Structured Outputs](https://developers.openai.com/api/docs/guides/structured-outputs)区分了提示、JSON mode 与 Schema adherence。

### F04 · P1：URL 可访问率被误称为“引用精度”

位置：[p2c.jsx:239](/E:/code/github_project/auto-dev/agent-dev-guide/src/chapters/labs/p2c.jsx:239)、[p2c.jsx:272](/E:/code/github_project/auto-dev/agent-dev-guide/src/chapters/labs/p2c.jsx:272)、[p2c.jsx:323](/E:/code/github_project/auto-dev/agent-dev-guide/src/chapters/labs/p2c.jsx:323)。

原文：“引用精度……逐条访问引用链接、核对摘录”；实际 `citation_precision()` 只计算能抓到正文的 URL 比例，没有核对 claim 或 quote。

建议：把当前指标改名为“来源可访问率”。引用支持率另算：逐条检查“结论→引用→原文证据”，并抽样人工校准；将“98%、幻觉引用归零”移到目标或待实测指标。链接存在并不证明结论得到支持。可参考 [Anthropic 研究系统的引用准确性评测](https://www.anthropic.com/engineering/multi-agent-research-system)。此项依据本地函数直接判定。

### F05 · P1：安全规则“确定性”不等于 100% 召回或零误报

位置：[p3a.jsx:270](/E:/code/github_project/auto-dev/agent-dev-guide/src/chapters/labs/p3a.jsx:270)、[labs/diag.jsx:379](/E:/code/github_project/auto-dev/agent-dev-guide/src/chapters/labs/diag.jsx:379)、[p3c.jsx:343](/E:/code/github_project/auto-dev/agent-dev-guide/src/chapters/labs/p3c.jsx:343)。

原文：“正则的召回是 100% 确定的”“100% 召回、零误报”。

问题：规则输出可重复，但只覆盖定义过的模式；未知密钥格式、编码、拆分等可漏报，测试字符串/示例值可误报。建议改为“规则层提供可重复的匹配判断；在明确标注的测试集上测召回与精度，持续扩充模式”。此为逻辑与实现边界问题，不需要把规则技术换新。

### F06 · P1：数据区标记不是“物理隔离”，行号合法也不能证明未被注入

位置：[p3b.jsx:12](/E:/code/github_project/auto-dev/agent-dev-guide/src/chapters/labs/p3b.jsx:12)、[p3c.jsx:340](/E:/code/github_project/auto-dev/agent-dev-guide/src/chapters/labs/p3c.jsx:340)。

原文：“数据与指令物理隔离”；做法为把不可信内容放进带标记的数据区，在 system 提示中声明不执行。

建议：改为“在消息与标记层区分指令和不可信数据，降低混淆风险”；明确这不是权限、进程或模型级隔离。行号校验保证评论位置有效，攻击者仍可诱导模型生成挂在合法行号上的虚假结论。补充 runtime 最小权限、证据校验和对抗评测；具体最新安全资料见专项报告。

### F07 · P1：实战目标数字被写成已经取得的项目成果

位置：[p1a.jsx:14](/E:/code/github_project/auto-dev/agent-dev-guide/src/chapters/labs/p1a.jsx:14)、[p1c.jsx:482](/E:/code/github_project/auto-dev/agent-dev-guide/src/chapters/labs/p1c.jsx:482)、[p2a.jsx:14](/E:/code/github_project/auto-dev/agent-dev-guide/src/chapters/labs/p2a.jsx:14)、[p2c.jsx:322](/E:/code/github_project/auto-dev/agent-dev-guide/src/chapters/labs/p2c.jsx:322)、[p3a.jsx:14](/E:/code/github_project/auto-dev/agent-dev-guide/src/chapters/labs/p3a.jsx:14)、[p3c.jsx:329](/E:/code/github_project/auto-dev/agent-dev-guide/src/chapters/labs/p3c.jsx:329)。

原文：自助解决率58%、幻觉率<1%、引用精度98%、回放召回90%+、评论有效率85%、人工审查耗时下降40%等，后接“可以经得起面试官任何深挖”“简历可以这么写”。

问题：仓库主要是教程与示例代码，未提供对应实测报告、样本量、运行配置、对照组或生产数据；部分指标实现本身不测所声称的质量。不能从 KPI 目标推导已经达标。

建议：统一标为“验收目标”或“简历句式模板，数字填写自己的实测结果”，采用 `[样本量] / [模型快照] / [测得指标]` 占位。每月抽检50条也不能自动证明总体幻觉率低于1%；应提供统计不确定性和更充分样本。此项为证据缺失判断，并非断言指标永远无法实现。

### F08 · P2：供应商兼容性被写得过于无条件

位置：[Ch02.jsx:76](/E:/code/github_project/auto-dev/agent-dev-guide/src/chapters/Ch02.jsx:76)、[overview.jsx:48](/E:/code/github_project/auto-dev/agent-dev-guide/src/chapters/labs/overview.jsx:48)、[Ch08.jsx:68](/E:/code/github_project/auto-dev/agent-dev-guide/src/chapters/Ch08.jsx:68)。

原文：“所有主流 SDK……四种角色”“一套 SDK 通吃各家模型”“本书所有代码可直接切换”。

建议：改为“本书以 OpenAI 兼容接口举例；切换 provider 需核对模型名、采样参数、消息语义、工具调用、结构化输出、缓存、嵌入端点与计费”。OpenAI 有 developer 角色与 Responses item；Claude 原生工具结果是内容块，兼容层还有功能限制。特别是 ATLAS 的 `text-embedding-3-small` 不能仅换 Claude 的聊天端点就继续使用。[Claude 官方兼容说明](https://platform.claude.com/docs/en/cli-sdks-libraries/libraries/openai-sdk)明确兼容层的使用范围与限制。

### F09 · P2：“普通/推理模型”按品牌版本二分已经不足

位置：[Ch02.jsx:36](/E:/code/github_project/auto-dev/agent-dev-guide/src/chapters/Ch02.jsx:36)、[GlossaryPage.jsx:33](/E:/code/github_project/auto-dev/agent-dev-guide/src/chapters/GlossaryPage.jsx:33)。

原文：GPT-5.x、Sonnet 等列作普通模型，另一卡片列同家族的 Thinking；“贵5–20倍、慢10倍+”。

建议：按“模型能力 + 本次推理模式/预算”解释，说明同家族可有不同推理控制，支持情况依模型而异。保留轻重任务路由思路，删除无条件倍率，提供固定模型、任务、token量的对照示例。[OpenAI reasoning 指南](https://developers.openai.com/api/docs/guides/reasoning-best-practices)与[Claude thinking/兼容说明](https://platform.claude.com/docs/en/cli-sdks-libraries/libraries/openai-sdk)均展示了模式差异。版本滞后见专项。

### F10 · P2：CoT 历史技术应补充现代推理模型的提示方式

位置：[Ch11.jsx:17](/E:/code/github_project/auto-dev/agent-dev-guide/src/chapters/Ch11.jsx:17)。

原文：“开放问题就一句话……请先分析再回答”“所有推理模型的灵魂”。

建议：保留2022年CoT作为历史方法，增加“已具备内部推理能力的模型通常不需要额外要求逐步思考；优先明确目标、约束与验收标准，验证实际收益”。[OpenAI 官方建议](https://developers.openai.com/api/docs/guides/reasoning-best-practices)指出此类提示可能无益甚至干扰；不能将所有推理机制归成同一种可见CoT。

### F11 · P2：METR 的时间视野不能无日期、无可靠性阈值地引用

位置：[Ch03.jsx:77](/E:/code/github_project/auto-dev/agent-dev-guide/src/chapters/Ch03.jsx:77)、[PapersPage.jsx:68](/E:/code/github_project/auto-dev/agent-dev-guide/src/chapters/PapersPage.jsx:68)、FAQ稳定性条目。

原文：“目前约在分钟到小时级”“每~7个月翻倍”，随后类比2小时的Agent循环。

建议：改为“METR在指定任务集上报告50%/80%成功率对应的人类专家任务时长；2025研究的历史趋势约7个月翻倍，最新测量应按模型和评测版本引用”。不要将人类任务时长等同Agent持续运行时间，也不要将50%成功率称为普遍可靠交付。[METR 方法页](https://metr.org/time-horizons/)本次显示更新时间2026-05-08，区分TH1.0/1.1和两种可靠性阈值；正文应引用具体测量，避免笼统“目前”。

### F12 · P2：LangChain调查的日期与样本范围丢失

位置：[Ch01.jsx:80](/E:/code/github_project/auto-dev/agent-dev-guide/src/chapters/Ch01.jsx:80)。

原文：“2026产业现状……57%的组织已经……要不要做Agent的讨论已经结束”。

建议：改为“LangChain在2025-11-18至12-02收集的1340份公开问卷中，57.3%的受访者报告已有Agent生产部署；该样本不代表全部组织”。[官方方法说明](https://www.langchain.com/state-of-agent-engineering)显示样本科技行业占63%、小于100人组织占49%；不能外推为全球企业采用率或采购结论。

### F13 · P2：多Agent的15倍数字缺少比较基线

位置：[Ch12.jsx:32](/E:/code/github_project/auto-dev/agent-dev-guide/src/chapters/Ch12.jsx:32)、[GlossaryPage.jsx:49](/E:/code/github_project/auto-dev/agent-dev-guide/src/chapters/GlossaryPage.jsx:49)、[labs/registry.js:57](/E:/code/github_project/auto-dev/agent-dev-guide/src/chapters/labs/registry.js:57)、[p2a.jsx:54](/E:/code/github_project/auto-dev/agent-dev-guide/src/chapters/labs/p2a.jsx:54)。

核查：Anthropic报告的约15倍是相对普通聊天交互，单Agent约4倍也是相对聊天；90.2%为其特定内部研究评测上的提升。建议把“单agent对话”明确写成“普通聊天交互”，删除泛称“多Agent就是15倍”；保留其2025历史案例，补模型组合与内部评测范围。[Anthropic 原文](https://www.anthropic.com/engineering/multi-agent-research-system)。

### F14 · P2：180组实验属于论文旧版本，当前链接已指向修订版

位置：[Ch12.jsx:32](/E:/code/github_project/auto-dev/agent-dev-guide/src/chapters/Ch12.jsx:32)、[Ch19.jsx:32](/E:/code/github_project/auto-dev/agent-dev-guide/src/chapters/Ch19.jsx:32)、[PapersPage.jsx:61](/E:/code/github_project/auto-dev/agent-dev-guide/src/chapters/PapersPage.jsx:61)。

核查：2025-12-09的[v1](https://arxiv.org/abs/2512.08296v1)为180种配置/4个基准；2026-04-08修订的[v3](https://arxiv.org/abs/2512.08296)为260种配置/6个基准，部分拟合数据与结果也变更。

建议：如果讲历史，显式写“2025初版”并链接v1；如果做最新导读，改为v3的260种配置/6个基准。不要只改组数而混用旧版定量结论。“首个/首次”也宜限定为该论文提出的框架，避免未经文献穷尽核查的优先权断言。

### F15 · P2：Mem0准确率和延迟数字来自不同基线

位置：[Ch09.jsx:40](/E:/code/github_project/auto-dev/agent-dev-guide/src/chapters/Ch09.jsx:40)。

原文：“比OpenAI内置记忆高~26%，延迟降91%”。

建议：写为“2025年Mem0论文在LoCoMo上的LLM-as-judge指标相对其OpenAI记忆基线改善约26%；相对全文上下文方法，p95延迟降低约91%”。不能把两项都理解为相对OpenAI，也不能视为2026线上产品的普遍效果。[论文摘要](https://arxiv.org/abs/2504.19413)。

### F16 · P2：R1与R1-Zero的训练方法混淆

位置：[PapersPage.jsx:64](/E:/code/github_project/auto-dev/agent-dev-guide/src/chapters/PapersPage.jsx:64)。

原文：“DeepSeek-R1：纯RL激励出推理能力”。

建议：改为“R1-Zero展示无需前置SFT的RL推理涌现；R1采用冷启动数据和多阶段训练改善可读性与表现”。这是经典论文的事实修正，不是因新模型发布而删旧论文。[DeepSeek-R1原论文](https://arxiv.org/abs/2501.12948)。

### F17 · P2：作者身份写错

位置：[Ch11.jsx:59](/E:/code/github_project/auto-dev/agent-dev-guide/src/chapters/Ch11.jsx:59)。

原文：“Yao(RWKV/ReAct作者)”。

建议：改为“姚顺雨（Shunyu Yao，ReAct/Tree of Thoughts等研究作者）”。[作者原文](https://ysymyth.github.io/The-Second-Half/)、[ReAct作者表](https://arxiv.org/abs/2210.03629)与[RWKV作者表](https://arxiv.org/abs/2305.13048)可核对；RWKV不应归到他名下。

### F18 · P2：Promptfoo示例混淆了JSON检查与工具调用检查

位置：[Ch15.jsx:25](/E:/code/github_project/auto-dev/agent-dev-guide/src/chapters/Ch15.jsx:25)。

原文：`contains-json`配`value: { tool: refund_order }`，以及`calls.length === 0`。

建议：`contains-json`仅验证可解析JSON（可配JSON Schema），不是证明runtime发起了工具调用；代码中也没有定义`calls`。应先配置工具/provider或完整Agent适配器，再根据实际`output`/轨迹断言名称、参数和无工具路径。[官方JS断言](https://www.promptfoo.dev/docs/configuration/expected-outputs/javascript/)、[工具调用指南](https://www.promptfoo.dev/docs/configuration/tools/)。保留为教学伪配置时，应明确标注不能直接运行。

### F19 · P2：缓存计费被简化成普遍1/10，缺少模型与写入成本

位置：[Ch04.jsx:43](/E:/code/github_project/auto-dev/agent-dev-guide/src/chapters/Ch04.jsx:43)、[Ch17.jsx:18](/E:/code/github_project/auto-dev/agent-dev-guide/src/chapters/Ch17.jsx:18)、[Ch17.jsx:85](/E:/code/github_project/auto-dev/agent-dev-guide/src/chapters/Ch17.jsx:85)。

原文：“缓存命中按≈1/10计价”“头部成本立省50–90%”“唯一零质量代价优化”。

建议：把1/10明确标成计算器示例假设，增加可配置缓存读/写单价、有效期与资格条件，分清缓存输入折扣与整任务折扣。Claude有缓存写入计费，OpenAI当前机制也应按具体模型代际核对；缓存高命中不保证整任务节省90%。[Claude缓存文档](https://platform.claude.com/docs/en/build-with-claude/prompt-caching)、[OpenAI缓存文档](https://developers.openai.com/api/docs/guides/prompt-caching)。

### F20 · P2：部分工程经验被写成普适定律

位置：[Ch10.jsx:21](/E:/code/github_project/auto-dev/agent-dev-guide/src/chapters/Ch10.jsx:21)、[Ch10.jsx:41](/E:/code/github_project/auto-dev/agent-dev-guide/src/chapters/Ch10.jsx:41)、[Ch12.jsx:39](/E:/code/github_project/auto-dev/agent-dev-guide/src/chapters/Ch12.jsx:39)、[GlossaryPage.jsx:52](/E:/code/github_project/auto-dev/agent-dev-guide/src/chapters/GlossaryPage.jsx:52)。

原文：“纯向量对专有名词/编号无能为力”“速度线性慢”“Orchestrator-Worker生产首选”“产出是不会用的3–10倍”。

建议：分别改为“精确匹配可能不足，可结合关键词检索”“长输入增加预填充计算，实际延迟受架构/缓存/服务影响”“适合可并行分解、集中校验的任务”“提升因任务和团队而异，应测质量与交付效率”。未经数据支持不保留通用倍率、最高/最多/最强排名。多Agent论文当前结果也强调[架构与任务匹配](https://arxiv.org/abs/2512.08296)，不支持不分场景的首选结论。

### F21 · P2：把持久记忆写成真相之源，需要注明范围

位置：[Ch04.jsx:80](/E:/code/github_project/auto-dev/agent-dev-guide/src/chapters/Ch04.jsx:80)。

说明：这句话确有2026论文依据，**不能判为凭空编造或简单过时**。但“新前沿”表示产品差异化转向记忆写入，不表示压缩不用了；同论文仍统计7/11系统使用阈值压缩。记忆还可能错误或陈旧，订单、余额等事实应从授权业务系统核验。

建议：“在该11系统样本中，持久记忆成为新的差异化方向，并与压缩互补；记忆用于跨会话状态，事实性数据保留来源、时间和核验路径”。[论文§9.5–9.6](https://arxiv.org/html/2609.00006v1)。

## 页面、数量与数据口径

### F22 · P3：首页、README、工作日志的数量不同步

位置：[App.jsx:195](/E:/code/github_project/auto-dev/agent-dev-guide/src/App.jsx:195)、[README.md:11](/E:/code/github_project/auto-dev/agent-dev-guide/README.md:11)、[README.md:30](/E:/code/github_project/auto-dev/agent-dev-guide/README.md:30)、WORKLOG的终态核验。

本地核验结果：81篇唯一论文、2份指南、68个项目；所有引用PDF在位；磁盘共84份PDF、约390.25MiB，其中 `public/papers/rag/2504.03160.pdf` 为未被当前条目引用的额外副本。首页仍写72篇；README仍写13图（首页/工坊合计宣称21图）、70份PDF与356MB；WORKLOG终态还写68论文/63项目。

建议：页面论文/项目数量从数据文件读取；README同步当前资源规模，区分“83份被引用PDF”与磁盘84份文件；历史日志保留，并在末尾补当前快照，不能将旧验收写成现在的数量。

### F23 · P2：项目页“实时、高星活跃”与静态数据/归档条目矛盾

位置：[ProjectsPage.jsx:45](/E:/code/github_project/auto-dev/agent-dev-guide/src/chapters/ProjectsPage.jsx:45)、[projects.json:330](/E:/code/github_project/auto-dev/agent-dev-guide/src/data/projects.json:330)、正文各处硬编码Star数。

核查：网站读取静态JSON，不在浏览时请求GitHub；`fetchedAt`为`2026-10-02T18:58:17.291Z`（北京时间2026-10-03 02:58）。页面用UTC字符串截断，显示2026-10-02；新增条目的push时间甚至晚于顶层抓取时间，说明后续合并没有同步快照元信息。数据已标Flowise为archived；[仓库页](https://github.com/FlowiseAI/Flowise)确认2026-08-13归档。

建议：“来自GitHub API的定期采集快照”，按明确时区显示日期；增量合并记录各条采集时间。归档项目列“历史学习参考”，更新“只收录活跃”口径。正文Star数用同一快照或注明日期，无需为了所谓最新而每次手改。

### F24 · P3：现有检查通过不代表事实审阅通过

位置：[audit-freshness.mjs:7](/E:/code/github_project/auto-dev/agent-dev-guide/tools/audit-freshness.mjs:7)、[check-data.mjs](/E:/code/github_project/auto-dev/agent-dev-guide/tools/check-data.mjs)、[final-check.mjs](/E:/code/github_project/auto-dev/agent-dev-guide/tools/final-check.mjs)。

核验：`node tools/check-data.mjs`与`node tools/final-check.mjs`均通过；它们主要检查格式/数量下限/文件在位。时效扫描仅覆盖chapters根目录、部分固定模型名和年份，不覆盖labs、图解、README或事实来源。建议将“元数据/文件在位核验”与“事实正确/当前有效核验”分开记录；版本升级建立包含来源日期、规格版本与代码参数的审核条目。

## 哪些内容应该保留

- ReAct 2022/2023、Function Calling 2023-06、MCP首发2024-11、MemGPT 2023、RAG 2020、CoT/ToT/Reflexion等历史节点本身不会因年份旧而失效。现代使用方式补注即可。
- GPT-3、DeepSeek-R1、Kimi K2等经典论文应保留，不应改成新版模型论文来制造“最新”外观。
- 2026国内模型、Harness研究、个人Agent案例等已有官方或作者来源；需要精确补最新迭代与条件，不能一概认定为未来事件或虚构。
- Loop、上下文管理、受控工作流、checkpoint、最小权限、结果/轨迹评测、外部反馈反思等核心思路仍有价值；问题集中在版本绑定与无条件结论。
- 路线图本身可以保留；框架学习建议应跟随维护状态与语言支持同步调整。19章与各支线均已纳入本次审阅，但本文不宣称运行过所有教材示例或逐篇重现81篇论文实验。

## 建议修订顺序

1. 先更新协议、安全标准、废弃模型与框架维护状态，并修正会影响跟做的API参数/端点与价格。
2. 修正实战“约束生成、引用精度、物理隔离、100%召回”等机制描述；把未提供实测证据的数字改为目标或模板。
3. 给调研/基准/论文结果补数据时间、版本、模型、比较基线，统一正文、图解、清单、FAQ。
4. 同步首页/README资源规模，改成自动读取数量；为版本/价格/Star快照补独立核查日期。
