import { Mile, CodeFile } from './labbits.jsx'
import { FigAtlasRag } from './diag.jsx'

/* P1 ATLAS · M2 最小闭环 + M3 检索管线 */
export default function P1b() {
  return (
    <>
      <Mile id="p1-m2" no="M2" title="最小闭环:LLM 网关 → Trace → 主循环">
        <p>这一节结束时,系统已经能端到端处理一条消息(哪怕检索还是空壳)。顺序刻意安排为:<b>先打地基(llm/observe),再盖房子(agent)</b>——因为主循环的每一行都依赖前两者的接口,地基没打好,房子必然返工。</p>

        <h4>observe.py:没有 trace 的 agent 是黑盒</h4>
        <p>trace 的消费方有三个:<b>排障</b>(线上出问题,第一件事就是打开那条会话的 JSONL)、<b>成本归因</b>(钱花在哪一步)、<b>评测</b>(离线复跑)。设计取舍:不上重型 APM(如 LangSmith)也能先跑起来——本地 JSONL 零依赖、可 grep、可进 git(脱敏后),等量级上去了再无缝换成商业平台。</p>
        <CodeFile name="atlas/observe.py" code={`"""Trace:一次任务一个 JSONL 文件；会话 ID 仅作关联字段,一行一个事件。
评测要复跑、成本要归因、线上要排障——全靠这份数据。
记录铁律:只记录"发生了什么",不记录"该怎么办"(后者是评测的职责)。"""
import json
import time
from pathlib import Path
from threading import RLock
from uuid import uuid4

TRACE_DIR = Path("traces")
TRACE_DIR.mkdir(exist_ok=True)


class Trace:
    def __init__(self, session_id: str, token_cap=None, cost_cap=None, principal=None):
        self._lock = RLock()
        self.sid = session_id
        self.task_id = uuid4().hex
        self.token_cap, self.cost_cap = token_cap, cost_cap
        self.principal = principal
        self.t0 = time.monotonic()
        self.events: list[dict] = []
        self.total_cost_usd = 0.0
        self.total_tokens = 0
        self.event("session_start")

    def event(self, step: str, **fields) -> None:
        with self._lock:
            self.events.append(
                {"ts": round(time.monotonic() - self.t0, 3), "step": step, **fields})

    def llm(self, **kw) -> None:
        """LLM 调用统一记账:成本与 token 同时是预算熔断的输入。"""
        with self._lock:
            self.total_cost_usd += kw.get("cost_usd", 0.0)
            self.total_tokens += kw.get("prompt_tokens", 0) + kw.get("completion_tokens", 0)
            self.event("llm", **kw)

    def merge(self, child) -> None:
        """每个 worker 独立计量，结束后原子合并；不从共享 events[-1] 猜用量。"""
        with child._lock:
            events = [{**e, "worker_sid": child.sid} for e in child.events]
            tokens, cost = child.total_tokens, child.total_cost_usd
        with self._lock:
            self.events.extend(events)
            self.total_tokens += tokens
            self.total_cost_usd += cost

    def check_budget(self) -> None:
        # 软阈值：在每次收费调用前检查。并发预留与未知失败用量需另外实现。
        with self._lock:
            if ((self.token_cap is not None and self.total_tokens >= self.token_cap)
                    or (self.cost_cap is not None and self.total_cost_usd >= self.cost_cap)):
                raise RuntimeError("task budget exhausted")

    def dump(self) -> None:
        root = TRACE_DIR.resolve()
        root.mkdir(parents=True, exist_ok=True)
        path = (root / f"{self.task_id}.jsonl").resolve()
        if not path.is_relative_to(root):
            raise ValueError("invalid trace path")
        with path.open("w", encoding="utf-8") as f:
            for e in self.events:
                f.write(json.dumps(e, ensure_ascii=False) + "\\n")
`} />
        <h4>llm.py:全项目只此一处敢 import openai</h4>
        <p>把「调模型」收敛成唯一入口,是 Agent 工程<span className="tag a">实战</span>里回报率最高的一条纪律:重试、超时、记账、换厂商,全都只需要改一个文件。两个细节值得抄走:<b>指数退避重试</b>(限流 429 是生产日常,不重试等于随机给用户报错)和<b>原生结构化输出 + 本地业务校验</b>(拒绝、截断或校验失败时明确降级，不盲目重试)。</p>
        <CodeFile name="atlas/llm.py" code={`"""OpenAI Responses 网关：配置、有限重试、原生结构化输出与分项计费。
复用到 SCOUT/SENTINEL 时只替换下面两处包名前缀。
其他厂商需另写适配器；不能只更换 base_url 就假定兼容。"""
import time
import math

from openai import OpenAI, APIConnectionError, APITimeoutError, RateLimitError, InternalServerError
from pydantic import BaseModel, ValidationError

from atlas.config import settings
from atlas.observe import Trace

_cfg = settings()
_client = OpenAI(base_url=_cfg.api_base, api_key=_cfg.api_key, max_retries=0)
_embed_client = OpenAI(base_url=_cfg.embedding_base, api_key=_cfg.embedding_key)

# 每百万 token 美元价：[普通输入、缓存读取、缓存写入、输出]。
# 从 settings 读取，换模型必须配价；未知价格禁止记为免费。
PRICES = _cfg.model_prices


class LLMError(Exception):
    """调用、格式或业务校验失败；上层按任务降级。"""


def usage_cost(model: str, usage) -> tuple[float, int, int, int, int]:
    if model not in PRICES:
        raise LLMError(f"未配置模型价格: {model}")
    pin, pread, pwrite, pout = PRICES[model]
    if any(not math.isfinite(p) or p < 0 for p in (pin, pread, pwrite, pout)):
        raise LLMError("价格必须是有限非负数")
    if usage is None:
        raise LLMError("缺少 usage，费用未知，停止自动执行")
    inp, out = usage.input_tokens, usage.output_tokens
    details = usage.input_tokens_details
    cached = getattr(details, "cached_tokens", 0) or 0
    written = getattr(details, "cache_write_tokens", 0) or 0
    ordinary = inp - cached - written
    if min(inp, out, cached, written, ordinary) < 0:
        raise LLMError("缓存用量与总输入不一致")
    # reasoning_tokens 已包含在 output_tokens 中，不重复计费。
    cost = (ordinary * pin + cached * pread + written * pwrite + out * pout) / 1e6
    return cost, inp, out, cached, written


def _request(model, messages, trace, schema=None, **kw):
    # 在请求前阻止价格未知的模型，避免调用完才发现不能算账。
    if model not in PRICES:
        raise LLMError(f"未配置模型价格: {model}")
    if "temperature" in kw or "top_p" in kw:
        raise LLMError("本教程推理配置不发送采样参数；更换模型请显式适配")
    params = dict(model=model, input=messages, reasoning={"effort": _cfg.reasoning_effort},
                  max_output_tokens=_cfg.max_output_tokens, timeout=60, store=False)
    params.update(kw)
    for attempt in range(3):
        try:
            trace.check_budget()
        except RuntimeError as err:
            raise LLMError("任务软预算已耗尽") from err
        t0 = time.monotonic()
        try:
            if schema is None:
                resp = _client.responses.create(**params)
            else:
                # SDK 生成严格 JSON Schema；不是把 schema 粘到提示词中。
                resp = _client.responses.parse(**params, text_format=schema)
            cost, inp, out, cached, written = usage_cost(model, resp.usage)
            trace.llm(model=model, ms=int((time.monotonic() - t0) * 1000),
                      prompt_tokens=inp, completion_tokens=out,
                      cached_tokens=cached, cache_write_tokens=written, cost_usd=cost)
            # 截断/拒绝也已经产生用量，先记账再判断是否可交付。
            if resp.status != "completed":
                raise LLMError(f"响应未完成: {resp.status}")
            if any(getattr(c, "type", "") == "refusal"
                   for item in resp.output for c in (getattr(item, "content", None) or [])):
                raise LLMError("模型拒绝该请求")
            return resp
        except (APIConnectionError, APITimeoutError, RateLimitError, InternalServerError) as err:
            if attempt == 2:
                raise LLMError(str(err)) from err
            time.sleep(2 ** attempt)
        except LLMError:
            raise
        except Exception as err:
            # 参数/权限/校验错误不通过盲目重试烧钱。
            raise LLMError(str(err)) from err


def chat(model: str, messages: list[dict], trace: Trace, **kw) -> str:
    resp = _request(model, messages, trace, **kw)
    if not resp.output_text:
        raise LLMError("模型没有返回可用文本")
    return resp.output_text


def chat_json(model: str, messages: list[dict], schema: type[BaseModel], trace: Trace, **kw):
    """原生格式约束 + Pydantic 校验；合法 JSON 不保证业务事实正确。"""
    resp = _request(model, messages, trace, schema=schema, **kw)
    try:
        if resp.output_parsed is None:
            raise LLMError("没有可用的结构化结果")
        return schema.model_validate(resp.output_parsed)
    except ValidationError as err:
        raise LLMError(f"业务结构校验失败: {err}") from err


def embed(texts: list[str], trace: Trace | None = None) -> list[list[float]]:
    """嵌入独立配置；索引维度与模型变更须重建，费用按供应商单独配置。"""
    if trace is None:
        raise LLMError("嵌入调用必须提供 trace，离线入库也需单独计量")
    try:
        trace.check_budget()
    except RuntimeError as err:
        raise LLMError("任务软预算已耗尽") from err
    resp = _embed_client.embeddings.create(model=_cfg.embedding_model, input=texts,
                                           dimensions=_cfg.embedding_dimensions)
    if resp.usage is None:
        raise LLMError("嵌入用量未知")
    cost = resp.usage.total_tokens * _cfg.embedding_price / 1e6
    if trace is not None:
        trace.llm(model=_cfg.embedding_model, prompt_tokens=resp.usage.total_tokens,
                  completion_tokens=0, cost_usd=cost)
    return [d.embedding for d in resp.data]
`} />

        <h4>agent.py:主循环——整个项目的心脏</h4>
        <p>下面是路由分发与两条重支路的核心片段；依赖前置模块、业务认证与数据库迁移。请重点体会三处设计,它们是「demo」与「生产」的分界线:</p>
        <ul>
          <li><b>路由表是字典,不是 if-else 链</b>——新增支路 = 加一个枚举值 + 一个函数,路由器 prompt 与 handlers 永远同步。</li>
          <li><b>LLMError 的兜底是「升级人工」而不是抛 500</b>——模型挂了,用户体验只是「转人工」,服务无感降级。</li>
          <li><b>所有收费调用前都检查任务软阈值</b>——预算熔断不是一个上线前再说的「优化项」,它写在统一网关；单次调用及并发仍可能越过软阈值，严格限额需预留输入/输出额度和持久会话账本。</li>
        </ul>
        <CodeFile name="atlas/agent.py" code={`"""ATLAS 主循环:显式路由 + 受控支路。

为什么不是"塞一堆工具让模型自由 ReAct"?
- 客服错误成本极高,我们要每一步可预测、可测试、可归因;
- 显式路由让每个支路可以单独评测(golden.yaml 按 route 分组),
  自由 agent 的失败是"玄学",受控架构的失败是"可定位的 bug"。
这与 Anthropic《Building Effective Agents》的结论一致:
能用 workflow 解决的,不要上 agent;要自主性的部分,圈在最小范围。
"""
from atlas import escalation, guardrails, search, tools
from atlas.config import settings
from atlas.llm import LLMError, chat, chat_json
from atlas.observe import Trace
from atlas.schemas import AgentReply, Route, RouteDecision

ROUTER_SYSTEM = """你是"云账坊"(SaaS 发票产品)的客服路由器。
把用户消息路由到唯一支路:
- knowledge: 产品功能、操作步骤、政策条款、报错含义 → 查知识库
- action:    查询或变更业务数据(订单状态、发票重开、退款进度)
- chitchat:  寒暄、感谢、无实质内容
- escalate:  用户明确要人工、辱骂、提及投诉/法律
拿不准时选 knowledge。只输出 JSON。"""

TOOL_SYSTEM = """你是云账坊的客服执行器。每轮只提出一个工具调用。
可用工具的名称、参数与用途由系统注入,禁止编造工具。
信息足够时,调用 finish 并给出面向用户的中文总结。"""

ANSWER_SYSTEM = """你是云账坊的客服专员。只依据【知识片段】回答,铁律:
1. 每个事实性句子后标注来源编号,如 [1];同源可共用编号。
2. 片段没有的信息,写"抱歉,这个我需要人工确认",禁止推测。
3. 先结论后步骤,语气专业友善,中文回答。
4. 末尾给出 confidence(0-1)与一句 self_check 自查。"""


def handle_message(session_id: str, user_text: str, history: list[dict], principal=None) -> dict:
    """单条消息的完整处理。返回统一形状的 dict,API 层不做业务逻辑。"""
    trace = Trace(session_id, token_cap=settings().session_token_cap,
                  cost_cap=settings().session_cost_cap_usd, principal=principal)
    try:
        clean = guardrails.sanitize_input(user_text, trace)
        if guardrails.is_furious(clean):           # R3 情绪规则:愤怒用户直接升级
            return escalation.escalate(session_id, clean, history,
                                       "sentiment", trace)
        decision: RouteDecision = chat_json(
            settings().lite_model,
            [{"role": "system", "content": ROUTER_SYSTEM},
             {"role": "user", "content": clean}],
            RouteDecision, trace)
        trace.event("route", route=decision.route,
                    confidence=decision.confidence, reason=decision.reason)

        handlers = {
            Route.chitchat: _chitchat_path,
            Route.knowledge: _knowledge_path,
            Route.action: _action_path,
            Route.escalate: _escalate_path,
        }
        result = handlers[decision.route](session_id, clean, history, trace)
        result["tools_called"] = [e["tool"] for e in trace.events if e["step"] == "tool"]
        result["route"] = decision.route.value     # 挂上路由结果,评测要用
        return result
    except LLMError:
        # 模型网关彻底失败:降级为转人工——用户无感,服务不 5xx
        return escalation.escalate(session_id, user_text, history,
                                   "policy", trace, extra={"error": "llm_unavailable"})
    finally:
        trace.dump()


# ---------------- 支路 A:知识检索 ----------------
def _knowledge_path(session_id, question, history, trace) -> dict:
    chunks = search.hybrid_search(question, trace)
    if not search.good_enough(chunks):
        # 检索救不回来 → 拒答式升级,绝不裸生成
        return escalation.escalate(session_id, question, history,
                                   "no_evidence", trace)
    reply: AgentReply = chat_json(
        settings().main_model,
        _answer_msgs(question, history, chunks),
        AgentReply, trace)
    if not guardrails.citations_cover(reply, chunks):
        # 引用对不上原文 = 模型编造了引用 → 整个回答作废
        trace.event("guardrail", hit="fabricated_citation")
        return escalation.escalate(session_id, question, history,
                                   "no_evidence", trace)
    if reply.confidence < settings().confidence_floor:
        return escalation.escalate(session_id, question, history,
                                   "confidence", trace,
                                   extra={"low_confidence": reply.confidence})
    return _ok(reply.answer, reply.citations, trace)


# ---------------- 支路 B:工具循环(唯一的"自主"区域)----------------
def _action_path(session_id, goal, history, trace) -> dict:
    msgs = [{"role": "system", "content": TOOL_SYSTEM}]
    msgs += history[-6:]                     # 只带最近 6 轮:便宜且够用
    msgs += [{"role": "user", "content": goal}]

    for _step in range(settings().agent_max_steps):
        if _budget_exceeded(trace):
            return escalation.escalate(session_id, goal, history, "budget", trace)
        proposal = chat_json(settings().main_model, msgs,
                             tools.ToolCall, trace)
        if proposal.tool == "finish":        # 模型认为可以收工
            return _ok(proposal.params.get("summary", "已为您处理。"), [], trace)
        if proposal.tool in tools.HUMAN_APPROVAL:   # 高危:只建单,等人工
            return escalation.escalate(session_id, goal, history, "approval",
                                       trace, extra={"tool": proposal.tool,
                                                     "params": proposal.params})
        result = tools.execute(proposal, trace)
        msgs += [{"role": "assistant", "content": proposal.model_dump_json()},
                 {"role": "user",
                  "content": f"TOOL_RESULT: {result.model_dump_json()}"}]
    return escalation.escalate(session_id, goal, history, "max_steps", trace)


# ---------------- 支路 C / D:闲聊与直接升级 ----------------
def _chitchat_path(session_id, text, history, trace) -> dict:
    answer = chat(settings().lite_model,
                  [{"role": "system",
                    "content": "你是云账坊的前台。礼貌简短,不聊业务细节,不承诺任何事。"},
                   *history[-4:], {"role": "user", "content": text}],
                  trace)
    return _ok(answer, [], trace)


def _escalate_path(session_id, text, history, trace) -> dict:
    return escalation.escalate(session_id, text, history, "policy", trace)


# ---------------- 工具函数 ----------------
def _answer_msgs(question: str, history: list[dict], chunks: list[dict]) -> list[dict]:
    ctx = "\\n\\n".join(f"[{i + 1}] doc_id={c['doc_id']} chunk_id={c['id']} ({c['title']})\\n{c['body']}"
                        for i, c in enumerate(chunks))
    return ([{"role": "system", "content": ANSWER_SYSTEM},
             *history[-6:],
             {"role": "user", "content": f"【知识片段】\\n{ctx}\\n\\n【用户问题】\\n{question}"}])


def _ok(answer: str, citations, trace, confidence: float = 0.9) -> dict:
    trace.event("done", escalated=False, tokens=trace.total_tokens,
                cost_usd=round(trace.total_cost_usd, 6))
    return {"answer": answer, "citations": [c.model_dump() for c in citations],
            "escalated": False, "confidence": confidence}


def _budget_exceeded(trace: Trace) -> bool:
    cfg = settings()
    return (trace.total_tokens >= cfg.session_token_cap
            or trace.total_cost_usd >= cfg.session_cost_cap_usd)
`} />
        <div className="card warn">
          <span className="card-tag">⚠ 新手最常踩的三个坑(本文件的对应防线)</span>
          <ul style={{ margin: '4px 0 0' }}>
            <li><b>history 全量注入</b>:30 轮对话后,每次调用都背着全部历史跑,成本线性上涨、质量反而下降。防线:<code style={{ fontFamily: 'var(--font-mono)' }}>history[-6:]</code>,配合 M6 的会话摘要压缩。</li>
            <li><b>把 LLM 异常直接抛给用户</b>:日志里一行 stack trace,用户眼前一个「Internal Server Error」。防线:except LLMError → 升级人工。</li>
            <li><b>参数未适配</b>：本例 reasoning=low，不发送 temperature/top_p；其他型号仅在官方支持时调整采样。温度零不能保证端到端确定性，稳定性靠回归评测、校验与受控动作。</li>
          </ul>
        </div>
      </Mile>

      <Mile id="p1-m3" no="M3" title="检索管线:企业级 RAG 的每一层都有理由">
        <p>RAG 是客服 Agent 的知识来源,也是「幻觉」的主要来源——所以本项目的 RAG 有四层设计,每层都对准一个具体的失败模式:</p>
        <FigAtlasRag />
        <h4>离线入库:切块的艺术是「自包含」</h4>
        <p>很多人纠结「chunk size 设 512 还是 1024」,但真正的杠杆在<b>块头</b>:把文档标题和段号拼进每一块,检索命中的片段脱离原文也能被读懂——这对下游两件事都致命重要:嵌入向量更干净(块自带主题),引用展示更完整(用户看到的是有出处的完整语境,不是半句话)。</p>
        <CodeFile name="atlas/retrieval/ingest.py" code={`"""离线入库:清洗 → 切块 → 块头增强 → 嵌入 → pgvector。

切块的第一参数不是"多大",而是"块是否自包含":
标题+段号拼进块头,命中片段脱离原文也能读懂,引用展示才有完整语境。"""
import hashlib
from pathlib import Path

import psycopg
from pgvector.psycopg import register_vector

from atlas.config import settings
from atlas.llm import embed

DDL = """
CREATE EXTENSION IF NOT EXISTS vector;
CREATE TABLE IF NOT EXISTS docs (
  id        TEXT PRIMARY KEY,
  source    TEXT NOT NULL,
  title     TEXT NOT NULL,
  body      TEXT NOT NULL,
  embedding vector(1024) NOT NULL
);
CREATE INDEX IF NOT EXISTS docs_vec ON docs USING hnsw (embedding vector_cosine_ops);
CREATE INDEX IF NOT EXISTS docs_fts ON docs USING GIN (to_tsvector('simple', body));
"""


def chunk_markdown(text: str, max_chars: int = 800) -> list[str]:
    """空行 + 长度双条件切块。800 字符 ≈ 400 token:装得下一个完整操作步骤,
    又不至于稀释语义。口诀:先保证"一块只说一件事",再谈大小。"""
    chunks: list[str] = []
    cur: list[str] = []
    size = 0
    for line in text.splitlines():
        cur.append(line)
        size += len(line)
        if size >= max_chars and line.strip() == "":
            chunks.append("\\n".join(cur))
            cur, size = [], 0
    if cur:
        chunks.append("\\n".join(cur))
    return chunks


def _ingest_dir(docs_dir: str, trace) -> int:
    """幂等:同一块内容 hash 相同,重复执行不产生重复数据。"""
    n = 0
    with psycopg.connect(settings().pg_dsn) as conn, conn.cursor() as cur:
        cur.execute(DDL)
        register_vector(cur)
        for path in sorted(Path(docs_dir).rglob("*.md")):
            text = path.read_text("utf-8")
            title = next(
                (ln.lstrip("# ") for ln in text.splitlines() if ln.strip()),
                path.stem)
            for i, chunk in enumerate(chunk_markdown(text)):
                if len(chunk.strip()) < 50:
                    continue                     # 噪声碎片:目录页/纯分隔线
                body = f"[{title} · 第{i + 1}段]\\n{chunk}"
                cur.execute(
                    """INSERT INTO docs (id, source, title, body, embedding)
                       VALUES (%s, %s, %s, %s, %s)
                       ON CONFLICT (id) DO NOTHING""",
                    (hashlib.sha1(body.encode()).hexdigest()[:16],
                     str(path), title, body, embed([body], trace)[0]))
                n += 1
    return n


def ingest_dir(docs_dir: str) -> int:
    from atlas.observe import Trace
    trace = Trace("ingest")
    try:
        return _ingest_dir(docs_dir, trace)
    finally:
        trace.dump()
`} note="嵌入式建索引:真实项目应改为「文档变更 → 队列 → 增量索引」,并在 ingest 后跑一次检索冒烟测试。" />
        <h4>在线检索:双路召回 + RRF + 重排 + 门槛</h4>
        <p>为什么不能只用向量检索?用一个真实失败案例说明:用户问「<b>ERR_INV_4023 是什么意思</b>」,嵌入模型把这串编码映射到一个语义空间里的「某处」,而知识库里那篇《错误码手册》的向量未必靠近它;但全文检索一个精确匹配就命中了。反过来,「发票抬头写错了怎么改」这种口语化问法,关键词全对不上,向量一击即中。<b>两条路互为盲区补偿</b>。</p>
        <CodeFile name="atlas/retrieval/search.py" code={`"""在线检索:双路召回 → RRF 融合 → LLM 重排 → 分数门槛。

每一层都对应一个具体失败模式:
- 只用向量:SKU/报错码这类精确词召回失败 → 补全文检索一路;
- 两路分数直接加权:向量余弦和 ts_rank 量纲不可比,权重是调不完的坑
  → RRF 只用排名:score = Σ 1/(k+rank),零调参;
- 粗召回直接进 prompt:top-50 条塞不进去,精度也不够
  → 重排只留 top-5,重排器用便宜模型即可;
- 最高分仍低于门槛:知识库大概率没有 → 返回空,上层拒答升级,绝不硬编。"""
import psycopg
from pydantic import BaseModel, Field
from pgvector.psycopg import register_vector

from atlas.config import settings
from atlas.llm import chat_json, embed
from atlas.observe import Trace


class _RerankItem(BaseModel):
    i: int = Field(ge=0)
    score: float = Field(ge=0, le=10)


class _RerankOut(BaseModel):
    results: list[_RerankItem]


RERANK_SYSTEM = """你是检索重排器。阅读问题与候选片段,为每个片段的相关性打 0-10 分:
10 = 直接回答了问题;0 = 完全无关。打分与片段出现顺序无关。只输出 JSON。"""


def hybrid_search(query: str, trace: Trace) -> list[dict]:
    cfg = settings()
    vec = embed([f"为检索优化的问句: {query}"], trace)[0]
    with psycopg.connect(cfg.pg_dsn) as conn, conn.cursor() as cur:
        cur.row_factory = psycopg.rows.dict_row
        register_vector(cur)
        cur.execute(
            """SELECT id, source AS doc_id, title, body FROM docs
               ORDER BY embedding <=> %s::vector LIMIT %s""",
            (vec, cfg.retrieve_top_k))
        dense = cur.fetchall()
        cur.execute(
            """SELECT id, source AS doc_id, title, body FROM docs
               WHERE to_tsvector('simple', body) @@ plainto_tsquery('simple', %s)
               ORDER BY ts_rank(to_tsvector('simple', body),
                                plainto_tsquery('simple', %s)) DESC LIMIT %s""",
            (query, query, cfg.retrieve_top_k))
        sparse = cur.fetchall()

    fused = _rrf(dense, sparse)[: cfg.retrieve_top_k]
    reranked = _rerank(query, fused, trace)
    trace.event("retrieval", dense=len(dense), sparse=len(sparse),
                fused=len(fused), returned=len(reranked))
    return reranked


def _rrf(dense: list[dict], sparse: list[dict], k: int = 60) -> list[dict]:
    """Reciprocal Rank Fusion:k=60 是论文验证过的鲁棒默认值。"""
    pool: dict[str, list] = {}
    for rows in (dense, sparse):
        for rank, row in enumerate(rows):
            entry = pool.setdefault(row["id"], [row, 0.0])
            entry[1] += 1.0 / (k + rank + 1)
    ranked = sorted(pool.values(), key=lambda e: -e[1])
    return [{**row, "rrf": s} for row, s in ranked]


def _rerank(query: str, chunks: list[dict], trace: Trace) -> list[dict]:
    """Listwise 重排:一次调用给全部候选打分。
    生产可无缝替换为 Cohere Rerank / bge-reranker 本地服务——接口不变。"""
    if not chunks:
        return []
    listing = "\\n\\n".join(
        f"[{i}] {c['title']}\\n{c['body'][:300]}" for i, c in enumerate(chunks))
    out = chat_json(settings().lite_model,
                    [{"role": "system", "content": RERANK_SYSTEM},
                     {"role": "user",
                      "content": f"问题: {query}\\n\\n候选:\\n{listing}"}],
                    _RerankOut, trace)
    floor = settings().min_rag_score * 10
    best = {}
    for r in out.results:
        if 0 <= r.i < len(chunks) and r.score >= floor:
            best[r.i] = max(best.get(r.i, 0), r.score)
    picked = [(score, chunks[i]) for i, score in best.items()]
    picked.sort(key=lambda t: -t[0])
    return [{**c, "score": s} for s, c in picked[: settings().rerank_top_n]]


def good_enough(chunks: list[dict]) -> bool:
    """重排层已经用分数过滤过:空列表 = 知识库没有 → 上层拒答。"""
    return bool(chunks)
`} note="中文生产环境请把 'simple' 分词换成 zhparser/jieba 预处理,否则全文检索基本失效;评审时这是必问题。" />
        <div className="card tip">
          <span className="card-tag">✔ M3 里程碑自测</span>
          <ul style={{ margin: '4px 0 0' }}>
            <li>跑 <code style={{ fontFamily: 'var(--font-mono)' }}>python -m atlas.retrieval.ingest docs/</code> 入库,然后分别用「怎么开发票」(语义)和「ERR_INV_4023」(精确码)测试检索,确认两路各自的命中——这是验证双路价值的实验,不要跳过。</li>
            <li>把 sparse 路临时注释掉,重跑精确码问题,亲眼看到召回失败——<b>被说服的知识才真正属于你</b>。</li>
          </ul>
        </div>
      </Mile>
    </>
  )
}
