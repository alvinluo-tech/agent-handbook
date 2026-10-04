#!/usr/bin/env node
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { execSync } from 'node:child_process'

/**
 * 单篇论文一键检索、归类、下载与录入 CLI 工具
 * 用法:
 *   node tools/add-paper.mjs <arxiv-id> <category> "<导读说明>"
 * 示例:
 *   node tools/add-paper.mjs 2401.12345 rag "提出了创新的双路嵌入检索机制"
 */

const [,, arxivId, category, lead] = process.argv

const VALID_CATS = [
  'code', 'eval', 'foundations', 'frontier', 'memory',
  'multiagent', 'planning', 'rag', 'safety', 'tooluse', 'web'
]

if (!arxivId || !category) {
  console.log(`
使用方式:
  node tools/add-paper.mjs <arxiv-id> <category> "<中文导读/意义说明>"

合法分类 (category):
  ${VALID_CATS.join(', ')}

示例:
  node tools/add-paper.mjs 2305.16291 web "Voyager: 开放世界自主探索智能体"
`)
  process.exit(1)
}

if (!VALID_CATS.includes(category)) {
  console.error(`❌ 非法分类: "${category}"。可用分类为:\n${VALID_CATS.join(', ')}`)
  process.exit(1)
}

const cleanId = arxivId.trim().replace(/^arxiv:\s*/i, '').replace(/v\d+$/, '')

async function main() {
  console.log(`\n🔍 正在从 arXiv API 抓取 [${cleanId}] 元数据...`)
  const apiUrl = `https://export.arxiv.org/api/query?id_list=${cleanId}`
  
  let xml = ''
  try {
    const res = await fetch(apiUrl)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    xml = await res.text()
  } catch (err) {
    console.error(`❌ 获取 arXiv 元数据失败:`, err.message)
    process.exit(1)
  }

  // XML 提取基础字段
  const titleMatch = xml.match(/<entry>[\s\S]*?<title>([\s\S]*?)<\/title>/)
  const summaryMatch = xml.match(/<summary>([\s\S]*?)<\/summary>/)
  const publishedMatch = xml.match(/<published>([\s\S]*?)<\/published>/)
  const authorMatches = [...xml.matchAll(/<author>\s*<name>(.*?)<\/name>/g)].map(m => m[1])

  if (!titleMatch) {
    console.error(`❌ 未找到 arXiv ID [${cleanId}] 对应的有效条目。请确认 ID 是否正确。`)
    process.exit(1)
  }

  const title = titleMatch[1].replace(/\s+/g, ' ').trim()
  const summary = summaryMatch ? summaryMatch[1].replace(/\s+/g, ' ').trim() : ''
  const year = publishedMatch ? publishedMatch[1].slice(0, 4) : '2025'
  const authors = authorMatches.slice(0, 3).join(', ') + (authorMatches.length > 3 ? ' et al.' : '')

  console.log(`✔ 论文标题: ${title}`)
  console.log(`✔ 作者团队: ${authors} (${year})`)

  // 1. 下载 PDF 资产到 public/papers/<category>/<cleanId>.pdf
  const destDir = join('public', 'papers', category)
  if (!existsSync(destDir)) mkdirSync(destDir, { recursive: true })
  const pdfPath = join(destDir, `${cleanId}.pdf`)
  const relativePdf = `papers/${category}/${cleanId}.pdf`

  if (!existsSync(pdfPath)) {
    console.log(`\n📥 正在下载 PDF 文件到 ${pdfPath} ...`)
    const pdfUrl = `https://arxiv.org/pdf/${cleanId}.pdf`
    try {
      const pRes = await fetch(pdfUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
      })
      if (!pRes.ok) throw new Error(`HTTP ${pRes.status}`)
      const buffer = Buffer.from(await pRes.arrayBuffer())
      writeFileSync(pdfPath, buffer)
      console.log(`✔ PDF 下载完成 (${(buffer.length / 1024 / 1024).toFixed(2)} MB)`)
    } catch (e) {
      console.warn(`⚠ PDF 自动下载受限: ${e.message}。建议稍后手动补齐至 ${pdfPath}`)
    }
  } else {
    console.log(`✔ PDF 已在本地存在: ${pdfPath}`)
  }

  // 2. 更新 src/data/papers.json
  const papersJsonPath = 'src/data/papers.json'
  const papers = JSON.parse(readFileSync(papersJsonPath, 'utf8'))

  const existingIdx = papers.findIndex(p => p.id === cleanId)
  const newEntry = {
    id: cleanId,
    title,
    cat: category,
    authors,
    year,
    url: `https://arxiv.org/abs/${cleanId}`,
    pdf: relativePdf,
    lead: lead || `${title} · 权威导读`,
    summary: summary.slice(0, 400) + (summary.length > 400 ? '...' : '')
  }

  if (existingIdx >= 0) {
    console.log(`ℹ 论文 [${cleanId}] 已存在，正在更新元数据...`)
    papers[existingIdx] = { ...papers[existingIdx], ...newEntry }
  } else {
    papers.unshift(newEntry)
    console.log(`✔ 论文 [${cleanId}] 已成功追加至 src/data/papers.json`)
  }

  writeFileSync(papersJsonPath, JSON.stringify(papers, null, 2) + '\n', 'utf8')

  // 3. 运行资源同步与审计
  console.log('\n🔄 正在同步统计与数据审计...')
  try {
    execSync('node tools/sync-resource-summary.mjs', { stdio: 'inherit' })
    execSync('node tools/check-data.mjs', { stdio: 'inherit' })
    console.log(`\n🎉 论文 [${cleanId}] 录入成功！`)
  } catch (e) {
    console.error(`❌ 同步或审计失败:`, e.message)
  }
}

main()
