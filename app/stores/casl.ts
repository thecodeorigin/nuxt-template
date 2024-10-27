import type { AnyAbility, SubjectType } from '@casl/ability'
import { createMongoAbility } from '@casl/ability'
import type { PermissionAction } from '@base/server/db/schemas'

export type Actions = `${PermissionAction}`

export interface Rule {
  action: Actions
  subject: string
}

export const useCaslStore = defineStore('casl', () => {
  const { currentPermissions } = useAuthStore()

  function reactiveAbility<T extends AnyAbility>(ability: T) {
    if (Object.hasOwn(ability, 'possibleRulesFor')) {
      return ability
    }

    const watcher = ref(true)
    ability.on('updated', () => {
      watcher.value = !watcher.value
    })

    const possibleRulesFor = ability.possibleRulesFor.bind(ability)
    ability.possibleRulesFor = (action: string, subject: SubjectType) => {
      return possibleRulesFor(action, subject)
    }
    ability.can = ability.can.bind(ability)
    ability.cannot = ability.cannot.bind(ability)

    return ability
  }

  const ability = reactiveAbility(
    createMongoAbility<[Actions, string]>(currentPermissions),
  )

  return {
    ability,
  }
})
