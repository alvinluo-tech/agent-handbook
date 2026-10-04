# 全站内容与 UI 复查 · 2026-10-03

本轮检查完成。覆盖 19 个主线章节、5 个支线入口、3 个实战项目的 9 个内容文件、81 条论文元数据、68 条项目元数据及公共组件。当前最需要处理的是通关进度丢失、错误论文收录、实战示例的可靠性漏洞、键盘访问和手机图解可读性。像素风可以保留，不必先做整站换肤。

这是当前版本的问题清单与改进建议，**尚未实施下列修复**。本轮新增本报告、离线复现脚本与截图；未发布、推送或修改外部服务。实战 Python 代码位于教学文本中，相关安全发现指复制部署这些示例的风险，不表示当前 Vite 静态站已暴露这些 API。

## 优先顺序

| 批次 | 应完成的工作 | 验收条件 |
| --- | --- | --- |
| 第一批：修正确性 | U01/U02/U04；C01–C05/C07/C08 | 跨章进度不丢；所有清单与 FAQ 可键盘操作；关闭目录后焦点可见；错误论文不再收录；危险教学示例修正或明确降为伪代码 |
| 第二批：恢复阅读与导航 | U03/U05–U09/U11/U15；C06/C09–C12/C16 | 刷新/分享/后退保留位置；390px 图解可读且页面不横向溢出；搜索与复制有清楚反馈；示例错误路径不会宣告成功 |
| 第三批：编辑与维护 | C13–C15/C17；U10/U12–U14 | 删除无依据的固定收益；正文与术语/路线图一致；采集脚本不覆写修订；章节按需加载；减少动效偏好生效 |

P1 表示应先修的功能缺陷或会教给读者危险实现的示例；P2 表示影响可靠性、阅读或可访问性；P3 表示进一步改进。以下共 **32 项（17 项内容/示例/维护，15 项 UI/交互）**，没有把审美偏好当成功能故障。

## 内容、示例与维护

### C01 · P1 · 论文库误收两篇物理论文

`src/data/papers.json:1581`、`src/data/papers.json:1750`；源头在 `tools/papers.mjs:91`、`tools/papers.mjs:38`。

2310.03021 实际是星暴星系与再电离研究，被归到 safety；2303.16462 实际是夸克物质剪切黏度研究，被归到 tooluse。采集清单注释分别写 NeMo Guardrails 与 TaskMatrix.AI，ID 和预期论文不匹配，API 成功返回元数据并不能证明选对了论文。浏览器论文库也实际显示了错误标题。

修正源清单、数据和 PDF 引用；预期标题/作者/主题应纳入收录核验，数量摘要随有效收录变化。官方证据：[2310.03021](https://arxiv.org/abs/2310.03021)、[2303.16462](https://arxiv.org/abs/2303.16462)。

### C02 · P1 · GitHub webhook 自动重试描述错误

`src/chapters/labs/p3c.jsx:68`、`src/chapters/labs/p3c.jsx:84`；`src/chapters/labs/p3a.jsx:59`。

正文将 GitHub webhook 解释为失败后自动重发，并声称队列满会回 503、GitHub 稍后重试。GitHub 官方明确说明失败投递不会自动重试；Cloud 超过 10 秒响应会记失败，需人工或自建重投递任务。示例实际也没有捕获 `queue.Full`，FastAPI 默认成功响应是 200，而不是正文所说的固定 202。

改为“快速返回 2xx、持久接收、失败投递巡检与显式重投递”；区分 GitHub 原生行为和自建重试器。官方证据：[失败投递](https://docs.github.com/en/webhooks/using-webhooks/handling-failed-webhook-deliveries)、[最佳实践](https://docs.github.com/en/webhooks/using-webhooks/best-practices-for-using-webhooks)。

### C03 · P1 · ATLAS 缺少用户与业务资源归属校验

`src/chapters/labs/p1c.jsx:262`、`src/chapters/labs/p1c.jsx:268`、`src/chapters/labs/p1c.jsx:28`。

API 直接信任请求里的 session_id 读取历史；查订单只按模型提供的 order_id 查询，没有认证身份、租户或订单归属条件。“只读，放心放行”容易误导：只读查询仍可能泄露别人的订单、金额和发票链接。

教学接口应展示认证主体→会话归属→租户/订单授权这条链，业务查询的主体条件由运行时注入，不能由模型声明。若保持片段形式，必须在代码旁明确这些前置条件，并给出跨用户访问被拒绝的例子。

### C04 · P1 · 会话和模型输出直接进入文件路径

`src/chapters/labs/p1b.jsx:58`；`src/chapters/labs/p1c.jsx:262`；`src/chapters/labs/p2c.jsx:235`。

Trace 使用 `traces/{session_id}.jsonl`，session_id 只校验长度，含 `../` 的值可越出 traces。SCOUT 把模型生成的标题直接作为 reports 文件名，也缺少路径净化及目录创建。Trace 每次用 w 写入，同一会话再次调用会覆盖此前事件；SCOUT 还固定使用 sid="scout"。

由服务端生成安全的任务 ID，文件路径检查最终解析位置，标题只作展示；以 task_id 区分运行，保存会话关联，明确追加/分文件策略。离线复现只计算路径，没有写入目录外文件。

### C05 · P1 · 引用闸门会放行空摘录和伪造后缀

`src/chapters/labs/p1c.jsx:146`、`src/chapters/labs/p1b.jsx:317`。

`citations_cover` 的 `if quote and ...` 让空摘录直接通过；截取前 120 字再核对，让“前 120 字真实、后面伪造”的摘录也通过。离线已复现两种输入均返回 True。此外，回答提示只展示顺序编号、标题和正文，没有明确暴露要求模型返回的 doc_id/chunk_id 映射。

拒绝空摘录，核对完整摘录与合法编号映射；把“摘录存在”与“摘录支持该事实句”分开评测，避免称子串检查为防幻觉的最后保证。

### C06 · P2 · ATLAS 评测器与返回类型不一致

`src/chapters/labs/p1c.jsx:338`、`src/chapters/labs/p1c.jsx:290`、`src/chapters/labs/p1c.jsx:324`。

主循环直接返回 `list[Citation]`，eval 又直接调用主循环；judge 却使用 `c['marker']`，会对模型对象进行字典下标访问，知识问答评测因此报 TypeError。API 序列化不在这条离线调用链上。golden.yaml 还声明 expect_tool，但 structural_ok 没有检查它。

统一边界类型，返回前 model_dump 或让 judge 使用对象字段；通过 trace 检查实际工具执行，不仅检查最终 route。补一条“不调用订单工具却给出订单答案”的反例。

### C07 · P1 · webhook 入队失败后，重投递被丢弃

`src/chapters/labs/p3c.jsx:154`。

先 `store.record`，再 `queue.enqueue`。队列满时已经留下 delivery 记录；同 delivery 重投递会直接 dedup 返回，任务永远没有执行。离线 mock 已复现：第一次入队异常，第二次返回 dedup=True，入队只尝试过一次。进程内队列重启丢任务也是已承认的简化，但不能同时把持久记录当作执行完成。

使用持久接收与任务状态（received/queued/running/completed/failed），原子领取任务，失败允许重试；入队成功不等于处理完成。不能只把 record 移到 enqueue 后就声称获得持久一致性。

### C08 · P1 · GitHub API 失败可能被记成成功审查

`src/chapters/labs/p3c.jsx:40`、`src/chapters/labs/p3c.jsx:58`、`src/chapters/labs/p3c.jsx:227`。

get_pr/get_diff/create_review 没有统一检查 HTTP 状态；create_review 在返回错误 JSON 时可返回 0，pipeline 仍记 posted 并登记评论指纹，后续有效审查可能被抑制。空 findings 在经过过滤/去重之后也不必然表示“自动审查通过”，可能只是建议已发过或被预算截掉。

先验证状态与响应，再登记真实发布结果；区分“已检查无发现”“重复建议”“预算抑制”“审查失败”。失败应显示需要人工复核，不能产生通过结论。

### C09 · P2 · PR 上下文未固定 commit 与源仓库

`src/chapters/labs/p3a.jsx:152`；`src/chapters/labs/p3a.jsx:286`、`src/chapters/labs/p3c.jsx:61`。

PRContext 只有分支名；取文件用基准仓库+head_ref，fork PR 的同名分支可能不存在或指向不同内容。审查中再次 push 也会改变分支，回写 review 未绑定所审 SHA。

保存 head/base SHA 与 head repository，按 SHA 取上下文，回写绑定 commit_id；发布前发现过期时重跑或明确标为过期结果。

### C10 · P2 · SCOUT 来源失败后删引用、保留事实

`src/chapters/labs/p2c.jsx:51`、`src/chapters/labs/p2c.jsx:154`。

正文说 HEAD 失败不证明内容不存在、失败保留未核验状态；实际 verify 只返回 HEAD 成功条目，没有状态字段。终检把失效 [Cn] 标记删掉，事实句仍保留，还只处理 sections，没有检查执行摘要的引用。读者最后得到的可能是更难核验的无来源结论。

保留来源与核验状态，HEAD 不适用时受限 GET 回退；逐句决定保留并标“未核验”、降级或删除整条结论，覆盖摘要与正文。不要把删标记称为事实质检。

### C11 · P2 · 重排返回值缺少索引边界与小样本校验

`src/chapters/labs/p1b.jsx:489`、`src/chapters/labs/p1b.jsx:503`。

仅检查 `r.i < len(chunks)`，负索引会选错候选，过小负数还会报 IndexError；重复索引可以重复入选。只有一条候选时直接返回，不经过相关性阈值，与 good_enough 声称“重排层已过滤”的契约不一致。

检查 `0 <= i < n`、唯一性；小样本也判断相关性，或明确改为其他可靠的拒答条件。检索层字段和引用映射一起验收。

### C12 · P2 · “总预算/完整 trace”与实现还有差距

`src/chapters/labs/p1b.jsx:331`、`src/chapters/labs/p2c.jsx:189`、`src/chapters/labs/p2c.jsx:213`、`src/chapters/labs/p3c.jsx:91`。

ATLAS 的 trace 从单消息开始，预算只在 action 循环检查，knowledge 路径及会话累积不共享所宣称的会话上限；检索 embed 未传 trace。SCOUT 分配 worker 预算后，没有再对写作、编辑、终检执行总额闸门，research 没有 dump；SENTINEL worker 也没有统一 finally 落盘，结束时 trace 只在内存中。不能把“有预算字段”描述为已实现所有项目的总费用刹车。

明确软阈值与严格上限，区分单调用/单任务/会话；统一网关检查剩余额度并记所有收费调用，任务出口和异常路径 finally 保存 trace。首次讲解即可说明还有哪些费用未计入。

### C13 · P2 · 正文和导读残留无依据的固定结论

`src/chapters/Ch09.jsx:77`、`src/chapters/Ch11.jsx:41`、`src/chapters/Ch12.jsx:19`、`src/chapters/Ch17.jsx:103`、`src/chapters/Ch17.jsx:119`；`src/chapters/PapersPage.jsx:30`、`src/chapters/PapersPage.jsx:44`。

典型残留：“简单记忆解决 80% 需求”“Prompt 规划零成本、收益立现”“100 文档单窗口必炸”“并行延迟对半砍”“LLM 固定典型耗时”“线上全量日志成本总低于事故”；论文导读仍写“碾压”“学术界事实标准”。这些既非版本过时，也不能由当前模型型号更新自动纠正。

改为有条件的工程建议：说明任务/模型/预算与实验设置，数字标为教学示例或附来源；把日志采样改成风险分级、错误任务保留、脱敏与成本权衡。CH.01 的“判断标准只有一个”和 CH.10 的“复杂问题召回必不准”也应去绝对化。

### C14 · P2 · 路线图与 FAQ 没有跟上正文的教学边界

`src/chapters/RoadmapPage.jsx:38`、`src/chapters/RoadmapPage.jsx:54`、`src/chapters/RoadmapPage.jsx:59`；`src/chapters/GlossaryPage.jsx:44`、`src/chapters/GlossaryPage.jsx:14`、`src/chapters/GlossaryPage.jsx:70`。

路线图仍承诺 smolagents“1k 行一晚上读完”、完成率“提升 15 个点”和 12 周“成大师”。FAQ 说 CH.05 才开始出现代码，但 CH.02 已有 API、CH.03 已有伪代码；术语 CoT 定义仍泛称显著提升，与 CH.11 对内部推理模型的限定不一致；“全图鉴默写=认证”会混淆记忆与工程能力。

用可交付目标替代承诺：读指定入口、复现一种失败、建立基线并报告变化；时间写学习建议，LV 写本站学习进度，不等同职业认证。术语是教学简化时明确限定，不把存储位置、缓存资格或框架取舍写成唯一对应。

### C15 · P2 · 数据更新脚本会重新引入陈旧条目

`tools/gh-projects.mjs:12`、`tools/gh-projects.mjs:134`；`tools/papers.mjs:16`、`tools/papers.mjs:278`；`README.md:49`。

项目采集清单 63 条，当前数据 68 条；当前 6 个 slug 不在主清单，包括 OpenClaw、Hermes、DeepSeek Harness、pi-mono、oh-my-pi 与 MCP 规范仓库。主脚本直接覆写 projects.json，还保留旧 AutoGen 点评。论文的错误 ID 也在生成清单中；仅手改渲染数据会被下一次生成覆盖。

统一维护 manifest，人工导读和采集元数据分开存，增量更新保留旧成功记录；每条记录保存 fetchedAt，失败更新不能删去历史成功数据。更新说明应使用能重建当前站点的真实命令。模型/协议表继续保留核查日期和官方链接，GLM-5.3 已列入当前快照，不应再退回 GLM-4.x。

### C16 · P2 · 页面元数据仍写 65 篇，部分数字硬编码

`index.html:7`、`src/App.jsx:193`、`src/App.jsx:195`、`src/App.jsx:197`。

SEO description 还是 65 篇，当前页面是 81 篇；首页章节/实战/项目数仍硬编码，侧栏却读取摘要。论文误收修正后更容易产生新的不一致。

章节数使用 CHAPTERS.length，实战数使用 LABS.length，项目数读取摘要；description 从同一数据生成或移除易变数量。提供一条“全站可见数量与来源一致”的检查。

### C17 · P3 · 完整示例、核心片段和伪代码缺少统一标识

`src/chapters/Ch02.jsx:60`、`src/chapters/Ch03.jsx:32`、`src/chapters/labs/overview.jsx:10`。

已有总说明，但读者直接跳到某个代码块时不一定看到依赖、SDK 版本、环境变量、执行入口和缺省模块。新手容易把“语法通过”理解成可运行；三个实战目前仍是教学文件片段，未形成经集成验证的可下载工程。

每个示例标“完整演示/核心片段/伪代码”，附环境、前置文件、运行命令与预期结果；教学示例的 SLO、客户数量、首轮 60 秒等数字在附近标注假设。ATLAS 的“15 分钟人工跟进”应来自真实排班配置，不能写死承诺。

## UI 与交互（按文件定位）

### src/components/Bits.jsx

- **U01 · P1** `src/components/Bits.jsx:24` — 每章持有各自 localStorage 旧快照，跨章勾选互相覆盖。浏览器实测 CH.01→CH.02 后 EXP 仍 1/94，刷新后 CH.01 归零。改为共享单一状态源，或写入时合并最新状态并同步所有实例；同页与跨标签 storage 更新都要考虑。验收至少跨 3 章勾选、取消、刷新仍一致。
- **U02 · P1** `src/components/Bits.jsx:39`、`src/components/Bits.jsx:121` — 复选框 display:none 失去键盘入口；FAQ 的 q 仅绑定点击，没有原生交互与展开状态。改为可聚焦原生 checkbox 配合视觉隐藏，FAQ 用 details/summary 或 button+aria-expanded。首页 76 个清单输入均为 display:none，FAQ 在可访问性树里均显示 generic。

### src/App.jsx / src/chapters/labs/LabsPage.jsx

- **U03 · P2** `src/App.jsx:17`、`src/App.jsx:76`、`src/chapters/labs/LabsPage.jsx:32` — 章节/支线没有 URL 状态，lab 只 replaceState，App 启动固定 home。实测 `/#lab-p3` 刷新显示首页；进入论文库时地址还残留 lab-p3。统一可分享路由，处理初始 URL 与 popstate/hashchange；章节导航使用实际链接，保留后退与新标签打开能力。
- **U04 · P1** `src/App.jsx:113`、`src/styles.css:648` — 手机目录关闭后仅平移，按钮仍可 Tab 聚焦到 x=-320；打开无焦点约束、Escape 不关闭，也无 aria-expanded/controls。实测菜单开启后 Escape 仍 sidebar open，底层仍可滚动。关闭时使抽屉 inert，打开管理焦点、遮罩与滚动，关闭返回触发按钮；菜单按钮不应遮住正文焦点。
- **U10 · P3** `src/App.jsx:136`、`src/App.jsx:161` — 长篇缺少跳至正文、章节内目录、当前小节定位与跨章“上/下一章”。主线页面在 1280×720 高约 60,029px；只靠 19 项侧栏和浏览器查找，手机定位成本较高。补 skip link、章节目录/锚点、分享按钮，保留长文模式但增加单章阅读入口。
- **U11 · P2** `src/App.jsx:136`、`src/chapters/labs/LabsPage.jsx:65` — 当前章节、分类、项目选择主要用 CSS 表示，缺少 aria-current/pressed 或适当 tab 语义；EXP、费用结果、复制反馈没有 live region。输入校验后静默改值也不说明原因。使用合适语义和克制的状态播报；演示初始显示 RUNNING，却尚未开始，应区分待机/运行/完成。
- **U12 · P2** `src/App.jsx:4`、`src/App.jsx:36`、`src/chapters/index.js:1` — Labs 和全部主线静态进入主包；首页每次滚动遍历全部章节并更新 App。构建主 JS 639.85KB、gzip 224.21KB；Ch19 动态导入已被静态导入抵消。优先拆分支线/章节，滚动监测使用 IntersectionObserver 或 rAF 节流，长文先考虑 content-visibility；论文 81 卡、项目 68 卡可分页。尚未测实际移动设备性能，不能把包体警告直接叫作实测卡顿。

### src/styles.css

- **U05 · P2** `src/styles.css:369` — 图解按宽度整体缩小：390px 页面 SVG 实际约 330px 宽，780 viewBox 下 10–14px 原始文字仅约 4.2–5.9px。手机截图确认难以阅读。增加全屏查看/缩放与下载、保持图内最小字号或移动端重排，并提供文字版流程。不要只加 overflow:hidden 掩盖问题。
- **U06 · P2** `src/styles.css:476` — 仓库名不换行；390px 项目库 document.scrollWidth=427，`modelcontextprotocol/modelcontextprotocol` 撑出卡片与页面。设置 flex min-width:0、overflow-wrap:anywhere，URL/路径及代码栏标题一并检查。320px 论文标题固定 min-width:260 也会侵入卡片内边距，应允许收缩。
- **U08 · P2** `src/styles.css:26`、`src/styles.css:154`、`src/styles.css:321`、`src/styles.css:544` — 辅助文字、链接和按钮存在小字低对比。计算：faint/纸底=3.66:1，faint/侧栏=3.34:1，蓝链接/纸底=3.61:1，白字/橙按钮=3.68:1，lab 英文副题/深底=2.99:1；普通小字应达到 4.5:1。保留像素标题，但功能标签/数字/副题提高字号和对比，7–9px 像素字只作装饰。
- **U13 · P3** `src/styles.css:51`、`src/styles.css:648`、`src/chapters/labs/labbits.jsx:122` — 全局平滑滚动与抽屉动效未处理 prefers-reduced-motion，代码还显式请求 smooth。提供减少动效分支；循环演示保留单步与重置，在运行中增加暂停更清楚。
- **U14 · P3** `src/styles.css:182`、`src/styles.css:200` — 390×844 首屏主要是介绍和六块统计，START 按钮落在屏幕下面。可把“开始阅读/继续上次/实战工坊”提前，统计缩成紧凑一行或折叠，版本标签降低权重。这是阅读效率建议，非阻断缺陷；保留纸感和像素主视觉。

### src/chapters/PapersPage.jsx / src/chapters/ProjectsPage.jsx

- **U07 · P2** `src/chapters/PapersPage.jsx:139`、`src/chapters/PapersPage.jsx:144` — 搜索仅 placeholder，无持久 label，inline outline:none 且无替代焦点。搜索存在空结果提示（已通过），但没有结果数量/清空按钮，英文导读搜索没有统一转小写。补 label、focus-visible、已筛选条件和清空入口；项目库增加名称搜索与维护/归档筛选比单纯星数更有用。

### src/chapters/labs/labbits.jsx

- **U09 · P2** `src/chapters/labs/labbits.jsx:49` — 复制失败被静默吞掉，按钮只有短暂 COPIED，无可访问状态；超长代码文件名与按钮共处可横滚代码栏，复制可能离开可视区。反馈成功或失败并给手动选择提示，使栏头/按钮固定可见；主线代码块也应使用同一可复制组件。复制失败分支为源码确认，本轮未强制更改浏览器权限复现。

### src/components/Diag.jsx / Diag2.jsx / labs/diag.jsx / GlossaryPage.jsx

- **U15 · P2** `src/components/Diag.jsx:28`、`src/components/Diag2.jsx:28`、`src/chapters/labs/diag.jsx:29`、`src/chapters/GlossaryPage.jsx:76` — SVG 设置 role=img 但没有独立可访问名称/描述关联；内部文字作为图片子树不一定可读。术语使用 dt/dd，却没有 dl；独立支线页面仅 h2，没有页面 h1。给 SVG 关联 caption/title/desc 与文字说明，术语用 dl，独立页面使用 h1，导航增加当前项语义。

## 实际验证与边界

| 检查 | 本轮结果 |
| --- | --- |
| 桌面 1280×720 | 首页、全部主线 DOM、正文结构/表格/图示；19 章、76 个清单输入、12 幅主线图已核对 |
| 手机 390×844 | 首页、Agent Loop 图、论文库、项目库、路线图、术语/FAQ、工坊大厅与 3 项目；记录图解小字和项目横向溢出 |
| 窄屏 320×740 / 平板 900×800 | 论文库布局与卡片宽度检查；不是每一页每一断点都做截图 |
| 三个实战项目 | 17/11/14 个代码块，3/2/2 幅项目图；手机文档没有额外页面横向溢出；项目导航可点击 |
| 搜索/FAQ/演示 | 论文无结果提示正常；FAQ 鼠标点击展开正常；演示单步/重置正常；键盘缺陷另列 |
| 路由 | lab-p3 刷新回首页已复现；论文/项目切换地址未同步已确认 |
| 清单 | 跨章写入覆盖已复现；测试结束恢复 EXP 0/94，与测试前一致 |
| 离线复现 | 空摘录、伪造后缀、judge 类型不匹配、路径越界计算、入队失败后重投递被去重，全部复现；没有发真实请求或写目录外文件 |
| 构建 / lint | build 通过；lint 0 errors、5 既有 warnings；主包及无效动态导入警告仍在 |
| 原有检查 | 成本 12 断言、45 段 Python 语法与已有离线逻辑检查通过；数据格式检查通过；资源终检 14 项通过 |
| 数据格式检查的局限 | “ALL CLEAN”只代表链接形状/字段/文件等完整，未检测学科误收，不能据此宣称论文质量合格 |

本轮没有执行付费模型、沙箱或真实 GitHub 评论，也没有测屏幕阅读器、真实手机性能、弱网和全量外链可用性。UI 结论来自实际浏览器操作、DOM/截图和源代码；教学安全问题来自代码静态分析及所列离线复现，未把未执行的集成测试算作通过。

## 证据与后续验收

- [手机图解截图](ui-evidence-2026-10-03/mobile-diagram.jpg)
- [手机项目库截图](ui-evidence-2026-10-03/mobile-project-overflow.jpg)
- [离线复现脚本](reproduce-review-findings.mjs)：`node audits/reproduce-review-findings.mjs`
- [前轮版本与协议核查来源](update-sources-2026-10-03.md)：本轮沿用已修订的型号快照，未重新给全部供应商做实时接口验证。
- UI 检查参照 [Web Interface Guidelines](https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md)，本轮已读取最新文本；对比度为本地按颜色值计算。

修复后的关键验收用例：跨章清单合并与刷新；手机关闭目录后的 Tab/Shift+Tab/Escape；FAQ 键盘展开；lab/章节/筛选链接刷新与后退；长仓库名与手机图解；API 错误不记成功；队列失败可恢复；引用空白/伪造/失效来源不能变成无证据事实；重新运行采集流程不会回退内容修订。
