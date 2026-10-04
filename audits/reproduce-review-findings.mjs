// 仅执行抽出的纯逻辑与离线 mock；不调用模型、GitHub 或业务系统。
import { readFileSync } from 'node:fs'
import { spawnSync } from 'node:child_process'

const files = ['p1b', 'p1c', 'p3c']
const blocks = files.flatMap(file => {
  const source = readFileSync(new URL(`../src/chapters/labs/${file}.jsx`, import.meta.url), 'utf8')
  return [...source.matchAll(/<CodeFile name="([^"]+)" code=\{`((?:\\[\s\S]|[^`\\])*)`\}/g)]
    .filter(m => !/(?<!\\)\$\{/.test(m[2]))
    .map(m => ({ name: m[1], code: Function(`return \`${m[2]}\``)() }))
})
const script = String.raw`import ast, asyncio, json, re, sys
from pathlib import Path
from types import SimpleNamespace as NS
blocks = json.load(sys.stdin)
def load(name, names, scope):
    code = next(b['code'] for b in blocks if b['name'] == name)
    nodes = [n for n in ast.parse(code).body if isinstance(n, (ast.FunctionDef, ast.AsyncFunctionDef)) and n.name in names]
    for node in nodes: node.decorator_list = []  # 离线直接调用，不注册 Web 路由。
    exec(compile(ast.Module(body=nodes, type_ignores=[]), name, 'exec'), scope)
    return scope
scope = load('atlas/guardrails.py', ['_norm', 'citations_cover'], {'re': re, 'AgentReply': object})
chunks = [{'id': 'c1', 'body': 'a' * 120}]
blank = NS(citations=[NS(chunk_id='c1', quote='')])
fake_tail = NS(citations=[NS(chunk_id='c1', quote='a' * 120 + ' invented suffix')])
assert scope['citations_cover'](blank, chunks) is True
assert scope['citations_cover'](fake_tail, chunks) is True
print('REPRODUCED: empty quote and fabricated suffix both pass citations_cover')
scope = load('evals/run_eval.py', ['judge'], {'Trace': object, 'chat': lambda *args: '{}'})
try:
    scope['judge']({'q': 'test'}, {'citations': [NS(marker='[1]', quote='proof')]}, NS())
except TypeError as err:
    print('REPRODUCED: judge receives Citation objects but uses dict subscripting:', str(err))
else:
    raise AssertionError('expected Citation object/dict mismatch')
root = Path('traces').resolve()
assert not (root / '../outside-name.jsonl').resolve().is_relative_to(root)
print('REPRODUCED: length-only session ID permits trace path outside traces directory (no file written)')
class Store:
    def __init__(self): self.ids = set()
    def seen(self, key, delivery): return delivery in self.ids
    def record(self, key, delivery, value): self.ids.add(delivery)
class Queue:
    calls = 0
    def enqueue(self, payload):
        self.calls += 1
        raise RuntimeError('mock queue full')
class Request:
    headers = {'x-hub-signature-256': 'test', 'x-github-event': 'pull_request', 'x-github-delivery': 'delivery-1'}
    async def body(self): return b'{"action":"opened"}'
store, queue = Store(), Queue()
scope = load('sentinel/api.py', ['webhook'], {'Request': Request, 'json': json, 'store': store, 'queue': queue, 'verify_signature': lambda *args: True})
async def check():
    try: await scope['webhook'](Request())
    except RuntimeError: pass
    else: raise AssertionError('expected queue full')
    retry = await scope['webhook'](Request())
    assert retry == {'ok': True, 'dedup': True} and queue.calls == 1
asyncio.run(check())
print('REPRODUCED: enqueue failure marks delivery seen; redelivery is discarded')
`
const result = spawnSync('python', ['-X', 'utf8', '-c', script], { input: JSON.stringify(blocks), encoding: 'utf8' })
process.stdout.write(result.stdout)
process.stderr.write(result.stderr)
if (result.error) throw result.error
process.exitCode = result.status
