import type { AnyAbility, SubjectType } from '@casl/ability'
import { createMongoAbility } from '@casl/ability'
import type { PermissionAction, PermissionSubject } from '@/server/db/schemas'

export type Actions = `${PermissionAction}`

export type Subjects = `${PermissionSubject}`

export interface Rule {
  action: Actions
  subject: Subjects
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
    createMongoAbility<[Actions, Subjects]>(currentPermissions),
  )

  return {
    ability,
  }
})
