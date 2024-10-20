import type * as z from 'zod'
import type { selectUserShortcutSchema } from '@base/server/db/schemas/user_shortcuts.schema'

export type RawShortcut = z.infer<typeof selectUserShortcutSchema>

export const useShortcutStore = defineStore('shortcut', () => {
  const authStore = useAuthStore()

  const userId = computed(() => authStore.currentUser?.id || '')

  const userShortcuts = ref<RawShortcut[]>([])

  async function getUserShortcuts() {
    if (!userShortcuts.value.length) {
      const response = await $api<{ data: RawShortcut[], total: number }>(`/users/${userId.value}/shortcuts`)

      userShortcuts.value = response.data
    }

    return userShortcuts.value
  }

  async function postUserShortcut(route: string) {
    const response = await $api<{ data: RawShortcut }>(`/users/${userId.value}/shortcuts`, {
      method: 'POST',
      body: JSON.stringify({
        route,
      }),
    })

    userShortcuts.value.push(response.data)
  }

  return {
    userShortcuts,
    getUserShortcuts,
    postUserShortcut,
  }
})
