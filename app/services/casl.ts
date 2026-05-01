export interface ParsedAbility {
  subject: string
  action: string
  scope: string | undefined
}

export interface AbilityRule {
  action: string
  subject: string
  conditions?: Record<string, unknown>
}

export function parseAbility(ability: string): ParsedAbility {
  const [subject = '', action = '', scope] = ability.split(':')
  return { subject, action, scope }
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
  return required.every((req) => {
    const { subject: rs, action: ra } = parseAbility(req)
    return abilities.some((have) => {
      const { subject, action } = parseAbility(have)
      return subject === rs && action === ra
    })
  })
}
