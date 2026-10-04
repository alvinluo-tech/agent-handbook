// R15: 对照 aieng-zh.cn 523 课目录,扫描本手册对候选 agent 主题的覆盖情况
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

const dir = new URL('../src/chapters/', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')
const files = readdirSync(dir).filter((f) => f.endsWith('.jsx'))
const texts = {}
for (const f of files) texts[f] = readFileSync(join(dir, f), 'utf8')

const TOPICS = [
  // Phase 13/14 工具与协议 / Agent 工程
  ['CRITIC(工具校验自纠错)', /CRITIC/i],
  ['休眠时计算 sleep-time compute', /sleep-time|休眠时/],
  ['记忆块 memory blocks (Letta)', /记忆块|memory block/i],
  ['HTN 分层任务网络', /HTN|分层任务网络/],
  ['LATS', /LATS/],
  ['Self-Refine', /Self-Refine|自我精炼/],
  ['Voyager 技能库', /Voyager/],
  ['AutoGen/actor 模型', /AutoGen|actor 模型|actor model/i],
  ['Claude Agent SDK', /Claude Agent SDK/],
  ['GAIA 基准', /GAIA/],
  ['WebArena/OSWorld', /WebArena|OSWorld/],
  ['语音 agent', /语音|voice agent/i],
  ['OTel GenAI 语义约定', /OpenTelemetry|OTel|语义约定/],
  ['多智能体辩论 debate', /辩论|debate/i],
  ['MAST 失效分类', /MAST/],
  ['Agent Skills/渐进式披露', /渐进式披露|progressive disclosure|Agent Skills/i],
  ['MCP Tasks/Apps/Elicitation/Roots/Sampling', /Elicitation|Roots|Sampling|MCP Apps|异步任务/],
  ['MCP OAuth2.1/网关/Registry/供应链', /OAuth|Registry|注册表|供应链/],
  ['LLM 路由层 LiteLLM/OpenRouter', /LiteLLM|OpenRouter|路由层|model router/i],
  ['多会话交接 handoff', /交接|handoff/i],
  ['范围契约 scope contract', /范围契约|scope contract/i],
  ['验证闸门 verification gate', /验证闸门|验证关卡|verification gate/i],
  ['审查者 reviewer agent', /审查者|reviewer agent/i],
  ['反馈棘轮 feedback ratchet', /反馈棘轮|feedback ratchet/i],
  ['持久化执行 durable execution', /持久化执行|durable execution/i],
  // Phase 15 自主系统
  ['STaR/Quiet-STaR', /STaR/],
  ['AlphaEvolve', /AlphaEvolve/],
  ['Darwin Gödel Machine/DGM', /Darwin Gödel|DGM/],
  ['AI Scientist', /AI Scientist/],
  ['权限模式 permission modes', /权限模式|permission mode/i],
  ['长时后台/持久 agent', /长时|后台 agent/],
  ['急停/断路器/金丝雀 token', /急停|断路器|金丝雀|circuit breaker|kill switch/i],
  ['Propose-Then-Commit', /Propose-Then-Commit|提案后提交/],
  ['Checkpoint/回滚', /Checkpoint|回滚/],
  ['Constitutional AI', /Constitutional/],
  ['Llama Guard', /Llama Guard/],
  ['RSP/Preparedness 前沿安全框架', /RSP|Preparedness|Frontier Safety/i],
  ['METR 时间跨度', /METR|时间跨度|time horizon/i],
  ['自动化对齐研究 AAR', /对齐研究|automated alignment/i],
  // Phase 16 多智能体
  ['FIPA-ACL/言语行为', /FIPA|言语行为/],
  ['发言者选择/群聊编排', /发言者|speaker selection|群聊/],
  ['黑板模式 blackboard', /黑板|blackboard/i],
  ['拜占庭容错/共识', /拜占庭|Byzantine|共识算法/i],
  ['自洽性投票 self-consistency', /自洽性|self-consistency/i],
  ['谈判议价 negotiation', /谈判|议价/],
  ['生成式 agent 涌现仿真', /生成式智能体|Generative Agents|小镇/],
  ['PSO/ACO 群体智能', /PSO|ACO|蚁群|粒子群/],
  ['MARL', /MARL|多智能体强化/],
  ['agent 经济/token 激励/声誉', /agent 经济|agent 经济学|声誉系统|token 激励/],
  ['群体思维/单一栽培/级联错误', /群体思维|单一栽培|级联错误/],
  // Phase 17 基础设施与生产
  ['语义缓存 semantic cache', /语义缓存|semantic cach/i],
  ['Batch API', /Batch API|批处理接口/],
  ['AI 网关 gateway', /AI 网关|gateway/i],
  ['金丝雀发布/影子流量/A-B', /影子流量|Canary 发布|灰度/],
  ['AI SRE/混沌工程', /SRE|混沌工程/],
  ['SOC 2/EU AI Act 合规', /SOC 2|EU AI Act|合规/],
  ['FinOps', /FinOps/],
  // Phase 18 安全对齐
  ['奖励作弊/古德哈特', /奖励作弊|古德哈特|reward hack/i],
  ['阿谀奉承 sycophancy', /阿谀|sycophan/i],
  ['潜伏特工 sleeper agents', /潜伏特工|sleeper/i],
  ['AI 控制 AI control', /AI 控制|AI control/i],
  ['可扩展监督/弱到强', /弱到强|scalable oversight|可扩展监督/i],
  ['PAIR 自动化红队', /PAIR|自动化红队/],
  ['many-shot 越狱', /many-shot|多样本越狱/],
  ['Garak/PyRIT', /Garak|PyRIT/],
  ['水印/SynthID/C2PA', /水印|SynthID|C2PA/],
  ['EchoLeak/AI CVE', /EchoLeak|AI CVE/],
  ['模型卡 model cards', /模型卡|model card/i],
  ['差分隐私', /差分隐私/],
]

console.log(`扫描 ${files.length} 个章节文件\n`)
let missing = 0
for (const [name, re] of TOPICS) {
  const hits = files.filter((f) => re.test(texts[f]))
  if (hits.length === 0) { missing++; console.log(`✗ 未覆盖  ${name}`) }
  else console.log(`✓ ${hits.join(',').padEnd(30)}  ${name}`)
}
console.log(`\n共 ${TOPICS.length} 项,未覆盖 ${missing} 项`)
