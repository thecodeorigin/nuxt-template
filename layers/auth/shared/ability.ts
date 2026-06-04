export interface ParsedAbility {
  subject: string
  action: string
  scope: string | undefined
}

export function parseAbility(ability: string): ParsedAbility {
  const [subject = '', action = '', scope] = ability.split(':')
  return { subject, action, scope }
}
