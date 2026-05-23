import { fileURLToPath } from 'node:url'
import { defineVitestProject } from '@nuxt/test-utils/config'
import { defineConfig } from 'vitest/config'

const ROOT = fileURLToPath(new URL('.', import.meta.url))

const layerAliases = [
  { find: /^#layers\/auth\/(.+?)(\.ts|\.vue)?$/, replacement: `${ROOT}/layers/auth/$1$2` },
  { find: /^#layers\/todo\/(.+?)(\.ts|\.vue)?$/, replacement: `${ROOT}/layers/todo/$1$2` },
  { find: /^#layers\/notifications\/(.+?)(\.ts|\.vue)?$/, replacement: `${ROOT}/layers/notifications/$1$2` },
  { find: /^#layers\/billing\/(.+?)(\.ts|\.vue)?$/, replacement: `${ROOT}/layers/billing/$1$2` },
  { find: /^#layers\/referral\/(.+?)(\.ts|\.vue)?$/, replacement: `${ROOT}/layers/referral/$1$2` },
]

const rootAliases = [
  { find: /^~~\/(.*)$/, replacement: `${ROOT}/$1` },
  { find: /^@@\/(.*)$/, replacement: `${ROOT}/$1` },
  { find: /^~\/(.*)$/, replacement: `${ROOT}/app/$1` },
  { find: /^@\/(.*)$/, replacement: `${ROOT}/app/$1` },
]

// @nuxthub/* packages are virtual at Nuxt runtime; provide stubs for the node unit env
const hubMockAliases = [
  { find: '@nuxthub/kv', replacement: `${ROOT}/test/__mocks__/hub-kv.ts` },
  { find: '@nuxthub/db/schema', replacement: `${ROOT}/test/__mocks__/hub-db-schema.ts` },
  { find: '@nuxthub/db', replacement: `${ROOT}/test/__mocks__/hub-db.ts` },
]

export default defineConfig({
  test: {
    projects: [
      {
        resolve: {
          alias: [...layerAliases, ...rootAliases, ...hubMockAliases],
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
          hookTimeout: 60000,
        },
      }),
    ],
    coverage: {
      enabled: true,
      provider: 'v8',
    },
  },
})
