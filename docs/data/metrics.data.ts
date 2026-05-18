import { readdirSync, readFileSync } from 'fs'
import { join, basename } from 'path'

const dataDir = join(__dirname, '../../data')
const solutionsDir = join(__dirname, '../../benchmarks/solutions')

export interface MetricsEntry {
  problem: string
  language: string
  loc: number
  tokens: number
  tokensPerLine: number
  halsteadVolume: number
  sigilsPerLine: number
  uniqueSigilTypes: number
  compressionRatio: number
  avgLineLength: number
  maxNesting: number
  visualDensity: number
  conceptCount: number
  keywords: number
  syntaxPatterns: number
  apiCalls: number
  guardrailScore: number
  ceremonyLines: number
  ceremonyRatio: number
  langKeywords: number
  langConcepts: number
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
      tokensPerLine: raw.conciseness.tokensPerLine ?? +(raw.conciseness.tokens / raw.conciseness.loc).toFixed(2),
      halsteadVolume: raw.conciseness.halsteadVolume,
      sigilsPerLine: raw.sigils.sigilsPerLine,
      uniqueSigilTypes: raw.sigils.uniqueSigilTypes,
      compressionRatio: raw.conciseness.compressionRatio,
      avgLineLength: raw.readability.avgLineLength,
      maxNesting: raw.readability.maxNesting,
      visualDensity: raw.readability.visualDensity,
      conceptCount: raw.concepts?.conceptCount ?? 0,
      keywords: raw.concepts?.keywords ?? 0,
      syntaxPatterns: raw.concepts?.syntaxPatterns ?? 0,
      apiCalls: raw.concepts?.apiCalls ?? 0,
      guardrailScore: raw.guardrails?.guardrailScore ?? 0,
      ceremonyLines: raw.ceremony?.ceremonyLines ?? 0,
      ceremonyRatio: raw.ceremony?.ceremonyRatio ?? 0,
      langKeywords: raw.surfaceArea?.keywords ?? 0,
      langConcepts: raw.surfaceArea?.concepts ?? 0,
    }
  })
}

const extMap: Record<string, string> = {
  python: 'py', typescript: 'ts', rust: 'rs', go: 'go',
  c: 'c', cpp: 'cpp', swift: 'swift', zig: 'zig',
  javascript: 'js', ruby: 'rb', java: 'java', kotlin: 'kt',
  haskell: 'hs', elixir: 'exs', milo: 'milo', ada: 'adb',
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
