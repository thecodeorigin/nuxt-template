import antfu from '@antfu/eslint-config'

export default antfu({
  vue: true,
  typescript: {
    overrides: [
      {
        files: ['*.d.ts'],
        rules: {
          'no-var': 'off',
        },
      },
    ],
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
  },
})
