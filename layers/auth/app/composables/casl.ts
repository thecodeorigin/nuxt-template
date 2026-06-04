import type { MongoAbility } from '@casl/ability'

export { abilitiesToRules, type AbilityRule } from '#layers/auth/shared/casl'

export function pageMetaCanCheck(ability: MongoAbility, required: string[]): boolean {
  if (required.length === 0)
    return true
  return required.some((req) => {
    const [s = '', a = ''] = req.split(':')
    return ability.can(a, s)
  })
}
