import { FigRoadmap } from '../components/Diag2.jsx'

export default function RoadmapPage() {
  return (
    <div className="page">
      <div className="page-head">
        <div className="ch-meta">
          <span className="ch-level">EXTRA · 支线</span>
          <span className="ch-mins">🗺️ 12 周学习建议 · 按个人进度调整</span>
        </div>
        <h1 className="ch-title">小白进化路线图</h1>
        <div className="ch-en">LEVEL-UP ROADMAP — ZERO TO AGENT MASTER</div>
      </div>

      <FigRoadmap />

      <div className="card gold" style={{ marginTop: 26 }}>
        <span className="card-tag">总原则</span>
        ① <strong>项目制学习</strong>:每一阶段以「做出东西」为里程碑,不以「看完视频」为里程碑;② <strong>读懂论文摘要即可动手</strong>,卡住再精读;③ 每周固定时间复盘:本周做的 agent 哪里翻车了?翻车点通常就是下一周该学的知识点。
      </div>

      <div className="road-grid">
        <div className="road-phase">
          <div className="ph-head"><span>第 1-2 周 · 打地基</span><span className="lv">LV.1-2</span></div>
          <ul>
            <li>通读本书 CH.01-04,跑通 CH.02/05 的 API 代码</li>
            <li><b>项目①</b>:命令行聊天机器人(流式输出 + token 统计)</li>
            <li>精读:Attention Is All You Need(可只读引言+图)、ReAct</li>
            <li>刷:Anthropic《Building Effective Agents》</li>
          </ul>
        </div>
        <div className="road-phase">
          <div className="ph-head"><span>第 3-5 周 · 造循环</span><span className="lv">LV.3-4</span></div>
          <ul>
            <li>CH.03/05/06:手写 Agent Loop → 加工具 → 接 MCP</li>
            <li><b>项目②</b>:「研究员 agent」——搜网页+读文件+写 markdown 报告</li>
            <li>装一个 MCP server(如 filesystem),让 Claude/Cursor 用上</li>
            <li>阅读 smolagents 的 Agent Loop 与工具执行入口，画出调用流程；代码量随版本变化</li>
          </ul>
        </div>
        <div className="road-phase">
          <div className="ph-head"><span>第 6-8 周 · 上强度</span><span className="lv">LV.5-7</span></div>
          <ul>
            <li>CH.07-10:沙箱、框架、记忆、RAG 各完成一次最小实践</li>
            <li><b>项目③</b>:给项目②加「记忆 + RAG 知识库 + 沙箱跑代码」</li>
            <li>选定主框架(LangGraph / OpenAI SDK / Mastra)重写项目③,对比体会</li>
            <li>精读:MemGPT、SWE-bench、GAIA</li>
          </ul>
        </div>
        <div className="road-phase">
          <div className="ph-head"><span>第 9-10 周 · 学会度量</span><span className="lv">LV.8</span></div>
          <ul>
            <li>CH.15/17:给项目③建 50 条黄金任务集 + promptfoo CI</li>
            <li><b>项目④</b>:用 eval 驱动为项目③建立完成率、时延与费用基线，做一次改动并报告变化及样本量</li>
            <li>接入 Langfuse,学会读 trace、算成本</li>
          </ul>
        </div>
        <div className="road-phase">
          <div className="ph-head"><span>第 11-12 周 · 完成综合实践</span><span className="lv">LV.9-10</span></div>
          <ul>
            <li>CH.12/13/14/16/18/19:多智能体、安全、协议各过一遍</li>
            <li><b>毕业项目⑤</b>:多 agent 协作系统(如「自动调研+写作+审稿」流水线),含沙箱、权限闸门、评估看板</li>
            <li>给项目写一篇复盘博客/做一次分享——输出是最后 10% 的学习</li>
          </ul>
        </div>
        <div className="road-phase">
          <div className="ph-head"><span>毕业之后</span><span className="lv">NEW GAME+</span></div>
          <ul>
            <li>跟进:每月挑 1 篇新论文 + 1 个新框架 release notes</li>
            <li>深耕:选一个垂直方向(GUI agent / 代码 agent / 记忆系统)读遍其顶会论文</li>
            <li>参与:给开源 agent 项目提 PR、把 MCP server 做成产品</li>
          </ul>
        </div>
      </div>

      <div className="card idea" style={{ marginTop: 24 }}>
        <span className="card-tag">比框架更值钱 · 六个工程判断力</span>
        真实工作里区分「能跑 demo」和「能交付」的,是这些习惯:① <strong>证据规划</strong>——方案里每个关键假设都标注「依据是什么、错了怎么办」;② <strong>范围契约</strong>——接任务先写清做什么、不做什么、验收标准,防止 agent 项目范围无限膨胀;③ <strong>隔离委派</strong>——可并行的探索分给 sub-agent 或同事,汇总点只收结论不收过程;④ <strong>最小可测切片</strong>——先打通一条端到端最薄的链路,再横向加厚;⑤ <strong>保留判断的规格</strong>——把「agent 决定」与「人来决定」的边界写进设计文档;⑥ <strong>反馈棘轮</strong>——每一次真实使用的翻车都变成一条 checklist 或 eval 用例,只进不退。这些是 2026 年一线 agent 团队的通用工程语言,与本书 CH.15/16/17 完全互补。
      </div>

      <div className="card tip" style={{ marginTop: 24 }}>
        <span className="card-tag">时间不够?</span>
        精简版(4 周):周 1 = CH.01-05 + 项目①②合并;周 2 = CH.06-10 + 项目③;周 3 = CH.15-16 + 项目④;周 4 = CH.11-14/17-19 快速通读 + 毕业项目缩水版。代价是少踩的坑以后都会补回来——学习守恒定律。
      </div>
    </div>
  )
}
