<script setup lang="ts">
import { computed } from 'vue'

interface DataPoint {
  label: string
  value: number
  max: number
}

const props = withDefaults(defineProps<{
  data: DataPoint[]
  label?: string
  color?: string
  size?: number
}>(), {
  label: '',
  color: '#3b82f6',
  size: 250,
})

const cx = computed(() => props.size / 2)
const cy = computed(() => props.size / 2)
const radius = computed(() => props.size / 2 - 45)

function polarToCart(angle: number, r: number): [number, number] {
  const rad = (angle - 90) * (Math.PI / 180)
  return [cx.value + r * Math.cos(rad), cy.value + r * Math.sin(rad)]
}

const axes = computed(() => {
  const n = props.data.length
  return props.data.map((d, i) => {
    const angle = (360 / n) * i
    const [x, y] = polarToCart(angle, radius.value)
    const [lx, ly] = polarToCart(angle, radius.value + 20)
    return { ...d, angle, x, y, lx, ly }
  })
})

const gridLevels = [0.25, 0.5, 0.75, 1.0]

function gridPath(level: number): string {
  const n = props.data.length
  const points = Array.from({ length: n }, (_, i) => {
    const angle = (360 / n) * i
    return polarToCart(angle, radius.value * level)
  })
  return points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0]},${p[1]}`).join(' ') + ' Z'
}

const dataPath = computed(() => {
  const n = props.data.length
  const points = props.data.map((d, i) => {
    const angle = (360 / n) * i
    const r = radius.value * Math.min(d.value / d.max, 1)
    return polarToCart(angle, r)
  })
  return points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0]},${p[1]}`).join(' ') + ' Z'
})
</script>

<template>
  <div class="radar-chart">
    <svg :width="size" :height="size" :viewBox="`0 0 ${size} ${size}`">
      <!-- Grid -->
      <path
        v-for="level in gridLevels"
        :key="level"
        :d="gridPath(level)"
        fill="none"
        stroke="var(--vp-c-divider)"
        :stroke-width="level === 1 ? 1.5 : 0.5"
      />
      <!-- Axes -->
      <line
        v-for="axis in axes"
        :key="axis.label"
        :x1="cx" :y1="cy"
        :x2="axis.x" :y2="axis.y"
        stroke="var(--vp-c-divider)"
        stroke-width="0.5"
      />
      <!-- Data polygon -->
      <path
        :d="dataPath"
        :fill="color"
        fill-opacity="0.2"
        :stroke="color"
        stroke-width="2"
      />
      <!-- Data points -->
      <circle
        v-for="(d, i) in data"
        :key="i"
        :cx="polarToCart((360 / data.length) * i, radius * Math.min(d.value / d.max, 1))[0]"
        :cy="polarToCart((360 / data.length) * i, radius * Math.min(d.value / d.max, 1))[1]"
        r="3"
        :fill="color"
      />
      <!-- Labels -->
      <text
        v-for="axis in axes"
        :key="'l-' + axis.label"
        :x="axis.lx"
        :y="axis.ly"
        text-anchor="middle"
        dominant-baseline="middle"
        class="radar-label"
      >
        {{ axis.label }}
      </text>
    </svg>
    <div v-if="label" class="radar-title">{{ label }}</div>
  </div>
</template>

<style scoped>
.radar-chart {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
}
.radar-label {
  font-size: 10px;
  fill: var(--vp-c-text-2);
}
.radar-title {
  font-weight: 600;
  font-size: 0.9rem;
  margin-top: 0.5rem;
}
</style>
