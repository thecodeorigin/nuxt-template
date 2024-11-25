import eslint from '@thecodeorigin/eslint-config'
import piniaPlugin from '@thecodeorigin/eslint-config/pinia'

import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt(
  eslint({
    rules: {
      'vue/no-unused-refs': 'off',
    },
  }),
  {
    files: ['**/*.ts', '**/*.vue'],
    plugins: {
      pinia: piniaPlugin,
    },
    rules: {
      'pinia/no-destructuring-pinia-store': 'error',
    },
  },
)
