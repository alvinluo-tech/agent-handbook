import CodeBlock from '../components/CodeBlock.jsx'
import { Chapter } from '../components/Bits.jsx'
import { FigSandbox } from '../components/Diag.jsx'

export default function Ch07() {
  return (
    <Chapter ch={{
      id: 'ch07', num: 'CH.07', icon: '📦', title: '沙箱:放心跑代码', en: 'SANDBOXING — ISOLATION FOR UNTRUSTED CODE', mins: 14,
      quests: ['能说清容器/gVisor/微VM 隔离层次', '理解为什么 AI 代码必须强隔离', '知道 E2B / Daytona 的定位', '会给沙箱加资源限额与超时'],
    }}>
      <p>要让 Agent 真正干活,迟早要让它<strong>执行自己写的代码</strong>:数据分析师跑 Python、代码 agent 跑测试、自动化 agent 装依赖。而 AI 生成的代码应<strong>按不可信输入处理</strong>——它可能写出死循环、删库命令、外发数据的脚本,也可能是提示注入的牺牲品(CH.16)。沙箱(Sandbox)就是那间防爆屋。</p>

      <FigSandbox />

      <h3>7.1 隔离技术光谱</h3>
      <div className="tbl-wrap">
        <table className="tbl">
          <thead><tr><th>技术</th><th>原理</th><th>隔离边界</th><th>代表</th></tr></thead>
          <tbody>
            <tr><td><b>进程级</b></td><td>直接跑在宿主机进程</td><td>❌ 几乎无</td><td>仅限完全可信的本地脚本</td></tr>
            <tr><td><b>容器 Docker</b></td><td>namespace/cgroup 隔离,共享宿主内核</td><td>⚠️ 基础</td><td>大多数自建方案的底线</td></tr>
            <tr><td><b>gVisor</b></td><td>用户态「假内核」拦截系统调用</td><td>✅ 强</td><td>Google App Engine / Cloud Run 同款</td></tr>
            <tr><td><b>Firecracker 微 VM</b></td><td>KVM 级独立内核,但秒/亚秒级启动</td><td>独立客体内核</td><td>AWS Lambda、<b>E2B</b>；不能据此推断其他产品的实现</td></tr>
            <tr><td><b>WASM / V8 隔离</b></td><td>语言级沙箱,毫秒启动</td><td>✅(纯计算)</td><td>Pyodide、数据库 UDF；可提供虚拟文件系统或受控宿主挂载</td></tr>
          </tbody>
        </table>
      </div>
      <p><strong>按威胁模型选择隔离边界</strong>，并配合权限、网络和资源策略。容器、gVisor、微 VM 不是简单的安全排行榜；宿主配置、漏洞修补和暴露能力同样关键。Daytona 当前文档描述 OCI runner 与 Linux namespace，不能直接归为 Firecracker 底座。</p>

      <h3>7.2 托管沙箱:不必自己造轮子</h3>
      <div className="grid2">
        <div className="card idea">
          <span className="card-tag">E2B(开源)</span>
          <p style={{ margin: 0 }}>Firecracker 微 VM 沙箱即服务,官方宣传在预热条件下可快速启动，具体延迟应区分镜像准备、环境分配与首条代码执行。SDK 一行代码给 Agent 一个带文件系统+网络的临时环境,用完即焚。适合代码解释器与短任务执行；配置网络、超时与数据保留策略后再接入。</p>
        </div>
        <div className="card idea">
          <span className="card-tag">Daytona(开源)</span>
          <p style={{ margin: 0 }}>亚秒级启动的 AI 云开发环境,完整开发环境(终端+IDE 级能力),适合代码 agent 的「工作机」。自建路线可研究 microsandbox、以及 Firecracker 直用。</p>
        </div>
      </div>

      <h3>7.3 沙箱里的工程细节</h3>
      <ul className="steps">
        <li><b>资源限额</b>CPU / 内存 / 磁盘 quota + <code>ulimit</code>,防死循环烧钱、防 fork 炸弹。</li>
        <li><b>墙钟超时</b>每个执行配超时(如 30s)与总预算(如 5 分钟),到点强杀并回传「超时」观察。</li>
        <li><b>网络策略</b>默认断网;需要时白名单域名。数据外泄的主要通道就是网络。</li>
        <li><b>文件白名单</b>只挂载任务目录,agent 不应看见你的 .ssh 和 .env。</li>
        <li><b>快照与复用</b>预装好依赖的镜像/快照复用,可减少重复初始化；收益取决于镜像、依赖与预热条件，需要实测。</li>
        <li><b>审计日志</b>沙箱内所有命令留痕,出事能复盘。</li>
      </ul>

      <CodeBlock name="E2B_SDK_EXAMPLE.PY" code={`from e2b_code_interpreter import Sandbox

csv_bytes = b"price\\n10\\n20\\n"  # 可复制运行的演示数据

with Sandbox.create(timeout=60) as sbx:          # 按当前 SDK 创建沙箱
    sbx.files.write("data.csv", csv_bytes)  # 塞进任务文件
    r = sbx.run_code("import pandas as pd;"
                     "pd.read_csv('data.csv').describe()")
    print(r.text)                           # 取回分析结果
# 退出时销毁运行环境；外部存储、审计日志和外部动作不随之抹除`} kind="核心片段" />

      <div className="card tip">
        <span className="card-tag">实战 · 沙箱选型四问</span>
        ① 任务是「算一下」(代码解释器够)还是「改代码库」(要完整开发环境)?② 合规允不允许代码出境(数据驻留)→ 决定托管或自建?③ 冷启动预算(按产品首响与完整执行目标衡量)?④ 成本模型:按秒计费的长驻 vs 按次短租。
      </div>

      <div className="card warn">
        <span className="card-tag">避坑 · 沙箱不是银弹</span>
        沙箱解决「代码跑起来」的隔离,不解决「代码该不该跑」的授权。两件事要配套:<strong>高危动作在 runtime 层审批</strong>(CH.16),<strong>工具结果在进入上下文前清洗</strong>(防注入)。沙箱 + 权限 + 注入防御,三件套齐了才算安全工程入门。
      </div>
    </Chapter>
  )
}
