import DefaultTheme from 'vitepress/theme'
import MetricsTable from './components/MetricsTable.vue'
import SolutionTabs from './components/SolutionTabs.vue'
import './custom.css'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('MetricsTable', MetricsTable)
    app.component('SolutionTabs', SolutionTabs)
  }
}
