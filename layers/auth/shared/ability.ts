export interface ParsedAbility {
  subject: string
  action: string
  scope: string | undefined
}

export function parseAbility(ability: string): ParsedAbility {
  const [subject = '', action = '', scope] = ability.split(':')
  return { subject, action, scope }
}

export const WILDCARDABLE_ACTIONS = new Set(['read', 'write', 'delete'])

/** Scope-PRECISE — server route gating. `manage` covers read/write/delete at the same scope. */
export function satisfiesAbility(have: string[], required: string): boolean {
  const { subject: rs, action: ra, scope: rScope } = parseAbility(required)
  return have.some((h) => {
    const { subject, action, scope } = parseAbility(h)
    if (subject !== rs)
      return false
    if (action === 'manage' && scope === rScope && WILDCARDABLE_ACTIONS.has(ra))
      return true
    return action === ra && scope === rScope
  })
}

/** Scope-TOLERANT — page-meta visibility (ignores :self distinctions). */
export function canSubjectAction(have: string[], required: string): boolean {
  const { subject: rs, action: ra } = parseAbility(required)
  return have.some((h) => {
    const { subject, action } = parseAbility(h)
    if (subject !== rs)
      return false
    if (action === 'manage' && WILDCARDABLE_ACTIONS.has(ra))
      return true
    return action === ra
  })
}
