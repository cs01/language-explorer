---
outline: deep
---

<script setup lang="ts">
import { data } from '../data/metrics.data'

const lang = 'clojure'
const label = 'Clojure'
const entries = data.metrics.filter(m => m.language === lang)
const allLangs = [...new Set(data.metrics.map(m => m.language))]

const avg = (key: string) => +(entries.reduce((s, e) => s + e[key], 0) / entries.length).toFixed(1)
const avgAll = (key: string, l: string) => {
  const e = data.metrics.filter(m => m.language === l)
  return +(e.reduce((s, x) => s + x[key], 0) / e.length).toFixed(1)
}

const stats = {
  lines: avg('loc'),
  tokens: avg('tokens'),
  complexity: Math.round(entries.reduce((s, e) => s + e.halsteadVolume, 0) / entries.length),
  sigilsPerLine: avg('sigilsPerLine'),
  guardrails: entries[0]?.guardrailScore ?? 0,
  ceremony: avg('ceremonyRatio'),
  concepts: Math.round(entries.reduce((s, e) => s + e.conceptCount, 0) / entries.length),
  tokensPerLine: avg('tokensPerLine'),
  keywords: entries[0]?.langKeywords ?? 0,
  surface: entries[0]?.langConcepts ?? 0,
  keywordRatio: entries[0]?.keywordRatio ?? 0,
  llmTokens: avg('llmTokens'),
  llmTokensPerLine: avg('llmTokensPerLine'),
  typeCoverage: entries[0]?.typeCoverage ?? 0,
}

const maxVals = {
  lines: Math.max(...allLangs.map(l => avgAll('loc', l))),
  sigilsPerLine: Math.max(...allLangs.map(l => avgAll('sigilsPerLine', l))),
  guardrails: 5,
  ceremony: Math.max(...allLangs.map(l => avgAll('ceremonyRatio', l))),
  concepts: Math.max(...allLangs.map(l => {
    const e = data.metrics.filter(m => m.language === l)
    return e.reduce((s, x) => s + x.conceptCount, 0) / e.length
  })),
  tokensPerLine: Math.max(...allLangs.map(l => avgAll('tokensPerLine', l))),
  llmTokens: Math.max(...allLangs.map(l => avgAll('llmTokens', l))),
  llmTokensPerLine: Math.max(...allLangs.map(l => avgAll('llmTokensPerLine', l))),
}

const radarData = [
  { label: 'Concise', value: maxVals.lines - stats.lines, max: maxVals.lines },
  { label: 'Simple', value: maxVals.concepts - stats.concepts, max: maxVals.concepts },
  { label: 'Clear', value: maxVals.sigilsPerLine - stats.sigilsPerLine, max: maxVals.sigilsPerLine },
  { label: 'Guardrails', value: stats.guardrails, max: maxVals.guardrails },
  { label: 'Lightweight', value: maxVals.ceremony - stats.ceremony, max: maxVals.ceremony },
  { label: 'Dense', value: stats.tokensPerLine, max: maxVals.tokensPerLine },
]

const catKeys = ["catTypes","catControlFlow","catFunctions","catOopData","catMemory","catConcurrency","catMetaprogramming","catErrorHandling"] as const
const catLabels = ["Types","Control","Functions","OOP/Data","Memory","Concurrency","Metaprog","Errors"]
const catMax = catKeys.map(k => Math.max(...allLangs.map(l => { const e = data.metrics.filter(m => m.language === l); return e[0]?.[k] ?? 0 }), 1))
const conceptRadar = catLabels.map((label, i) => ({ label, value: entries[0]?.[catKeys[i]] ?? 0, max: catMax[i] }))

const gr = {
  memory: entries[0]?.grMemory ?? 0,
  null: entries[0]?.grNull ?? 0,
  race: entries[0]?.grRace ?? 0,
  overflow: entries[0]?.grOverflow ?? 0,
  coercion: entries[0]?.grCoercion ?? 0,
  memoryWhen: entries[0]?.grMemoryWhen ?? "none",
  memoryActivation: entries[0]?.grMemoryActivation ?? "default",
  nullWhen: entries[0]?.grNullWhen ?? "none",
  nullActivation: entries[0]?.grNullActivation ?? "default",
  raceWhen: entries[0]?.grRaceWhen ?? "none",
  raceActivation: entries[0]?.grRaceActivation ?? "default",
  overflowWhen: entries[0]?.grOverflowWhen ?? "none",
  overflowActivation: entries[0]?.grOverflowActivation ?? "default",
  coercionWhen: entries[0]?.grCoercionWhen ?? "none",
  coercionActivation: entries[0]?.grCoercionActivation ?? "default",
}

const tags = ['JVM', 'Functional', 'Dynamic', 'GC']

const catData = catLabels.map((label, i) => ({ label, value: entries[0]?.[catKeys[i]] ?? 0 }))

const grReasons = {
  memory: 'JVM GC + immutable data prevent memory corruption',
  null: 'nil is idiomatic; NPE possible but JVM catches it',
  race: 'Atoms/refs/STM prevent most races, but Java interop risks',
  overflow: 'Arbitrary-precision by default (BigInt auto-promotion)',
  coercion: 'Some implicit numeric widening in arithmetic',
}
</script>

# Clojure

<div class="lang-tags"><span v-for="t in tags" class="lang-tag">{{ t }}</span></div>

A modern Lisp on the JVM — immutable data structures by default and a strong concurrency story with atoms, refs, and STM. Niche but valued in finance and data processing for its simplicity and REPL-driven development. Among the most concise languages in benchmarks, with minimal syntax and a prefix notation that eliminates operator precedence.

<div style="display: flex; align-items: flex-start; gap: 2rem; flex-wrap: wrap;">
<RadarChart :data="radarData" label="Quality" color="#3b82f6" />
<RadarChart :data="conceptRadar" label="Concept Distribution" color="#f59e0b" />

<GuardrailCard :score="stats.guardrails" :memory="gr.memory" :null="gr.null" :race="gr.race" :overflow="gr.overflow" :coercion="gr.coercion" :memoryWhen="gr.memoryWhen" :memoryActivation="gr.memoryActivation" :nullWhen="gr.nullWhen" :nullActivation="gr.nullActivation" :raceWhen="gr.raceWhen" :raceActivation="gr.raceActivation" :overflowWhen="gr.overflowWhen" :overflowActivation="gr.overflowActivation" :coercionWhen="gr.coercionWhen" :coercionActivation="gr.coercionActivation" :reasons="grReasons" />
<ExpressivenessCard :lines="stats.lines" :tokens="stats.tokens" :complexity="stats.complexity" :ceremony="stats.ceremony" :maxLines="maxVals.lines" :maxComplexity="maxVals.complexity" :maxCeremony="maxVals.ceremony" />
<SurfaceAreaCard :concepts="stats.surface" :keywords="stats.keywords" :keywordRatio="stats.keywordRatio" :categories="catData" />
<ExplicitnessCard :concepts="stats.surface" :keywordRatio="stats.keywordRatio" />
<AIReadinessCard :llmTokens="stats.llmTokens" :llmTokensPerLine="stats.llmTokensPerLine" :typeCoverage="stats.typeCoverage" :maxLlmTokens="maxVals.llmTokens" :maxLlmTokensPerLine="maxVals.llmTokensPerLine" />
</div>

## Solutions

View all Clojure solutions in the [problem pages](/problems/two-sum).

<style>
.lang-tags { display: flex; gap: 0.5rem; margin-bottom: 0.75rem; flex-wrap: wrap; }
.lang-tag {
  display: inline-block; padding: 2px 10px; border-radius: 99px; font-size: 0.8rem;
  background: var(--vp-c-brand-soft); color: var(--vp-c-brand-1); font-weight: 500;
}
</style>
