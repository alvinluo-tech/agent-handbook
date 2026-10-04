import { Chapter } from '../components/Bits.jsx'
import { FigProtocolTimeline } from '../components/Diag2.jsx'

export default function Ch18() {
  return (
    <Chapter ch={{
      id: 'ch18', num: 'CH.18', icon: '🌐', title: '协议生态与 Agent 互联网', en: 'PROTOCOL STACK — MCP, A2A, AG-UI, AP2', mins: 14,
      quests: ['能画出 agent 协议栈分层', '区分 MCP / A2A / AG-UI / AP2 职责', '理解「协议热」背后的产业逻辑', '知道选协议时的评估维度'],
    }}>
      <p>1990 年代,不同的网络各自为政,直到 TCP/IP 一统江湖,才有了互联网。2024-2026 的 Agent 世界正在重演这个故事:<strong>工具、Agent 互联、界面与支付协议逐步形成生态</strong>。看懂这章,你就能理解未来五年产业格局的推演逻辑。</p>

      <FigProtocolTimeline />

      <h3>18.1 协议栈:各层管什么</h3>
      <div className="tbl-wrap">
        <table className="tbl">
          <thead><tr><th>层</th><th>协议</th><th>连接谁</th><th>核心机制</th></tr></thead>
          <tbody>
            <tr><td><b>工具/数据层</b></td><td><b>MCP</b>(2024.11)</td><td>agent ↔ 工具与数据</td><td>JSON-RPC,tools/resources/prompts,stdio/HTTP(CH.06)</td></tr>
            <tr><td><b>agent 互联层</b></td><td><b>A2A</b>(2025.04)</td><td>agent ↔ agent</td><td>Agent Card 自我发现、任务(task)生命周期、可协商流式/轮询/推送与传输绑定；2025-06 进入 Linux 基金会，2026-08 进入 AAIF 治理</td></tr>
            <tr><td><b>界面层</b></td><td><b>AG-UI</b>(2025.05)</td><td>agent ↔ 前端 UI</td><td>按 SDK/协议版本定义的标准事件流(不把事件数写死)(流式文本/工具状态/生成式 UI),前后端解耦</td></tr>
            <tr><td><b>支付层</b></td><td><b>AP2</b> / <b>x402</b>(2025)</td><td>agent ↔ 钱包/商家</td><td>AP2:A2A/MCP 扩展,带「授权凭证 mandates」的代理支付;x402:HTTP 402 原生微支付(稳定币)</td></tr>
            <tr><td><b>商务层</b></td><td>UCP(2026.01) / ACP(2025.09)</td><td>agent ↔ 电商平台</td><td>标准化「逛街-下单-履约」的商品交易接口</td></tr>
          </tbody>
        </table>
      </div>
      <p>一张图记忆(也回答面试题):<strong>MCP 连手脚,A2A 连同事,AG-UI 连屏幕,AP2/x402 连钱包,UCP 连商场</strong>。MCP 与 A2A 明确互补；支付与商务协议存在职责交叠，选型应核对商家支持、授权、结算与履约边界，不能概括为全部互不竞争。</p>

      <h3>18.2 A2A 详解:agent 之间的外交协议</h3>
      <p>设想你的公司 agent 要委托外部一个「报税 agent」干活。A2A 的流程:</p>
      <ol className="steps">
        <li><b>发现</b>对方在 <code>/.well-known/agent-card.json</code> 公布 Agent Card:我是谁、会什么、怎么收费、要什么鉴权。</li>
        <li><b>协商</b>你的 agent 读卡判断:能力匹配吗?支持流式吗?认证方式?</li>
        <li><b>委托</b>发送消息后，服务可返回消息或任务；任务采用 working / input-required / completed / failed 等状态(绑定中的名称按版本核对)。SSE 是可协商的流式方式，也可轮询或使用推送通知，不能视为必经路径。</li>
        <li><b>交付</b>产出(Artifact,如文件/报告)回传;全程各自内部细节(用什么模型什么工具)互不暴露——<strong>「不透明协作」</strong>是 A2A 的设计哲学。</li>
      </ol>

      <h3>18.3 为什么协议如此重要?(产业视角)</h3>
      <div className="grid2">
        <div className="card idea">
          <span className="card-tag">供给侧</span>
          <p style={{ margin: 0 }}>协议把「集成」从定制工程变成即插即用:<strong>工具商写一次 MCP server,兼容且获得授权的 Agent 可复用；服务商发布 Agent Card 后，仍需版本、能力与信任校验才能接受委托</strong>。生态位分工开始出现:有专门卖「MCP server 套件」的公司,有做「agent 信用与审计」的中间层。</p>
        </div>
        <div className="card gold">
          <span className="card-tag">需求侧</span>
          <p style={{ margin: 0 }}>个人助理 agent 用 x402 给新闻网站付 0.001 美元读一篇报道;企业 agent 之间用 A2A 组临时项目组——<strong>「agent 经济」的雏形</strong>。支付协议绑定「可验证授权」(谁批准的、花了多少、干什么),这正是人类组织管理的镜像。</p>
        </div>
      </div>

      <div className="card warn">
        <span className="card-tag">避坑 · 协议选型的清醒剂</span>
        ① <strong>协议 ≠ 标准已稳定</strong>:A2A/AG-UI 版本迭代很快,生产接入要锁版本+抽象适配层;② <strong>别为协议而协议</strong>:单机内两个函数能解决的,不需要跨进程协议;③ <strong>安全交付物</strong>:接外部 agent = 接外部代码,CH.16 的权限与审计全套适用;④ 关注治理方(是否进中立基金会)——同时检查维护、兼容策略与实际采用情况。
      </div>
    </Chapter>
  )
}
