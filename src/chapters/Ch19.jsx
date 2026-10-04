import { useEffect, useState } from 'react'
import { Chapter } from '../components/Bits.jsx'

export default function Ch19() {
  return (
    <Chapter ch={{
      id: 'ch19', num: 'CH.19', icon: '🚀', title: '前沿雷达', en: 'FRONTIER — SELF-EVOLVING, DEEP AGENTS & BEYOND', mins: 15,
      quests: ['了解自进化 agent(ADAS/DGM/AFlow)', '理解 Deep Agents 的共性组件', '知道 agent 经济学(成本/定价/支付)', '形成自己对 next 的判断框架'],
    }}>
      <p>最后一章主线:把雷达转向前方。以下每个方向都有论文撑腰(见论文库「前沿」分类)和早期生产案例。学会<strong>评估前沿</strong>比追随前沿更重要——文末给你一个判断框架。</p>

      <h3>19.1 自进化 Agent:Agent 造 Agent</h3>
      <div className="grid3">
        <div className="card idea">
          <span className="card-tag">ADAS(2024)</span>
          <p style={{ margin: 0 }}><strong>Automated Design of Agentic Systems</strong>:让「元 agent」在代码空间里搜索并发明新的 agent 设计,发现的某些流程超过了人类手搓版本。</p>
        </div>
        <div className="card idea">
          <span className="card-tag">AFlow(2024)</span>
          <p style={{ margin: 0 }}>把工作流表示为代码,用 MCTS 自动探索「哪个 workflow 适合哪个任务」,小模型也能打平旗舰模型的人类手搓方案。</p>
        </div>
        <div className="card idea">
          <span className="card-tag">Darwin Gödel Machine(2025)</span>
          <p style={{ margin: 0 }}>Sakana 团队:agent 改写<strong>自己的代码</strong>(harness 自我改造),在 SWE-bench 上自我迭代出新变体。「自我改进」从口号变成可复现实验。</p>
        </div>
      </div>
      <p>配套的还有 Voyager(在 Minecraft 里自建技能库,程序性记忆的鼻祖)、DeepMind 的 <a href="https://arxiv.org/abs/2506.13131" target="_blank" rel="noreferrer">AlphaEvolve</a>(进化式代码 agent,把「改进算法」交给 LLM+进化搜索,复现并改进了矩阵乘法等经典结果,已收录论文库)、以及 2025-26 一批「self-evolving agents」综述。共同启示:<strong>agent 的下一个能力跃迁,可能不是更大的模型,而是自动化的 harness/记忆进化</strong>。</p>

      <div className="card gold">
        <span className="card-tag">2026 新声 · Harness 工程的科学化</span>
        三篇相关研究(均已收入<a href="#" onClick={() => window.dispatchEvent(new CustomEvent('adg-go', { detail: 'papers' }))}>论文军火库</a>)标志着这个方向从「手艺」走向「科学」:
        ① 《Towards a Science of Scaling Agent Systems》(Google,2025-12):<strong>初版 180 组/4 类基准，2026-04 v3 为 260 组/6 类基准</strong>研究「多 Agent 何时优于单 Agent」的条件——CH.12 的「何时不用多 agent」从此有了实验依据;
        ② 《From QA to Task Completion: Agent System &amp; Harness Design Survey》(2026-06):提出 harness 六组件解剖,是本书 CH.01「Agent = 五大件」的学术版;
        ③ 《Harness Engineering: Anatomy of Coding Agents》(2026-07):解剖 11 个真实代码 agent 源码,验证「harness 是产品」。
        <br />趋势判读:<strong>模型竞争趋缓的地方,harness 竞争正在白热化</strong>——这是工程师价值密度最高的地带。
      </div>

      <h3>19.2 Deep Agents:2025-26 的「通用研究者」范式</h3>
      <p>Deep Research(OpenAI/Anthropic/Google 先后推出)验证了一套组件配方,社区随之总结出 <strong>Deep Agents</strong> 架构(langchain 等已开源对应模板):</p>
      <ul className="steps">
        <li><b>规划工具</b>显式 todo/计划工具,长任务不迷路(CH.11)。</li>
        <li><b>子 agent</b>上下文隔离 + 并行探索(CH.12)。</li>
        <li><b>文件系统记忆</b>中间产物落盘,跨步骤、跨会话可用(CH.04/09)。</li>
        <li><b>详细系统提示</b>把「如何研究、如何止损、何时停」写进宪法(CH.04)。</li>
        <li><b>长时间预算</b>10-30 分钟的自主运行,靠熔断+检查点兜底(CH.03/17)。</li>
      </ul>
      <p>你会发现:配方里的每一味药,都是前面 18 章讲过的技术。<strong>前沿不是新魔法,是已知组件的极限组合</strong>——这是本书反复想传递的工程观。</p>

      <h3>19.3 Agent 经济学与「劳动力」视角</h3>
      <ul>
        <li><strong>成本曲线</strong>:任务成本取决于模型、轮数、缓存、搜索与执行环境；还需计入人工核验、返工和运维。按 token、按席位与按结果收费并存，应以本业务完成率和总成本判断收益，不能由示例 API 费用推断普遍盈亏平衡。</li>
        <li><strong>支付与身份</strong>:x402/AP2(CH.18)+ agent 身份/信用体系,让 agent 可以「自己花钱办事」——2026 年的早期实验场是内容付费与电商代购。</li>
        <li><strong>工程能力</strong>:编排、审计、评估与业务集成是本书希望培养的能力；具体岗位需求和就业影响须对照有时间、地区与样本范围的招聘研究。</li>
      </ul>

      <h3>19.4 其他值得盯的雷达信号</h3>
      <div className="tbl-wrap">
        <table className="tbl">
          <thead><tr><th>方向</th><th>一句话</th><th>关注度信号</th></tr></thead>
          <tbody>
            <tr><td><b>具身智能 / VLA</b></td><td>视觉-语言-动作模型让 agent 长进机器人身体</td><td>Figure/宇树等融资与 demo 密集</td></tr>
            <tr><td><b>Voice Agent</b></td><td>语音进-语音出的实时 agent(客服/外呼/陪伴)</td><td>两条路线:级联管线(VAD→STT→LLM→TTS,可控可观测)vs 语音到语音模型(有望减少串联延迟);LiveKit Agents 与 Pipecat 成为两大开源底座,端到端延迟需按首次响应、完整轮次和网络条件分别实测,难点在打断处理与轮次检测(turn detection)</td></tr>
            <tr><td><b>Agent OS / 浏览器集成</b></td><td>研究让 agent 常驻并在授权范围内调度应用</td><td>按产品发布、实际可用性与权限边界观察，不能等同所有应用均可自动控制</td></tr>
            <tr><td><b>个人 Agent 探索</b></td><td><b>OpenClaw</b>(消息优先、本地优先)、<b>Hermes Agent</b>(Nous Research)等开源方案值得比较，仓库状态见兵器谱快照</td><td>消息、网页和操作系统都可以成为入口；隐私、持久记忆与权限设计需共同评估(CH.09/16)</td></tr>
            <tr><td><b>世界模型 + RL 复兴</b></td><td>「Era of Experience」(Silver & Sutton):从环境经验中学习,超越人类数据</td><td>学界共识的「下半场」方向</td></tr>
            <tr><td><b>可扩展监督 / AI 控制</b></td><td>当 agent 能力逼近或超过人类审查能力时,如何继续监督与纠偏(弱到强泛化、trusted monitor、可审查协议)</td><td>前沿实验室对齐团队的主攻方向,离日常生产尚远但值得知道</td></tr>
            <tr><td><b>形式化护栏</b></td><td>用形式化方法约束 agent 动作空间(可验证安全)</td><td>高价值场景(金融/医疗)刚需</td></tr>
          </tbody>
        </table>
      </div>

      <div className="card boss">
        <span className="card-tag">BOSS 提示 · 前沿评估框架(带走这个)</span>
        遇到任何新热点,问四问:① <strong>底层是什么</strong>——是已知组件的新组合,还是真的新原理?(应先辨认其新增能力)② <strong>可复现吗</strong>——有论文/开源/第三方复测吗?③ <strong>成本几何</strong>——Demo 华丽,单位经济学算得过来吗?④ <strong>我的场景匹配吗</strong>——可靠性要求能容忍它的失败模式吗?四问过后,追与不追,一目了然。
      </div>
      <p>🎉 主线 19 章到此通关!接下来的支线副本:<a href="#" onClick={() => window.dispatchEvent(new CustomEvent('adg-go', { detail: 'papers' }))}>📚 论文军火库</a>、<a href="#" onClick={() => window.dispatchEvent(new CustomEvent('adg-go', { detail: 'projects' }))}>⚔️ GitHub 兵器谱</a>、<a href="#" onClick={() => window.dispatchEvent(new CustomEvent('adg-go', { detail: 'roadmap' }))}>🗺️ 进化路线图</a>。</p>
      <AchievementCard />
    </Chapter>
  )
}

/* 通关认证:动态读取各章清单完成度 */
function AchievementCard() {
  const [state, setState] = useState({ done: 0, total: 0, chDone: 0 })
  useEffect(() => {
    const calc = () => {
      import('./index.js').then(({ CHAPTERS }) => {
        let checks = {}
        try { checks = JSON.parse(localStorage.getItem('adg-quests') || '{}') } catch { }
        let done = 0, total = 0, chDone = 0
        for (const ch of CHAPTERS) {
          const set = new Set(checks[ch.id] || [])
          total += ch.quests.length
          done += ch.quests.filter((_, i) => set.has(i)).length
          if (ch.quests.length > 0 && ch.quests.every((_, i) => set.has(i))) chDone++
        }
        setState({ done, total, chDone })
      })
    }
    calc()
    window.addEventListener('adg-quest-change', calc)
    return () => window.removeEventListener('adg-quest-change', calc)
  }, [])
  const full = state.total > 0 && state.done === state.total
  return (
    <div className="card boss" style={{ textAlign: 'center', padding: '28px 22px' }}>
      <span className="card-tag">ACHIEVEMENT</span>
      <div style={{ fontFamily: 'var(--font-pixel)', fontSize: 13, color: 'var(--gold)', letterSpacing: 1, lineHeight: 2 }}>
        {full ? '★ CONGRATULATIONS! ★' : 'KEEP GOING, PLAYER!'}
      </div>
      <div style={{ fontSize: 16, margin: '10px 0 6px' }}>
        {full
          ? '你已通关全部章节清单 —— 现在,你已经是本书定义的「Agent 大师」了。'
          : `当前进度:主线章节清单 ${state.chDone}/19 章全勾 · EXP ${state.done}/${state.total}。大师之路,就差你还没勾的那些格子。`}
      </div>
      <div style={{ fontSize: 13, color: '#9c92b8' }}>
        {full
          ? ' Game Clear ≠ Game Over:把毕业项目做出来,然后把这本手册送给下一个小白。'
          : '提示:每章末尾的「通关清单」勾满,这里就会变成通关奖状。'}
      </div>
    </div>
  )
}
