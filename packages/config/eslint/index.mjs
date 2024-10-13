import antfu from '@antfu/eslint-config'
import defu from 'defu'

export default function config(options) {
  return antfu(defu(options, {
    vue: true,
    typescript: {
      overrides: {
        'no-var': 'off',
      },
    },
    jsonc: true,
    stylistic: {
      indent: 2,
      quotes: 'single',
    },
    rules: {
      'no-console': 'off',
      'no-debugger': 'warn',

      'node/prefer-global/process': 'off',

      'regexp/no-unused-capturing-group': 'off',

      'ts/ban-ts-comment': 'off',
      'ts/no-empty-object-type': 'off',
      'ts/no-unused-expressions': ['error', { allowTaggedTemplates: true }],

      'vue/valid-v-slot': 'off',
      'vue/custom-event-name-casing': 'off',
      'vue/no-multiple-template-root': 'off',
    },
  }))
}
