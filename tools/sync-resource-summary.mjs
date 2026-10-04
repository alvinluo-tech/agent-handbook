import { readFileSync, readdirSync, statSync, writeFileSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const papers = JSON.parse(readFileSync(join(root, 'src/data/papers.json'), 'utf8'))
const projects = JSON.parse(readFileSync(join(root, 'src/data/projects.json'), 'utf8'))
function pdfFiles(dir) {
  if (!existsSync(dir)) return []
  return readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const path = join(dir, entry.name)
    return entry.isDirectory() ? pdfFiles(path) : entry.name.endsWith('.pdf') ? [path] : []
  })
}
const pdfs = pdfFiles(join(root, 'public/papers'))
const diagramFiles = ['src/components/Diag.jsx', 'src/components/Diag2.jsx', 'src/chapters/labs/diag.jsx']
const summary = {
  papers: papers.papers.length,
  guides: papers.guides.length,
  projects: projects.repos.length,
  referencedPdfs: new Set([...papers.papers, ...papers.guides].map(item => item.pdf).filter(Boolean)).size,
  diskPdfs: pdfs.length,
  pdfMiB: Number((pdfs.reduce((total, file) => total + statSync(file).size, 0) / 1024 ** 2).toFixed(2)),
  diagrams: diagramFiles.reduce((total, file) => total + (readFileSync(join(root, file), 'utf8').match(/export function Fig\w+/g) || []).length, 0),
}
writeFileSync(join(root, 'src/data/resource-summary.json'), `${JSON.stringify(summary, null, 2)}\n`)
console.log('Resource summary:', JSON.stringify(summary))
