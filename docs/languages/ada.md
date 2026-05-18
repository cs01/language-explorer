---
outline: deep
---

<script setup lang="ts">
import { data } from '../data/metrics.data'

const allLangs = [...new Set(data.metrics.map(m => m.language))]

const stats = {
  guardrails: 3.4,
  keywords: 74,
  surface: 85,
  typeCoverage: 1.0,
}

const catKeys = ["catTypes","catControlFlow","catFunctions","catOopData","catMemory","catConcurrency","catMetaprogramming","catErrorHandling"] as const
const catLabels = ["Types","Control","Functions","OOP/Data","Memory","Concurrency","Metaprog","Errors"]
const catValues = [18, 10, 8, 12, 10, 12, 6, 9]
const catMax = catKeys.map(k => Math.max(...allLangs.map(l => { const e = data.metrics.filter(m => m.language === l); return e[0]?.[k] ?? 0 }), 1))
const conceptRadar = catLabels.map((label, i) => ({ label, value: catValues[i], max: catMax[i] }))

const gr = { memory: 0.67, null: 0.67, race: 0.33, overflow: 1, coercion: 1 }

const tags = ['Systems', 'Static']

const catData = catLabels.map((label, i) => ({ label, value: catValues[i] }))

const grReasons = {
  memory: 'Runtime bounds/access checks, but Unchecked_Deallocation allows use-after-free',
  null: 'Access types checked at runtime; "not null" annotation opt-in',
  race: 'Protected objects available but not required for all shared state',
  overflow: 'Constraint_Error raised on overflow — always checked',
  coercion: 'Strong typing — no implicit conversions between numeric types',
}
</script>

# Ada

<div class="lang-tags"><span v-for="t in tags" class="lang-tag">{{ t }}</span></div>

Designed for safety-critical systems — avionics, defense, railway signaling, and space. Strong static typing with range types, contract-based programming, and built-in concurrency (tasks and protected objects). Large surface area (85 concepts) but every feature exists to catch bugs at compile time rather than in production.

<small>Profile only — no benchmark solutions yet.</small>

<div style="display: flex; align-items: flex-start; gap: 2rem; flex-wrap: wrap;">
<RadarChart :data="conceptRadar" label="Concept Distribution" color="#f59e0b" />
<GuardrailCard :score="stats.guardrails" :memory="gr.memory" :null="gr.null" :race="gr.race" :overflow="gr.overflow" :coercion="gr.coercion" :memoryWhen="gr.memoryWhen" :memoryActivation="gr.memoryActivation" :nullWhen="gr.nullWhen" :nullActivation="gr.nullActivation" :raceWhen="gr.raceWhen" :raceActivation="gr.raceActivation" :overflowWhen="gr.overflowWhen" :overflowActivation="gr.overflowActivation" :coercionWhen="gr.coercionWhen" :coercionActivation="gr.coercionActivation" :reasons="grReasons" />
<SurfaceAreaCard :concepts="stats.surface" :keywords="stats.keywords" :keywordRatio="stats.keywordRatio" :categories="catData" />
<ExplicitnessCard :concepts="stats.surface" :keywordRatio="stats.keywordRatio" />
<AIReadinessCard :llmTokens="0" :llmTokensPerLine="0" :typeCoverage="stats.typeCoverage" :maxLlmTokens="1" :maxLlmTokensPerLine="1" />
</div>

<style>
.lang-tags { display: flex; gap: 0.5rem; margin-bottom: 0.75rem; flex-wrap: wrap; }
.lang-tag {
  display: inline-block; padding: 2px 10px; border-radius: 99px; font-size: 0.8rem;
  background: var(--vp-c-brand-soft); color: var(--vp-c-brand-1); font-weight: 500;
}
</style>
