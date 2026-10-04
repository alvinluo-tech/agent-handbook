from pathlib import Path
import json, re

blocks = json.loads(Path('audits/snippets-before-fix.json').read_text(encoding='utf8'))
def edit(file, name, old, new):
    assert old in blocks[file][name], (file, name, old[:80])
    blocks[file][name] = blocks[file][name].replace(old, new)

edit('p1b', 'atlas/observe.py', 'from threading import RLock', 'from threading import RLock\nfrom uuid import uuid4')
edit('p1b', 'atlas/observe.py', '一次会话一个 JSONL 文件', '一次任务一个 JSONL 文件；会话 ID 仅作关联字段')
edit('p1b', 'atlas/observe.py', 'def __init__(self, session_id: str):', 'def __init__(self, session_id: str, token_cap=None, cost_cap=None, principal=None):')
edit('p1b', 'atlas/observe.py', '        self.sid = session_id', '        self.sid = session_id\n        self.task_id = uuid4().hex\n        self.token_cap, self.cost_cap = token_cap, cost_cap\n        self.principal = principal')
edit('p1b', 'atlas/observe.py', '    def dump(self) -> None:', '''    def check_budget(self) -> None:
        # 软阈值：在每次收费调用前检查。并发预留与未知失败用量需另外实现。
        with self._lock:
            if ((self.token_cap is not None and self.total_tokens >= self.token_cap)
                    or (self.cost_cap is not None and self.total_cost_usd >= self.cost_cap)):
                raise RuntimeError("task budget exhausted")

    def dump(self) -> None:''')
edit('p1b', 'atlas/observe.py', '        path = TRACE_DIR / f"{self.sid}.jsonl"', '''        root = TRACE_DIR.resolve()
        root.mkdir(parents=True, exist_ok=True)
        path = (root / f"{self.task_id}.jsonl").resolve()
        if not path.is_relative_to(root):
            raise ValueError("invalid trace path")''')
edit('p1b', 'atlas/llm.py', '        t0 = time.monotonic()', '''        try:
            trace.check_budget()
        except RuntimeError as err:
            raise LLMError("任务软预算已耗尽") from err
        t0 = time.monotonic()''')
edit('p1b', 'atlas/llm.py', '    resp = _embed_client.embeddings.create', '''    if trace is None:
        raise LLMError("嵌入调用必须提供 trace，离线入库也需单独计量")
    try:
        trace.check_budget()
    except RuntimeError as err:
        raise LLMError("任务软预算已耗尽") from err
    resp = _embed_client.embeddings.create''')
edit('p1b', 'atlas/agent.py', 'history: list[dict]) -> dict:', 'history: list[dict], principal=None) -> dict:')
edit('p1b', 'atlas/agent.py', '    trace = Trace(session_id)', '    trace = Trace(session_id, token_cap=settings().session_token_cap,\n                  cost_cap=settings().session_cost_cap_usd, principal=principal)')
edit('p1b', 'atlas/agent.py', '        result["route"] = decision.route.value', '        result["tools_called"] = [e["tool"] for e in trace.events if e["step"] == "tool"]\n        result["route"] = decision.route.value')
edit('p1b', 'atlas/agent.py', '        return _ok(proposal.params.get("summary", "已为您处理。"), [], trace)', '        return _ok(proposal.params.get("summary", "已为您处理。"), [], trace)')
edit('p1b', 'atlas/agent.py', 'f"[{i + 1}] ({c[\'title\']})\\n{c[\'body\']}"', 'f"[{i + 1}] doc_id={c[\'doc_id\']} chunk_id={c[\'id\']} ({c[\'title\']})\\n{c[\'body\']}"')
edit('p1b', 'atlas/agent.py', '"citations": citations,', '"citations": [c.model_dump() for c in citations],')
edit('p1b', 'atlas/agent.py', 'return (trace.total_tokens >', 'return (trace.total_tokens >=')
edit('p1b', 'atlas/agent.py', 'or trace.total_cost_usd >', 'or trace.total_cost_usd >=')
edit('p1b', 'atlas/retrieval/search.py', '    i: int', '    i: int = Field(ge=0)')
edit('p1b', 'atlas/retrieval/search.py', 'embed([f"为检索优化的问句: {query}"])', 'embed([f"为检索优化的问句: {query}"], trace)')
edit('p1b', 'atlas/retrieval/search.py', 'SELECT id, title, body FROM docs', 'SELECT id, source AS doc_id, title, body FROM docs')
edit('p1b', 'atlas/retrieval/search.py', '    if len(chunks) <= 1:\n        return chunks', '    if not chunks:\n        return []')
edit('p1b', 'atlas/retrieval/search.py', '''    picked = [(r.score, chunks[r.i]) for r in out.results
              if r.i < len(chunks) and r.score >= floor]''', '''    best = {}
    for r in out.results:
        if 0 <= r.i < len(chunks) and r.score >= floor:
            best[r.i] = max(best.get(r.i, 0), r.score)
    picked = [(score, chunks[i]) for i, score in best.items()]''')
ingest_name = next(k for k in blocks['p1b'] if 'ingest.py' in k)
edit('p1b', ingest_name, 'def ingest_dir(docs_dir: str) -> int:', 'def _ingest_dir(docs_dir: str, trace) -> int:')
edit('p1b', ingest_name, 'embed([body])[0]', 'embed([body], trace)[0]')
blocks['p1b'][ingest_name] += '''

def ingest_dir(docs_dir: str) -> int:
    from atlas.observe import Trace
    trace = Trace("ingest")
    try:
        return _ingest_dir(docs_dir, trace)
    finally:
        trace.dump()
'''

edit('p1c', 'atlas/tools.py', '只读,放心放行。', '只读也必须验证租户与用户归属。')
edit('p1c', 'atlas/tools.py', '    row = db.fetch_one(', '''    principal = trace.principal
    if principal is None:
        return ToolResult(ok=False, summary="缺少经认证的业务身份，查询已拒绝。")
    row = db.fetch_one(''')
edit('p1c', 'atlas/tools.py', 'WHERE order_id = %s",\n        (order_id,)', 'WHERE order_id = %s AND tenant_id = %s AND user_id = %s",\n        (order_id, principal.tenant_id, principal.user_id)')
# 高危工具在工具层再次拦截，不能靠循环的单一入口保证权限。
edit('p1c', 'atlas/tools.py', '    fn = REGISTRY.get(call.tool)', '''    if call.tool in HUMAN_APPROVAL:
        return ToolResult(ok=False, needs_human=True, summary="该操作必须经人工授权后在独立审批服务执行。")
    fn = REGISTRY.get(call.tool)''')
# 退款函数改为只给审批层的说明，不执行未授权或非原子业务 SQL。
a=blocks['p1c']['atlas/tools.py'].index('def refund_apply(');b=blocks['p1c']['atlas/tools.py'].index('\n\nREGISTRY',a)
blocks['p1c']['atlas/tools.py']=blocks['p1c']['atlas/tools.py'][:a]+'''def refund_apply(params: dict, trace: Trace) -> ToolResult:
    """此 Agent 不执行退款或创建业务单；审批服务须独立鉴权与事务幂等。"""
    return ToolResult(ok=False, needs_human=True,
                      summary="请进入人工退款流程；审批服务须重新核对订单归属与金额。")
'''+blocks['p1c']['atlas/tools.py'][b:]
edit('p1c', 'atlas/tools.py', 'trace.event("tool", tool=call.tool, params=call.params)', 'trace.event("tool", tool=call.tool)  # 不记录订单、金额或凭据')
edit('p1c', 'atlas/tools.py', 'summary=f"工具临时故障:{err}。请决定重试还是换方案。"', 'summary="工具暂时不可用，请选择转人工；内部错误不向用户暴露。"')

g=blocks['p1c']['atlas/guardrails.py'];a=g.index('    if not reply.citations:',g.index('def citations_cover'))
blocks['p1c']['atlas/guardrails.py']=g[:a]+'''    if not reply.citations:
        return False
    by_id = {c["id"]: (i + 1, c) for i, c in enumerate(chunks)}
    markers = set()
    for cit in reply.citations:
        entry = by_id.get(cit.chunk_id)
        if entry is None:
            return False
        number, chunk = entry
        if cit.marker != f"[{number}]" or cit.doc_id != chunk["doc_id"]:
            return False
        quote = _norm(cit.quote)
        if not quote or quote not in _norm(chunk["body"]):
            return False
        if cit.marker in markers:
            return False
        markers.add(cit.marker)
    cited = set(re.findall(r"\\[\\d+\\]", reply.answer))
    return bool(cited) and cited <= markers
'''
edit('p1c', 'atlas/guardrails.py', '这是防幻觉的最后闸门——宁可多转人工,不放行一条假引用。', '本闸门只测摘录与编号映射；事实句是否被摘录支持还要另外评测。')
edit('p1c', 'atlas/escalation.py', '无需重复描述。人工会在 15 分钟内跟进。', '当前为转人工请求，是否受理及响应时间以工单系统确认为准。')
edit('p1c', 'atlas/escalation.py', '已把你之前的信息完整带给他们,', '已整理此前信息供人工接入,')

api=blocks['p1c']['atlas/api.py']
api=api.replace('from fastapi import FastAPI, HTTPException', 'from fastapi import FastAPI, HTTPException, Depends')
api=api.replace('from pydantic import BaseModel, Field', 'from pydantic import BaseModel, Field\nfrom uuid import UUID, uuid4\nfrom atlas.auth import Principal, get_principal')
api=api.replace('session_id: str = Field(min_length=8, max_length=64)', 'session_id: UUID')
api=api.replace('def chat(body: ChatIn):\n    history = db.recent_messages(body.session_id)', '''def chat(body: ChatIn, principal: Principal = Depends(get_principal)):
    sid = str(body.session_id)
    owned = db.fetch_one(
        "SELECT id FROM sessions WHERE id=%s AND tenant_id=%s AND user_id=%s",
        (sid, principal.tenant_id, principal.user_id))
    if owned is None:
        raise HTTPException(status_code=404, detail="session not found")
    history = db.recent_messages(sid)''')
api=api.replace('agent.handle_message(body.session_id, body.message, history)', 'agent.handle_message(sid, body.message, history, principal=principal)').replace('db.append_message(body.session_id,','db.append_message(sid,')
api=api.replace('@app.post("/v1/chat")', '''@app.post("/v1/sessions", status_code=201)
def create_session(principal: Principal = Depends(get_principal)):
    sid = str(uuid4())
    db.fetch_one(
        "INSERT INTO sessions (id, tenant_id, user_id) VALUES (%s,%s,%s) RETURNING id",
        (sid, principal.tenant_id, principal.user_id))
    return {"session_id": sid}


@app.post("/v1/chat")''')
blocks['p1c']['atlas/api.py']=api
edit('p1c', 'evals/run_eval.py', '    if case.get("must_cite")', '    if case.get("expect_tool") and case["expect_tool"] not in result.get("tools_called", []):\n        return False\n    if case.get("must_cite")')
edit('p1c', 'evals/run_eval.py', '    """免费的结构断言:不花一分钱 token,先筛掉一半。"""', '    """先用结构断言检查路由、引用及工具轨迹，不产生模型费用。"""')
edit('p1c', 'evals/run_eval.py', 'f"[{c[\'marker\']}] {c[\'quote\'][:120]}"', 'f"{c[\'marker\']} {c[\'quote\']}"')

edit('p2a','scout/schemas.py','    title: str\n\n\nclass Section', '    title: str\n    verification: str = "unverified"  # reachable / unverified；可达不代表支持事实\n\n\nclass Section')
edit('p2a','scout/schemas.py','台账验证时会核对摘录确实出现在原文里。','摘录真实性和事实支持率须另做内容核查，台账仅检测来源可达性。')
edit('p2c','scout/ledger.py','3. 交付前验证:死链剔除——链接失效是最常见的『慢性假引用』。','3. 交付前检测可达性；未核验来源保留状态，不无声删除引用。')
a=blocks['p2c']['scout/ledger.py'].index('        alive = []')
blocks['p2c']['scout/ledger.py']=blocks['p2c']['scout/ledger.py'][:a]+'''        citations = self.all()
        for cit in citations:
            try:
                # 此核心片段仅 HEAD；GET 回退必须经外网代理、DNS/重定向校验和字节上限。
                # 不自动请求任意 URL 的 GET，避免把核查器变成 SSRF 下载器。
                resp = httpx.head(cit.url, timeout=8, follow_redirects=False)
                ok = 200 <= resp.status_code < 300
            except Exception:
                ok = False
            cit.verification = "reachable" if ok else "unverified"
            trace.event("cite_check", cid=cit.cid, verification=cit.verification)
        return citations
'''
v=blocks['p2c']['scout/verify.py'];a=v.index('    # 1) 孤儿引用');b=v.index('    # 2)',a)
v=v[:a]+'''    # 引用缺失时保留原标记并明确未核验，覆盖摘要与所有正文。
    def annotate(text):
        def replace(match):
            cid = f"C{match.group(1)}"
            if cid in valid_cids:
                return match.group(0)
            trace.event("unverified_citation", cid=cid)
            report.open_questions.append(f"{cid} 来源未核验，相关结论须复核")
            return match.group(0) + "（来源未核验，相关结论待复核）"
        return CITED.sub(replace, text)
    report.executive_summary = annotate(report.executive_summary)
    for sec in report.sections:
        sec.content = annotate(sec.content)
'''+v[b:];blocks['p2c']['scout/verify.py']=v
run=blocks['p2c']['scout/run.py'];a=run.index('    tr = Trace("scout")');b=run.index('\n\ndef render',a)
body=run[a:b].replace('tr = Trace("scout")', 'tr = Trace("scout", token_cap=settings().total_token_cap)').replace('{c.cid for c in citations}', '{c.cid for c in citations if c.verification == "reachable"}').replace('台账验证(死链剔除)', '台账可达性验证(保留未核验状态)')
lines=body.splitlines();body=lines[0]+'\n    try:\n'+'\n'.join('    '+line for line in lines[1:])+'\n    finally:\n        tr.dump()\n'
run=run[:a]+body+run[b:]
run=run.replace('f"- {c.cid} {c.title} — {c.url}"', 'f"- {c.cid} {c.title} — {c.url}（{c.verification}；可达不代表支持事实）"')
run=run.replace('import sys', 'import sys\nfrom pathlib import Path\nfrom uuid import uuid4')
run=run.replace('    out = f"reports/{rpt.title[:24]}.md"\n    open(out, "w", encoding="utf-8").write(md)', '    root = Path("reports").resolve()\n    root.mkdir(parents=True, exist_ok=True)\n    out = root / f"{uuid4().hex}.md"  # 模型标题只用于展示\n    out.write_text(md, encoding="utf-8")')
blocks['p2c']['scout/run.py']=run
edit('p2b','scout/worker.py', 'trace = Trace(f"{parent_trace.sid}-{sq.id}")', 'trace = Trace(f"{parent_trace.sid}-{sq.id}", token_cap=sq.budget_tokens)')

edit('p3a','sentinel/models.py', '    head_ref: str', '    head_repo: str                       # fork 的源仓库\n    head_sha: str                        # 所审 commit\n    base_sha: str\n    head_ref: str')
edit('p3a','sentinel/context.py','gh.get_file(pr.repo, pr.head_ref,', 'gh.get_file(pr.head_repo, pr.head_sha,')
gh=blocks['p3c']['sentinel/github.py']
gh=gh.replace('r = self.c.get(f"/repos/{repo}/pulls/{number}").json()', 'response = self.c.get(f"/repos/{repo}/pulls/{number}")\n        response.raise_for_status()\n        r = response.json()')
gh=gh.replace('head_ref=r["head"]["ref"], base_ref=', 'head_repo=r["head"]["repo"]["full_name"], head_sha=r["head"]["sha"],\n                         base_sha=r["base"]["sha"], head_ref=r["head"]["ref"], base_ref=')
gh=gh.replace('        return r.text', '        r.raise_for_status()\n        return r.text')
gh=gh.replace('        if r.status_code != 200:\n            return ""', '        if r.status_code == 404:\n            return ""\n        r.raise_for_status()')
gh=gh.replace('body: str, comments: list[dict]) -> int:', 'body: str, comments: list[dict], commit_id: str | None = None) -> int:')
gh=gh.replace('            "event": event, "body": body,', '            "event": event, "body": body,\n            **({"commit_id": commit_id} if commit_id else {}),')
gh=gh.replace('        return r.json().get("id", 0)', '        r.raise_for_status()\n        review_id = r.json().get("id")\n        if not isinstance(review_id, int) or review_id <= 0:\n            raise ValueError("GitHub 未返回有效 review ID")\n        return review_id')
blocks['p3c']['sentinel/github.py']=gh
pipe=blocks['p3c']['sentinel/pipeline.py']
pipe=pipe.replace('    # 3) 去重与预算', '    before_suppress = len(findings)\n    # 3) 去重与预算')
pipe=pipe.replace('    # 4) 回写:', '    if gh.get_pr(repo, number).head_sha != pr.head_sha:\n        raise RuntimeError("PR 已更新，请重跑，当前结果不发布")\n\n    # 4) 回写:')
pipe=pipe.replace('summary if findings else "✅ 自动审查通过:未发现需要人工关注的问题。",', 'summary if findings else ("本轮建议已去重或被数量预算限制；不表示审查通过。"\n                                  if before_suppress else "本轮检查未产生可发布建议；请结合人工 review，不能证明无缺陷。"),')
pipe=pipe.replace('"body": _render(f)} for f in findings])', '"body": _render(f)} for f in findings], commit_id=pr.head_sha)')
blocks['p3c']['sentinel/pipeline.py']=pipe

# 写回 JSX：模板转义与浏览器渲染保持一致。
for file, names in blocks.items():
    path = Path(f'src/chapters/labs/{file}.jsx')
    text = path.read_text(encoding='utf8')
    pattern = r'(<CodeFile name="([^"]+)" code=\{`)((?:\\[\s\S]|[^`\\])*)(`\})'
    def replace(match):
        code = names[match[2]].replace('\\','\\\\').replace('`','\\`').replace('${','\\${')
        return match[1]+code+match[4]
    path.write_text(re.sub(pattern, replace, text), encoding='utf8')
