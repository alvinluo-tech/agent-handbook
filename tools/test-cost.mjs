import assert from 'node:assert/strict'
import { estimateTaskCost } from '../src/lib/cost.js'

const invoice = { turns: 1, inputTokens: 1_000_000, outputTokens: 100_000,
  inputPrice: 2, cachedPrice: 0.1, writePrice: 2.5, outputPrice: 10,
  cacheHit: 0, cacheWrite: 0 }
// 一百万普通输入 + 十万输出的示例账单应为 $3。
assert.equal(estimateTaskCost(invoice), 3)
// 同一百万输入：70 万缓存读取、10 万写入、20 万普通输入。
assert.equal(estimateTaskCost({ ...invoice, cacheHit: 70, cacheWrite: 10 }), 1.72)
// 已全部命中缓存时，不能再把相同输入计为缓存写入。
assert.equal(estimateTaskCost({ ...invoice, cacheHit: 100, cacheWrite: 100 }), 1.1)
assert.equal(estimateTaskCost({ ...invoice, cacheHit: 150, cacheWrite: 100 }), 1.1)
assert.equal(estimateTaskCost({ ...invoice, turns: 0 }), 0)
assert.equal(estimateTaskCost({ ...invoice, turns: 6 }), 18)
for (const value of [-1, NaN, Infinity]) {
  assert.throws(() => estimateTaskCost({ ...invoice, inputTokens: value }), RangeError)
  assert.throws(() => estimateTaskCost({ ...invoice, writePrice: value }), RangeError)
}
console.log('成本账单与输入边界：12 项断言通过')
