import { LabHead, Mile, CodeFile, FileTree, Kpis, Adr, LabToc } from './labbits.jsx'
import { FigAtlasArch } from './diag.jsx'
import { LABS } from './registry.js'

const lab = LABS[0]

export default function P1a() {
  return (
    <>
      <LabHead
        lab={lab}
        scene={'「云账坊」是一款面向中小企业的发票/记账 SaaS,约 4000 家付费客户。12 人客服团队每月处理 ~9000 张工单,其中 60% 是高度重复的问题(怎么开发票、退款到哪了、API 报错什么意思)。目标:AI 客服先行接待,解决 55% 以上的常见问题,把人留给真正需要人的会话。'}
        stack={'Python 3.12 · FastAPI · OpenAI Responses SDK · Postgres(pgvector)· Pydantic v2 · pytest'}
        resume={'「独立设计并落地智能客服 Agent:混合检索 RAG + 受控工具调用 + 分层护栏,在 [样本量/评测设置] 下，自助解决率 [实测值]、幻觉率 [实测值及置信区间]、单会话成本 [实测值]」——数字须来自自己的评测与账单。'}
        points={'一条从需求到上线的完整链路:受控路由、生产级 RAG、引用强制、升级人工、评测回归、成本工程。它是后两个项目的地基。'}
      />
      <LabToc items={[
        { id: 'p1-m0', no: 'M0', label: '需求与指标' },
        { id: 'p1-m1', no: 'M1', label: '架构与选型' },
        { id: 'p1-m2', no: 'M2', label: '最小闭环' },
        { id: 'p1-m3', no: 'M3', label: '检索管线' },
        { id: 'p1-m4', no: 'M4', label: '工具与护栏' },
        { id: 'p1-m5', no: 'M5', label: 'API 与评测' },
        { id: 'p1-m6', no: 'M6', label: '上线与运维' },
        { id: 'p1-res', no: 'END', label: '简历与面试' },
      ]} />

      <Mile id="p1-m0" no="M0" title="需求分析:先把「不做什么」写清楚">
        <p>新手拿到「做个客服机器人」就直接开始写 prompt 了;工程师拿到同样的话,先回答三个问题:<b>成功长什么样?失败的长什么样?哪些事情坚决不做?</b>这一节产出的不是代码,是整个项目的「宪法」——后面所有技术决策都要回到这里对齐。</p>
        <Kpis items={[
          ['≥ 55%', '自助解决率(deflection):AI 独立闭环、用户不再追问的会话占比'],
          ['< 5%', '升级率过高说明知识库没建好,过低说明该转人工的没转'],
          ['≥ 4.2/5', 'CSAT:AI 会话满意度采样回访'],
          ['< 1%', '幻觉率:抽检中「说了知识库里没有的事」的比例'],
          ['p95 < 8s', '首响应延迟:客服场景用户预期低于搜索,高于闲聊'],
          ['< $0.05', '单会话成本:决定这个项目是降本还是烧钱'],
        ]} />
        <div className="card warn">
          <span className="card-tag">⚠ 非目标(同样重要)</span>
          <ul style={{ margin: '4px 0 0' }}>
            <li><b>不做自由闲聊</b>——客服 Agent 的每一次「 personality 发挥」都是风险敞口,语气专业、边界清楚即可。</li>
            <li><b>不自动执行高危操作</b>——退款、改合同、删数据永远只创建「待审批」单,打款动作留给人工。</li>
            <li><b>不做情绪陪伴</b>——愤怒用户的第一诉求是「找到活人」,识别到情绪就升级,不要恋战。</li>
            <li><b>不上线自由 ReAct</b>——给模型一堆工具让它自己决策在客服场景是失控风险(理由见 M1 的架构决策)。</li>
          </ul>
        </div>
        <div className="card idea">
          <span className="card-tag">💡 为什么 M0 值得 20% 的项目时间</span>
          <p style={{ margin: 0 }}>上面 6 个指标会在 M5 变成评测集的判分维度,在 M6 变成监控大盘的告警项。<b>没有 M0 的量化目标,「优化 prompt」就只能靠感觉</b>——你会永远处于「好像好一点了?」的状态。Anthropic、OpenAI 的官方工程指南都把「定义评估标准」列为第一步,这不是仪式感,是工程纪律。</p>
        </div>
      </Mile>

      <Mile id="p1-m1" no="M1" title="架构与选型:把每次技术选择都写成可辩护的决策">
        <p>先看全景,再逐块拆。注意这条流水线的形状:<b>它更像一条「受控workflow + 局部 agent」的混合架构</b>,而不是一个自由 agent——这是本项目最重要的架构决策。</p>
        <FigAtlasArch />
        <Adr rows={[
          ['单循环 + 显式路由(轻模型先分类,再走固定支路)', '自由 ReAct:给模型全部工具让它自主决定', '客服错误成本极高(乱承诺退款是真金白银);显式路由让每个分支可单测、可单独评测、可灰度', '牺牲灵活性:跨支路的复杂问题要靠进阶改造(M4 末尾),使支路和权限可枚举；路由判断与业务结果仍需校验'],
          ['Postgres + pgvector 一库双用', '独立向量库(Milvus/Qdrant/Pinecone)', '数据量 < 100 万块时,少一个组件就少一分运维成本;全文检索(pg FTS)和向量检索同库 JOIN,事务一致', '超大规模或高 QPS 时迁移到专用向量库;检索层接口已抽象,替换只改一个文件'],
          ['引用强制 + 拒答模板', '让模型「尽量别瞎说」(prompt 祈祷法)', '幻觉的最便宜解法是结构性约束:没有检索命中就拒答,有命中就必须给 [n] 编号,引用原文对不上就作废', '回答会显得保守;但客服场景「我不知道,转人工」的用户满意度远高于自信的胡说'],
          ['工具只读为主,高危操作只建单', '让 Agent 直接执行退款/修改', '审计与撤销能力:建单可追溯、可驳回;直接执行出事无法回滚', '流程多一步人工;这是刻意的——高危操作的吞吐瓶颈不该由 token 决定'],
        ]} />
        <h4>项目骨架</h4>
        <p>整个项目是一个标准 Python 包 + 一个 API 服务。目录结构本身就传达了架构:路由、检索、工具、护栏、升级各自独立成模块,<b>每个模块都可以被单独测试</b>。</p>
        <FileTree name="atlas/ — 项目结构">
{`atlas/
├── config.py            # 全部配置项(pydantic-settings,环境变量注入)
├── schemas.py           # 所有 LLM 结构化输出的 schema(路由/回答/引用…)
├── llm.py               # 统一 LLM 网关:重试/超时/成本记账,全项目只此一处调模型
├── observe.py           # Trace:一行一事件的 JSONL,评测与排障的数据源
├── agent.py             # 主循环:路由分发 + 各支路执行
├── tools.py             # 业务工具:注册表模式,幂等,高危只建单
├── guardrails.py        # 双层护栏:输入清洗拦截 / 输出引用核查
├── escalation.py        # 升级人工:上下文包打包
├── retrieval/
│   ├── ingest.py        # 离线入库:切块 → 嵌入 → pgvector
│   └── search.py        # 在线检索:双路召回 → RRF → 重排 → 门槛
├── db.py                # Postgres 访问(会话/消息/订单)
└── api.py               # FastAPI 入口
evals/
├── golden.yaml          # 黄金评测集(知识题/工具题/该升级的/该拒答的)
└── run_eval.py          # 跑评测 + LLM-as-judge + 断言及格线
tests/                   # 纯逻辑单测(路由/RRF/护栏不花钱就能测)
docker-compose.yml       # Postgres + API 一键起`}
        </FileTree>
        <h4>config.py:配置是第一个正式决定</h4>
        <p>所有会变的数字——模型名、预算上限、检索参数、升级阈值——<b>一个都不许散落在代码里</b>。原因很实际:上线后你调参的最高频动作就是改这些数字,如果它们埋在函数体里,每次调整都是一次代码评审 + 一次重新部署。</p>
        <CodeFile name="atlas/config.py" code={`from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """全部可调参数集中一处。环境变量前缀 ATLAS_,支持 .env 文件。

    为什么显式列出每个字段而不是用 dict?
    - 启动时即校验类型与必填项:拼错的配置在第一秒就报错,而不是运行到一半。
    - IDE 可以自动补全,新人 grep 一个参数名就能找到定义。
    """
    model_config = SettingsConfigDict(env_file=".env", env_prefix="ATLAS_", extra="ignore")

    # ---- 模型分工:贵的模型只用在刀刃上 ----
    lite_model: str = "gpt-6-luna"       # 路由/重排/闲聊:便宜、快
    main_model: str = "gpt-6.1-sol"            # 合成回答:质量优先
    api_base: str = "https://api.openai.com/v1"   # 本例为 Responses；其他厂商需对应适配器
    api_key: str  # 必填；通过 ATLAS_/SCOUT_ 环境变量或本地 .env 提供
    reasoning_effort: str = "low"
    max_output_tokens: int = 4096
    # 2026-10-03 标准价，$/百万 token：输入/缓存读/缓存写/输出
    model_prices: dict[str, tuple[float, float, float, float]] = {
        "gpt-6-luna": (0.10, 0.01, 0.125, 0.50),
        "gpt-6.1-sol": (2.00, 0.10, 2.50, 10.00),
    }
    embedding_base: str = "https://api.openai.com/v1"
    embedding_key: str = ""  # ATLAS 需要单独填写；可与聊天 key 同值
    embedding_model: str = "text-embedding-3-small"
    embedding_dimensions: int = 1024
    embedding_price: float = 0.02  # $/百万输入 token；变更时核对索引维度

    # ---- 预算熔断:单任务的软阈值；会话累计限额另需持久账本 ----
    session_token_cap: int = 30_000      # 单消息任务 token 软阈值
    session_cost_cap_usd: float = 0.50   # 单消息任务成本软阈值(美元)
    agent_max_steps: int = 6             # 工具循环最大步数

    # ---- 检索参数 ----
    retrieve_top_k: int = 50             # 每路召回条数(粗召回便宜,宁多勿漏)
    rerank_top_n: int = 5                # 重排后保留条数(进 prompt 的配额)
    min_rag_score: float = 0.55          # 重排满分 10 分,低于 5.5 视为"知识库没有"

    # ---- 升级阈值 ----
    confidence_floor: float = 0.75       # 模型自评置信度低于此值 → 升级

    # ---- 存储 ----
    pg_dsn: str  # 通过 ATLAS_PG_DSN 配置，禁止在代码内保存凭据


@lru_cache
def settings() -> Settings:
    return Settings()
`} />
        <h4>schemas.py:让 LLM 的输出先过合同再进门</h4>
        <p>LLM 返回的是字符串,但系统内部流转的必须是结构。<b>每一个 LLM 调用的期望输出,都先在这里定义成 Pydantic 模型</b>——解析失败就重试或作废。Pydantic 检查字段与取值，支持的 API 再提供原生格式约束。下节使用 Responses parse；其他端点的提示词 JSON + 校验重试是降级路径，不能宣称同等约束。JSON 格式正确仍可能包含错误事实。</p>
        <CodeFile name="atlas/schemas.py" code={`"""跨边界的数据合同:LLM 输出必须 parse 成这些类,parse 不过 = 这次调用作废。"""
from enum import Enum

from pydantic import BaseModel, Field


class Route(str, Enum):
    """路由器的四个出口。枚举而不是自由文本:路由结果要进指标统计,拼不应该被允许。"""
    knowledge = "knowledge"   # 支路 A:查知识库
    action = "action"         # 支路 B:调业务工具
    chitchat = "chitchat"     # 支路 C:寒暄直答
    escalate = "escalate"     # 直接升级(用户要求人工/辱骂/法律威胁)


class RouteDecision(BaseModel):
    route: Route
    confidence: float = Field(ge=0, le=1)
    reason: str = ""          # 强制模型给理由:实测能压低"随手分类"的错误率


class Citation(BaseModel):
    marker: str               # 展示用编号,如 "[1]"
    doc_id: str               # 溯源用 ID,前端点击可跳原文
    chunk_id: str
    quote: str                # 支撑本句的原义摘录——护栏会用它做核对


class AgentReply(BaseModel):
    answer: str
    citations: list[Citation] = []
    confidence: float = Field(ge=0, le=1)
    self_check: str           # 一句话自查:"我有没有在无证据时下结论?"——便宜的软护栏


class ToolCall(BaseModel):
    tool: str
    params: dict = {}


class ToolResult(BaseModel):
    ok: bool
    done: bool = True         # False = 循环继续(工具要求补充信息等)
    needs_human: bool = False
    summary: str = ""
    confidence: float = 0.9`}
        />
      </Mile>
    </>
  )
}
