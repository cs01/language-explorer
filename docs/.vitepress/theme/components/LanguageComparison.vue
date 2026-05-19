<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

interface LangData {
  language: string
  lines: number
  tokens: number
  tokensPerLine: number
  verbosity: number
  sigilsPerLine: number
  guardrails: number
  ceremony: number
  grMemoryWhen?: string
  grNullWhen?: string
  grRaceWhen?: string
  grOverflowWhen?: string
  grCoercionWhen?: string
}

interface Group {
  label: string
  languages: string[]
}

const props = defineProps<{
  languages: LangData[]
  groups?: Group[]
}>()

const colors = ['#06b6d4', '#f97316', '#a78bfa', '#22c55e']
const allLangs = computed(() => props.languages.map(l => l.language).sort())
const defaultPair = ['Rust', 'Zig'].filter(l => allLangs.value.includes(l))
const selected = ref<string[]>(defaultPair.length === 2 ? defaultPair : [allLangs.value[0] || '', allLangs.value[1] || ''])
const activeGroup = ref('')

// ?langs=python,haskell → auto-select from URL
const displayAliases: Record<string, string> = {
  cpp: 'C++', 'c++': 'C++', csharp: 'C#', 'c#': 'C#',
  objc: 'Objective-C', javascript: 'JavaScript', typescript: 'TypeScript',
}
function resolveDisplayName(slug: string): string {
  const lower = slug.toLowerCase().trim()
  return displayAliases[lower] ?? lower.charAt(0).toUpperCase() + lower.slice(1)
}
onMounted(() => {
  if (typeof window === 'undefined') return
  const params = new URLSearchParams(window.location.search)
  const langsParam = params.get('langs')
  if (!langsParam) return
  const requested = langsParam.split(',')
    .map(resolveDisplayName)
    .filter(s => allLangs.value.includes(s))
    .slice(0, 4)
  if (requested.length >= 2) selected.value = requested
})

function toggleLang(lang: string) {
  activeGroup.value = ''
  const idx = selected.value.indexOf(lang)
  if (idx >= 0) {
    selected.value.splice(idx, 1)
  } else if (selected.value.length < 4) {
    selected.value.push(lang)
  }
}

function applyGroup(group: Group) {
  if (activeGroup.value === group.label) {
    activeGroup.value = ''
    selected.value = [allLangs.value[0] || '', allLangs.value[1] || '']
    return
  }
  activeGroup.value = group.label
  const matching = group.languages.map(l => l.charAt(0).toUpperCase() + l.slice(1))
    .filter(l => allLangs.value.includes(l))
  selected.value = matching.slice(0, 4)
}

function isGreyedOut(lang: string): boolean {
  if (!activeGroup.value || !props.groups) return false
  const group = props.groups.find(g => g.label === activeGroup.value)
  if (!group) return false
  return !group.languages.includes(lang.toLowerCase())
}

function langColor(lang: string): string | null {
  const idx = selected.value.indexOf(lang)
  return idx >= 0 ? colors[idx] : null
}

const withData = computed(() => props.languages.filter(l => (l.lines as number) > 0))
const maxVals = computed(() => ({
  lines: Math.max(...withData.value.map(l => l.lines), 1),
  tokensPerLine: Math.max(...withData.value.map(l => l.tokensPerLine), 1),
  verbosity: Math.max(...withData.value.map(l => l.verbosity), 1),
  sigilsPerLine: Math.max(...withData.value.map(l => l.sigilsPerLine), 1),
  guardrails: Math.max(...props.languages.map(l => l.guardrails), 1),
  ceremony: Math.max(...withData.value.map(l => l.ceremony), 1),
}))

const metrics = ['lines', 'tokensPerLine', 'verbosity', 'sigilsPerLine', 'guardrails', 'ceremony'] as const
const higherIsBetter = new Set(['guardrails', 'tokensPerLine'])
const radarLabels: Record<string, string> = {
  lines: 'Fewer Lines', tokensPerLine: 'Info per Line', verbosity: 'Concise',
  sigilsPerLine: 'Low Noise', guardrails: 'Safe', ceremony: 'Lightweight',
}
const barLabels = radarLabels
const barDescriptions: Record<string, string> = {
  lines: 'Fewer lines of code — Python\'s `two_sum` is 8 lines vs Java\'s 22',
  tokensPerLine: 'More information per line — higher means each line does more',
  verbosity: 'Lower Halstead Volume — less total information to process',
  sigilsPerLine: 'Fewer special characters per line — { -> & :: * etc.',
  guardrails: 'More bugs caught by the language — memory, null, race, overflow, coercion',
  ceremony: 'Less boilerplate — imports, main wrappers, lone braces, type-only lines',
}

const expressLinks: Record<string, string> = {
  'Fewer Lines': './metrics/code-size', 'Info per Line': './metrics/code-size', 'Concise': './metrics/verbosity',
  'Low Noise': './metrics/symbol-noise', Safe: './metrics/safety', Lightweight: './metrics/type-ceremony',
}
const conceptLabelLinks: Record<string, string> = {
  Types: './metrics/concept-count', Control: './metrics/concept-count', Functions: './metrics/concept-count',
  'OOP/Data': './metrics/concept-count', Memory: './metrics/concept-count', Concurrency: './metrics/concept-count',
  Metaprog: './metrics/concept-count', Errors: './metrics/concept-count',
}

function normalize(val: number, max: number, higher: boolean): number {
  const raw = higher ? val / max : 1 - val / max
  return Math.max(Math.min(raw, 1), 0.1)
}

function getBarWidth(lang: string, metric: string): number {
  const entry = props.languages.find(l => l.language === lang)
  if (!entry || !hasExpressData(lang)) return 0
  const val = entry[metric as keyof LangData] as number
  const max = maxVals.value[metric as keyof typeof maxVals.value]
  return normalize(val, max, higherIsBetter.has(metric)) * 100
}

function getValue(lang: string, metric: string): number {
  const entry = props.languages.find(l => l.language === lang)
  if (!entry) return 0
  return entry[metric as keyof LangData] as number
}

// Radar overlay
const radarSize = 400
const radarCx = radarSize / 2
const radarCy = radarSize / 2
const radarR = radarSize / 2 - 55

function polarToCart(angle: number, r: number): [number, number] {
  const rad = (angle - 90) * (Math.PI / 180)
  return [radarCx + r * Math.cos(rad), radarCy + r * Math.sin(rad)]
}

const radarAxes = computed(() => {
  const n = metrics.length
  return metrics.map((m, i) => {
    const angle = (360 / n) * i
    const [x, y] = polarToCart(angle, radarR)
    const [lx, ly] = polarToCart(angle, radarR + 25)
    return { metric: m, label: radarLabels[m], angle, x, y, lx, ly }
  })
})

const gridLevels = [0.25, 0.5, 0.75, 1.0]

function gridPath(level: number): string {
  const n = metrics.length
  const points = Array.from({ length: n }, (_, i) => {
    const angle = (360 / n) * i
    return polarToCart(angle, radarR * level)
  })
  return points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0]},${p[1]}`).join(' ') + ' Z'
}

function hasExpressData(lang: string): boolean {
  const entry = props.languages.find(l => l.language === lang)
  return !!entry && (entry.lines as number) > 0
}

function langRadarPath(lang: string): string {
  const entry = props.languages.find(l => l.language === lang)
  if (!entry || !hasExpressData(lang)) return ''
  const n = metrics.length
  const points = metrics.map((m, i) => {
    const val = entry[m as keyof LangData] as number
    const max = maxVals.value[m as keyof typeof maxVals.value]
    const r = radarR * normalize(val, max, higherIsBetter.has(m))
    const angle = (360 / n) * i
    return polarToCart(angle, r)
  })
  return points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0]},${p[1]}`).join(' ') + ' Z'
}

// Concept distribution radar
const catMetrics = ['catTypes', 'catControlFlow', 'catFunctions', 'catOopData', 'catMemory', 'catConcurrency', 'catMetaprogramming', 'catErrorHandling'] as const
const catLabels: Record<string, string> = {
  catTypes: 'Types', catControlFlow: 'Control', catFunctions: 'Functions', catOopData: 'OOP/Data',
  catMemory: 'Memory', catConcurrency: 'Concurrency', catMetaprogramming: 'Metaprog', catErrorHandling: 'Errors',
}

const catMaxVals = computed(() => {
  const result: Record<string, number> = {}
  for (const m of catMetrics) {
    result[m] = Math.max(...props.languages.map(l => (l as any)[m] ?? 0), 1)
  }
  return result
})

const catAxes = computed(() => {
  const n = catMetrics.length
  return catMetrics.map((m, i) => {
    const angle = (360 / n) * i
    const [x, y] = polarToCart(angle, radarR)
    const [lx, ly] = polarToCart(angle, radarR + 22)
    return { metric: m, label: catLabels[m], angle, x, y, lx, ly }
  })
})

function catGridPath(level: number): string {
  const n = catMetrics.length
  const points = Array.from({ length: n }, (_, i) => {
    const angle = (360 / n) * i
    return polarToCart(angle, radarR * level)
  })
  return points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0]},${p[1]}`).join(' ') + ' Z'
}

function langCatPath(lang: string): string {
  const entry = props.languages.find(l => l.language === lang)
  if (!entry) return ''
  const n = catMetrics.length
  const points = catMetrics.map((m, i) => {
    const val = (entry as any)[m] ?? 0
    const max = catMaxVals.value[m]
    const r = radarR * Math.min(val / max, 1)
    const angle = (360 / n) * i
    return polarToCart(angle, r)
  })
  return points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0]},${p[1]}`).join(' ') + ' Z'
}

const hasCatData = computed(() => props.languages.some(l => (l as any).catTypes > 0))

// Safety guardrail badge data
const guardrailFields = [
  { key: 'grMemoryWhen', label: 'Memory' },
  { key: 'grNullWhen', label: 'Null' },
  { key: 'grRaceWhen', label: 'Race' },
  { key: 'grOverflowWhen', label: 'Overflow' },
  { key: 'grCoercionWhen', label: 'Coercion' },
] as const

const hasGuardrailWhenData = computed(() =>
  props.languages.some(l => l.grMemoryWhen || l.grNullWhen || l.grRaceWhen || l.grOverflowWhen || l.grCoercionWhen)
)
</script>

<template>
  <div class="comparison">
    <div class="lang-picker">
      <div v-if="groups && groups.length > 0" class="group-filters">
        <button
          v-for="group in groups"
          :key="group.label"
          :class="['group-chip', { active: activeGroup === group.label }]"
          @click="applyGroup(group)"
        >
          {{ group.label }}
        </button>
      </div>
      <div class="picker-label">Languages <span class="picker-hint">· pick 2–4, or use a group filter</span></div>
      <div class="lang-grid">
        <button
          v-for="lang in allLangs"
          :key="lang"
          :class="['lang-chip', { active: selected.includes(lang), maxed: !selected.includes(lang) && selected.length >= 4, greyed: isGreyedOut(lang) }]"
          :style="selected.includes(lang) ? { borderColor: langColor(lang)!, color: langColor(lang)!, background: langColor(lang) + '18' } : {}"
          @click="toggleLang(lang)"
        >
          <span class="chip-dot" :style="{ background: selected.includes(lang) ? langColor(lang)! : 'transparent' }"></span>
          {{ lang }}
        </button>
      </div>
    </div>

    <div class="radar-row">
      <div v-if="hasCatData" class="radar-overlay">
        <div class="radar-title">Concept Distribution</div>
        <div class="concept-subtitle">Where the concepts live — not good or bad, just the shape.</div>
        <svg :width="radarSize" :height="radarSize" :viewBox="`0 0 ${radarSize} ${radarSize}`">
          <path
            v-for="level in gridLevels"
            :key="'cg2-' + level"
            :d="catGridPath(level)"
            fill="none"
            stroke="var(--vp-c-divider)"
            :stroke-width="level === 1 ? 1.5 : 0.5"
          />
          <line
            v-for="axis in catAxes"
            :key="'ca2-' + axis.metric"
            :x1="radarCx" :y1="radarCy"
            :x2="axis.x" :y2="axis.y"
            stroke="var(--vp-c-divider)"
            stroke-width="0.5"
          />
          <path
            v-for="(lang, idx) in selected"
            :key="'cat2-' + lang"
            :d="langCatPath(lang)"
            :fill="colors[idx]"
            fill-opacity="0.12"
            :stroke="colors[idx]"
            stroke-width="2"
          />
          <a
            v-for="axis in catAxes"
            :key="'cl2-' + axis.metric"
            :href="conceptLabelLinks[axis.label]"
            class="radar-link"
          >
            <text
              :x="axis.lx"
              :y="axis.ly"
              text-anchor="middle"
              dominant-baseline="middle"
              class="radar-label radar-label-link"
            >
              {{ axis.label }}
            </text>
          </a>
        </svg>
      </div>

      <div class="radar-overlay">
        <div class="radar-title">Expressiveness</div>
        <div class="concept-subtitle">How the code reads — bigger = more of that quality.</div>
        <svg :width="radarSize" :height="radarSize" :viewBox="`0 0 ${radarSize} ${radarSize}`">
          <path
            v-for="level in gridLevels"
            :key="level"
            :d="gridPath(level)"
            fill="none"
            stroke="var(--vp-c-divider)"
            :stroke-width="level === 1 ? 1.5 : 0.5"
          />
          <line
            v-for="axis in radarAxes"
            :key="axis.metric"
            :x1="radarCx" :y1="radarCy"
            :x2="axis.x" :y2="axis.y"
            stroke="var(--vp-c-divider)"
            stroke-width="0.5"
          />
          <path
            v-for="(lang, idx) in selected"
            :key="'radar-' + lang"
            :d="langRadarPath(lang)"
            :fill="colors[idx]"
            fill-opacity="0.12"
            :stroke="colors[idx]"
            stroke-width="2"
          />
          <a
            v-for="axis in radarAxes"
            :key="'rl-' + axis.metric"
            :href="expressLinks[axis.label]"
            class="radar-link"
          >
            <text
              :x="axis.lx"
              :y="axis.ly"
              text-anchor="middle"
              dominant-baseline="middle"
              class="radar-label radar-label-link"
            >
              {{ axis.label }}
            </text>
          </a>
        </svg>
      </div>
    </div>

    <div class="radar-legend">
      <span v-for="(lang, idx) in selected" :key="'legend-' + lang" class="radar-legend-item">
        <span class="radar-swatch" :style="{ background: colors[idx] }"></span> {{ lang }}
      </span>
    </div>

    <div v-if="hasGuardrailWhenData" class="safety-comparison">
      <div class="safety-header">Safety</div>
      <div class="safety-legend">
        <span class="safety-badge compile">compile-time</span>
        <span class="safety-badge runtime">runtime</span>
        <span class="safety-badge none">none</span>
      </div>
      <div v-for="(lang, idx) in selected" :key="'gr-' + lang" class="safety-row">
        <div class="safety-lang">
          <span class="safety-name" :style="{ color: colors[idx] }">{{ lang }}</span>
          <span class="safety-score">{{ getValue(lang, 'guardrails') }} / 5</span>
        </div>
        <div class="safety-badges">
          <span
            v-for="field in guardrailFields"
            :key="field.key"
            :class="['safety-badge', (props.languages.find(l => l.language === lang)?.[field.key as keyof LangData] as string) || 'none']"
          >{{ field.label }}</span>
        </div>
      </div>
    </div>

    <div class="comparison-bars">
      <div v-for="metric in metrics" :key="metric" class="bar-group">
        <div class="bar-label">{{ barLabels[metric] }}</div>
        <div class="bar-desc">{{ barDescriptions[metric] }}</div>
        <div v-for="(lang, idx) in selected" :key="lang + metric" class="bar-row">
          <span class="bar-lang" :style="{ color: colors[idx] }">{{ lang }}</span>
          <div class="bar-track">
            <div
              class="bar-fill"
              :style="{ width: getBarWidth(lang, metric) + '%', background: colors[idx] }"
            ></div>
          </div>
          <span class="bar-value">{{ Math.round(getBarWidth(lang, metric)) }}%</span>
        </div>
      </div>
    </div>

  </div>
</template>

<style scoped>
.radar-legend {
  display: flex;
  justify-content: center;
  gap: 1.25rem;
  margin: 0.5rem 0 1rem;
  font-size: 0.85rem;
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
.comparison { margin: 1.5rem 0; }
.lang-picker {
  margin-bottom: 1.5rem;
}
.picker-label {
  font-weight: 600;
  font-size: 0.85rem;
  color: var(--vp-c-text-2);
  margin-bottom: 0.5rem;
}
.lang-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}
.lang-chip {
  padding: 0.35rem 0.75rem;
  border: 1.5px solid var(--vp-c-divider);
  border-radius: 20px;
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-2);
  font-size: 0.82rem;
  cursor: pointer;
  transition: all 0.15s ease;
  display: flex;
  align-items: center;
  gap: 0.35rem;
  user-select: none;
}
.lang-chip:hover:not(.maxed) {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-text-1);
}
.lang-chip.active {
  font-weight: 600;
}
.lang-chip.maxed {
  opacity: 0.35;
  cursor: not-allowed;
}
.chip-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}
.picker-hint {
  font-weight: 400;
  color: var(--vp-c-text-3);
}
.group-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin-bottom: 0.75rem;
}
.group-chip {
  padding: 0.3rem 0.7rem;
  border: 1.5px solid var(--vp-c-divider);
  border-radius: 14px;
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-2);
  font-size: 0.78rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
}
.group-chip:hover {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-text-1);
}
.group-chip.active {
  border-color: var(--vp-c-brand-1);
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1);
  font-weight: 600;
}
.lang-chip.greyed {
  opacity: 0.25;
}
.concept-section {
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--vp-c-divider);
}
.concept-header {
  text-align: center;
  margin-bottom: 1rem;
}
.concept-title {
  font-weight: 700;
  font-size: 1.1rem;
  color: var(--vp-c-text-1);
}
.concept-subtitle {
  font-size: 0.82rem;
  color: var(--vp-c-text-3);
  margin-top: 0.25rem;
}
.bar-group { margin-bottom: 1.2rem; }
.bar-label { font-weight: 600; font-size: 0.82rem; margin-bottom: 0.1rem; color: var(--vp-c-text-2); }
.bar-desc { font-size: 0.72rem; color: var(--vp-c-text-3); margin-bottom: 0.3rem; }
.bar-row { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.25rem; }
.bar-lang {
  font-size: 0.75rem;
  font-weight: 600;
  min-width: 5.5rem;
  text-align: right;
}
.bar-track {
  flex: 1;
  height: 20px;
  background: var(--vp-c-bg-soft);
  border-radius: 4px;
  overflow: hidden;
}
.bar-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.3s ease;
  opacity: 0.85;
}
.bar-value {
  font-size: 0.8rem;
  font-variant-numeric: tabular-nums;
  min-width: 3rem;
  text-align: right;
  color: var(--vp-c-text-2);
}
.radar-row {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  justify-content: center;
  margin-bottom: 1.5rem;
}
.radar-overlay {
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow: visible;
}
.radar-overlay svg {
  overflow: visible;
}
.radar-title {
  font-weight: 600;
  font-size: 0.85rem;
  color: var(--vp-c-text-2);
  margin-bottom: 0.25rem;
}
.radar-label {
  font-size: 13px;
  fill: var(--vp-c-text-2);
}
.radar-label-link {
  fill: var(--vp-c-brand-1);
}
.radar-link {
  cursor: pointer;
}
.safety-comparison {
  margin-bottom: 1.5rem;
  padding: 1rem 1.25rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg-soft);
}
.safety-header {
  font-weight: 600;
  font-size: 0.85rem;
  color: var(--vp-c-text-2);
  margin-bottom: 0.5rem;
}
.safety-legend {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}
.safety-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.35rem;
}
.safety-lang {
  min-width: 5.5rem;
  text-align: right;
}
.safety-name {
  font-weight: 600;
  font-size: 0.8rem;
}
.safety-score {
  font-size: 0.72rem;
  color: var(--vp-c-text-3);
  font-weight: 400;
}
.safety-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
}
.safety-badge {
  font-size: 0.72rem;
  font-weight: 500;
  padding: 0.15rem 0.5rem;
  border-radius: 10px;
  border: 1px solid transparent;
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
</style>
