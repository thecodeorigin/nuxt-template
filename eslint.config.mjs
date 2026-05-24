import antfu from '@antfu/eslint-config'
import pluginPnpm from 'eslint-plugin-pnpm'
import * as jsoncParser from 'jsonc-eslint-parser'
import * as yamlParser from 'yaml-eslint-parser'
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt(
  antfu({
    stylistic: true,
    imports: true,
    pnpm: true,
    typescript: true,
    vue: true,
  }),
  {
    files: ['docs/content/**/*.md'],
    rules: {
      'markdown/no-multiple-h1': 'off',
    },
  },
  {
    ignores: ['node_modules', '.nuxt', '.agents', '.agent', '.claude', '.data', '.wrangler', '.output', 'dist', 'server/db/migrations'],
  },
  {
    name: 'pnpm/package.json',
    files: [
      'package.json',
      '**/package.json',
    ],
    languageOptions: {
      parser: jsoncParser,
    },
    plugins: {
      pnpm: pluginPnpm,
    },
    rules: {
      'pnpm/json-enforce-catalog': 'error',
      'pnpm/json-valid-catalog': 'error',
      'pnpm/json-prefer-workspace-settings': 'error',
    },
  },
  {
    name: 'pnpm/pnpm-workspace-yaml',
    files: ['pnpm-workspace.yaml'],
    languageOptions: {
      parser: yamlParser,
    },
    plugins: {
      pnpm: pluginPnpm,
    },
    rules: {
      'pnpm/yaml-no-unused-catalog-item': 'error',
      'pnpm/yaml-no-duplicate-catalog-item': 'error',
      'pnpm/yaml-valid-packages': 'error',
    },
  },
  {
    rules: {
      'ts/no-explicit-any': 'off',
      'ts/prefer-literal-enum-member': 'off',
      'ts/no-dynamic-delete': 'off',
      'ts/unified-signatures': 'off',
      'ts/no-use-before-define': 'off',
      'comma-dangle': ['error', 'always-multiline'],
      'no-alert': 'off',
      'no-console': 'off',
      'node/prefer-global/buffer': 'off',
      'node/prefer-global/process': 'off',
      'style/brace-style': 'off',
      'vue/no-multiple-template-root': 'off',
    },
  },
)
