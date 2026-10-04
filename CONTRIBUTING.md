# 贡献指南 (Contributing Guide)

感谢你关注并有意向为 **《AGENT 开发工程师全指南》(Agent Dev Guide)** 贡献力量！  
本项目是一个面向工业级落地、开源开放、数据驱动的像素风互动式手册。我们非常欢迎来自社区的 Issue 讨论、论文推荐、开源项目补充、内容勘误与实战演练贡献。

---

## 目录

- [一、 快速开始与本地开发](#一-快速开始与本地开发)
- [二、 目录架构与设计约定](#二-目录架构与设计约定)
- [三、 贡献类型与具体规范](#三-贡献类型与具体规范)
  - [1. 推荐/补录学术论文](#1-推荐补录学术论文)
  - [2. 推荐开源兵器库项目](#2-推荐开源兵器库项目)
  - [3. 内容勘误与主线章节修订](#3-内容勘误与主线章节修订)
  - [4. 新增或完善实战教学项目](#4-新增或完善实战教学项目)
- [四、 质量门禁与本地验证](#四-质量门禁与本地验证)
- [五、 Git 提交规范与 PR 流程](#五-git-提交规范与-pr-流程)
- [六、 语义化版本发布规范 (SemVer)](#六-语义化版本发布规范-semver)

---

## 一、 快速开始与本地开发

本项目基于 **Vite + React 19** 构建，零重型 UI 框架依赖，保证极速启动与纯粹的底层掌控力。

```bash
# 1. 克隆代码仓库
git clone https://github.com/<your-username>/agent-dev-guide.git
cd agent-dev-guide

# 2. 安装依赖 (推荐 Node.js >= 20.0.0)
npm install

# 3. 启动本地开发服务 (支持 HMR 热更新)
npm run dev

# 4. 执行生产构建
npm run build

# 5. 本地预览生产构建产物
npm run preview
```

---

## 二、 目录架构与设计约定

在着手修改前，请熟悉本项目的模块分工：

```text
agent-dev-guide/
├── public/                 # 静态资产 (本地托管的像素字体、论文 PDF 库、原著图、SVG 图标)
│   ├── figures/            # 提取自官方论文的高清矢量/位图图解
│   ├── fonts/              # 本地托管的 Fusion Pixel 与 Press Start 2P 字体
│   └── papers/             # 88+ 篇归类论文的原版 PDF 资产库
├── src/
│   ├── chapters/           # 主线 19 章 (Ch01.jsx ~ Ch19.jsx) 与支线独立页面
│   │   ├── labs/           # 3 大企业级实战工坊项目 (ATLAS, SCOUT, SENTINEL)
│   │   ├── PapersPage.jsx  # 论文军火库 (即时搜索 + 11 类别筛选 + 本地 PDF 预览)
│   │   ├── ProjectsPage.jsx# GitHub 兵器谱 (星标快照、技术栈标签、官方文档直达)
│   │   └── VersionsPage.jsx# 版本与文档管理中心 (更新日志 + 贡献指引)
│   ├── components/         # 纯手绘 SVG 图解 (Diag.jsx)、代码块、终端仿真器与图标系统
│   ├── data/               # 结构化数据源 (papers.json, projects.json, version.json)
│   └── lib/                # 路由状态机 (navigation.js)、通关进度 (progress.js)、剪贴板 (clipboard.js)
├── tools/                  # 自动化维护脚本 (下载流水线、引用比对、发版工具、终检门禁)
├── .github/                # GitHub 社区规范模板与 CI/CD 自动化流水线
└── WORKLOG.md              # 严密的迭代研发日志
```

---

## 三、 贡献类型与具体规范

### 1. 推荐/补录学术论文
- **准入标准**：聚焦于 2022-2026 年间在智能体领域具备奠基性、代表性或重大技术突破的论文（arXiv / ACL / NeurIPS / ICLR 等）。
- **元数据要求**：在 `src/data/papers.json` 中配置清晰的字段，包括：
  - `id`: 标准 10 位 arXiv ID（如 `2210.03629`）
  - `title`: 准确英文全称
  - `cat`: 所属分类（`foundations`, `planning`, `tooluse`, `multiagent`, `memory`, `rag`, `code`, `web`, `eval`, `safety`, `frontier`）
  - `lead`: 中文导读（1-2 句核心贡献与行业意义）
- **PDF 同步**：推荐使用内置 CLI 工具自动拉取元数据与下载 PDF：
  ```bash
  node tools/add-paper.mjs <arXiv-id> <category>
  ```

### 2. 推荐开源兵器库项目
- **准入标准**：工业生产中广泛采用、活跃维护、或具有突破性架构理念的高星开源仓库（SDK、运行时、沙箱、评测框架、协议实现）。
- **配置路径**：在 `src/data/projects.json` 中维护。要求包含项目全称、GitHub `owner/repo` 路径、定位一句话说明、主要语言与场景分类标签。

### 3. 内容勘误与主线章节修订
- **认知准则**：所有论述必须对照一线厂商（Anthropic, OpenAI, Google, Microsoft）公开技术白皮书及最新行业实践。
- **严禁陈旧表述**：如提及模型、架构、版本或性能对比，请核查是否为当前主流版本。
- **链接与格式规范**：正文新增超链接必须使用语义文字包裹，外链需自动支持安全属性 `target="_blank" rel="noreferrer"`。

### 4. 新增或完善实战教学项目
- 实战项目存放于 `src/chapters/labs/`。
- 每个项目必须具备：
  - `LabHead`（业务背景、技术栈、对标产品、简历句式模板）；
  - `LabToc`（M0~M6 里程碑路标导航）；
  - `Mile`（需求分析、架构决策表 `Adr`、模块文件树 `FileTree`、生产代码 `CodeBlock`）；
  - `LabFoot`（通关清单 `QuestList` 与闭环引导）。

---

## 四、 质量门禁与本地验证

提交 Pull Request 之前，**必须在本地依次运行并通过全套审计门禁**：

```bash
# 1. 校验数据格式完整度 (JSON 语法、字段规范)
node tools/check-data.mjs

# 2. 校验正文 arXiv 引用与论文库差集 (确保无引用外孤立论文)
node tools/audit-cited-diff.mjs

# 3. 运行 14 项全站资源与构建终检门禁
node tools/final-check.mjs

# 4. 执行生产级打包并确认零警告通过
npm run build
```

**门禁标准**：
- `final-check.mjs` 必须显示 `ALL SYSTEMS GO ★`（14/14 PASS）。
- 构建产物不得产生破坏性样式冲突或静态资产 404。

---

## 五、 Git 提交规范与 PR 流程

我们遵循 [Conventional Commits](https://www.conventionalcommits.org/) 规范编写提交信息：

- `feat:` 新增主线章节、实战项目、交互组件或重大功能
- `fix:` 修复样式错位、链接失效、内容勘误或逻辑缺陷
- `docs:` 纯文档或注释更新（如 README、CONTRIBUTING 补充）
- `paper:` 推荐或补录学术论文及导读
- `project:` 增补或更新 GitHub 兵器谱开源项目
- `chore:` 依赖升级、构建配置或工程维护脚本调整

**PR 提交流程**：
1. Fork 本仓库并基于 `main` 分支拉出特性分支（如 `git checkout -b feat/add-deep-research-paper`）；
2. 保持原子化提交，并包含清晰的意图说明；
3. 本地运行 `npm run build && node tools/final-check.mjs` 验证通过；
4. 提交 PR 并按 `.github/PULL_REQUEST_TEMPLATE.md` 勾选自查清单；
5. CI 自动化流水线检查通过后，核心维护者将及时审核与合入。

---

## 六、 语义化版本发布规范 (SemVer)

本项目采用 [Semantic Versioning 2.0.0](https://semver.org/lang/zh-CN/) 进行版本管理：

- **主版本号 (Major，如 v2.0.0)**：手册架构彻底重构、学习路线体系重编或颠覆性交互形态上线。
- **次版本号 (Minor，如 v1.2.0)**：新增完整主线攻略章节、新增实战工坊项目、上线重磅交互功能。
- **修订号 (Patch，如 v1.1.1)**：正文内容勘误、模型版本时效性修正、增补论文/开源项目、UI 与移动端体验微调。

每次发布新版本请同步更新 `src/data/version.json` 与 `WORKLOG.md`，并在 UI 内置的 `#versions` 页面记录完整的发布日志。

感谢你的每一份付出，让我们一起打造最顶级的开源 Agent 工程师宝典！
