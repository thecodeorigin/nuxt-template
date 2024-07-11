import antfu from '@antfu/eslint-config'

export default antfu({
  vue: true,
  typescript: true,
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

    'vue/valid-v-slot': 'off',
    'vue/custom-event-name-casing': 'off',
  },
})
