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
</style>
