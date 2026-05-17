import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'langmetrics',
  description: 'Data-driven comparison of programming language design',
  base: '/langmetrics/',
  head: [['link', { rel: 'icon', href: '/langmetrics/favicon.ico' }]],
  themeConfig: {
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Results', link: '/results' },
      { text: 'Methodology', link: '/methodology' },
      { text: 'GitHub', link: 'https://github.com/cs01/langmetrics' },
    ],
    sidebar: [
      {
        text: 'Overview',
        items: [
          { text: 'What is this?', link: '/' },
          { text: 'Key Findings', link: '/results' },
        ]
      },
      {
        text: 'Metrics',
        items: [
          { text: 'Code Size', link: '/metrics/code-size' },
          { text: 'Symbol Noise', link: '/metrics/symbol-noise' },
          { text: 'Complexity', link: '/metrics/complexity' },
          { text: 'Concept Count', link: '/metrics/concept-count' },
          { text: 'Type Ceremony', link: '/metrics/type-ceremony' },
          { text: 'Error Overhead', link: '/metrics/error-overhead' },
        ]
      },
      {
        text: 'Problems',
        items: [
          { text: 'Two Sum', link: '/problems/two-sum' },
          { text: 'Valid Parens', link: '/problems/valid-parens' },
          { text: 'Word Frequency', link: '/problems/word-freq' },
          { text: 'Concurrent Fetch', link: '/problems/concurrent-fetch' },
        ]
      },
      {
        text: 'Reference',
        items: [
          { text: 'Methodology', link: '/methodology' },
          { text: 'Adding a Problem', link: '/contributing' },
        ]
      },
    ],
    socialLinks: [
      { icon: 'github', link: 'https://github.com/cs01/langmetrics' },
    ],
  },
})
