<script setup lang="ts">
const props = defineProps<{
  score: number
  memory: number
  null: number
  race: number
  overflow: number
  coercion: number
  memoryWhen?: string
  memoryActivation?: string
  nullWhen?: string
  nullActivation?: string
  raceWhen?: string
  raceActivation?: string
  overflowWhen?: string
  overflowActivation?: string
  coercionWhen?: string
  coercionActivation?: string
  reasons?: {
    memory?: string
    null?: string
    race?: string
    overflow?: string
    coercion?: string
  }
}>()

const categories = [
  { key: 'memory', label: 'Memory' },
  { key: 'null', label: 'Null' },
  { key: 'race', label: 'Data Races' },
  { key: 'overflow', label: 'Overflow' },
  { key: 'coercion', label: 'Coercion' },
]

// Fallback: derive when/activation from numeric score if 2-axis props missing
function getWhen(key: string): string {
  const explicit = (props as any)[key + 'When']
  if (explicit && explicit !== 'none') return explicit
  // fallback from numeric value
  const v = (props as any)[key] ?? 0
  if (v >= 1) return 'compile'
  if (v >= 0.67) return 'runtime'
  if (v >= 0.33) return 'runtime'
  return 'none'
}

function getActivation(key: string): string {
  const explicit = (props as any)[key + 'Activation']
  if (explicit && explicit !== 'default') return explicit
  const w = (props as any)[key + 'When']
  if (w && w !== 'none') return explicit || 'default'
  // fallback from numeric value
  const v = (props as any)[key] ?? 0
  if (v >= 0.67) return 'default'
  if (v >= 0.33) return 'optin'
  return 'default'
}

function statusLabel(key: string): string {
  const w = getWhen(key)
  const a = getActivation(key)
  if (w === 'none') return 'None'
  const label = w === 'compile' ? 'Compile-time' : 'Runtime'
  return a === 'optin' ? label + ' (opt-in)' : label
}

function statusClass(key: string): string {
  const w = getWhen(key)
  const a = getActivation(key)
  if (w === 'none') return 'none'
  if (a === 'optin') return 'optin'
  return w === 'compile' ? 'compile' : 'runtime'
}

function reason(key: string): string {
  return (props.reasons as any)?.[key] ?? ''
}
</script>

<template>
  <div class="gr-card">
    <div class="gr-header">
      <span class="gr-title">Safety</span>
      <span class="gr-score">{{ score }} <span class="gr-max">/ 5</span></span>
    </div>
    <div class="gr-grid">
      <div v-for="cat in categories" :key="cat.key" class="gr-item">
        <div class="gr-row">
          <div class="gr-label">
            <span class="gr-dot" :class="statusClass(cat.key)"></span>
            {{ cat.label }}
          </div>
          <span class="gr-status" :class="statusClass(cat.key)">
            {{ statusLabel(cat.key) }}
          </span>
        </div>
        <div v-if="reason(cat.key)" class="gr-reason">{{ reason(cat.key) }}</div>
      </div>
    </div>
    <div class="gr-legend">
      <span class="gr-leg-item"><span class="gr-dot compile"></span>Compile-time</span>
      <span class="gr-leg-item"><span class="gr-dot runtime"></span>Runtime</span>
      <span class="gr-leg-item"><span class="gr-dot optin"></span>Opt-in</span>
      <span class="gr-leg-item"><span class="gr-dot none"></span>None</span>
    </div>
    <div class="gr-footer">
      <a href="../methodology#safety">How we score</a>
    </div>
  </div>
</template>

<style scoped>
.gr-card {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  padding: 1rem 1.25rem;
  min-width: 260px;
  background: var(--vp-c-bg-soft);
}
.gr-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 0.75rem;
}
.gr-title {
  font-weight: 600;
  font-size: 0.95rem;
}
.gr-score {
  font-size: 1.4rem;
  font-weight: 700;
}
.gr-max {
  font-size: 0.85rem;
  font-weight: 400;
  color: var(--vp-c-text-3);
}
.gr-grid {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}
.gr-item {
  display: flex;
  flex-direction: column;
}
.gr-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.85rem;
}
.gr-label {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  color: var(--vp-c-text-2);
}
.gr-reason {
  font-size: 0.7rem;
  color: var(--vp-c-text-3);
  margin-left: 1.15rem;
  margin-top: -1px;
  margin-bottom: 2px;
}
.gr-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}
.gr-dot.compile { background: #22c55e; }
.gr-dot.runtime { background: #3b82f6; }
.gr-dot.optin { background: #f59e0b; }
.gr-dot.none { background: #ef4444; }
.gr-status {
  font-weight: 500;
  font-size: 0.8rem;
}
.gr-status.compile { color: #22c55e; }
.gr-status.runtime { color: #3b82f6; }
.gr-status.optin { color: #f59e0b; }
.gr-status.none { color: #ef4444; }
.gr-legend {
  display: flex;
  gap: 0.6rem;
  margin-top: 0.6rem;
  padding-top: 0.5rem;
  border-top: 1px solid var(--vp-c-divider);
  flex-wrap: wrap;
}
.gr-leg-item {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.65rem;
  color: var(--vp-c-text-3);
}
.gr-footer {
  margin-top: 0.4rem;
  font-size: 0.75rem;
  text-align: right;
}
.gr-footer a {
  color: var(--vp-c-text-3);
}
</style>
