---
outline: deep
---

<script setup lang="ts">
import { data } from '../data/metrics.data'

const allLangs = [...new Set(data.metrics.map(m => m.language))]

const stats = {
  guardrails: 0.1,
  keywords: 150,
  surface: 35,
  keywordRatio: +(150 / 35).toFixed(2),
  typeCoverage: 0.25,
}

const catKeys = ["catTypes","catControlFlow","catFunctions","catOopData","catMemory","catConcurrency","catMetaprogramming","catErrorHandling"] as const
const catLabels = ["Types","Control","Functions","OOP/Data","Memory","Concurrency","Metaprog","Errors"]
const catValues = [10, 6, 4, 0, 8, 2, 3, 2]
const catMax = catKeys.map(k => Math.max(...allLangs.map(l => { const e = data.metrics.filter(m => m.language === l); return e[0]?.[k] ?? 0 }), 1))
const conceptRadar = catLabels.map((label, i) => ({ label, value: catValues[i], max: catMax[i] }))

const gr = { memory: 0, null: 0, race: 0, overflow: 0, coercion: 0.33 }

const tags = [] as string[]

const catData = catLabels.map((label, i) => ({ label, value: catValues[i] }))

const grReasons = {
  memory: 'No protection — raw pointer manipulation',
  null: 'No protection — null deref is UB',
  race: 'No protection — no concurrency model',
  overflow: 'nsw/nuw flags available but not default',
  coercion: 'Explicit bitcast/trunc/zext but some implicit ptr casts',
}
</script>

# LLVM IR

Not a programming language but a compiler intermediate representation — the assembly language of the LLVM toolchain. Included as a baseline: high keyword count (150 instructions) but tiny conceptual surface (35) since it has no OOP, error handling, or concurrency abstractions. Near-zero guardrails — it's one step above raw machine code.

<small>Profile only — no benchmark solutions yet.</small>

<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 1.5rem; align-items: start;">
<RadarChart :data="conceptRadar" label="Concept Distribution" color="#f59e0b" />
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
