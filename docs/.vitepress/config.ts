import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'langmetrics',
  description: 'Data-driven comparison of programming language design',
  base: '/langmetrics/',
  head: [['link', { rel: 'icon', href: '/langmetrics/favicon.ico' }]],
  themeConfig: {
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Compare', link: '/compare' },
      { text: 'Languages', link: '/languages/python' },
      { text: 'Methodology', link: '/methodology' },
      { text: 'GitHub', link: 'https://github.com/cs01/langmetrics' },
    ],
    sidebar: [
      {
        text: 'Overview',
        items: [
          { text: 'Home', link: '/' },
          { text: 'Compare', link: '/compare' },
        ]
      },
      {
        text: 'Languages',
        items: [
          { text: 'Python', link: '/languages/python' },
          { text: 'Ruby', link: '/languages/ruby' },
          { text: 'JavaScript', link: '/languages/javascript' },
          { text: 'TypeScript', link: '/languages/typescript' },
          { text: 'Kotlin', link: '/languages/kotlin' },
          { text: 'Elixir', link: '/languages/elixir' },
          { text: 'Haskell', link: '/languages/haskell' },
          { text: 'Rust', link: '/languages/rust' },
          { text: 'Go', link: '/languages/go' },
          { text: 'Swift', link: '/languages/swift' },
          { text: 'Java', link: '/languages/java' },
          { text: 'C++', link: '/languages/cpp' },
          { text: 'C', link: '/languages/c' },
          { text: 'Zig', link: '/languages/zig' },
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
