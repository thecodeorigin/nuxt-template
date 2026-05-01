import { fileURLToPath } from 'node:url'
import { defineVitestProject } from '@nuxt/test-utils/config'
import { defineConfig } from 'vitest/config'

const ROOT = fileURLToPath(new URL('.', import.meta.url))

const layerAliases = [
  { find: /^#layers\/auth\/(.+?)(\.ts|\.vue)?$/, replacement: `${ROOT}/layers/auth/$1$2` },
  { find: /^#layers\/todo\/(.+?)(\.ts|\.vue)?$/, replacement: `${ROOT}/layers/todo/$1$2` },
]

const rootAliases = [
  { find: /^~~\/(.*)$/, replacement: `${ROOT}/$1` },
  { find: /^@@\/(.*)$/, replacement: `${ROOT}/$1` },
  { find: /^~\/(.*)$/, replacement: `${ROOT}/app/$1` },
  { find: /^@\/(.*)$/, replacement: `${ROOT}/app/$1` },
]

export default defineConfig({
  test: {
    projects: [
      {
        resolve: {
          alias: [...layerAliases, ...rootAliases],
        },
        test: {
          name: 'unit',
          include: [
            'test/unit/*.{test,spec}.ts',
            'layers/*/test/unit/*.{test,spec}.ts',
          ],
          environment: 'node',
        },
      },
      await defineVitestProject({
        test: {
          name: 'nuxt',
          include: [
            'test/nuxt/*.{test,spec}.ts',
            'layers/*/test/nuxt/*.{test,spec}.ts',
          ],
          environment: 'nuxt',
          environmentOptions: {
            nuxt: {
              rootDir: fileURLToPath(new URL('.', import.meta.url)),
              domEnvironment: 'happy-dom',
            },
          },
        },
      }),
    ],
    coverage: {
      enabled: true,
      provider: 'v8',
    },
  },
})
