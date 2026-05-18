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
  grMemory: number
  grNull: number
  grRace: number
  grOverflow: number
  grCoercion: number
  grMemoryWhen: string
  grMemoryActivation: string
  grNullWhen: string
  grNullActivation: string
  grRaceWhen: string
  grRaceActivation: string
  grOverflowWhen: string
  grOverflowActivation: string
  grCoercionWhen: string
  grCoercionActivation: string
  ceremonyLines: number
  ceremonyRatio: number
  langKeywords: number
  langConcepts: number
  keywordRatio: number
  catTypes: number
  catControlFlow: number
  catFunctions: number
  catOopData: number
  catMemory: number
  catConcurrency: number
  catMetaprogramming: number
  catErrorHandling: number
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
      grMemory: raw.guardrails?.memory ?? 0,
      grNull: raw.guardrails?.null ?? 0,
      grRace: raw.guardrails?.race ?? 0,
      grOverflow: raw.guardrails?.overflow ?? 0,
      grCoercion: raw.guardrails?.coercion ?? 0,
      grMemoryWhen: raw.guardrails?.grMemoryWhen ?? 'none',
      grMemoryActivation: raw.guardrails?.grMemoryActivation ?? 'default',
      grNullWhen: raw.guardrails?.grNullWhen ?? 'none',
      grNullActivation: raw.guardrails?.grNullActivation ?? 'default',
      grRaceWhen: raw.guardrails?.grRaceWhen ?? 'none',
      grRaceActivation: raw.guardrails?.grRaceActivation ?? 'default',
      grOverflowWhen: raw.guardrails?.grOverflowWhen ?? 'none',
      grOverflowActivation: raw.guardrails?.grOverflowActivation ?? 'default',
      grCoercionWhen: raw.guardrails?.grCoercionWhen ?? 'none',
      grCoercionActivation: raw.guardrails?.grCoercionActivation ?? 'default',
      ceremonyLines: raw.ceremony?.ceremonyLines ?? 0,
      ceremonyRatio: raw.ceremony?.ceremonyRatio ?? 0,
      langKeywords: raw.surfaceArea?.keywords ?? 0,
      langConcepts: raw.surfaceArea?.concepts ?? 0,
      keywordRatio: raw.surfaceArea?.keywordRatio ?? 0,
      catTypes: raw.surfaceArea?.categories?.types ?? 0,
      catControlFlow: raw.surfaceArea?.categories?.controlFlow ?? 0,
      catFunctions: raw.surfaceArea?.categories?.functions ?? 0,
      catOopData: raw.surfaceArea?.categories?.oopData ?? 0,
      catMemory: raw.surfaceArea?.categories?.memory ?? 0,
      catConcurrency: raw.surfaceArea?.categories?.concurrency ?? 0,
      catMetaprogramming: raw.surfaceArea?.categories?.metaprogramming ?? 0,
      catErrorHandling: raw.surfaceArea?.categories?.errorHandling ?? 0,
    }
  })
}

const extMap: Record<string, string> = {
  python: 'py', typescript: 'ts', rust: 'rs', go: 'go',
  c: 'c', cpp: 'cpp', swift: 'swift', zig: 'zig',
  javascript: 'js', ruby: 'rb', java: 'java', kotlin: 'kt',
  haskell: 'hs', elixir: 'exs', milo: 'milo', ada: 'adb',
  csharp: 'cs', erlang: 'erl', clojure: 'clj', objc: 'm',
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
