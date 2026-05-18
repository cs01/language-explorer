import DefaultTheme from 'vitepress/theme'
import MetricsTable from './components/MetricsTable.vue'
import SolutionTabs from './components/SolutionTabs.vue'
import RadarChart from './components/RadarChart.vue'
import LanguageComparison from './components/LanguageComparison.vue'
import GuardrailCard from './components/GuardrailCard.vue'
import ExpressivenessCard from './components/ExpressivenessCard.vue'
import SurfaceAreaCard from './components/SurfaceAreaCard.vue'
import ExplicitnessCard from './components/ExplicitnessCard.vue'
import AIReadinessCard from './components/AIReadinessCard.vue'
import './custom.css'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('MetricsTable', MetricsTable)
    app.component('SolutionTabs', SolutionTabs)
    app.component('RadarChart', RadarChart)
    app.component('LanguageComparison', LanguageComparison)
    app.component('GuardrailCard', GuardrailCard)
    app.component('ExpressivenessCard', ExpressivenessCard)
    app.component('SurfaceAreaCard', SurfaceAreaCard)
    app.component('ExplicitnessCard', ExplicitnessCard)
    app.component('AIReadinessCard', AIReadinessCard)
  }
}
