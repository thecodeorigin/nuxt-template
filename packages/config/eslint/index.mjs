import antfu from '@antfu/eslint-config'
import defu from 'defu'

/**
 * @type {Parameters<typeof antfu>[0]}
 */
const defaultOptions = {
  typescript: {
    overrides: {
      'no-var': 'off',
    },
  },
  vue: true,
  jsonc: true,
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
}

export default function config(options) {
  return antfu(defu(options, defaultOptions))
}
