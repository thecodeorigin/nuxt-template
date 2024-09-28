import eslint from '@imrim12/eslint-config'
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt(
  eslint(),
)
