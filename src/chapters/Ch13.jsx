import CodeBlock from '../components/CodeBlock.jsx'
import { Chapter } from '../components/Bits.jsx'

export default function Ch13() {
  return (
    <Chapter ch={{
      id: 'ch13', num: 'CH.13', icon: '🖥️', title: '计算机操作与浏览器 Agent', en: 'COMPUTER USE & BROWSER AGENTS', mins: 15,
      quests: ['理解截图路线 vs DOM/可访问性树路线', '知道 CUA 四大架构流派', '能说出 browser-use / playwright-mcp 定位', '知道 GUI agent 的成功率现实与风控'],
    }}>
      <p>前面几章的工具都是「结构化接口」,但世界上大多数软件只给人用:按钮、菜单、验证码。<strong>Computer Use / 浏览器 Agent</strong> 让 AI 直接长出眼睛(截图)和手(鼠标键盘),操作任何给人设计的界面——这是 Agent 走向「替你上网干活」的最后一块拼图。</p>

      <h3>13.1 两条技术路线:眼睛 vs 结构</h3>
      <div className="grid2">
        <div className="card idea">
          <span className="card-tag">截图路线(视觉优先)</span>
          <p style={{ margin: 0 }}>模型看截图 → 输出坐标动作(点击 x,y / 输入 / 滚动)。代表:Claude Computer Use、OpenAI 的 Computer-Using Agent(CUA；Operator 为 2025 年历史浏览器产品)、UI-TARS。<strong>优点</strong>:不挑应用,桌面/任意软件通吃,接近人类方式。<strong>缺点</strong>:慢(每步都要截图推理)、坐标会点歪、贵。</p>
        </div>
        <div className="card idea">
          <span className="card-tag">DOM / 可访问性树路线(结构优先)</span>
          <p style={{ margin: 0 }}>读取网页 DOM 或可访问性树(a11y tree)→ 模型选择「元素 #42」执行动作。代表:browser-use、Playwright MCP。<strong>优点</strong>:快、准、便宜。<strong>缺点</strong>:DOM 主要用于网页，可访问性树也可用于桌面；应用暴露的结构可能残缺或误导。</p>
        </div>
      </div>
      <p>2026 年的实践共识:<strong>浏览器场景混合使用</strong>(结构树导航为主、截图校验为辅,如 browser-use 的双模);桌面可通过 Windows UI Automation / macOS Accessibility 读结构化控件，再用截图回退。模型侧也在进化:UI-TARS 等原生 GUI 模型把「看屏-决策」一体化,减少外部脚手架。</p>

      <h3>13.2 四大架构流派(2026 版图)</h3>
      <div className="tbl-wrap">
        <table className="tbl">
          <thead><tr><th>流派</th><th>代表</th><th>特点</th></tr></thead>
          <tbody>
            <tr><td><b>Agent 浏览器</b></td><td>Comet(Perplexity)、Atlas(OpenAI)</td><td>整个浏览器就是 agent 的壳,浏览即协作</td></tr>
            <tr><td><b>虚拟计算机 / 桌面 agent</b></td><td>Claude Computer Use / Cowork；ChatGPT agent 整合原 Operator</td><td>产品的浏览器、虚拟环境与本机控制范围不同，须核对实际暴露的能力</td></tr>
            <tr><td><b>嵌入式 Copilot</b></td><td>各 SaaS 内置 AI 助手</td><td>应用厂商自己开放接口给 agent,最稳但各封闭</td></tr>
            <tr><td><b>开源框架</b></td><td>browser-use、Stagehand、Skyvern、UI-TARS</td><td>自建主力:框架管循环与解析,模型管决策</td></tr>
          </tbody>
        </table>
      </div>

      <h3>13.3 browser-use:浏览器循环如何工作</h3>
      <CodeBlock name="BROWSER_USE_QUICKSTART.PY" code={`# pip install browser-use
import asyncio
from browser_use import Agent
from browser_use.llm import ChatOpenAI   # 接入具体模型前核对框架的工具与端点支持

agent = Agent(
    task="去 book.com 搜索《Agent 开发全指南》,比价后加入购物车,先不下单",
    llm=ChatOpenAI(model="gpt-6-luna", reasoning_effort="none"),
)
asyncio.run(agent.run())  # DOM/截图 → 模型决策 → 浏览器控制层(CDP) → 观察`} kind="核心片段" />
      <p>它把 CH.03 的循环原样搬到了浏览器:观察(压缩后的 DOM + 可选截图)→ 思考 → 行动(点击/输入)→ 观察。值得学的是它的<strong>观察压缩</strong>:不做无压缩的全 DOM 注入,而是提取可交互元素列表——又一个 CH.04 的应用。</p>

      <h3>13.4 现实检验:能干到什么程度</h3>
      <div className="card warn">
        <span className="card-tag">诚实的现状(2026)</span>
        <a href="https://arxiv.org/abs/2307.13854" target="_blank" rel="noreferrer">WebArena</a>是网页基准，<a href="https://os-world.github.io/" target="_blank" rel="noreferrer">OSWorld</a>是桌面多应用基准，2026-06 又发布 OSWorld 2.0。版本、任务预算和完整完成率/部分得分不能混成一条百分比增长曲线；能力应按同一评测设置判断。<strong>无人值守仍需按风险与可靠性逐项验证</strong>:验证码、多步支付、弹窗广告、界面改版都会翻车。所以生产模式几乎都是<strong>「agent 干 + 人兜底」</strong>:敏感步骤(支付/删除/发邮件)强制人工确认,失败自动转人工。
      </div>
      <div className="card tip">
        <span className="card-tag">实战 · 给 GUI agent 上保险</span>
        ① 域名白名单(只许去任务相关站点);② 只读模式浏览、写操作审批;③ 全程录屏 + 每步动作日志(审计与回放);④ 凭证隔离——用一次性虚拟卡/子账号,永远不给主账号密码;⑤ 界面反爬与反自动化是法律/服务条款红线,企业部署前过合规。
      </div>
    </Chapter>
  )
}
