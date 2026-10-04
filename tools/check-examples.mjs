// 验证渲染后的 Python 示例语法；不执行网络调用、第三方操作或示例主程序。
import { readFileSync, readdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const examples = []
function scan(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) { scan(path); continue }
    if (!entry.name.endsWith('.jsx')) continue
    const source = readFileSync(path, 'utf8')
    const patterns = [
      /<CodeFile name="([^"]+)" code=\{`((?:\\[\s\S]|[^`\\])*)`\}/g,
      /code-name">([^<]+)<\/span><\/div>\s*<pre>\{`((?:\\[\s\S]|[^`\\])*)`\}/g,
    ]
    for (const pattern of patterns) for (const match of source.matchAll(pattern)) {
      if (!/\.py\b/i.test(match[1]) || /(?<!\\)\$\{/.test(match[2])) continue
      // 只有无插值的字符串；与 JSX 模板渲染的转义一致。
      let code = Function(`return \`${match[2]}\``)()
      if (/\.ya?ml\b/i.test(match[1])) {
        const marker = code.indexOf('# ------')
        if (marker < 0) continue
        code = code.slice(marker)
      }
      examples.push({ file: path.replaceAll('\\', '/'), name: match[1], code })
    }
  }
}
scan(join(root, 'src/chapters'))
const script = `import ast, json, sys\nblocks=json.load(sys.stdin)\nerrors=[]\nfor b in blocks:\n    try: ast.parse(b['code'], filename=b['name'])\n    except SyntaxError as e: errors.append({'file':b['file'],'name':b['name'],'line':e.lineno,'message':e.msg,'text':e.text})\nprint(json.dumps({'checked':len(blocks),'errors':errors}, ensure_ascii=False, indent=2))\nsys.exit(bool(errors))`
const result = spawnSync('python', ['-X', 'utf8', '-c', script], { input: JSON.stringify(examples), encoding: 'utf8' })
if (result.error) throw result.error
process.stdout.write(result.stdout)
process.stderr.write(result.stderr)
if (result.status) process.exit(result.status)
const checks = String.raw`import ast, json, sys, math, time
from types import SimpleNamespace as NS
from threading import RLock
from concurrent.futures import ThreadPoolExecutor
blocks = json.load(sys.stdin)
def load_node(name, node_name, scope):
    code = next(b['code'] for b in blocks if b['name'] == name)
    node = next(n for n in ast.parse(code).body if isinstance(n, (ast.ClassDef, ast.FunctionDef)) and n.name == node_name)
    exec(compile(ast.Module(body=[node], type_ignores=[]), name, 'exec'), scope)
    return scope[node_name]
scope = {'math': math, 'PRICES': {'m': (2, .1, 2.5, 10)}, 'LLMError': ValueError}
cost = load_node('atlas/llm.py', 'usage_cost', scope)
usage = NS(input_tokens=1_000_000, output_tokens=100_000,
    input_tokens_details=NS(cached_tokens=700_000, cache_write_tokens=100_000),
    output_tokens_details=NS(reasoning_tokens=50_000))
assert math.isclose(cost('m', usage)[0], 1.72)  # 推理是输出子项，不再次收费
assert cost('m', usage)[1:] == (1_000_000, 100_000, 700_000, 100_000)
for model, data in [('unknown', usage), ('m', None),
    ('m', NS(input_tokens=1, output_tokens=1, input_tokens_details=NS(cached_tokens=2)))]:
    try: cost(model, data)
    except ValueError: pass
    else: raise AssertionError('invalid invoice accepted')
Trace = load_node('atlas/observe.py', 'Trace', {'time': time, 'RLock': RLock})
parent = Trace('parent')
def worker(i):
    child = Trace(str(i))
    for _ in range(100): child.llm(prompt_tokens=8, completion_tokens=2, cost_usd=.1)
    parent.merge(child)
with ThreadPoolExecutor(max_workers=8) as pool: list(pool.map(worker, range(40)))
assert parent.total_tokens == 40_000
assert math.isclose(parent.total_cost_usd, 400)
assert sum(e['step'] == 'llm' for e in parent.events) == 4_000
assert {e['worker_sid'] for e in parent.events if 'worker_sid' in e} == {str(i) for i in range(40)}
criteria = [{'id': k, 'weight': w} for k, w in [('coverage', 3), ('grounded', 3), ('balance', 2), ('honesty', 2)]]
score = load_node('evals/rubric.yaml + run_rubric.py', 'weighted_score', {'CRITERIA': criteria})
good = [{'id': k, 'score': v} for k, v in [('honesty', 5), ('balance', 5), ('grounded', 0), ('coverage', 10)]]
assert score(good) == 5  # 顺序不同仍按 id 配权重
for invalid in [good[:-1], good + [good[0]], good[:-1] + [{'id': 'unknown', 'score': 10}],
    good[:-1] + [{'id': 'coverage', 'score': 11}], good[:-1] + [{'id': 'coverage', 'score': float('nan')}]]:
    try: score(invalid)
    except ValueError: pass
    else: raise AssertionError('invalid rubric accepted')
cfg = NS(max_comments_per_pr=6, ctx_token_budget=100)
class Finding(NS):
    def model_dump(self, **kw): return self.__dict__.copy()
context_scope = {'settings': lambda: cfg, 'Hunk': object, 'GitHub': object, 'PRContext': object, 'Trace': Trace}
count_tokens = load_node('sentinel/context.py', 'count_tokens', context_scope)
context = load_node('sentinel/context.py', 'build_context', context_scope)
pr = NS(repo='demo', head_ref='main')
gh = NS(get_file=lambda *args: 'x' * 6000)
tr = Trace('context')
text = context(pr, [NS(path='a.py', added=[(3, 'return 1')])], gh, tr)
assert count_tokens(text) <= cfg.ctx_token_budget
assert 'L3: return 1' in text and 'CONVENTIONS' not in text
try: context(pr, [NS(path='a.py', added=[(3, 'x' * 10000)])], gh, tr)
except ValueError: pass
else: raise AssertionError('oversize diff accepted')
suppression_scope = {'Finding': Finding, 'CommentStore': object, 'Trace': Trace,
    'settings': lambda: cfg, 'fingerprint': lambda f: str(id(f)),
    'SEVERITY_RANK': {'low': 0, 'medium': 1, 'high': 2, 'blocker': 3}}
suppress = load_node('sentinel/dedupe.py', 'suppress', suppression_scope)
findings = [Finding(severity='low', path='a.py', line=i) for i in range(10)] + [Finding(severity='blocker', path='a.py', line=99)]
store = NS(seen=lambda *args: False)
for cap in [0, 1, 6]:
    cfg.max_comments_per_pr = cap
    out = suppress(findings, 'pr1', store, Trace('comments'))
    assert len(out) == cap
    if cap: assert out[0].severity == 'blocker'
print('离线逻辑检查通过：缓存/费用、并发 Trace、rubric、上下文超限与评论预算')
`
const runtime = spawnSync('python', ['-X', 'utf8', '-c', checks], { input: JSON.stringify(examples), encoding: 'utf8' })
if (runtime.error) throw runtime.error
process.stdout.write(runtime.stdout)
process.stderr.write(runtime.stderr)
process.exitCode = runtime.status ?? 1
