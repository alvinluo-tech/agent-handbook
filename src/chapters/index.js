import { lazy } from 'react'
// 章节注册表:主线 19 章 + 支线页面
const Ch01 = lazy(() => import('./Ch01.jsx'))
const Ch02 = lazy(() => import('./Ch02.jsx'))
const Ch03 = lazy(() => import('./Ch03.jsx'))
const Ch04 = lazy(() => import('./Ch04.jsx'))
const Ch05 = lazy(() => import('./Ch05.jsx'))
const Ch06 = lazy(() => import('./Ch06.jsx'))
const Ch07 = lazy(() => import('./Ch07.jsx'))
const Ch08 = lazy(() => import('./Ch08.jsx'))
const Ch09 = lazy(() => import('./Ch09.jsx'))
const Ch10 = lazy(() => import('./Ch10.jsx'))
const Ch11 = lazy(() => import('./Ch11.jsx'))
const Ch12 = lazy(() => import('./Ch12.jsx'))
const Ch13 = lazy(() => import('./Ch13.jsx'))
const Ch14 = lazy(() => import('./Ch14.jsx'))
const Ch15 = lazy(() => import('./Ch15.jsx'))
const Ch16 = lazy(() => import('./Ch16.jsx'))
const Ch17 = lazy(() => import('./Ch17.jsx'))
const Ch18 = lazy(() => import('./Ch18.jsx'))
const Ch19 = lazy(() => import('./Ch19.jsx'))
const RoadmapPage = lazy(() => import('./RoadmapPage.jsx'))
const GlossaryPage = lazy(() => import('./GlossaryPage.jsx'))
const VersionsPage = lazy(() => import('./VersionsPage.jsx'))

export const CHAPTERS = [
  { id: 'ch01', num: 'CH.01', icon: '🤖', title: '什么是 Agent?', en: 'WHAT IS AN AGENT — DEFINITIONS & SPECTRUM', mins: 12, quests: ['能说清 Workflow 与 Agent 的区别(控制流由谁决定)', '能画出 Agent 五大组件公式', '知道 2025-26 主流大厂对 Agent 的定义差异', '理解「自主性越高,护栏越多」'], Comp: Ch01 },
  { id: 'ch02', num: 'CH.02', icon: '🧱', title: 'LLM 速成底座', en: 'LLM CRASH COURSE FOR AGENT BUILDERS', mins: 15, quests: ['能解释 token / 上下文窗口 / 温度', '知道推理模式与预算的取舍', '能读懂上下文与输出预算参数', '理解「模型能力 = Agent 能力上限」'], Comp: Ch02 },
  { id: 'ch03', num: 'CH.03', icon: '🔁', title: 'Agent Loop:心跳与灵魂', en: 'THE AGENT LOOP — PERCEIVE, REASON, ACT, OBSERVE', mins: 18, quests: ['能徒手写出最小 Agent Loop 伪代码', '理解 ReAct 循环与终止条件设计', '知道循环失控的典型症状与断路器', '跑一遍本章的循环演示'], Comp: Ch03 },
  { id: 'ch04', num: 'CH.04', icon: '🎒', title: '上下文工程', en: 'CONTEXT ENGINEERING — THE NEW PROMPT ENGINEERING', mins: 16, quests: ['能列举上下文窗口里的 8 类内容', '理解 compaction 压缩与 note-taking', '知道 KV-cache 友好设计的 3 条原则', '会用 sub-agent 隔离脏上下文'], Comp: Ch04 },
  { id: 'ch05', num: 'CH.05', icon: '🔧', title: '工具使用与 Function Calling', en: 'TOOL USE & FUNCTION CALLING', mins: 16, quests: ['能写出一份合格的工具 Schema', '理解工具调用完整时序(意图→执行→回填)', '掌握工具描述优化的技巧', '知道并行调用与工具数量上限的权衡'], Comp: Ch05 },
  { id: 'ch06', num: 'CH.06', icon: '🔌', title: 'MCP:AI 界的 USB-C', en: 'MODEL CONTEXT PROTOCOL DEEP DIVE', mins: 15, quests: ['能画 MCP Host/Client/Server 架构', '区分 tools / resources / prompts 三原语', '亲手跑通一个 MCP server(stdio)', '知道 MCP 安全三坑(投毒/混淆代理/令牌透传)'], Comp: Ch06 },
  { id: 'ch07', num: 'CH.07', icon: '📦', title: '沙箱:放心跑代码', en: 'SANDBOXING — ISOLATION FOR UNTRUSTED CODE', mins: 14, quests: ['能说清容器/gVisor/微VM 隔离层次', '理解为什么 AI 代码必须强隔离', '知道 E2B / Daytona 的定位', '会给沙箱加资源限额与超时'], Comp: Ch07 },
  { id: 'ch08', num: 'CH.08', icon: '🏭', title: 'Runtime 与框架选型', en: 'AGENT RUNTIMES & FRAMEWORK LANDSCAPE', mins: 18, quests: ['能对比主流框架的定位差异', '理解「要不要框架」论战双方论点', '知道生产选型的 4 个判据', '理解 Agent Runtime = 循环+状态+工具+护栏'], Comp: Ch08 },
  { id: 'ch09', num: 'CH.09', icon: '🧠', title: '记忆系统', en: 'MEMORY — WORKING, EPISODIC, SEMANTIC, PROCEDURAL', mins: 16, quests: ['能区分 4 类记忆与存储位置', '理解 MemGPT 的记忆分页思想', '知道 mem0 / Letta / Zep 的取舍', '会设计一条记忆写入/遗忘策略'], Comp: Ch09 },
  { id: 'ch10', num: 'CH.10', icon: '📚', title: 'RAG 与知识工程', en: 'RAG & KNOWLEDGE ENGINEERING', mins: 16, quests: ['能画出 RAG 双流水线', '知道切块/嵌入/重排的关键参数', '理解 Agentic RAG 与传统 RAG 差异', '知道什么时候该 RAG、什么时候该长上下文'], Comp: Ch10 },
  { id: 'ch11', num: 'CH.11', icon: '🗺️', title: '规划与推理', en: 'PLANNING & REASONING — COT, TOT, REFLEXION', mins: 15, quests: ['能解释 CoT / ToT / Reflexion 的差异', '理解 plan-and-execute 与 ReAct 的取舍', '知道「会反思」带来的收益与成本', '能把规划技术落到 prompt 或框架参数'], Comp: Ch11 },
  { id: 'ch12', num: 'CH.12', icon: '👥', title: '多智能体系统', en: 'MULTI-AGENT SYSTEMS — WHEN ONE IS NOT ENOUGH', mins: 18, quests: ['能画出三种多智能体拓扑', '知道 orchestrator-worker 的适用条件', '理解上下文隔离是 sub-agent 的核心价值', '知道何时「不要」用多智能体'], Comp: Ch12 },
  { id: 'ch13', num: 'CH.13', icon: '🖥️', title: '计算机操作与浏览器 Agent', en: 'COMPUTER USE & BROWSER AGENTS', mins: 15, quests: ['理解截图路线 vs DOM/可访问性树路线', '知道 CUA 四大架构流派', '能说出 browser-use / playwright-mcp 定位', '知道 GUI agent 的成功率现实与风控'], Comp: Ch13 },
  { id: 'ch14', num: 'CH.14', icon: '👩‍💻', title: '代码智能体', en: 'CODING AGENTS & SWE-BENCH', mins: 16, quests: ['能说出代码 agent 的标准工作流', '理解 ACI(agent-computer interface)设计', '知道 SWE-bench Verified 的含义', '理解 harness 工程为何成为胜负手'], Comp: Ch14 },
  { id: 'ch15', num: 'CH.15', icon: '📏', title: '评估:Eval 驱动开发', en: 'EVALS — MEASURE BEFORE YOU SCALE', mins: 16, quests: ['能搭建最小 eval 集(任务+判分)', '区分结果评估与轨迹评估', '知道 LLM-as-judge 的校准坑', '理解 pass@k 与基准饱和问题'], Comp: Ch15 },
  { id: 'ch16', num: 'CH.16', icon: '🛡️', title: '安全:注入与护栏', en: 'SECURITY — PROMPT INJECTION & GUARDRAILS', mins: 17, quests: ['能演示一次间接提示注入的原理', '记住 OWASP LLM Top 10 前三项', '会设计最小权限 + 高危操作人工闸门', '理解分层防御与残余风险'], Comp: Ch16 },
  { id: 'ch17', num: 'CH.17', icon: '📡', title: '可观测性与成本', en: 'OBSERVABILITY, TRACING & COST ENGINEERING', mins: 13, quests: ['会读一条 agent trace(时间线+token)', '知道 prompt caching 省钱原理', '能列出延迟预算的大头', '会设置预算/轮数熔断'], Comp: Ch17 },
  { id: 'ch18', num: 'CH.18', icon: '🌐', title: '协议生态与 Agent 互联网', en: 'PROTOCOL STACK — MCP, A2A, AG-UI, AP2', mins: 14, quests: ['能画出 agent 协议栈分层', '区分 MCP / A2A / AG-UI / AP2 职责', '理解「协议热」背后的产业逻辑', '知道选协议时的评估维度'], Comp: Ch18 },
  { id: 'ch19', num: 'CH.19', icon: '🚀', title: '前沿雷达', en: 'FRONTIER — SELF-EVOLVING, DEEP AGENTS & BEYOND', mins: 15, quests: ['了解自进化 agent(ADAS/DGM/AFlow)', '理解 Deep Agents 的共性组件', '知道 agent 经济学(成本/定价/支付)', '形成自己对 next 的判断框架'], Comp: Ch19 },
]

export const EXTRAS = { roadmap: RoadmapPage, glossary: GlossaryPage, versions: VersionsPage }
