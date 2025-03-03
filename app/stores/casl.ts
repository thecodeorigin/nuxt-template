import type { AnyAbility, SubjectType } from '@casl/ability'
import { createMongoAbility } from '@casl/ability'

export const useCaslStore = defineStore('casl', () => {
  const config = useRuntimeConfig()

  const scopes = useState<Array<{ action: string, subject: string }>>('scopes', () => [])

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

    if (config.public.features.authorization) {
      ability.can = ability.can.bind(ability)
      ability.cannot = ability.cannot.bind(ability)
    }
    else {
      ability.can = () => true
      ability.cannot = () => false
    }

    return ability
  }

  const ability = reactiveAbility(
    createMongoAbility<[string, string]>(scopes.value),
  )

  async function fetchScopes() {
    const response = await $api('/api/scopes')

    if (Array.isArray(response)) {
      scopes.value = response.map((scope) => {
        const [action, subject] = scope.split(':') as [string, string]

        return { action, subject }
      })
    }

    ability.update(scopes.value)

    return scopes.value
  }

  return {
    ability,
    fetchScopes,
  }
})
