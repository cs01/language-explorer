<script setup lang="ts">
const props = defineProps<{
  concepts: number
  keywordRatio: number
}>()

const pct = Math.round(props.keywordRatio * 100)
const implicitPct = 100 - pct
</script>

<template>
  <div class="ex-card">
    <div class="ex-header">
      <span class="ex-title">Explicitness</span>
    </div>
    <div class="ex-bar-labels">
      <span>{{ pct }}% explicit</span>
      <span>{{ implicitPct }}% implicit</span>
    </div>
    <div class="ex-bar">
      <div class="ex-seg syntax" :style="{ width: pct + '%' }"></div>
      <div class="ex-seg implicit" :style="{ width: implicitPct + '%' }"></div>
    </div>
    <div class="ex-context">
      {{ pct }}% of {{ concepts }} concepts have dedicated keyword syntax.
      The rest are learned through documentation and practice.
    </div>
  </div>
</template>

<style scoped>
.ex-card {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  padding: 0.85rem 1.25rem;
  min-width: 260px;
  max-width: 320px;
  background: var(--vp-c-bg-soft);
}
.ex-header { margin-bottom: 0.5rem; }
.ex-title { font-weight: 600; font-size: 0.95rem; }
.ex-bar-labels {
  display: flex;
  justify-content: space-between;
  font-size: 0.72rem;
  font-weight: 600;
  margin-bottom: 0.2rem;
  color: var(--vp-c-text-2);
}
.ex-bar {
  display: flex;
  height: 8px;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 0.45rem;
}
.ex-seg { height: 100%; }
.ex-seg.syntax { background: var(--vp-c-text-3); }
.ex-seg.implicit { background: var(--vp-c-brand-1); }
.ex-context {
  font-size: 0.72rem;
  color: var(--vp-c-text-3);
  line-height: 1.4;
}
</style>
