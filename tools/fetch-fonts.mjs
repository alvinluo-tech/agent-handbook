// 下载像素字体:Press Start 2P(拉丁)+ Fusion Pixel(中文,开源 OFL)
// 用法: node tools/fetch-fonts.mjs
import { mkdir, writeFile } from 'node:fs/promises'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { execSync } from 'node:child_process'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const DIR = join(ROOT, 'public', 'fonts')
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36'

async function dl(url, dest, tries = 3) {
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(url, { headers: { 'User-Agent': UA }, redirect: 'follow' })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const buf = Buffer.from(await res.arrayBuffer())
      if (buf.length < 1000) throw new Error('too small')
      await writeFile(dest, buf)
      return buf.length
    } catch (e) {
      if (i === tries - 1) throw e
      await new Promise((r) => setTimeout(r, 1500))
    }
  }
}

async function main() {
  await mkdir(DIR, { recursive: true })

  // 1) Press Start 2P
  try {
    const css = await (await fetch('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap', { headers: { 'User-Agent': UA } })).text()
    const m = css.match(/url\((https:\/\/fonts\.gstatic\.com[^)]+\.woff2)\)/)
    if (!m) throw new Error('no woff2 url in css')
    const size = await dl(m[1], join(DIR, 'press-start-2p.woff2'))
    console.log(`press-start-2p.woff2 OK ${(size / 1024).toFixed(0)}KB`)
  } catch (e) { console.error('press-start-2p FAIL:', e.message) }

  // 2) Fusion Pixel —— 先试 jsdelivr,失败走 GitHub release zip
  const jsCandidates = [
    'https://cdn.jsdelivr.net/npm/fusion-pixel-12px-proportional-zh_hans/dist/fusion-pixel-12px-proportional-zh_hans.woff2',
    'https://cdn.jsdelivr.net/npm/fusion-pixel-12px-monospaced-zh_hans/dist/fusion-pixel-12px-monospaced-zh_hans.woff2',
  ]
  let ok = false
  for (const u of jsCandidates) {
    try {
      const size = await dl(u, join(DIR, 'fusion-pixel.woff2'))
      console.log(`fusion-pixel.woff2 OK (jsdelivr) ${(size / 1e6).toFixed(1)}MB`)
      ok = true
      break
    } catch (e) { console.log(`jsdelivr miss: ${u.slice(0, 80)} (${e.message})`) }
  }
  if (!ok) {
    try {
      const rel = JSON.parse(await (await fetch('https://api.github.com/repos/TakWolf/fusion-pixel-font/releases/latest', { headers: { 'User-Agent': UA } })).text())
      const asset = (rel.assets || []).find((a) => a.name.includes('12px-proportional-woff2'))
      if (!asset) throw new Error('no 12px-proportional-woff2 asset')
      const zipPath = join(DIR, 'fp.zip')
      await dl(asset.browser_download_url, zipPath)
      execSync(`tar -xf "${zipPath}" -C "${DIR}"`, { stdio: 'inherit' })
      execSync(`powershell -NoProfile -Command "$f = Get-ChildItem '${DIR}' -Filter '*zh_hans*.woff2' | Select-Object -First 1; if ($f) { Move-Item $f.FullName '${join(DIR, 'fusion-pixel.woff2')}' -Force }"`, { stdio: 'inherit' })
      console.log('fusion-pixel.woff2 OK (github release)')
      ok = true
    } catch (e) { console.error('fusion-pixel FAIL:', e.message) }
  }
  if (!ok) console.warn('>>> 无中文像素字体,CSS 会优雅回退到系统字体')
}

main().catch((e) => { console.error(e); process.exit(1) })
