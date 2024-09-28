import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

const rootDir = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  define: {
    $page: 'globalThis.$page',
  },
  test: {
    globals: true,
    setupFiles: [
      path.resolve(rootDir, './e2e/setup/1.init.ts'),
    ],
  },
})
