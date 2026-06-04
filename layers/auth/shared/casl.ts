import type { MongoAbility, RawRuleOf } from '@casl/ability'
import { createMongoAbility } from '@casl/ability'
import { parseAbility } from '#layers/auth/shared/ability'

export const WILDCARDABLE_ACTIONS = new Set(['read', 'write', 'delete'])

export interface AbilityRule {
  action: string
  subject: string
  conditions?: Record<string, unknown>
}

export function abilitiesToRules(abilities: string[], userId: string | undefined): AbilityRule[] {
  return abilities.map((ability) => {
    const { subject, action, scope } = parseAbility(ability)
    const rule: AbilityRule = { action, subject }
    if (scope === 'self' && userId) {
      rule.conditions = { user_id: userId }
    }
    return rule
  })
}

export function buildAbility(abilities: string[], userId: string | undefined): MongoAbility {
  return createMongoAbility(abilitiesToRules(abilities, userId) as RawRuleOf<MongoAbility>[])
}
