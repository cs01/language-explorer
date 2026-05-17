import DefaultTheme from 'vitepress/theme'
import MetricsTable from './components/MetricsTable.vue'
import SolutionTabs from './components/SolutionTabs.vue'
import RadarChart from './components/RadarChart.vue'
import LanguageComparison from './components/LanguageComparison.vue'
import './custom.css'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('MetricsTable', MetricsTable)
    app.component('SolutionTabs', SolutionTabs)
    app.component('RadarChart', RadarChart)
    app.component('LanguageComparison', LanguageComparison)
  }
}
