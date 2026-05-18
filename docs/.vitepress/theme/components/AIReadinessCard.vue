<script setup lang="ts">
const props = defineProps<{
  llmTokens: number
  llmTokensPerLine: number
  typeCoverage: number
  maxLlmTokens: number
  maxLlmTokensPerLine: number
}>()

function pct(val: number, max: number) {
  return max > 0 ? Math.round((val / max) * 100) : 0
}

function barClass(pctVal: number) {
  if (pctVal <= 33) return 'low'
  if (pctVal <= 66) return 'mid'
  return 'high'
}

function coverageLabel(v: number) {
  if (v >= 1.0) return 'Fully Static'
  if (v >= 0.75) return 'Static + Inference'
  if (v >= 0.5) return 'Gradual'
  if (v >= 0.25) return 'Mostly Dynamic'
  return 'Dynamic'
}

function coverageClass(v: number) {
  if (v >= 0.75) return 'low'
  if (v >= 0.5) return 'mid'
  return 'high'
}

const tokenMetrics = [
  { label: 'LLM Tokens', val: () => props.llmTokens, max: () => props.maxLlmTokens },
  { label: 'Tok/Line', val: () => props.llmTokensPerLine, max: () => props.maxLlmTokensPerLine },
]
</script>

<template>
  <div class="ai-card">
    <div class="ai-header">
      <span class="ai-title">AI Readiness</span>
    </div>
    <div class="ai-grid">
      <div class="ai-row">
        <div class="ai-label">Type Coverage</div>
        <div class="ai-bar-wrap">
          <div class="ai-bar" :class="coverageClass(typeCoverage)" :style="{ width: Math.round(typeCoverage * 100) + '%' }"></div>
        </div>
        <div class="ai-val ai-coverage-label">{{ coverageLabel(typeCoverage) }}</div>
      </div>
      <div v-for="m in tokenMetrics" :key="m.label" class="ai-row">
        <div class="ai-label">{{ m.label }}</div>
        <div class="ai-bar-wrap">
          <div class="ai-bar" :class="barClass(pct(m.val(), m.max()))" :style="{ width: pct(m.val(), m.max()) + '%' }"></div>
        </div>
        <div class="ai-val">{{ m.val() }}</div>
      </div>
    </div>
    <div class="ai-context">Lower tokens = cheaper API calls. Higher type coverage = more for AI to work with.</div>
  </div>
</template>

<style scoped>
.ai-card {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  padding: 1rem 1.25rem;
  min-width: 240px;
  background: var(--vp-c-bg-soft);
}
.ai-header { margin-bottom: 0.75rem; }
.ai-title { font-weight: 600; font-size: 0.95rem; }
.ai-grid {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}
.ai-row {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
}
.ai-label {
  white-space: nowrap;
  color: var(--vp-c-text-2);
  font-size: 0.85rem;
}
.ai-coverage-label {
  font-size: 0.72rem;
  width: auto;
  text-align: right;
}
.ai-bar-wrap {
  flex: 1;
  height: 6px;
  border-radius: 3px;
  background: var(--vp-c-divider);
  overflow: hidden;
}
.ai-bar {
  height: 100%;
  border-radius: 3px;
  transition: width 0.3s;
}
.ai-bar.low { background: #22c55e; }
.ai-bar.mid { background: #f59e0b; }
.ai-bar.high { background: #ef4444; }
.ai-val {
  text-align: right;
  font-weight: 500;
  font-size: 0.8rem;
  color: var(--vp-c-text-2);
  white-space: nowrap;
}
.ai-context {
  margin-top: 0.5rem;
  font-size: 0.72rem;
  color: var(--vp-c-text-3);
  line-height: 1.4;
}
</style>
