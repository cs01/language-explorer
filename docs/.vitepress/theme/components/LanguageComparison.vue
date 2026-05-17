<script setup lang="ts">
import { ref, computed } from 'vue'

interface LangData {
  language: string
  lines: number
  tokens: number
  complexity: number
  sigilsPerLine: number
  symbolTypes: number
}

const props = defineProps<{
  languages: LangData[]
}>()

const colors = ['#3b82f6', '#8b5cf6', '#06b6d4', '#f59e0b']
const allLangs = computed(() => props.languages.map(l => l.language).sort())
const selected = ref<string[]>([allLangs.value[0] || '', allLangs.value[1] || ''])

function addLang() {
  if (selected.value.length < 4) {
    const unused = allLangs.value.find(l => !selected.value.includes(l))
    if (unused) selected.value.push(unused)
  }
}

function removeLang(idx: number) {
  if (selected.value.length > 2) selected.value.splice(idx, 1)
}

const maxVals = computed(() => ({
  lines: Math.max(...props.languages.map(l => l.lines)),
  tokens: Math.max(...props.languages.map(l => l.tokens)),
  complexity: Math.max(...props.languages.map(l => l.complexity)),
  sigilsPerLine: Math.max(...props.languages.map(l => l.sigilsPerLine)),
  symbolTypes: Math.max(...props.languages.map(l => l.symbolTypes)),
}))

const metrics = ['lines', 'tokens', 'complexity', 'sigilsPerLine', 'symbolTypes'] as const
const metricLabels: Record<string, string> = {
  lines: 'Lines', tokens: 'Tokens', complexity: 'Complexity',
  sigilsPerLine: 'Sym/Line', symbolTypes: 'Sym Types',
}

function getBarWidth(lang: string, metric: string): number {
  const entry = props.languages.find(l => l.language === lang)
  if (!entry) return 0
  const val = entry[metric as keyof LangData] as number
  const max = maxVals.value[metric as keyof typeof maxVals.value]
  return (val / max) * 100
}

function getValue(lang: string, metric: string): number {
  const entry = props.languages.find(l => l.language === lang)
  if (!entry) return 0
  return entry[metric as keyof LangData] as number
}

// Radar overlay
const radarSize = 280
const radarCx = radarSize / 2
const radarCy = radarSize / 2
const radarR = radarSize / 2 - 35

function polarToCart(angle: number, r: number): [number, number] {
  const rad = (angle - 90) * (Math.PI / 180)
  return [radarCx + r * Math.cos(rad), radarCy + r * Math.sin(rad)]
}

const radarAxes = computed(() => {
  const n = metrics.length
  return metrics.map((m, i) => {
    const angle = (360 / n) * i
    const [x, y] = polarToCart(angle, radarR)
    const [lx, ly] = polarToCart(angle, radarR + 20)
    return { metric: m, label: metricLabels[m], angle, x, y, lx, ly }
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

function langRadarPath(lang: string): string {
  const entry = props.languages.find(l => l.language === lang)
  if (!entry) return ''
  const n = metrics.length
  const points = metrics.map((m, i) => {
    const val = entry[m as keyof LangData] as number
    const max = maxVals.value[m as keyof typeof maxVals.value]
    const r = radarR * Math.min(val / max, 1)
    const angle = (360 / n) * i
    return polarToCart(angle, r)
  })
  return points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0]},${p[1]}`).join(' ') + ' Z'
}
</script>

<template>
  <div class="comparison">
    <div class="comparison-selectors">
      <div v-for="(lang, idx) in selected" :key="idx" class="selector-row">
        <span class="color-dot" :style="{ background: colors[idx] }"></span>
        <select v-model="selected[idx]">
          <option v-for="l in allLangs" :key="l" :value="l">{{ l }}</option>
        </select>
        <button v-if="selected.length > 2" class="remove-btn" @click="removeLang(idx)">×</button>
      </div>
      <button v-if="selected.length < 4" class="add-btn" @click="addLang">+ Add language</button>
    </div>

    <div class="radar-overlay">
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
        <text
          v-for="axis in radarAxes"
          :key="'rl-' + axis.metric"
          :x="axis.lx"
          :y="axis.ly"
          text-anchor="middle"
          dominant-baseline="middle"
          class="radar-label"
        >
          {{ axis.label }}
        </text>
      </svg>
      <div class="radar-legend">
        <div v-for="(lang, idx) in selected" :key="'legend-' + lang" class="legend-item">
          <span class="color-dot" :style="{ background: colors[idx] }"></span>
          <span>{{ lang }}</span>
        </div>
      </div>
    </div>

    <div class="comparison-bars">
      <div v-for="metric in metrics" :key="metric" class="bar-group">
        <div class="bar-label">{{ metricLabels[metric] }}</div>
        <div v-for="(lang, idx) in selected" :key="lang + metric" class="bar-row">
          <div class="bar-track">
            <div
              class="bar-fill"
              :style="{ width: getBarWidth(lang, metric) + '%', background: colors[idx] }"
            ></div>
          </div>
          <span class="bar-value">{{ getValue(lang, metric) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.comparison { margin: 1.5rem 0; }
.comparison-selectors {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  align-items: center;
}
.selector-row {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}
.color-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}
.selector-row select {
  padding: 0.3rem 0.6rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-1);
  font-size: 0.85rem;
}
.remove-btn {
  border: none;
  background: none;
  color: var(--vp-c-text-3);
  cursor: pointer;
  font-size: 1.2rem;
  padding: 0 0.3rem;
}
.add-btn {
  padding: 0.3rem 0.8rem;
  border: 1px dashed var(--vp-c-divider);
  border-radius: 6px;
  background: none;
  color: var(--vp-c-text-2);
  cursor: pointer;
  font-size: 0.82rem;
}
.add-btn:hover { border-color: var(--vp-c-brand-1); color: var(--vp-c-brand-1); }
.bar-group { margin-bottom: 1rem; }
.bar-label { font-weight: 600; font-size: 0.82rem; margin-bottom: 0.3rem; color: var(--vp-c-text-2); }
.bar-row { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.25rem; }
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
  opacity: 0.8;
}
.bar-value {
  font-size: 0.8rem;
  font-variant-numeric: tabular-nums;
  min-width: 3rem;
  text-align: right;
  color: var(--vp-c-text-2);
}
.radar-overlay {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 1.5rem;
}
.radar-label {
  font-size: 10px;
  fill: var(--vp-c-text-2);
}
.radar-legend {
  display: flex;
  gap: 1rem;
  margin-top: 0.5rem;
  font-size: 0.82rem;
  color: var(--vp-c-text-2);
}
.legend-item {
  display: flex;
  align-items: center;
  gap: 0.3rem;
}
</style>
