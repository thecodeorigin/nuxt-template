import type { InferSelectModel } from 'drizzle-orm'
import type { userShortcutTable } from '@base/server/db/schemas'

export type RawShortcut = InferSelectModel<typeof userShortcutTable>

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

  async function deleteUserShortcut(shortcutId: string) {
    const response = await $api<{ data: RawShortcut[] }>(`/users/${userId.value}/shortcuts/${shortcutId}`, {
      method: 'DELETE',
    })

    userShortcuts.value = userShortcuts.value.filter(shortcut => shortcut.id !== response.data[0]?.id)
  }
  return {
    userShortcuts,
    getUserShortcuts,
    postUserShortcut,
    deleteUserShortcut,
  }
})
