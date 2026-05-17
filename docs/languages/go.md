---
outline: deep
---

<script setup lang="ts">
import { data } from '../data/metrics.data'

const lang = 'go'
const label = 'Go'
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
  symbolTypes: Math.round(entries.reduce((s, e) => s + e.uniqueSigilTypes, 0) / entries.length),
  safety: avg('safetyPerLine'),
  ceremony: avg('ceremonyRatio'),
}

const maxVals = {
  lines: Math.max(...allLangs.map(l => avgAll('loc', l))),
  tokens: Math.max(...allLangs.map(l => avgAll('tokens', l))),
  complexity: Math.max(...allLangs.map(l => {
    const e = data.metrics.filter(m => m.language === l)
    return e.reduce((s, x) => s + x.halsteadVolume, 0) / e.length
  })),
  sigilsPerLine: Math.max(...allLangs.map(l => avgAll('sigilsPerLine', l))),
  symbolTypes: Math.max(...allLangs.map(l => {
    const e = data.metrics.filter(m => m.language === l)
    return e.reduce((s, x) => s + x.uniqueSigilTypes, 0) / e.length
  })),
  safety: Math.max(...allLangs.map(l => avgAll('safetyPerLine', l))),
  ceremony: Math.max(...allLangs.map(l => avgAll('ceremonyRatio', l))),
}

const radarData = [
  { label: 'Lines', value: stats.lines, max: maxVals.lines },
  { label: 'Tokens', value: stats.tokens, max: maxVals.tokens },
  { label: 'Complexity', value: stats.complexity, max: maxVals.complexity },
  { label: 'Sym/Line', value: stats.sigilsPerLine, max: maxVals.sigilsPerLine },
  { label: 'Sym Types', value: stats.symbolTypes, max: maxVals.symbolTypes },
  { label: 'Safety', value: stats.safety, max: maxVals.safety },
  { label: 'Ceremony', value: stats.ceremony, max: maxVals.ceremony },
]

const perProblem = entries.map(e => ({
  problem: e.problem,
  lines: e.loc,
  tokens: e.tokens,
  complexity: e.halsteadVolume,
  'symbols/line': e.sigilsPerLine,
  safety: e.safetyPerLine,
  ceremony: e.ceremonyRatio,
}))

const columns = [
  { key: 'lines', label: 'Lines' },
  { key: 'tokens', label: 'Tokens' },
  { key: 'complexity', label: 'Complexity' },
  { key: 'symbols/line', label: 'Sym/Line' },
  { key: 'safety', label: 'Safety', lower: false },
  { key: 'ceremony', label: 'Ceremony' },
]

// Rank among all languages (1 = best)
const rankings = allLangs
  .map(l => ({ lang: l, lines: avgAll('loc', l) }))
  .sort((a, b) => a.lines - b.lines)
const rank = rankings.findIndex(r => r.lang === lang) + 1
</script>

# Go

<div style="display: flex; align-items: flex-start; gap: 2rem; flex-wrap: wrap;">
<RadarChart :data="radarData" :label="label" color="#3b82f6" />

<div>

**Overall rank: #{{ rank }} of {{ allLangs.length }}** (by avg lines)

| Metric | Value |
|--------|-------|
| Avg Lines | {{ stats.lines }} |
| Avg Tokens | {{ stats.tokens }} |
| Complexity | {{ stats.complexity }} |
| Symbols/Line | {{ stats.sigilsPerLine }} |
| Symbol Types | {{ stats.symbolTypes }} |
| Safety/Line | {{ stats.safety }} |
| Ceremony | {{ stats.ceremony }} |

</div>
</div>

## Per-problem breakdown

<MetricsTable :data="perProblem" :columns="columns" />

## Solutions

View all Go solutions in the [problem pages](/problems/two-sum).
