import { readdirSync, readFileSync } from 'fs'
import { join, basename } from 'path'

const dataDir = join(__dirname, '../../data')
const solutionsDir = join(__dirname, '../../benchmarks/solutions')

export interface MetricsEntry {
  problem: string
  language: string
  loc: number
  tokens: number
  halsteadVolume: number
  sigilsPerLine: number
  uniqueSigilTypes: number
  compressionRatio: number
  avgLineLength: number
  maxNesting: number
  visualDensity: number
}

export interface SolutionEntry {
  problem: string
  language: string
  code: string
}

function loadMetrics(): MetricsEntry[] {
  const files = readdirSync(dataDir).filter(f => f.endsWith('.json'))
  return files.map(f => {
    const raw = JSON.parse(readFileSync(join(dataDir, f), 'utf-8'))
    const parts = basename(f, '.json').split('-')
    const language = parts.pop()!
    const problem = parts.join('-')
    return {
      problem,
      language,
      loc: raw.conciseness.loc,
      tokens: raw.conciseness.tokens,
      halsteadVolume: raw.conciseness.halsteadVolume,
      sigilsPerLine: raw.sigils.sigilsPerLine,
      uniqueSigilTypes: raw.sigils.uniqueSigilTypes,
      compressionRatio: raw.conciseness.compressionRatio,
      avgLineLength: raw.readability.avgLineLength,
      maxNesting: raw.readability.maxNesting,
      visualDensity: raw.readability.visualDensity,
    }
  })
}

const extMap: Record<string, string> = {
  python: 'py', typescript: 'ts', rust: 'rs', go: 'go',
  c: 'c', cpp: 'cpp', swift: 'swift', zig: 'zig',
  javascript: 'js', ruby: 'rb', java: 'java', kotlin: 'kt',
  haskell: 'hs', elixir: 'exs', milo: 'milo',
}

function loadSolutions(): SolutionEntry[] {
  const entries: SolutionEntry[] = []
  for (const lang of readdirSync(solutionsDir)) {
    const langDir = join(solutionsDir, lang)
    const ext = extMap[lang]
    if (!ext) continue
    for (const file of readdirSync(langDir)) {
      if (!file.endsWith(`.${ext}`)) continue
      const problem = basename(file, `.${ext}`)
      const code = readFileSync(join(langDir, file), 'utf-8')
      entries.push({ problem, language: lang, code })
    }
  }
  return entries
}

export default {
  watch: ['../../data/*.json', '../../benchmarks/solutions/**/*'],
  load() {
    return {
      metrics: loadMetrics(),
      solutions: loadSolutions(),
    }
  }
}
