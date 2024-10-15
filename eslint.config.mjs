import eslint from '@thecodeorigin/eslint-config'
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt(
  eslint(),
)
