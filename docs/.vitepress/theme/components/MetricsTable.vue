<script setup lang="ts">
import { ref, computed } from 'vue'

interface Row {
  language: string
  [key: string]: string | number
}

interface Group {
  label: string
  languages: string[]
}

const props = withDefaults(defineProps<{
  data: Row[]
  columns: { key: string; label: string; lower?: boolean }[]
  groups?: Group[]
}>(), {
  groups: () => []
})

const activeGroup = ref('All')
const sortKey = ref(props.columns[0]?.key || 'language')
const sortAsc = ref(true)

const allGroups = computed(() => {
  if (props.groups.length === 0) return []
  return [{ label: 'All', languages: [] as string[] }, ...props.groups]
})

function toggleSort(key: string) {
  if (sortKey.value === key) {
    sortAsc.value = !sortAsc.value
  } else {
    sortKey.value = key
    sortAsc.value = true
  }
}

const filtered = computed(() => {
  if (activeGroup.value === 'All' || allGroups.value.length === 0) return props.data
  const group = allGroups.value.find(g => g.label === activeGroup.value)
  if (!group || group.languages.length === 0) return props.data
  return props.data.filter(r => group.languages.includes(r.language.toLowerCase()))
})

const sorted = computed(() => {
  const key = sortKey.value
  const asc = sortAsc.value
  return [...filtered.value].sort((a, b) => {
    const av = a[key]
    const bv = b[key]
    if (typeof av === 'string' && typeof bv === 'string') {
      return asc ? av.localeCompare(bv) : bv.localeCompare(av)
    }
    return asc ? (av as number) - (bv as number) : (bv as number) - (av as number)
  })
})

function getColor(value: number, key: string): string {
  const col = props.columns.find(c => c.key === key)
  if (!col) return ''
  // Color relative to visible data only
  const vals = filtered.value.map(r => r[key] as number)
  const min = Math.min(...vals)
  const max = Math.max(...vals)
  if (max === min) return ''

  const lowerBetter = col.lower !== false
  const ratio = lowerBetter
    ? (value - min) / (max - min)
    : 1 - (value - min) / (max - min)

  const r = ratio < 0.5 ? Math.round(ratio * 2 * 234) : 234
  const g = ratio < 0.5 ? 197 : Math.round((1 - (ratio - 0.5) * 2) * 197)
  const b = 30
  const alpha = 0.18 + ratio * 0.22
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

function isBest(value: number, key: string): boolean {
  const col = props.columns.find(c => c.key === key)
  if (!col) return false
  const vals = filtered.value.map(r => r[key] as number)
  const lowerBetter = col.lower !== false
  return lowerBetter ? value === Math.min(...vals) : value === Math.max(...vals)
}

function sortArrow(key: string): string {
  if (sortKey.value !== key) return '↕'
  return sortAsc.value ? '↑' : '↓'
}
</script>

<template>
  <div>
    <div v-if="allGroups.length > 0" class="metrics-filters">
      <button
        v-for="group in allGroups"
        :key="group.label"
        :class="{ active: activeGroup === group.label }"
        @click="activeGroup = group.label"
      >
        {{ group.label }}
      </button>
    </div>
    <table class="metrics-table">
      <thead>
        <tr>
          <th @click="toggleSort('language')">
            Language
            <span class="sort-arrow" :class="{ active: sortKey === 'language' }">
              {{ sortArrow('language') }}
            </span>
          </th>
          <th v-for="col in columns" :key="col.key" @click="toggleSort(col.key)">
            {{ col.label }}
            <span class="sort-arrow" :class="{ active: sortKey === col.key }">
              {{ sortArrow(col.key) }}
            </span>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in sorted" :key="row.language">
          <td class="lang-cell">{{ row.language }}</td>
          <td
            v-for="col in columns"
            :key="col.key"
            class="metric-cell"
            :style="{ backgroundColor: getColor(row[col.key] as number, col.key) }"
          >
            {{ row[col.key] }}
            <span v-if="isBest(row[col.key] as number, col.key)" class="best-badge">best</span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
