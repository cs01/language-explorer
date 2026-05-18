---
outline: deep
---

<script setup lang="ts">
import { data } from '../data/metrics.data'

const allLangs = [...new Set(data.metrics.map(m => m.language))]

const stats = {
  guardrails: 5.0,
  keywords: 32,
  surface: 50,
  keywordRatio: +(32 / 50).toFixed(2),
  typeCoverage: 1.0,
}

const catKeys = ["catTypes","catControlFlow","catFunctions","catOopData","catMemory","catConcurrency","catMetaprogramming","catErrorHandling"] as const
const catLabels = ["Types","Control","Functions","OOP/Data","Memory","Concurrency","Metaprog","Errors"]
const catValues = [10, 8, 6, 6, 8, 2, 2, 8]
const catMax = catKeys.map(k => Math.max(...allLangs.map(l => { const e = data.metrics.filter(m => m.language === l); return e[0]?.[k] ?? 0 }), 1))
const conceptRadar = catLabels.map((label, i) => ({ label, value: catValues[i], max: catMax[i] }))

const gr = { memory: 1, null: 1, race: 1, overflow: 1, coercion: 1 }

const tags = ['Systems', 'Static']

const catData = catLabels.map((label, i) => ({ label, value: catValues[i] }))

const grReasons = {
  memory: 'Borrow checker prevents use-after-free at compile time',
  null: 'No null — Maybe<T> with explicit check required',
  race: 'Capability-based effects prevent shared mutable state',
  overflow: 'Compile-time range checks on bounded integers',
  coercion: 'No implicit conversions',
}
const conceptLinks = { Types: "../metrics/concept-count", Control: "../metrics/concept-count", Functions: "../metrics/concept-count", "OOP/Data": "../metrics/concept-count", Memory: "../metrics/concept-count", Concurrency: "../metrics/concept-count", Metaprog: "../metrics/concept-count", Errors: "../metrics/concept-count" }
</script>

# Zero

<div class="lang-tags"><span v-for="t in tags" class="lang-tag">{{ t }}</span></div>

An experimental language with maximum guardrails (5.0) from only 50 concepts — less than half of Rust's 110. Achieves this through capability-based effects, a borrow checker, and Maybe types for absence instead of null. No exceptions, no implicit dispatch, no OOP — a deliberately narrow design that proves safety doesn't require complexity.

<small>Profile only — no benchmark solutions yet.</small>

<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 1.5rem; align-items: start;">
<RadarChart :data="conceptRadar" label="Concept Distribution" color="#f59e0b" :links="conceptLinks" />
<GuardrailCard :score="stats.guardrails" :memory="gr.memory" :null="gr.null" :race="gr.race" :overflow="gr.overflow" :coercion="gr.coercion" :memoryWhen="gr.memoryWhen" :memoryActivation="gr.memoryActivation" :nullWhen="gr.nullWhen" :nullActivation="gr.nullActivation" :raceWhen="gr.raceWhen" :raceActivation="gr.raceActivation" :overflowWhen="gr.overflowWhen" :overflowActivation="gr.overflowActivation" :coercionWhen="gr.coercionWhen" :coercionActivation="gr.coercionActivation" :reasons="grReasons" />
<SurfaceAreaCard :concepts="stats.surface" :keywords="stats.keywords" :keywordRatio="stats.keywordRatio" :categories="catData" />
<ExplicitnessCard :concepts="stats.surface" :keywordRatio="stats.keywordRatio" />
</div>

<style>
.lang-tags { display: flex; gap: 0.5rem; margin-bottom: 0.75rem; flex-wrap: wrap; }
.lang-tag {
  display: inline-block; padding: 2px 10px; border-radius: 99px; font-size: 0.8rem;
  background: var(--vp-c-brand-soft); color: var(--vp-c-brand-1); font-weight: 500;
}
</style>
