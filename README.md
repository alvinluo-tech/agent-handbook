# 🤖 AGENT 开发工程师全指南 (Agent Dev Guide)

<p align="center">
  <img src="public/favicon.svg" alt="Agent Dev Guide Logo" width="100" height="100" />
</p>

<p align="center">
  <strong>From Zero to Agent Master —— 面向工业级落地、开源开放、数据驱动的像素风全栈智能体工程师培养手册</strong>
</p>

<p align="center">
  <a href=".github/workflows/ci.yml"><img src="https://img.shields.io/badge/CI-Passing-brightgreen?style=flat-square&logo=githubactions" alt="CI Status" /></a>
  <a href="https://vercel.com"><img src="https://img.shields.io/badge/Deploy-Vercel-black?style=flat-square&logo=vercel" alt="Deploy to Vercel" /></a>
  <a href="src/data/version.json"><img src="https://img.shields.io/badge/Version-v1.1.0-blueviolet?style=flat-square" alt="Version v1.1.0" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square" alt="License: MIT" /></a>
  <a href="package.json"><img src="https://img.shields.io/badge/React-19.2-61dafb?style=flat-square&logo=react" alt="React 19" /></a>
  <a href="package.json"><img src="https://img.shields.io/badge/Vite-8.3-646CFF?style=flat-square&logo=vite" alt="Vite 8" /></a>
  <a href="CONTRIBUTING.md"><img src="https://img.shields.io/badge/PRs-Welcome-brightgreen.svg?style=flat-square" alt="PRs Welcome" /></a>
</p>

---

## 📖 项目简介 (Overview)

2023 年行业还在争论「ChatGPT 是不是 AGI」，2026 年的今天，「Agent（智能体）」已经成为现代软件工程的通用核心原语。

**《AGENT 开发工程师全指南》** 是一本完全由工业实践与学术前沿驱动的**交互式像素风开源开发手册**。从底层的感知-思考-行动心跳循环（Agent Loop）、上下文工程、MCP 协议、安全沙箱，一路打到工业级 RAG 检索、多智能体协同拓扑、代码智能体（SWE-bench）与安全护栏。

全书所有认知与代码严格对照 **Anthropic / OpenAI / Google / 微软** 等一线大厂公开工程实践与经典权威论文整理，并配备：
- **纯手绘 SVG 像素架构图解**（无外部重型矢量库依赖）；
- **动态终端循环仿真器**（可视化 ReAct 状态机）；
- **3 大企业级实战工坊**（44 份完整工业 Python/SQL/配置源码与 ADR 决策表）；
- **88 篇权威学术论文军火库**（支持即时搜索与本地 PDF 预览）；
- **68 个高星开源项目兵器谱**（维护度采集与技术选型点评）；
- **UI 内置「版本与文档管理中心」**（遵循 SemVer 2.0.0 规范，开源协作清晰可溯）。

---

## 🌟 核心特色 (Key Highlights)

| 特色模块 | 详细说明 |
| :--- | :--- |
| **🕹️ 像素风沉浸体验** | 纯手写 SVG 图解（`shapeRendering: crispEdges`）、复古 CRT 扫描线与像素字体，告别枯燥的长文排版。 |
| **🏆 游戏化通关清单** | 每章末尾设有通关技能清单，勾选自动累积 EXP，驱动侧边栏从 `LV.1 见习工程师` 升级至 `LV.10 满级智能体架构师`。 |
| **⚙️ 纯粹零框架依赖** | 仅基于 React 19 + Vite 构建，零任何冗余 UI 组件库，极速秒开（产物经过 Rollup 细粒度代码分割）。 |
| **📚 论文军火库 (88 篇)** | 分为 11 大类，全部配备中文导读、核心贡献摘要，本地附带 90 份原版 PDF，开卷即读。 |
| **⚔️ GitHub 兵器谱 (68 个)** | 涵盖运行时、协议、沙箱、评测、GUI 计算机操作等多维生态，包含官方链接、定位解析与选型考量。 |
| **🔨 企业级实战工坊 (3 个)** | 提供真实 SaaS 客服中台（ATLAS）、深度研究局（SCOUT）与代码审查哨兵（SENTINEL）的架构设计与实现。 |
| **📜 专属文档与版本管理** | UI 内置 `#versions` 管理中心，结构化记录 Semantic Versioning 迭代脉络与全流程贡献指引。 |

---

## 📚 19 篇核心主线攻略 (Curriculum)

| 章节 | 编号与图标 | 中文标题 | 核心掌握能力 | 预计耗时 |
| :---: | :---: | :--- | :--- | :---: |
| **01** | `CH.01` 🤖 | [什么是 Agent?](#) | 区分 Workflow 与 Agent（控制流归属）、五大组件公式、自主性 L1~L5 阶梯 | 12 min |
| **02** | `CH.02` 🧱 | [LLM 速成底座](#) | Token、上下文窗口、推理计算预算取舍、模型能力与系统上限 | 15 min |
| **03** | `CH.03` 🔁 | [Agent Loop: 心跳与灵魂](#) | ReAct 循环四拍（感知/推理/行动/观察）、硬熔断与智能熔断机制 | 18 min |
| **04** | `CH.04` 🎒 | [上下文工程](#) | 8 类上下文组织、Compaction 压缩、Note-taking、KV-Cache 命中设计 | 16 min |
| **05** | `CH.05` 🔧 | [工具使用与 Function Calling](#) | 工具 Schema 设计哲学、时序闭环、Anthropic Agent Skills 渐进式披露 | 16 min |
| **06** | `CH.06` 🔌 | [MCP: AI 界的 USB-C](#) | Model Context Protocol 原语（Tools/Resources/Prompts）、安全三坑 | 15 min |
| **07** | `CH.07` 📦 | [沙箱: 放心跑代码](#) | 容器 / gVisor / Firecracker 微 VM 隔离阶梯、E2B / Daytona 实践 | 14 min |
| **08** | `CH.08` 🏭 | [Runtime 与框架选型](#) | LangGraph / AutoGen / CrewAI / LlamaIndex 架构横评与无框架裸写决策 | 18 min |
| **09** | `CH.09` 🧠 | [记忆系统](#) | 工作/情景/语义/程序性四类记忆分层、MemGPT 分页机制、Mem0/Letta | 16 min |
| **10** | `CH.10` 📚 | [RAG 与知识工程](#) | 混合检索（pgvector + BM25）、RRF 融合重排、Agentic RAG vs 长窗口 | 16 min |
| **11** | `CH.11` 🗺️ | [规划与推理](#) | CoT / ToT / Reflexion 反思对比、Plan-and-Execute 延迟与成本控制 | 15 min |
| **12** | `CH.12` 👥 | [多智能体系统](#) | Orchestrator-Worker / 辩论 / 群聊拓扑，上下文隔离与避免系统过载 | 18 min |
| **13** | `CH.13` 🖥️ | [计算机操作与浏览器 Agent](#) | 视觉截图 vs DOM/Accessibility 树、Playwright/OSWorld 现实挑战 | 15 min |
| **14** | `CH.14` 👩‍💻 | [代码智能体](#) | SWE-bench 标准流程、ACI 设计、Harness 支架对解决率的决定性影响 | 16 min |
| **15** | `CH.15` 📏 | [评估: Eval 驱动开发](#) | 黄金基准集（Golden Set）、LLM-as-a-judge 校准、CI 自动化回归回归 | 16 min |
| **16** | `CH.16` 🛡️ | [安全: 提示注入与护栏](#) | 直接/间接提示注入防御、分层防御、最小特权与高危操作人工确认闸门 | 17 min |
| **17** | `CH.17` 📡 | [可观测性与成本](#) | OpenTelemetry Trace 追踪、Prompt Caching 省钱实操、延迟与轮数断路器 | 13 min |
| **18** | `CH.18` 🌐 | [协议生态与 Agent 互联网](#) | MCP / A2A / AG-UI / AP2 协议栈分层、Agent Card 发现与跨系统协作 | 14 min |
| **19** | `CH.19` 🚀 | [前沿雷达](#) | 自进化 Agent（ADAS / AlphaEvolve）、Deep Agents、智能体经济学 | 15 min |

---

## 🔨 实战工坊三剑客 (Enterprise Labs Matrix)

实战工坊提供 3 个完整的教学工程项目，包含技术选型架构、44 份工业代码文件与关键 ADR 决策表：

| 项目代号 | 业务场景 | 技术栈组合 | 对标产品 | 核心锻造能力 |
| :---: | :--- | :--- | :--- | :--- |
| **LAB.01<br />ATLAS** | **B2B SaaS 智能客服中台** | Python 3.12 · FastAPI · pgvector · Pydantic v2 · pytest | Intercom Fin<br />Decagon<br />Sierra | 混合检索 RAG、受控工具调用、双层防注入护栏、自动升级人工打包、Golden Set 回归评测 |
| **LAB.02<br />SCOUT** | **全自动深度研究局 (Deep Research)** | Python 3.12 · Crawl4AI · asyncio · SQLite/DuckDB · ReportLab | OpenAI Deep Research<br />Perplexity Pro | 规划拆解 (Lead)、并行爬虫 (Worker)、证据账本 (Ledger)、交叉自审验证、结构化长篇研报生成 |
| **LAB.03<br />SENTINEL** | **生产级代码审查哨兵 (Code Reviewer)** | Python 3.12 · GitHub REST/Webhook · unidiff · tree-sitter | CodeRabbit<br />Copilot PR Review | Webhook 幂等处理、Diff 解析、代码规则匹配、LLM 幻觉去重、高信噪比内联评论直发 |

---

## 🚀 快速开始与本地开发 (Quickstart)

### 环境准备
- 推荐 **Node.js >= 20.0.0**
- 推荐使用 npm、pnpm 或 yarn

### 运行步骤
```bash
# 1. 克隆项目到本地
git clone https://github.com/<your-username>/agent-dev-guide.git
cd agent-dev-guide

# 2. 安装依赖
npm install

# 3. 启动本地开发服务器 (支持极速 HMR)
npm run dev
# 浏览器访问: http://localhost:5173

# 4. 执行全套数据校验与系统完整性终检
npm run check

# 5. 生产打包并预览
npm run build
npm run preview
```

---

## 🌐 公开部署指南 (Deployment)

本项目为纯前端静态应用，支持部署至任意主流托管平台：

### 1. 部署到 Vercel (推荐，零配置极速上线)
本项目原生针对 Vercel 进行了优化适配，享有全球边缘 CDN 加速与 PR 自动化分支预览体验：
1. 登录 [Vercel 控制台](https://vercel.com/)，点击 **Add New -> Project**；
2. 授权并选择导入你的 GitHub 仓库 `alvinluo-tech/agent-handbook`；
3. Framework Preset 会被自动检测为 **Vite**；
4. 保持标准默认配置即可：
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
5. 点击 **Deploy**，约 30 秒即可构建完成并获得全球 HTTPS 访问链接（支持一键绑定个性化自定义域名）。

### 2. 部署到 Cloudflare Pages / Netlify / 其他静态托管
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Root Directory**: `./`

### 3. Docker 容器化部署
利用标准 Nginx 镜像即可轻量托管：
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

---

## 🛠️ 质量门禁与开发者 CLI 工具链

为了方便开源社区持续维护与迭代，本项目提供多项自动化维护脚本：

```bash
# 运行数据合规性、正文引用差集与 14 项全系统终检门禁
npm run check

# 一键拉取 arXiv 论文元数据并下载 PDF 归类录入
npm run add:paper <arxiv-id> <category> "<中文导读>"
# 示例: npm run add:paper 2305.16291 web "Voyager: 开放世界自主探索智能体"

# 语义化版本发版工具 (自动更新 package.json / version.json / WORKLOG 并跑门禁)
npm run release <patch | minor | major> "<发布标题>" "<核心摘要>"
# 示例: npm run release patch "更新模型流派最新对比" "同步 DeepSeek 与 Claude 最新参数"
```

---

## 🤝 参与贡献 (Contributing)

我们非常欢迎来自全球开发者的各种形式贡献！无论是修补错别字、提交新论文推荐、补充开源项目还是提出新章节构想：

- 详见完整的 **[贡献指南 (CONTRIBUTING.md)](CONTRIBUTING.md)**；
- 请遵守 **[行为准则 (CODE_OF_CONDUCT.md)](CODE_OF_CONDUCT.md)**；
- 安全问题请参阅 **[安全政策 (SECURITY.md)](SECURITY.md)**；
- 欢迎使用预设的 **[Issue 模板](.github/ISSUE_TEMPLATE/)** 与 **[PR 模板](.github/PULL_REQUEST_TEMPLATE.md)**。

---

## 📜 许可证 (License)

本项目采用 [MIT 许可证](LICENSE) 开源。  
收录之学术论文版权归属原作者与相关学术机构，仅供教学与非营利性学术交流。

---

<p align="center">
  <sub>Made with ❤️ by Auto-Dev Agent Engineering Community · 持续演进中</sub>
</p>
