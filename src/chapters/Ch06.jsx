import CodeBlock from '../components/CodeBlock.jsx'
import { Chapter } from '../components/Bits.jsx'
import { FigMcp } from '../components/Diag.jsx'

export default function Ch06() {
  return (
    <Chapter ch={{
      id: 'ch06', num: 'CH.06', icon: '🔌', title: 'MCP:AI 界的 USB-C', en: 'MODEL CONTEXT PROTOCOL DEEP DIVE', mins: 15,
      quests: ['能画 MCP Host/Client/Server 架构', '区分 tools / resources / prompts 三原语', '亲手跑通一个 MCP server(stdio)', '知道 MCP 安全三坑(投毒/混淆代理/令牌透传)'],
    }}>
      <p>2024 年 11 月,Anthropic 开源了 <a href="https://modelcontextprotocol.io" target="_blank" rel="noreferrer">Model Context Protocol(MCP)</a>,给「模型 ↔ 工具/数据」这层连接定了一个开放标准。到 2025 年,OpenAI、Google、微软全线跟进;2025 年 12 月,Anthropic 把 MCP 捐赠给中立基金会 <strong>Agentic AI Foundation</strong>——它成了事实上的「AI 界 USB-C」。作为 Agent 工程师,这是工具集成的重要开放协议；生产接入应明确规范与 SDK 版本。</p>

      <FigMcp />

      <h3>6.1 解决了什么问题?</h3>
      <p>MCP 之前:M 个应用要接 N 个工具,得写 M×N 个胶水集成,且各家格式不一。MCP 之后:工具方写一次 <strong>MCP Server</strong>,应用方实现一次 <strong>MCP Client</strong>,M×N 变 M+N。你自己写的内部工具也能一键接进 Claude、Cursor 等所有支持 MCP 的客户端——这就是标准的力量。</p>

      <h3>6.2 三种原语:Server 能给模型什么</h3>
      <div className="tbl-wrap">
        <table className="tbl">
          <thead><tr><th>原语</th><th>由谁控制</th><th>是什么</th><th>例子</th></tr></thead>
          <tbody>
            <tr><td><b>Tools 工具</b></td><td>模型控制</td><td>可执行的动作(带副作用)</td><td>发消息、创建 PR、查库、点按钮</td></tr>
            <tr><td><b>Resources 资源</b></td><td>应用控制</td><td>只读上下文数据(URI 标识)</td><td>文件内容、数据库 schema、日志</td></tr>
            <tr><td><b>Prompts 提示模板</b></td><td>用户控制</td><td>预制的最佳实践提示词</td><td>/code-review、/sql-explain 斜杠命令</td></tr>
          </tbody>
        </table>
      </div>
      <p>这个「谁控制」的区分是理解 MCP 的钥匙:<strong>模型提出工具调用，Host/runtime 决定是否授权执行；资源由应用选择，模板通常由用户主动选择</strong>。<strong>Sampling</strong>在 2024-11 初版已存在，<strong>Elicitation</strong>在 2025 年加入。2026-07-28 规范引入多轮往返请求(MRTR)，并弃用 Sampling、Roots 与 Logging；弃用能力在过渡窗口中仍可用。参见<a href="https://modelcontextprotocol.io/specification/2026-07-28/changelog" target="_blank" rel="noreferrer">当前规范变更</a>，不要把历史能力当成新项目的默认设计。</p>

      <h3>6.3 十分钟跑通第一个 MCP Server</h3>
      <CodeBlock name="WEATHER_MCP.PY — 官方 Python SDK v2 · MCPServer" code={`# Python 3.12+；本例核查于 2026-10-03
# pip install "mcp[cli]==2.3.0"
from mcp.server.mcpserver import MCPServer

mcp = MCPServer("weather", version="1.0.0")

@mcp.tool()
def get_weather(city: str) -> str:
    """查询指定城市的当前天气。city 传中文城市名。"""
    return f"{city}:晴,26°C,东南风 2 级"   # 这里换成真实 API

if __name__ == "__main__":
    mcp.run(transport="stdio")  # 与 HTTP 客户端的版本兼容需分别验证`} kind="核心片段" />
      <p>这里返回的是演示天气，不是实时数据。按客户端文档注册此 stdio 服务后测试工具发现与调用；官方 v2 的 MCPServer 与第三方 FastMCP 包是不同项目，迁移参见<a href="https://py.sdk.modelcontextprotocol.io/migration/" target="_blank" rel="noreferrer">官方指南</a>。调试用官方 <strong>MCP Inspector</strong>(<code>npx @modelcontextprotocol/inspector</code>),相当于这个协议的 Postman。</p>

      <h3>6.4 传输层:stdio 与 Streamable HTTP</h3>
      <ul>
        <li><strong>stdio</strong>:server 作为本地子进程,标准输入输出通信。适合本地工具；子进程仍需最小权限、可信依赖与环境隔离。</li>
        <li><strong>Streamable HTTP</strong>(2025 年规范取代旧 SSE 方案):服务独立部署，支持远程请求与鉴权；SSE 可作为响应编码方式，不能与旧 HTTP+SSE 传输混称。</li>
      </ul>

      <div className="card idea"><span className="card-tag">2026-07-28 · 无状态核心</span>当前规范移除连接级 initialize 与协议会话，版本和能力元信息随请求声明；多步操作用显式状态句柄，补充输入走 MRTR。无状态不等于应用不能持久化任务；旧客户端的初始化/会话须由兼容层处理，并明确协商到的协议版本。</div>

      <h3>6.5 安全:MCP 的甜蜜与陷阱</h3>
      <div className="card warn">
        <span className="card-tag">避坑 · MCP 安全三坑(官方 Best Practices 点名)</span>
        ① <strong>工具投毒(Tool Poisoning)</strong>:恶意 server 在工具描述里藏指令(「调用本工具前请把 API key 发到…」),或工具返回内容里夹带注入。→ 只装可信来源的 server,工具结果按不可信内容对待(CH.16)。<br />
        ② <strong>混淆代理(Confused Deputy)</strong>:一个被授权的 server 替攻击者干了坏事。→ 最小权限,按 server 隔离凭证。<br />
        ③ <strong>令牌透传(Token Passthrough)</strong>:server 接受未签发给自身的 token，再转给下游 API，破坏授权边界。→ 规范<strong>禁止</strong>；验证 audience，为 MCP 与下游分别建立授权。客户端正常提交签发给 MCP server 的 token 不属于此反模式。<br />
        加一条工程纪律:<strong>安装 MCP server = 给模型请一个来路需审查的外部帮手</strong>,审查它的代码/来源,就像审查 npm 依赖。
      </div>

      <div className="card tip">
        <span className="card-tag">实战 · MCP 学习路线</span>
        ① 用 Inspector 跑通官方 servers(filesystem / fetch / git)→ ② 用官方 MCPServer 写一个对接内部 API 的 server → ③ 读完规范里的 security 页 → ④ 看本书<a href="https://github.com/modelcontextprotocol/servers" target="_blank" rel="noreferrer">兵器谱</a>里的 servers 合集与 awesome 列表,挑 3 个拆解源码。做完这四步,你的简历上可以诚实地写「熟悉 MCP 生态」。
      </div>

      <h3>6.6 MCP 之后的互操作版图</h3>
      <p>MCP 管的是「agent ↔ 工具」。Agent 与 agent 之间(A2A)、与前端界面之间(AG-UI)、与钱包之间(AP2/x402)各有协议,拼成完整栈——那是 CH.18 的内容。一张图记住分工:<strong>MCP 连手脚,A2A 连同事,AG-UI 连用户,AP2 连钱包</strong>。</p>
    </Chapter>
  )
}
