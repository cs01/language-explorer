<script setup lang="ts">
import { ref } from 'vue'

interface Solution {
  lang: string
  label: string
  code: string
}

const props = defineProps<{
  solutions: Solution[]
}>()

const active = ref(0)
</script>

<template>
  <div class="solution-tabs">
    <div class="solution-tabs-nav">
      <button
        v-for="(sol, i) in solutions"
        :key="sol.lang"
        :class="{ active: active === i }"
        @click="active = i"
      >
        {{ sol.label }}
      </button>
    </div>
    <div class="solution-code">
      <pre><code>{{ solutions[active]?.code }}</code></pre>
    </div>
  </div>
</template>
