---
outline: deep
---

<script setup lang="ts">
import { data } from './data/metrics.data'

const languages = [...new Set(data.metrics.map(m => m.language))]
const displayName: Record<string, string> = {
  cpp: 'C++', csharp: 'C#', objc: 'Objective-C', javascript: 'JavaScript', typescript: 'TypeScript',
}
const toDisplay = (lang: string) => displayName[lang] ?? lang.charAt(0).toUpperCase() + lang.slice(1)

// Per-program metrics (averaged across benchmark problems)
const expressData = languages.map(lang => {
  const entries = data.metrics.filter(m => m.language === lang)
  const avg = (key) => +(entries.reduce((s, e) => s + e[key], 0) / entries.length).toFixed(1)
  return {
    language: toDisplay(lang),
    lines: avg('loc'),
    tokens: avg('tokens'),
    'tok/line': avg('tokensPerLine'),
    complexity: Math.round(entries.reduce((s, e) => s + e.halsteadVolume, 0) / entries.length),
    'symbols/line': avg('sigilsPerLine'),
    concepts: Math.round(entries.reduce((s, e) => s + e.conceptCount, 0) / entries.length),
    ceremony: avg('ceremonyRatio'),
  }
})

const expressColumns = [
  { key: 'lines', label: 'Lines' },
  { key: 'complexity', label: 'Complexity' },
  { key: 'ceremony', label: 'Ceremony' },
]

// Concept category radars for paired comparisons
const catKeys = ['catTypes','catControlFlow','catFunctions','catOopData','catMemory','catConcurrency','catMetaprogramming','catErrorHandling'] as const
const catLabels = ['Types','Control','Functions','OOP/Data','Memory','Concurrency','Metaprog','Errors']

function conceptRadarFor(lang: string) {
  const entries = data.metrics.filter(m => m.language === lang)
  const allMax = catKeys.map(k => Math.max(...languages.map(l => {
    const e = data.metrics.filter(m => m.language === l)
    return e[0]?.[k] ?? 0
  }), 1))
  return catLabels.map((label, i) => ({
    label,
    value: entries[0]?.[catKeys[i]] ?? 0,
    max: allMax[i],
  }))
}

// Guardrail breakdown — show when (compile/runtime/none) for nuance
function guardrailBreakdown(lang: string) {
  const entries = data.metrics.filter(m => m.language === lang)
  if (!entries.length) return []
  const e = entries[0]
  const items = [
    { label: 'Memory', when: e.grMemoryWhen },
    { label: 'Null', when: e.grNullWhen },
    { label: 'Race', when: e.grRaceWhen },
    { label: 'Overflow', when: e.grOverflowWhen },
    { label: 'Coercion', when: e.grCoercionWhen },
  ]
  return items.map(i => ({
    ...i,
    level: i.when === 'compile' ? 'compile' : i.when === 'runtime' ? 'runtime' : 'none',
  }))
}

const zigGuardrails = guardrailBreakdown('zig')
const rustGuardrails = guardrailBreakdown('rust')
const zigScore = data.metrics.find(m => m.language === 'zig')?.guardrailScore ?? 0
const rustScore = data.metrics.find(m => m.language === 'rust')?.guardrailScore ?? 0

// Hero feature bars — averaged across benchmarks
function heroStats(lang: string) {
  const entries = data.metrics.filter(m => m.language === lang)
  const avg = (key: string) => +(entries.reduce((s, e) => s + e[key], 0) / entries.length).toFixed(1)
  return {
    lines: avg('loc'),
    complexity: Math.round(entries.reduce((s, e) => s + e.halsteadVolume, 0) / entries.length),
    ceremony: avg('ceremonyRatio'),
    concepts: entries[0]?.langConcepts ?? 0,
    keywords: entries[0]?.langKeywords ?? 0,
    guardrails: entries[0]?.guardrailScore ?? 0,
  }
}
const zigStats = heroStats('zig')
const rustStats = heroStats('rust')

const heroMetrics = [
  { label: 'Concepts to Learn', zig: zigStats.concepts, rust: rustStats.concepts, unit: '', lower: true },
  { label: 'Keywords', zig: zigStats.keywords, rust: rustStats.keywords, unit: '', lower: true },
  { label: 'Avg Lines', zig: zigStats.lines, rust: rustStats.lines, unit: '', lower: true },
  { label: 'Complexity', zig: zigStats.complexity, rust: rustStats.complexity, unit: '', lower: true },
  { label: 'Ceremony', zig: +(zigStats.ceremony * 100).toFixed(0), rust: +(rustStats.ceremony * 100).toFixed(0), unit: '%', lower: true },
  { label: 'Guardrails', zig: zigStats.guardrails, rust: rustStats.guardrails, unit: ' / 5', lower: false },
]

const pairs = [
  { left: 'typescript', right: 'javascript', why: 'Types added — 100 vs 65 concepts, but stronger guardrails' },
  { left: 'python', right: 'haskell', why: 'Same total concepts (75), opposite shapes' },
  { left: 'rust', right: 'go', why: 'Systems safety vs simplicity' },
  { left: 'c', right: 'zig', why: 'C successor — similar size (60 vs 65), more guardrails' },
]

const pairRadars = pairs.map(p => ({
  ...p,
  leftLabel: toDisplay(p.left),
  rightLabel: toDisplay(p.right),
  leftData: conceptRadarFor(p.left),
  rightData: conceptRadarFor(p.right),
  leftGuardrails: guardrailBreakdown(p.left),
  rightGuardrails: guardrailBreakdown(p.right),
  leftScore: data.metrics.find(m => m.language === p.left)?.guardrailScore ?? 0,
  rightScore: data.metrics.find(m => m.language === p.right)?.guardrailScore ?? 0,
}))

const conceptLinks = { Types: './metrics/concept-count', Control: './metrics/concept-count', Functions: './metrics/concept-count', 'OOP/Data': './metrics/concept-count', Memory: './metrics/concept-count', Concurrency: './metrics/concept-count', Metaprog: './metrics/concept-count', Errors: './metrics/concept-count' }
</script>

# Language Explorer

Quantitative comparison of programming languages — measured from real code, not opinions.

<div class="hero-matchup">
<div class="matchup-header">
  <span class="matchup-vs">Zig vs Rust</span>
  <span class="matchup-tagline">Two modern takes on systems programming. Different tradeoffs.</span>
</div>

<div class="hero-radars">
<RadarChart :data="conceptRadarFor('zig')" label="Zig" color="#3b82f6" :size="220" :links="conceptLinks" />
<RadarChart :data="conceptRadarFor('rust')" label="Rust" color="#f97316" :size="220" :links="conceptLinks" />
</div>
<div class="radar-legend">
  <span class="radar-legend-item"><span class="radar-swatch" style="background: #3b82f6"></span> Zig</span>
  <span class="radar-legend-item"><span class="radar-swatch" style="background: #f97316"></span> Rust</span>
</div>

<div class="matchup-insight">
Zig bets on <strong>simplicity</strong> — comptime, no hidden allocators, 65 concepts. Rust bets on <strong>safety</strong> — ownership, lifetimes, borrow checker, 110 concepts. Same polygon axes, radically different shapes.
</div>

<div class="hero-bars">
  <div class="hero-bar-header">
    <span></span>
    <span class="hero-lang-label" style="color: #3b82f6">Zig</span>
    <span class="hero-lang-label" style="color: #f97316">Rust</span>
  </div>
  <div v-for="m in heroMetrics" :key="m.label" class="hero-bar-row">
    <span class="hero-bar-label">{{ m.label }}</span>
    <div class="hero-bar-pair">
      <div class="hero-bar-cell">
        <div class="hero-bar-track">
          <div class="hero-bar-fill" :style="{ width: (m.zig / Math.max(m.zig, m.rust) * 100) + '%', background: '#3b82f6' }"></div>
        </div>
        <span class="hero-bar-val">{{ m.zig }}{{ m.unit }}</span>
      </div>
      <div class="hero-bar-cell">
        <div class="hero-bar-track">
          <div class="hero-bar-fill" :style="{ width: (m.rust / Math.max(m.zig, m.rust) * 100) + '%', background: '#f97316' }"></div>
        </div>
        <span class="hero-bar-val">{{ m.rust }}{{ m.unit }}</span>
      </div>
    </div>
  </div>
</div>

<div class="safety-comparison">
<div class="safety-header">Safety Guardrails <a href="./methodology#guardrails" class="safety-link">how we score →</a></div>
<div class="safety-legend">
  <span class="safety-badge compile">compile-time</span>
  <span class="safety-badge runtime">runtime</span>
  <span class="safety-badge none">none</span>
</div>
<div class="safety-row">
  <div class="safety-lang">
    <span class="safety-name" style="color: #3b82f6">Zig</span>
    <span class="safety-score">{{ zigScore }} / 5</span>
  </div>
  <div class="safety-badges">
    <span v-for="g in zigGuardrails" :key="g.label" :class="['safety-badge', g.level]">{{ g.label }}</span>
  </div>
</div>
<div class="safety-row">
  <div class="safety-lang">
    <span class="safety-name" style="color: #f97316">Rust</span>
    <span class="safety-score">{{ rustScore }} / 5</span>
  </div>
  <div class="safety-badges">
    <span v-for="g in rustGuardrails" :key="g.label" :class="['safety-badge', g.level]">{{ g.label }}</span>
  </div>
</div>
</div>

<div class="matchup-cta">
<a href="./compare?langs=zig,rust" class="cta-button">Full Comparison →</a>
<a href="./compare" class="cta-link">or explore all 14 languages</a>
</div>
</div>

## Expressiveness

How concise is the code? Averaged across 7 benchmark problems.

<MetricsTable :data="expressData" :columns="expressColumns" />

<small>Full metrics on the <a href="./compare">Compare</a> page. <a href="./methodology">Methodology →</a></small>

<div v-for="pair in pairRadars" :key="pair.left" class="concept-pair">
<div class="pair-header"><strong>{{ pair.leftLabel }}</strong> vs <strong>{{ pair.rightLabel }}</strong> — {{ pair.why }}</div>
<div style="display: flex; gap: 1rem; flex-wrap: wrap; justify-content: center;">
<RadarChart :data="pair.leftData" :label="pair.leftLabel" color="#3b82f6" :size="220" :links="conceptLinks" />
<RadarChart :data="pair.rightData" :label="pair.rightLabel" color="#f97316" :size="220" :links="conceptLinks" />
</div>
<div class="radar-legend">
  <span class="radar-legend-item"><span class="radar-swatch" style="background: #3b82f6"></span> {{ pair.leftLabel }}</span>
  <span class="radar-legend-item"><span class="radar-swatch" style="background: #f97316"></span> {{ pair.rightLabel }}</span>
</div>
<div class="safety-comparison">
<div class="safety-header">Safety Guardrails <a href="./methodology#guardrails" class="safety-link">how we score →</a></div>
<div class="safety-legend">
  <span class="safety-badge compile">compile-time</span>
  <span class="safety-badge runtime">runtime</span>
  <span class="safety-badge none">none</span>
</div>
<div class="safety-row">
  <div class="safety-lang">
    <span class="safety-name" style="color: #3b82f6">{{ pair.leftLabel }}</span>
    <span class="safety-score">{{ pair.leftScore }} / 5</span>
  </div>
  <div class="safety-badges">
    <span v-for="g in pair.leftGuardrails" :key="g.label" :class="['safety-badge', g.level]">{{ g.label }}</span>
  </div>
</div>
<div class="safety-row">
  <div class="safety-lang">
    <span class="safety-name" style="color: #f97316">{{ pair.rightLabel }}</span>
    <span class="safety-score">{{ pair.rightScore }} / 5</span>
  </div>
  <div class="safety-badges">
    <span v-for="g in pair.rightGuardrails" :key="g.label" :class="['safety-badge', g.level]">{{ g.label }}</span>
  </div>
</div>
</div>
<div class="pair-cta"><a :href="`./compare?langs=${pair.left},${pair.right}`">Compare {{ pair.leftLabel }} & {{ pair.rightLabel }} →</a></div>
</div>

<style>
.radar-legend {
  display: flex;
  justify-content: center;
  gap: 1.25rem;
  margin: 0.25rem 0 0.75rem;
  font-size: 0.8rem;
  color: var(--vp-c-text-2);
}
.radar-legend-item {
  display: flex;
  align-items: center;
  gap: 0.35rem;
}
.radar-swatch {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 2px;
}
.hero-matchup {
  margin: 1.5rem 0 2rem;
  padding: 1.5rem;
  border-radius: 12px;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
}
.matchup-header {
  text-align: center;
  margin-bottom: 1.25rem;
}
.matchup-vs {
  display: block;
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
  letter-spacing: -0.02em;
}
.matchup-tagline {
  display: block;
  font-size: 0.9rem;
  color: var(--vp-c-text-2);
  margin-top: 0.25rem;
}
.hero-radars {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  justify-content: center;
  margin-bottom: 0.5rem;
}
.hero-bars {
  margin-bottom: 1.25rem;
}
.hero-bar-header {
  display: grid;
  grid-template-columns: 120px 1fr 1fr;
  gap: 1rem;
  margin-bottom: 0.5rem;
  padding: 0 0.25rem;
}
.hero-lang-label {
  font-weight: 700;
  font-size: 0.85rem;
  text-align: center;
}
.hero-bar-row {
  display: grid;
  grid-template-columns: 120px 1fr;
  gap: 0.5rem;
  align-items: center;
  margin-bottom: 0.4rem;
}
.hero-bar-label {
  font-size: 0.78rem;
  font-weight: 500;
  color: var(--vp-c-text-2);
  text-align: right;
  padding-right: 0.5rem;
}
.hero-bar-pair {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}
.hero-bar-cell {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.hero-bar-track {
  flex: 1;
  height: 18px;
  background: var(--vp-c-bg);
  border-radius: 4px;
  overflow: hidden;
}
.hero-bar-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.3s ease;
  opacity: 0.75;
}
.hero-bar-val {
  font-size: 0.78rem;
  font-weight: 500;
  font-variant-numeric: tabular-nums;
  min-width: 3.5rem;
  color: var(--vp-c-text-2);
}
.matchup-insight {
  text-align: center;
  font-size: 0.88rem;
  color: var(--vp-c-text-2);
  max-width: 600px;
  margin: 0 auto 1.25rem;
  line-height: 1.5;
}
.safety-comparison {
  background: var(--vp-c-bg);
  border-radius: 8px;
  padding: 1rem 1.25rem;
  margin-bottom: 1.25rem;
}
.safety-header {
  font-weight: 700;
  font-size: 0.9rem;
  color: var(--vp-c-text-1);
  margin-bottom: 0.75rem;
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
}
.safety-link {
  font-size: 0.72rem;
  font-weight: 400;
  color: var(--vp-c-text-3) !important;
  text-decoration: none !important;
}
.safety-link:hover {
  color: var(--vp-c-brand-1) !important;
}
.safety-row {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.5rem 0;
  flex-wrap: wrap;
  border-bottom: 1px solid var(--vp-c-divider);
}
.safety-row:last-child {
  border-bottom: none;
  padding-bottom: 0;
}
.safety-lang {
  min-width: 100px;
  display: flex;
  align-items: baseline;
  gap: 0.4rem;
}
.safety-name {
  font-weight: 600;
  font-size: 0.85rem;
}
.safety-score {
  font-size: 0.72rem;
  color: var(--vp-c-text-3);
  font-weight: 400;
}
.safety-badges {
  display: flex;
  gap: 0.35rem;
  flex-wrap: wrap;
}
.safety-legend {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--vp-c-divider);
  font-size: 0.7rem;
}
.safety-badge {
  padding: 0.2rem 0.55rem;
  border-radius: 12px;
  font-size: 0.72rem;
  font-weight: 500;
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-3);
  border: 1px solid var(--vp-c-divider);
}
.safety-badge.compile {
  background: #22c55e18;
  color: #16a34a;
  border-color: #22c55e44;
}
.safety-badge.runtime {
  background: #f59e0b18;
  color: #d97706;
  border-color: #f59e0b44;
}
.safety-badge.none {
  opacity: 0.5;
}
.dark .safety-badge.compile {
  color: #4ade80;
}
.dark .safety-badge.runtime {
  color: #fbbf24;
}
.matchup-cta {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}
.cta-button {
  display: inline-block;
  padding: 0.6rem 1.5rem;
  border-radius: 8px;
  background: var(--vp-c-brand-1);
  color: var(--vp-c-bg) !important;
  font-weight: 600;
  font-size: 0.9rem;
  text-decoration: none !important;
  transition: opacity 0.15s ease;
}
.cta-button:hover {
  opacity: 0.9;
}
.cta-link {
  font-size: 0.82rem;
  color: var(--vp-c-text-2);
}
.concept-pair {
  margin-bottom: 2rem;
  padding: 1rem;
  border-radius: 8px;
  background: var(--vp-c-bg-soft);
}
.pair-header {
  text-align: center;
  margin-bottom: 0.75rem;
  font-size: 0.9rem;
  color: var(--vp-c-text-2);
}
.pair-cta {
  text-align: center;
  margin-top: 0.5rem;
  font-size: 0.82rem;
}
@media (max-width: 640px) {
  .hero-bar-row {
    grid-template-columns: 1fr;
  }
  .hero-bar-label {
    text-align: left;
  }
  .hero-bar-header {
    display: none;
  }
}
</style>
