import type antfu from '@antfu/eslint-config'
import type { OptionsConfig, TypedFlatConfigItem } from '@antfu/eslint-config'

export default (options: OptionsConfig & TypedFlatConfigItem) => ReturnType<typeof antfu>
