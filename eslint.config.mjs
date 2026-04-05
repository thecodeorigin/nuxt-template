import antfu from '@antfu/eslint-config'
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
  {
    files: ['docs/content/**/*.md'],
    rules: {
      'markdown/no-multiple-h1': 'off',
    },
  },
  {
    ignores: ['node_modules', '.nuxt', '.agents', '.agent', '.docker', 'dist'],
  },
)
