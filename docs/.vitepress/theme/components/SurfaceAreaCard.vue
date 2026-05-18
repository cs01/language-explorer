<script setup lang="ts">
const props = defineProps<{
  concepts: number
  keywords: number
  keywordRatio: number
  categories: { label: string, value: number }[]
}>()

const maxVal = Math.max(...props.categories.map(c => c.value), 1)
</script>

<template>
  <div class="sa-card">
    <div class="sa-header">
      <span class="sa-title">Surface Area</span>
      <span class="sa-score">{{ concepts }} <span class="sa-unit">concepts</span></span>
    </div>
    <div class="sa-kw">{{ keywords }} reserved keywords</div>
    <div class="sa-bars">
      <div v-for="cat in categories" :key="cat.label" class="sa-row">
        <span class="sa-label">{{ cat.label }}</span>
        <div class="sa-bar-wrap">
          <div class="sa-bar" :style="{ width: Math.round((cat.value / maxVal) * 100) + '%' }"></div>
        </div>
        <span class="sa-val">{{ cat.value }}</span>
      </div>
    </div>
    <div class="sa-footer">
      <a href="../methodology#surface-area">How we measure</a>
    </div>
  </div>
</template>

<style scoped>
.sa-card {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  padding: 1rem 1.25rem;
  min-width: 260px;
  background: var(--vp-c-bg-soft);
}
.sa-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 0.15rem;
}
.sa-title { font-weight: 600; font-size: 0.95rem; }
.sa-score { font-size: 1.4rem; font-weight: 700; }
.sa-unit { font-size: 0.75rem; font-weight: 400; color: var(--vp-c-text-3); }
.sa-kw { font-size: 0.8rem; color: var(--vp-c-text-3); margin-bottom: 0.6rem; }
.sa-bars { display: flex; flex-direction: column; gap: 0.35rem; }
.sa-row { display: grid; grid-template-columns: auto 1fr auto; align-items: center; gap: 0.4rem; font-size: 0.8rem; }
.sa-label { white-space: nowrap; color: var(--vp-c-text-3); text-align: right; }
.sa-bar-wrap { flex: 1; height: 6px; border-radius: 3px; background: var(--vp-c-divider); overflow: hidden; }
.sa-bar { height: 100%; border-radius: 3px; background: #8b5cf6; transition: width 0.3s; }
.sa-val { width: 24px; text-align: right; font-weight: 500; color: var(--vp-c-text-2); font-size: 0.75rem; }
.sa-footer { margin-top: 0.5rem; font-size: 0.75rem; text-align: right; }
.sa-footer a { color: var(--vp-c-text-3); }
</style>
