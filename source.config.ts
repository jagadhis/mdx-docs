import { defineConfig, defineDocs } from 'fumadocs-mdx/config'

export const docsCollection = defineDocs({
  dir: 'src/content/docs',
})

export default defineConfig({
  lastModifiedTime: 'none'
})
