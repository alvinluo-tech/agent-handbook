import { Chapter } from '../components/Bits.jsx'

export default function Ch14() {
  return (
    <Chapter ch={{
      id: 'ch14', num: 'CH.14', icon: '👩‍💻', title: '代码智能体', en: 'CODING AGENTS & SWE-BENCH', mins: 16,
      quests: ['能说出代码 agent 的标准工作流', '理解 ACI(agent-computer interface)设计', '知道 SWE-bench Verified 的含义', '理解 harness 工程为何成为胜负手'],
    }}>
      <p>代码是 Agent 最能施展拳脚的领域:目标可验证(测试通过没有?)、环境数字化(终端+文件系统)、反馈即时。这也让代码 agent(Claude Code、OpenHands、Aider、Cline……)成为目前<strong>已有较多可验证工程实践</strong>的 Agent 品类——而它们的设计模式,正在反哺所有其他领域的 Agent。</p>

      <h3>14.1 标准工作流:一个代码 agent 的日常</h3>
      <ol className="steps">
        <li><b>理解任务</b>读 issue / 用户需求,检索相关代码(grep / 语义搜索 / repo map)。</li>
        <li><b>制定计划</b>列 todo:改哪些文件、怎么验证(Claude Code 的 plan mode 甚至先出方案等人批)。</li>
        <li><b>实施修改</b>小步编辑,每步保持可编译;大改前先写测试。</li>
        <li><b>验证</b>跑测试 / lint / 构建——<strong>这是代码 agent 独有的超能力:客观的自我检查</strong>。</li>
        <li><b>迭代</b>失败 → 读报错 → 修复 → 再验证(Reflexion 的现实版)。</li>
        <li><b>交付</b>整理 diff、写 commit message / PR 描述。</li>
      </ol>

      <h3>14.2 SWE-bench:这个领域的「高考」</h3>
      <p><a href="https://arxiv.org/abs/2310.06770" target="_blank" rel="noreferrer">SWE-bench</a>(2023)用真实 GitHub issue 出题:给你仓库+issue,修完后跑该仓库的测试用例判分。<strong>SWE-bench Verified</strong> 是人工核验过题目质量的 500 题子集,于 2024-08-13 发布。原版、Verified、Pro 的题目与判分口径不同，不应拼接成同一条分数增长曲线：</p>
      <div className="tbl-wrap">
        <table className="tbl">
          <thead><tr><th>时间</th><th>基准 / 事件</th><th>如何解读</th></tr></thead>
          <tbody>
            <tr><td>2023.10</td><td>原版 SWE-bench 发布</td><td>原版实验仅与相同任务集、预算的结果比较</td></tr>
            <tr><td>2024.05</td><td>SWE-agent / ACI 研究</td><td>论文早于 Verified，不能将成绩归入 Verified 历史</td></tr>
            <tr><td>2024.08</td><td>Verified 发布</td><td>首发同一 GPT-4o + Agentless 在原版为 16%，Verified 为 33.2%，说明子集改变会影响成绩</td></tr>
            <tr><td>2025–2026</td><td>Verified / Pro / 终端任务并行使用</td><td>成绩必须注明系统、模型、任务版本、工具和尝试预算，以带日期的官方结果为准</td></tr>
            <tr><td>工程验收</td><td>真实仓库回归集</td><td>同时测修复有效性、未引入回归、成本与人工复核负担</td></tr>
          </tbody>
        </table>
      </div>
      <p>参见<a href="https://openai.com/index/introducing-swe-bench-verified/" target="_blank" rel="noreferrer">Verified 官方首发说明</a>。这里有两个重要教训:① <strong>模型 + harness 双轮驱动</strong>(在固定模型、任务和预算下比较脚手架效果);② <strong>基准会饱和</strong>,所以 Terminal-Bench(终端任务)、SWE-bench Pro、tau-bench 等新基准不断出现(CH.15)。</p>

      <h3>14.3 ACI:给模型设计的「人体工学」</h3>
      <p><a href="https://arxiv.org/abs/2405.15793" target="_blank" rel="noreferrer">SWE-agent 论文</a>提出 Agent-Computer Interface 概念,人机工程学照搬给模型:</p>
      <ul>
        <li><strong>反馈要快且可读</strong>:编辑命令立即回显改动行数与 lint 结果,而不是静默成功。</li>
        <li><strong>窄而深的接口</strong>:一个精心设计的 <code>edit_file</code>(带精确行号与 diff 预览)胜过 20 个 shell 杂牌命令。</li>
        <li><strong>防呆设计</strong>:容易犯的错(忘了保存、改错文件)在接口层面直接拦下并提示。</li>
        <li><strong>上下文友好</strong>:工具输出裁剪到关键行;长输出给摘要+「看更多」选项。</li>
      </ul>
      <div className="card tip">
        <span className="card-tag">实战 · 用好今天的代码 agent(写给每个开发者)</span>
        ① <strong>写好 AGENTS.md / CLAUDE.md</strong>:仓库里的「给 agent 的 README」——构建命令、代码规范、目录导览(这是程序性记忆,CH.09)。2026 年 <strong>AGENTS.md 已成为跨工具的厂商中立标准</strong>(自动加载规则依工具版本与设置而异)，Claude Code 的 agents-md 支持需核对版本及 Project instructions 设置；必要时用 CLAUDE.md 的 @AGENTS.md 导入共享规则;② <strong>任务要小而清晰</strong>:一次一个 issue,给验收标准;③ <strong>提供验证路径</strong>:「跑 <code>make test</code> 即可验证」明确验收路径;④ <strong>先 plan 后 code</strong>:复杂任务先让它出计划;⑤ <strong>review 每一行</strong>:责任仍是人类的。
      </div>

      <div className="card boss">
        <span className="card-tag">BOSS 提示 · harness 工程时代</span>
        2026 年初有个标志性案例:<a href="https://blog.langchain.com/improving-deep-agents-with-harness-engineering/" target="_blank" rel="noreferrer">LangChain 报告其 Deep Agents 在 Terminal-Bench 2.0 上</a><strong>不改模型</strong>,仅靠改进 harness(上下文管理、工具接口、重试策略)把 52.8% 提到 66.5%。结论写进你的工程观:<strong>模型是引擎,harness 是整车</strong>——同一台引擎,调校决定名次。这也是为什么 CH.15(评估)是一切优化的前提。
      </div>

      <h3>14.4 开源弹药库速览</h3>
      <ul>
        <li><strong>OpenHands</strong>:开源代码 Agent 平台，可用于工程实验与论文复现。</li>
        <li><strong>Claude Code(官方仓库)</strong>:sub-agent / hooks / skills 生态设计值得全文精读。</li>
        <li><strong>Aider</strong>:repo map(用图谱算法压缩仓库结构进上下文)是教科书级 CH.04 案例。</li>
        <li><strong>Cline</strong>:浏览器+编辑器双栖,plan/act 分离模式。</li>
        <li><strong>Gemini CLI</strong>:Google 官方开源终端 agent,上下文管理实现可读。</li>
        <li><strong>pi-mono与 oh-my-pi</strong>:Mario Zechner 的极简 4 工具 harness 及其明星 fork——「少即是多」流派代表,配 CH.05 一起读。</li>
        <li><strong>DeepSeek Harness</strong>:模型厂官方下场做 harness(「Everything is a Plugin」),见 CH.08。</li>
      </ul>
      <p>更多带 Star/活跃度数据的完整清单,见支线「GitHub 兵器谱」。</p>
    </Chapter>
  )
}
