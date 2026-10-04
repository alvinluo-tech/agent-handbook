> 修订前审阅快照：本轮已于 2026-10-03 更新正文，详见 [更新验收记录](update-completion-2026-10-03.md)。原句与行号保留用于追溯，不代表当前正文；GLM 5.3 的补充核查见 [来源表](update-sources-2026-10-03.md)。

# 协议、安全、沙箱与 Computer Use 时效核查

核查基准：2026-10-03（用户时区 Asia/Shanghai）。范围：CH.06、CH.07、CH.13、CH.16、CH.18，以及 Diag.jsx / Diag2.jsx 中相关图解。只新增此报告，没有修改正文。下列行号为核查时源文件行号。P1 表示会直接教错接口或安全边界，P2 表示时效/事实误导，P3 表示应补限定条件。

## 优先修正：可由官方来源确认

### 1. P1：MCP Python SDK 示例使用已移除的 v1 导入

- 位置：`E:/code/github_project/auto-dev/agent-dev-guide/src/chapters/Ch06.jsx:34`，同文件第 32、36、65 行。
- 原文：`from mcp.server.fastmcp import FastMCP`，安装指令却是未锁版本的 `pip install "mcp[cli]"`。
- 问题：官方 Python SDK v2 将 FastMCP 改名 MCPServer，并移除旧模块；依照当前安装指令运行旧示例会出现 ModuleNotFoundError。独立第三方 FastMCP 包与官方 SDK 的旧同名类也应区分。
- 建议替换：按官方迁移示例使用 `from mcp.server.mcpserver import MCPServer`、`mcp = MCPServer("weather")`，并逐项核对构造器及运行方式；示例标明“官方 Python SDK v2 / MCP 2026-07-28”。若保留历史示例，明确 SDK v1 并锁 `<2`。
- 来源：[官方迁移指南](https://py.sdk.modelcontextprotocol.io/migration/#fastmcp-renamed-to-mcpserver)，[官方当前 README](https://github.com/modelcontextprotocol/python-sdk)。文档无发布日期；2026-10-03 查阅，v2 已对应 2026-07-28 规范。

### 2. P1：令牌透传被弱化为“不建议”，定义也不准确

- 位置：`E:/code/github_project/auto-dev/agent-dev-guide/src/chapters/Ch06.jsx:59`。
- 原文：“把用户凭证原样转发给 server……规范明确不建议”。
- 问题：Token passthrough 指 MCP server 接受并未签发给自己的 token，然后传给下游 API；正常客户端向 MCP server 提交 audience 正确的 access token 并不是该反模式。规范是明确禁止，非建议避免。
- 建议替换：“MCP server 不得接受未明确签发给自身的 token，也不得未经 audience 验证把客户端 token 转交下游 API；分别建立 MCP 与下游授权边界。”
- 来源：[MCP 官方安全最佳实践](https://modelcontextprotocol.io/docs/2025-11-25/tutorials/security/security_best_practices#token-passthrough)，规范日期 2025-11-25；2026-10-03 查阅。

### 3. P2：Sampling 时间线错误，且遗漏已弃用状态

- 位置：`E:/code/github_project/auto-dev/agent-dev-guide/src/chapters/Ch06.jsx:28`。
- 原文：“2025 年的规范更新还加入了 Sampling……与 Elicitation”。
- 问题：Sampling 在 2024-11-05 规范已有；2026-07-28 又将 Sampling、Roots、Logging 标为 Deprecated。Elicitation 属后续新增，两者不能并列说 2025 才加入。
- 建议替换：“Sampling 在早期规范已存在，Elicitation 在 2025 年加入。2026-07-28 规范引入 MRTR 处理补充输入，并弃用 Sampling、Roots、Logging；弃用能力在过渡窗口中仍可用，不应说成已立即移除。新项目按当前迁移建议实现。”
- 来源：[2024 Sampling](https://modelcontextprotocol.io/specification/2024-11-05/client/sampling)，日期 2024-11-05；[2026 changelog](https://modelcontextprotocol.io/specification/2026-07-28/changelog)，日期 2026-07-28。

### 4. P2：协议章整体缺少 MCP 2026 无状态核心

- 位置：`E:/code/github_project/auto-dev/agent-dev-guide/src/chapters/Ch06.jsx:51`。
- 原文：“server 是独立服务,支持远程调用、多会话、鉴权”。
- 问题：按当前规范，协议级 session 与 `Mcp-Session-Id`、initialize 握手已移除；应用可有任务状态，但“多会话”不能继续暗示当前协议依赖有状态连接。
- 建议替换：“Streamable HTTP 支持远程请求和授权；2026-07-28 核心已无状态，每个请求携带版本与客户端能力，跨请求状态通过显式句柄传递。旧客户端仍需版本兼容。”
- 来源：[2026 规范发布](https://blog.modelcontextprotocol.io/posts/2026-07-28/)，2026-07-28；[规范变更](https://modelcontextprotocol.io/specification/2026-07-28/changelog)，2026-07-28。旧实现并不会在发布日期被强制停用，不能将“新版规范变化”写成“旧 server 已不能使用”。

### 5. P2：MCP 图解仍标旧 HTTP(SSE) 传输

- 位置：`E:/code/github_project/auto-dev/agent-dev-guide/src/components/Diag.jsx:219`。
- 原文：“传输支持 stdio 与 HTTP(SSE)”。
- 建议替换：“标准传输为 stdio 与 Streamable HTTP；旧 HTTP+SSE 自 2025-03-26 起弃用。Streamable HTTP 的响应仍可使用 SSE，不能把 SSE 编码与旧传输协议混为一谈。”
- 来源：[2026 changelog](https://modelcontextprotocol.io/specification/2026-07-28/changelog)，日期 2026-07-28。

### 6. P1：A2A Agent Card 地址过时

- 位置：`E:/code/github_project/auto-dev/agent-dev-guide/src/chapters/Ch18.jsx:32`。
- 原文：`/.well-known/agent.json`。
- 建议替换：`/.well-known/agent-card.json`；写明当前规范版本，旧地址仅用于历史说明。
- 来源：[A2A 官方规范 §14.3](https://a2a-protocol.org/latest/specification/#143-well-known-uri-registration)，2026-10-03 查阅当前规范。

### 7. P2：A2A 生命周期示意使用不存在的枚举，SSE 被说成必经路径

- 位置：`E:/code/github_project/auto-dev/agent-dev-guide/src/chapters/Ch18.jsx:34`，第 20 行相关。
- 原文：“对方以 SSE 推送状态(work→done/failed)”。
- 建议替换：“通过发送消息启动交互；服务可直接返回消息或 task。任务状态按当前绑定表示，例如 `TASK_STATE_WORKING → TASK_STATE_COMPLETED / TASK_STATE_FAILED`；还可需输入、需鉴权、取消或拒绝。HTTP 流式模式用 SSE，也可轮询、推送通知或 gRPC 流。”
- 来源：[A2A 官方规范](https://a2a-protocol.org/latest/specification/)，2026-10-03 查阅。`work/done` 可保留为口语解释，但必须标为非协议字段。

### 8. P2：A2A 当前治理归属少了 2026 更新

- 位置：`E:/code/github_project/auto-dev/agent-dev-guide/src/chapters/Ch18.jsx:20`，`E:/code/github_project/auto-dev/agent-dev-guide/src/components/Diag2.jsx:162`。
- 原文：“Linux 基金会托管,50+ 厂商参与”；图中 2025.04 写“Google → Linux 基金会”。
- 建议替换：“Google 于 2025-04 发布，2025-06 转入 Linux Foundation；2026-08 已成为 AAIF Growth Stage 项目。”图解将首发与治理迁移分成独立日期。参与厂商数若保留需注明它是首发统计。
- 来源：[A2A 官方加入 AAIF 公告](https://a2a-protocol.org/latest/blog/2026/08/27/a-new-chapter-for-a2a-joining-the-agentic-ai-foundation/)，2026-08-27。

### 9. P2：UCP 发布年份写错

- 位置：`E:/code/github_project/auto-dev/agent-dev-guide/src/chapters/Ch18.jsx:23`。
- 原文：“UCP / ACP(2025)”。
- 建议替换：“UCP（2026-01-11）/ ACP（2025-09-29）”。两者覆盖相近商务场景，不能概括为互不竞争的独立层；宜改“职责有分工，也有重叠”。
- 来源：[Google UCP 发布](https://blog.google/products/ads-commerce/agentic-commerce-ai-tools-protocol-retailers-platforms/)，2026-01-11；[OpenAI ACP 发布](https://openai.com/index/buy-it-in-chatgpt/)，2025-09-29。

### 10. P2：AP2 与 x402 合并为同一发布日期和机制

- 位置：`E:/code/github_project/auto-dev/agent-dev-guide/src/components/Diag2.jsx:164`。
- 原文：“2025.09 AP2 / x402”“agent 支付协议(HTTP 402)”。
- 建议替换：独立节点：“2025-05-06 x402：HTTP 402 支付”“2025-09-16 AP2：授权 mandates 与代理支付”。HTTP 402 是 x402 的机制，不应套给 AP2。
- 来源：[Coinbase x402 发布](https://www.coinbase.com/en-in/developer-platform/discover/launches/x402)，2025-05-06；[Google AP2 发布](https://cloud.google.com/blog/products/ai-machine-learning/announcing-agents-to-payments-ap2-protocol)，2025-09-16。

### 11. P2：AG-UI 事件数固定在旧版本

- 位置：`E:/code/github_project/auto-dev/agent-dev-guide/src/chapters/Ch18.jsx:21`。
- 原文：“16 种标准事件流”。
- 问题：当前官方事件页已列 Activity、Reasoning 等扩展事件族；固定 16 容易让读者按旧清单实现。
- 建议替换：“标准化运行生命周期、文本、工具调用、状态同步、活动/推理等事件；具体事件集合按锁定 SDK 版本查官方定义。”
- 来源：[AG-UI 当前 Events](https://docs.ag-ui.com/concepts/events)，[JS core events](https://docs.ag-ui.com/sdk/js/core/events)，无发布日期；2026-10-03 查阅。

### 12. P2：把 Daytona 无依据地归为 Firecracker 底座

- 位置：`E:/code/github_project/auto-dev/agent-dev-guide/src/chapters/Ch07.jsx:22`，`E:/code/github_project/auto-dev/agent-dev-guide/src/components/Diag.jsx:254`。
- 原文：“AWS Lambda、E2B、Daytona 底座”“E2B / Daytona 底座”。
- 问题：Daytona 官方架构说明 OCI 镜像、runner、Linux namespace 隔离，不能由此认定它采用 Firecracker。
- 建议替换：Firecracker 代表保留 AWS Lambda / E2B；Daytona 单独按其官方当前架构介绍，注明隔离实现与具体部署有关。
- 来源：[Daytona 官方 Architecture](https://www.daytona.io/docs/en/architecture/)，无发布日期；2026-10-03 查阅。

### 13. P2：E2B 示例使用弃用构造器

- 位置：`E:/code/github_project/auto-dev/agent-dev-guide/src/chapters/Ch07.jsx:55`。
- 原文：`with Sandbox(timeout=60) as sbx:`。
- 建议替换：`with Sandbox.create(timeout=60) as sbx:`，并锁定 SDK 版本。第 60 行“状态不留痕”应改“退出 with 后销毁该运行环境；审计日志、外部存储等仍按产品配置与保留策略处理”，销毁 VM 不等于无日志或无外部副作用。
- 来源：[E2B Python SDK v2.5 文档](https://e2b.dev/docs/sdk-reference/python-sdk/v2.5.0/sandbox_sync)，无发布日期；2026-10-03 查阅，文档明确 constructor Deprecated；[官方维护 PyPI 2.46.4](https://pypi.org/project/e2b/2.46.4/)，页面示例也是 `Sandbox.create()`。

### 14. P2：可访问性树被限定为浏览器，桌面被说成只能截图

- 位置：`E:/code/github_project/auto-dev/agent-dev-guide/src/chapters/Ch13.jsx:19`、第 22 行。
- 原文：“只限浏览器”“桌面场景只能走视觉路线”。
- 建议替换：“DOM 路线主要用于浏览器；可访问性树也可通过 Windows UI Automation、macOS Accessibility 等原生接口用于桌面。桌面可混合结构化控件访问与截图回退，取决于应用暴露的结构。”
- 来源：[Microsoft UI Automation Overview](https://learn.microsoft.com/en-us/windows/win32/winauto/uiauto-uiautomationoverview)，[官方 Windows AI-assisted testing](https://learn.microsoft.com/en-us/windows/apps/develop/ai-assisted/testing)，无明确发布日期；2026-10-03 查阅。

### 15. P2：Operator 仍作为当前 OS 级桌面产品列举

- 位置：`E:/code/github_project/auto-dev/agent-dev-guide/src/chapters/Ch13.jsx:30`，第 15 行相关。
- 原文：“OS 级桌面 agent……Operator(CUA)”“控制整个桌面,跨应用干活”。
- 问题：Operator 首发是远程浏览器产品；2025-07 已整合进 ChatGPT agent，独立站退役。CUA 是模型/能力，Operator 是历史产品，不能当同义词。
- 建议替换：“浏览器与虚拟计算机 agent：ChatGPT agent（整合原 Operator）”；OS 级桌面另列确实控制本机跨应用的产品。截图模型代表可写“OpenAI CUA；Operator 为 2025 年历史产品”。
- 来源：[OpenAI Operator 公告及更新](https://openai.com/index/introducing-operator/)，更新 2025-07-17；[ChatGPT agent 发布](https://openai.com/index/introducing-chatgpt-agent/)，2025-07-17。

### 16. P2：browser-use 底层仍说 Playwright

- 位置：`E:/code/github_project/auto-dev/agent-dev-guide/src/chapters/Ch13.jsx:48`。
- 原文：“内部循环:取DOM/截图 → LLM决策 → Playwright执行”。
- 建议替换：“内部循环：读取 DOM/截图 → LLM 决策 → 浏览器控制层执行 → 观察”；若具体讲当前实现，注明直接 CDP 与事件驱动架构，Playwright 是另一个可连接路径。
- 来源：[项目方文章](https://browser-use.com/posts/bitter-lesson-browser-agents)，2026-09 发布（检索结果显示两周前）；[官方当前源码](https://github.com/browser-use/browser-use/blob/main/browser_use/browser/session.py)，2026-10-03 查阅，直接导入 `CDPClient` / `bubus`。

### 17. P2：OWASP 2025 被用作当前安全排名，Agentic 仍写“新倡议”

- 位置：`E:/code/github_project/auto-dev/agent-dev-guide/src/chapters/Ch16.jsx:50`，第 7 行学习目标相关。
- 原文：“OWASP LLM/GenAI Top 10(2025)前三名……LLM03 供应链”“新出现的 OWASP Agentic AI 倡议”。
- 建议替换：“OWASP LLM Top 10 2026 前三项为 Prompt Injection、Sensitive Information Disclosure、Excessive Agency；同时阅读已发布的 OWASP Top 10 for Agentic Applications 2026。”若介绍 2025 排名，必须写“历史 2025 版”。
- 来源：[OWASP 2026 发布](https://genai.owasp.org/2026/09/01/owasp-genai-security-project-unveils-2026-top-10-for-llm-applications-new-agent-control-standard-and-sponsors-as-community-tops-30000-members/)，2026-09-01；[官方 2026 前言](https://raw.githubusercontent.com/GenAI-Security-Project/GenAI-LLM-Top10/main/2026/final/LLM00_Preface.md)，2026-10-03 查阅；[Agentic Top 10 发布](https://genai.owasp.org/2025/12/09/owasp-top-10-for-agentic-applications-the-benchmark-for-agentic-security-in-the-age-of-autonomous-ai/)，2025-12-09。

### 18. P2：540% 被从漏洞报告增长扩大为注入事件增长

- 位置：`E:/code/github_project/auto-dev/agent-dev-guide/src/chapters/Ch16.jsx:19`。
- 原文：“HackerOne 2025 报告显示注入事件同比暴涨 540%”。
- 建议替换：“HackerOne 2025/26 报告称，其平台提示注入漏洞报告同比增长 540%。”注明样本平台，不解释成全行业真实安全事件增长。
- 来源：[HackerOne 第九版报告官方页面](https://www.hackerone.com/report/hacker-powered-security)，2025/26 报告；2026-10-03 查阅。

### 19. P2：研究中攻击成功率被写成通用模型/系统表现

- 位置：`E:/code/github_project/auto-dev/agent-dev-guide/src/chapters/Ch16.jsx:24`，第 37 行相关。
- 原文：“单靠模型本身抵抗注入(73.2% 攻击成功率)→叠加系统级防御后降到 8.7%”。
- 建议替换：“2025 年预印本《Securing AI Agents Against Prompt Injection Attacks》在其特定任务/攻击/防御设置下报告 73.2% → 8.7%；该结果不能作为任意模型或生产系统的保证。”必须补模型、数据集、baseline 与防御组合。
- 来源：[作者预印本](https://arxiv.org/abs/2511.15759)，2025-11；2026-10-03 查阅。数字确有来源，不应删成‘伪造’，问题是条件丢失。

## 技术绝对化与需限定表述

### 20. P3：沙箱“共识”和性能数字应去绝对化

- 位置：`E:/code/github_project/auto-dev/agent-dev-guide/src/chapters/Ch07.jsx:27`，`E:/code/github_project/auto-dev/agent-dev-guide/src/components/Diag.jsx:253`、第 257、275 行。
- 原文：“2025-2026 的产业共识……微 VM 才是放心”“约 ~10% 性能开销”“容器之上再叠 gVisor / 微 VM”。
- 建议：“根据威胁模型选择 namespace/cgroup、用户态内核或微 VM，并配合权限、网络和资源策略”；gVisor 性能写“随系统调用、网络与文件 I/O 负载显著变化，需实测”。不能把这些技术解释成线性安全排名或固定 10% 代价。
- 来源：[gVisor 官方 Performance Guide](https://gvisor.dev/docs/architecture_guide/performance/)，无发布日期；2026-10-03 查阅；Daytona 的现行官方架构也是反例，不支持微 VM 为唯一合格路线。

### 21. P3：WASM 文件系统表述应澄清访问边界

- 位置：`E:/code/github_project/auto-dev/agent-dev-guide/src/chapters/Ch07.jsx:23`。
- 原文：“Pyodide、数据库 UDF;无完整文件系统”。
- 问题：“无完整文件系统”可以理解为无法获得完整宿主环境，不宜直接判成“没有任何文件系统”。但教学上应区分虚拟文件系统、受控宿主挂载与完整操作系统能力，避免读者误解。
- 建议：“WASM 可提供虚拟文件系统或受控宿主目录访问；是否能访问宿主文件、网络、系统调用由运行时与能力授权决定，不能直接等同完整操作系统环境。”
- 来源：[Pyodide 官方文件系统文档](https://pyodide.org/en/stable/usage/file-system.html)，无发布日期；2026-10-03 查阅，默认提供内存文件系统。

### 22. P3：benchmark 不能用一个混合区间讲两条时间线

- 位置：`E:/code/github_project/auto-dev/agent-dev-guide/src/chapters/Ch13.jsx:55`。
- 原文：“网页 Arena 基准(WebArena/OSWorld)……2024 ~15%……2026 60-80%”。
- 问题：OSWorld 是桌面多应用基准，不是“网页 Arena”；WebArena 初始 14.41% 是 2023 论文特定 GPT-4 agent 结果。两个基准任务、预算与排行榜设置不同，不能合并为同一成功率趋势。官方 OSWorld 页面还明确公告 2026-06-26 发布 OSWorld 2.0；当前介绍至少应区分原始版、Verified 与 2.0。
- 建议：“WebArena（网页）与 OSWorld（桌面）分别列具体系统、报告日期、任务版本、预算与成功率；动态排行只作为带日期的快照。”没有同条件 2026 来源就删除 60–80% 统一区间。
- 新版例子：OSWorld 2.0 官方页面当前报告在 500 步、binary completion 设置下，最佳系统为 20.6%，partial score 为 54.8%。这恰好说明“成功率”必须区分完整完成率与部分得分，而不是把旧短任务排行榜区间当成新长任务能力。
- 来源：[WebArena 原始论文](https://arxiv.org/abs/2307.13854)，2023-07；[OSWorld 官方项目](https://os-world.github.io/)，[OSWorld 2.0](https://osworld-v2.xlang.ai/)，2026-10-03 查阅。

## 不应误判为过时或虚构

- `E:/code/github_project/auto-dev/agent-dev-guide/src/chapters/Ch06.jsx:10` 与 Diag.jsx 第 241 行：2024-11 MCP 发布、2025-12 捐赠 AAIF 属历史事实，可以保留；它们只是不能替代 2026 技术更新。
- `E:/code/github_project/auto-dev/agent-dev-guide/src/chapters/Ch13.jsx:46`：`gpt-5-mini` 可作为有意识选择的示例模型；“不是最新型号”本身不等于错误，需核查可用性和示例目的。不要机械替换所有旧型号。
- `E:/code/github_project/auto-dev/agent-dev-guide/src/chapters/Ch16.jsx:53`：[Anthropic September 2026 威胁报告](https://www.anthropic.com/threat-intelligence-report-september-2026) 确实可访问；[2026-09-09 官方事件评估](https://www.anthropic.com/research/alignment-assessment-cybersecurity-incidents) 也确实存在。不能因年份比训练知识新而认定虚构。
- 同行 FTC 报道存在 AP、Axios 2026-09-30 对 FTC 发言人的报道；本次未找到同主题 FTC 官方公告，因此这是“具媒体佐证、缺一手链接”，不能写“已证伪”。原文“据报道”可保留，但应补具体报道/日期，并避免把调查开始日期等同报道日期。核查参考：[AP 报道](https://apnews.com/article/89ac416717adbfb1d72f2d85e6ce83d1)。
- Ch07 E2B ~150–200ms、Daytona 亚秒启动是产品典型/宣传数值；应带条件和测量范围，不能当 Firecracker 所有工作负载的普遍启动值。Stars 数应另加统计日期或移除，本报告未将无日期 Stars 直接断言为错误。

## 建议修改顺序

先修 SDK 导入、Token passthrough 定义与 A2A Card 地址；再统一 MCP 2026 / OWASP 2026、产品现状和协议时间线；最后把厂商 Stars、性能、成功率与“产业共识”改成有日期/条件的来源快照。
