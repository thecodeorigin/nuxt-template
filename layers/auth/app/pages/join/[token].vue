<script setup lang="ts">
import { useOrganizationApi } from '#layers/auth/app/api/useOrganizationApi'

definePageMeta({ public: true })

const route = useRoute()
const router = useRouter()
const token = route.params.token as string
const orgApi = useOrganizationApi()
const authStore = useAuthStore()
const toast = useToast()

const { data: invitation, error } = useAsyncData(
  `invitation-${token}`,
  () => orgApi.fetchInvitation(token),
)
whenError(error)

useHead({ title: () => (invitation.value ? `Join ${invitation.value.org.name}` : 'Invitation') })

const accepting = ref(false)

async function accept() {
  if (!authStore.currentUser) {
    await router.push('/auth/login')
    return
  }
  accepting.value = true
  try {
    const result = await orgApi.acceptInvitation(token)
    await authStore.fetchCurrentUser()
    toast.add({ title: `Joined ${result.org.name}`, color: 'success' })
    await router.push('/dashboard')
  }
  catch (err: unknown) {
    const e = err as { data?: { statusMessage?: string } }
    toast.add({ title: 'Failed to accept invitation', description: e?.data?.statusMessage ?? 'Unknown error', color: 'error' })
  }
  finally {
    accepting.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center p-4">
    <UCard class="w-full max-w-md">
      <template #header>
        <p class="text-lg font-semibold">
          Organization invitation
        </p>
      </template>

      <div v-if="error || !invitation" class="text-center py-4">
        <UIcon name="i-lucide-circle-x" class="size-12 text-error mx-auto mb-3" />
        <p class="font-medium">
          Invitation not found or expired
        </p>
        <p class="text-sm text-muted mt-1">
          The invitation link may have been revoked or is no longer valid.
        </p>
      </div>

      <div v-else class="space-y-4">
        <p>
          You have been invited to join <strong>{{ invitation.org.name }}</strong><template v-if="invitation.roleName">
            as a <strong>{{ invitation.roleName }}</strong>
          </template>.
        </p>
        <div v-if="!authStore.currentUser" class="text-sm text-muted">
          Sign in to accept this invitation.
        </div>
      </div>

      <template v-if="invitation" #footer>
        <div class="flex justify-end gap-2">
          <UButton color="neutral" variant="ghost" label="Cancel" @click="router.push('/')" />
          <UButton
            :label="authStore.currentUser ? 'Accept invitation' : 'Sign in to accept'"
            :loading="accepting"
            @click="accept"
          />
        </div>
      </template>
    </UCard>
  </div>
</template>
