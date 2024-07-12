import { useAbility as useCaslAbility } from '@casl/vue'
import type { ability } from '@/plugins/casl/ability'

export const useAbility = () => useCaslAbility<typeof ability>()
