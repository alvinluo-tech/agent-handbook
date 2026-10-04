# 全篇更新的官方来源与适用范围

核查快照：2026-10-03，Asia/Shanghai。模型、价格与产品状态为该日可读资料，不承诺后续不变；历史论文保留原始模型与年份。正文中的目标 KPI、示例 Trace 和简历句式均不作为仓库实测结果。

## 模型与接口

| 更新对象 | 核对结果与边界 | 官方来源 |
| --- | --- | --- |
| GLM-5.3 | 旗舰 API ID `glm-5.3`；文本输入，1M 上下文、128K 最大输出；始终启用推理，effort 为 low/high/max。不能沿用 disabled。旗舰权重采用自定义许可，Flash 的模态、参数规模与 MIT 许可另列 | [旗舰指南](https://docs.z.ai/guides/llm/glm-5.3)、[GLM-5 官方仓库](https://github.com/zai-org/GLM-5)、[Flash 模型卡](https://huggingface.co/zai-org/GLM-5.3-Flash) |
| OpenAI 默认模型 | 当前教学默认 `gpt-6.1-sol`，轻量档 `gpt-6-luna`；工具和推理示例使用 Responses，并省略不适用的 temperature/top_p。原 GPT-5/mini 的历史实验不改名 | [Sol 模型](https://developers.openai.com/api/docs/models/gpt-6.1-sol)、[Luna 模型](https://developers.openai.com/api/docs/models/gpt-6-luna)、[弃用列表](https://developers.openai.com/api/docs/deprecations) |
| 标准费率示例 | 每百万 token 美元价按普通输入/缓存读取/缓存写入/输出分别列出：Sol 2/.1/2.5/10，Luna .1/.01/.125/.5。输入包括缓存子项；输出包括推理子项，不重复收费。换供应商、端点、服务档需重新配价 | [价格](https://developers.openai.com/api/docs/pricing)、[缓存与 usage](https://developers.openai.com/api/docs/guides/prompt-caching) |
| 结构化输出 | SDK Responses parse 使用 Pydantic text_format 生成格式约束，并处理拒绝、未完成响应与业务校验；合法结构不保证事实正确 | [官方结构化输出](https://developers.openai.com/api/docs/guides/structured-outputs) |
| Claude | 5.5 发布状态单独标注；接入须按原生思考、工具、缓存规则适配 | [Opus 5.5](https://www.anthropic.com/claude-opus-5-5)、[Sonnet 5.5](https://www.anthropic.com/claude-sonnet-5-5)、[缓存规则](https://platform.claude.com/docs/en/build-with-claude/prompt-caching) |
| Gemini | 3.8 Flash 稳定版与 3.1 Pro preview 状态分开，不能由 Flash 版本推出同版本 Pro | [3.8 Flash 官方模型页](https://ai.google.dev/gemini-api/docs/models/gemini-3.8-flash) |
| DeepSeek | V4.1-Flash 与 V4-Pro 并存，旧 Flash/Vision Exp 的退休状态按发布记录处理 | [官方更新](https://api-docs.deepseek.com/updates/) |
| Kimi / Qwen | K3 与 Qwen 3.8 的开放权重、托管 API、模态、思考控制和自定义许可分别判断 | [K3 模型卡](https://huggingface.co/moonshotai/Kimi-K3)、[Qwen 官方组织](https://huggingface.co/Qwen) |

## 框架、协议与安全

| 更新对象 | 核对结果与边界 | 官方来源 |
| --- | --- | --- |
| AutoGen / 微软 | AutoGen 维护模式，新增项目评估 Microsoft Agent Framework；保留存量与历史项目定位 | [AutoGen](https://github.com/microsoft/autogen)、[迁移指南](https://learn.microsoft.com/en-us/agent-framework/migration-guide/from-autogen/) |
| ADK / Harness | ADK 支持语言按官方表列出；DeepSeek Harness 主要实现为 TS/Node | [ADK](https://adk.dev/)、[DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) |
| MCP | 2026-07-28 的 stateless/per-request 模型与旧版初始化、会话描述分开；deprecated 不等于立刻移除。Sampling 是旧能力，不写成 2025 新功能 | [当前规范](https://modelcontextprotocol.io/specification/2026-07-28)、[版本变化](https://modelcontextprotocol.io/specification/2026-07-28/changelog) |
| MCP Python SDK | 官方稳定 v2 示例锁定 2.3.0，使用 `MCPServer`；第三方 FastMCP 与官方旧导入区分 | [v2 迁移指南](https://py.sdk.modelcontextprotocol.io/migration/)、[官方 SDK](https://github.com/modelcontextprotocol/python-sdk) |
| MCP 授权 | 禁止服务接收不是签发给自身的 token 并透传下游；不误解为正常客户端授权都被禁止 | [安全最佳实践](https://modelcontextprotocol.io/specification/2026-07-28/basic/security_best_practices) |
| A2A | Card 地址 `/.well-known/agent-card.json`，传输/状态按绑定与版本核对；SSE 可协商，另有轮询、推送。首发与基金会治理时间分开 | [规范](https://a2a-protocol.org/latest/specification/)、[官方项目](https://github.com/a2aproject/A2A) |
| 支付/商务/界面 | x402、AP2、ACP、UCP 首发时间分别注明；支付和商务协议可能交叠。AG-UI 事件数不固定为 16 | [x402](https://www.x402.org/)、[AP2](https://ap2-protocol.org/)、[ACP](https://www.agenticcommerce.dev/)、[UCP](https://ucp.dev/)、[AG-UI](https://docs.ag-ui.com/) |
| 沙箱 | 不给容器/gVisor/微 VM 设通用安全排名；Daytona OCI runner 与 E2B microVM 分开。销毁环境不等于删除外部动作、日志和保留数据 | [Daytona 文档](https://www.daytona.io/docs/)、[E2B 文档](https://e2b.dev/docs) |
| Computer Use | 桌面可有 UIA/可访问性树；browser-use 当前 CDP 事件架构不概括为内部 Playwright；Operator 保留历史产品背景 | [browser-use 官方源码](https://github.com/browser-use/browser-use/blob/main/browser_use/browser/session.py)、[ChatGPT agent](https://openai.com/index/introducing-chatgpt-agent/) |
| OWASP | LLM 2026 与 Agentic 2026 为不同清单。2026 LLM 前三项为注入、敏感信息泄露、过度代理；归档网页仍可能显示 2025，正文链接直接指向 2026 版本前言 | [2026 官方前言](https://raw.githubusercontent.com/GenAI-Security-Project/GenAI-LLM-Top10/main/2026/final/LLM00_Preface.md)、[2026 发布公告](https://genai.owasp.org/2026/09/01/owasp-genai-security-project-unveils-2026-top-10-for-llm-applications-new-agent-control-standard-and-sponsors-as-community-tops-30000-members/)、[Agentic 发布公告](https://genai.owasp.org/2025/12/09/owasp-top-10-for-agentic-applications-the-benchmark-for-agentic-security-in-the-age-of-autonomous-ai/) |

## 论文与量化口径

| 原有表达 | 更新后的口径 | 来源 |
| --- | --- | --- |
| 多 Agent 15 倍 token | 对比普通聊天，单 Agent 约 4 倍；90.2% 质量提升有另一套内部研究比较基线，不等于 SCOUT 实测 | [Anthropic 工程文章](https://www.anthropic.com/engineering/multi-agent-research-system) |
| 180 组 / 4 基准 | 2025-12 初版；2026-04 v3 为 260 组 / 6 基准。本地旧 PDF 与网页修订版不混为同版本 | [Scaling Agent Systems](https://arxiv.org/abs/2512.08296) |
| METR 时间视野 | 指定成功率对应的人类专家任务时长；历史翻倍趋势不等于 Agent 能连续稳定运行的时间 | [METR 研究](https://metr.org/time-horizons/) |
| 57.3% 采用率 | 2025-11/12 的 1340 名受访者，不代表所有企业 | [LangChain 调查](https://www.langchain.com/state-of-agent-engineering) |
| Mem0 的准确率/延迟 | 26% 与 91% 对应不同基线和指标，注明 LLM judge 与 p95 等条件 | [Mem0 论文](https://arxiv.org/abs/2504.19413) |
| R1 纯 RL | R1-Zero 与包含冷启动等多阶段训练的 R1 分开 | [DeepSeek-R1 论文](https://arxiv.org/abs/2501.12948) |
| 540% 注入增长 | HackerOne 平台漏洞报告，不外推全行业安全事件 | [HackerOne 报告](https://www.hackerone.com/report/hacker-powered-security) |
| 73.2% → 8.7% | 特定论文实验，不承诺任意生产防御效果 | [安全预印本](https://arxiv.org/abs/2511.15759) |
| SWE-bench / GUI 趋势 | 原版、Verified、Pro 及 GUI 不同版本分别列出，避免把不同子集的成绩串成同一时间序列 | [SWE-bench](https://www.swebench.com/)、[OSWorld](https://os-world.github.io/) |

数量与 Star 由本地数据/资源文件及 GitHub API 快照核对。项目页明确标记归档条目。AP 关于 FTC 的报道保留媒体归因，不解释为已获得第一方调查文件。框架优劣、时延、费用和招聘趋势改为有条件的选型或观察建议，不补造统一结论。
