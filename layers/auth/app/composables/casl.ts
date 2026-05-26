import { canSubjectAction, parseAbility } from '#layers/auth/shared/ability'

export interface AbilityRule {
  action: string
  subject: string
  conditions?: Record<string, unknown>
}

export function abilitiesToRules(
  abilities: string[],
  userId: string | undefined,
): AbilityRule[] {
  return abilities.map((ability) => {
    const { subject, action, scope } = parseAbility(ability)
    const rule: AbilityRule = { action, subject }
    if (scope === 'self' && userId) {
      rule.conditions = { user_id: userId }
    }
    return rule
  })
}

export function pageMetaCanCheck(abilities: string[], required: string[]): boolean {
  if (required.length === 0)
    return true
  return required.some(req => canSubjectAction(abilities, req))
}
