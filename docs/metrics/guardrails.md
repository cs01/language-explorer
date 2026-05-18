---
outline: deep
---

<script setup lang="ts">
import { data } from '../data/metrics.data'

const languages = [...new Set(data.metrics.map(m => m.language))]
const displayName: Record<string, string> = {
  cpp: 'C++', csharp: 'C#', objc: 'Objective-C', javascript: 'JavaScript', typescript: 'TypeScript',
}
const toDisplay = (lang: string) => displayName[lang] ?? lang.charAt(0).toUpperCase() + lang.slice(1)

const grData = languages.map(lang => {
  const e = data.metrics.filter(m => m.language === lang)[0]
  if (!e) return null
  return {
    language: toDisplay(lang),
    guardrails: e.guardrailScore,
    grMemoryWhen: e.grMemoryWhen,
    grNullWhen: e.grNullWhen,
    grRaceWhen: e.grRaceWhen,
    grOverflowWhen: e.grOverflowWhen,
    grCoercionWhen: e.grCoercionWhen,
  }
}).filter(Boolean).sort((a, b) => b.guardrails - a.guardrails)

const columns = [
  { key: 'guardrails', label: 'Score', lower: false },
]

function levelClass(when: string) {
  if (when === 'compile') return 'compile'
  if (when === 'runtime') return 'runtime'
  return 'none'
}
</script>

# Safety Guardrails

**How many classes of bugs does the language prevent for you?**

Five categories — memory safety, null derefs, data races, integer overflow, and type coercion — each scored by *when* the protection kicks in: compile-time (best), runtime, or not at all. Weighted by real-world CVE impact. [How we score →](../methodology#guardrails)

## Results

<div class="gr-table">
<table>
<thead>
<tr>
<th>Language</th>
<th>Score</th>
<th>Memory</th>
<th>Null</th>
<th>Race</th>
<th>Overflow</th>
<th>Coercion</th>
</tr>
</thead>
<tbody>
<tr v-for="row in grData" :key="row.language">
<td class="lang-cell"><strong>{{ row.language }}</strong></td>
<td class="score-cell">{{ row.guardrails }}</td>
<td><span :class="['gr-badge', levelClass(row.grMemoryWhen)]">{{ row.grMemoryWhen }}</span></td>
<td><span :class="['gr-badge', levelClass(row.grNullWhen)]">{{ row.grNullWhen }}</span></td>
<td><span :class="['gr-badge', levelClass(row.grRaceWhen)]">{{ row.grRaceWhen }}</span></td>
<td><span :class="['gr-badge', levelClass(row.grOverflowWhen)]">{{ row.grOverflowWhen }}</span></td>
<td><span :class="['gr-badge', levelClass(row.grCoercionWhen)]">{{ row.grCoercionWhen }}</span></td>
</tr>
</tbody>
</table>
</div>

<div class="legend">
  <span class="gr-badge compile">compile-time</span>
  <span class="gr-badge runtime">runtime</span>
  <span class="gr-badge none">none</span>
</div>

## What the categories measure

| Category | Weight | What it prevents |
|----------|:---:|-----------------|
| **Memory** | 45% | Use-after-free, double-free, buffer overflow, uninitialized reads |
| **Null** | 20% | Null/nil pointer dereference |
| **Data Races** | 15% | Two threads mutating shared state concurrently |
| **Overflow** | 12% | Integer overflow silently wrapping |
| **Coercion** | 8% | Implicit type coercions (`"5" + 3 → "53"`) |

Weights reflect real-world impact: [~70% of high-severity CVEs](https://msrc.microsoft.com/blog/2019/07/a-proactive-approach-to-more-secure-code/) are memory safety bugs (Microsoft, Google Chrome). Integer overflow [dropped out of the CWE Top 25 in 2025](https://cwe.mitre.org/top25/archive/2025/2025_cwe_top25.html).

## Notable tradeoffs

**Rust (4.8)** — near-perfect but not 5.0. Integer overflow panics in debug mode, wraps in release. The borrow checker prevents memory, null, and race bugs at compile time.

**Go (3.1)** — GC handles memory, but null panics at runtime (no Option type), race detection is opt-in (`-race` flag), and no overflow protection.

**TypeScript (3.3)** — GC handles memory. Null and coercion protection require `strict` mode (opt-in). No overflow or race protection.

**Python (3.8)** — GC + arbitrary-precision integers (no overflow possible). But no race protection and coercion is runtime-only (`True + 1 → 2`).

**C (0)** — no protection in any category. Every bug class is the programmer's responsibility.

<style>
.gr-table { overflow-x: auto; margin: 1rem 0; }
.gr-table table { width: 100%; border-collapse: collapse; font-size: 0.85rem; }
.gr-table th { text-align: left; padding: 0.5rem 0.6rem; border-bottom: 2px solid var(--vp-c-divider); font-size: 0.78rem; color: var(--vp-c-text-2); }
.gr-table td { padding: 0.4rem 0.6rem; border-bottom: 1px solid var(--vp-c-divider); }
.lang-cell { white-space: nowrap; }
.score-cell { font-variant-numeric: tabular-nums; font-weight: 600; }
.gr-badge {
  display: inline-block;
  padding: 0.15rem 0.45rem;
  border-radius: 10px;
  font-size: 0.7rem;
  font-weight: 500;
  border: 1px solid var(--vp-c-divider);
}
.gr-badge.compile {
  background: #22c55e18;
  color: #16a34a;
  border-color: #22c55e44;
}
.gr-badge.runtime {
  background: #f59e0b18;
  color: #d97706;
  border-color: #f59e0b44;
}
.gr-badge.none {
  opacity: 0.5;
}
.dark .gr-badge.compile { color: #4ade80; }
.dark .gr-badge.runtime { color: #fbbf24; }
.legend {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  font-size: 0.75rem;
}
</style>
