// 缓存读/写均是输入 token 的子项；输出包含推理 token，不能重复收费。
export function estimateTaskCost({ turns, inputTokens, outputTokens, inputPrice, cachedPrice, writePrice, outputPrice, cacheHit, cacheWrite }) {
  const values = [turns, inputTokens, outputTokens, inputPrice, cachedPrice, writePrice, outputPrice, cacheHit, cacheWrite]
  if (values.some(value => !Number.isFinite(value) || value < 0)) throw new RangeError('用量和价格须为有限非负数')
  const totalInput = inputTokens * turns
  const cached = totalInput * Math.min(cacheHit, 100) / 100
  const written = Math.min(totalInput - cached, totalInput * Math.min(cacheWrite, 100) / 100)
  const ordinary = totalInput - cached - written
  return (ordinary * inputPrice + cached * cachedPrice + written * writePrice + outputTokens * turns * outputPrice) / 1e6
}
