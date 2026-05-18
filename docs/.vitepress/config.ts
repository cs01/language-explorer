import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'Language Explorer',
  description: 'Data-driven comparison of programming language design',
  base: '/language-explorer/',
  head: [['link', { rel: 'icon', href: '/language-explorer/favicon.ico' }]],
  themeConfig: {
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Compare', link: '/compare' },
      { text: 'Languages', link: '/languages/python' },
      { text: 'Methodology', link: '/methodology' },
      { text: 'GitHub', link: 'https://github.com/cs01/language-explorer' },
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
          { text: 'Ada', link: '/languages/ada' },
          { text: 'C', link: '/languages/c' },
          { text: 'C#', link: '/languages/csharp' },
          { text: 'C++', link: '/languages/cpp' },
          { text: 'Clojure', link: '/languages/clojure' },
          { text: 'Elixir', link: '/languages/elixir' },
          { text: 'Erlang', link: '/languages/erlang' },
          { text: 'Go', link: '/languages/go' },
          { text: 'Haskell', link: '/languages/haskell' },
          { text: 'Java', link: '/languages/java' },
          { text: 'JavaScript', link: '/languages/javascript' },
          { text: 'Kotlin', link: '/languages/kotlin' },
          { text: 'LLVM IR', link: '/languages/llvm-ir' },
          { text: 'Milo', link: '/languages/milo' },
          { text: 'Objective-C', link: '/languages/objc' },
          { text: 'Python', link: '/languages/python' },
          { text: 'Ruby', link: '/languages/ruby' },
          { text: 'Rust', link: '/languages/rust' },
          { text: 'Swift', link: '/languages/swift' },
          { text: 'TypeScript', link: '/languages/typescript' },
          { text: 'Zero', link: '/languages/zero' },
          { text: 'Zig', link: '/languages/zig' },
        ]
      },
      {
        text: 'Metrics',
        items: [
          { text: 'Safety Guardrails', link: '/metrics/guardrails' },
          { text: 'Code Size', link: '/metrics/code-size' },
          { text: 'Symbol Noise', link: '/metrics/symbol-noise' },
          { text: 'Complexity', link: '/metrics/complexity' },
          { text: 'Concept Count', link: '/metrics/concept-count' },
          { text: 'Type Ceremony', link: '/metrics/type-ceremony' },
          { text: 'Error Overhead', link: '/metrics/error-overhead' },
          { text: 'AI Readiness', link: '/metrics/ai-readiness' },
          { text: 'How We Score', link: '/methodology' },
        ]
      },
      {
        text: 'Reference',
        items: [
          { text: 'Adding a Problem', link: '/contributing' },
        ]
      },
    ],
    socialLinks: [
      { icon: 'github', link: 'https://github.com/cs01/language-explorer' },
    ],
  },
})
