<script setup lang="ts">
const props = defineProps<{
  lines: number
  tokens: number
  complexity: number
  ceremony: number
  maxLines: number
  maxComplexity: number
  maxCeremony: number
}>()

function pct(val: number, max: number) {
  return max > 0 ? Math.round((val / max) * 100) : 0
}

function barClass() {
  return 'neutral'
}

const metrics = [
  { label: 'Lines', desc: 'Avg non-blank lines', val: () => props.lines, max: () => props.maxLines },
  { label: 'Complexity', desc: 'Halstead Volume', val: () => props.complexity, max: () => props.maxComplexity },
  { label: 'Ceremony', desc: 'Boilerplate ratio', val: () => props.ceremony, max: () => props.maxCeremony },
]
</script>

<template>
  <div class="ex-card">
    <div class="ex-header">
      <span class="ex-title">Expressiveness</span>
      <span class="ex-subtitle">avg across benchmarks</span>
    </div>
    <div class="ex-grid">
      <div v-for="m in metrics" :key="m.label" class="ex-row">
        <div class="ex-label">{{ m.label }}</div>
        <div class="ex-bar-wrap">
          <div class="ex-bar" :class="barClass(pct(m.val(), m.max()))" :style="{ width: pct(m.val(), m.max()) + '%' }"></div>
        </div>
        <div class="ex-val">{{ m.val() }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ex-card {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  padding: 1rem 1.25rem;
  min-width: 240px;
  background: var(--vp-c-bg-soft);
}
.ex-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 0.75rem;
}
.ex-title {
  font-weight: 600;
  font-size: 0.95rem;
}
.ex-subtitle {
  font-size: 0.75rem;
  color: var(--vp-c-text-3);
}
.ex-grid {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}
.ex-row {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
}
.ex-label {
  white-space: nowrap;
  color: var(--vp-c-text-2);
}
.ex-bar-wrap {
  flex: 1;
  height: 6px;
  border-radius: 3px;
  background: var(--vp-c-divider);
  overflow: hidden;
}
.ex-bar {
  height: 100%;
  border-radius: 3px;
  transition: width 0.3s;
}
.ex-bar.neutral { background: var(--vp-c-brand-1); }
.ex-val {
  width: 45px;
  text-align: right;
  font-weight: 500;
  font-size: 0.8rem;
  color: var(--vp-c-text-2);
}
</style>
