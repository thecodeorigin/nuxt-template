import { useAbility as useCaslAbility } from '@casl/vue'
import type { ability } from '../ability'

export const useAbility = () => useCaslAbility<typeof ability>()
