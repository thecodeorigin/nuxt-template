<script setup lang="ts">
import { UpdateUserSchema } from '#layers/auth/shared/schemas/user'

const authStore = useAuthStore()
const toast = useToast()

const state = reactive({
  name: authStore.currentUser?.name ?? '',
  username: authStore.currentUser?.username ?? '',
  bio: authStore.currentUser?.bio ?? '',
})
const saving = ref(false)

async function onSubmit() {
  saving.value = true
  try {
    await authStore.updateCurrentUser({ name: state.name, username: state.username, bio: state.bio })
    toast.add({ title: 'Profile updated', color: 'success' })
  }
  catch (err: any) {
    toast.add({ title: 'Update failed', description: err?.data?.statusMessage ?? 'Unknown error', color: 'error' })
  }
  finally {
    saving.value = false
  }
}
</script>

<template>
  <UForm :schema="UpdateUserSchema" :state="state" @submit="onSubmit">
    <UPageCard
      title="Profile"
      description="These informations will be displayed publicly."
      variant="naked"
      orientation="horizontal"
      class="mb-4"
    >
      <UButton type="submit" label="Save changes" :loading="saving" class="w-fit lg:ms-auto" />
    </UPageCard>

    <UPageCard variant="subtle">
      <UFormField name="name" label="Name" description="Will appear on receipts, invoices, and other communication." required class="flex max-sm:flex-col justify-between items-start gap-4">
        <UInput v-model="state.name" autocomplete="off" />
      </UFormField>
      <USeparator />
      <UFormField name="email" label="Email" description="Used to sign in, for email receipts and product updates." class="flex max-sm:flex-col justify-between items-start gap-4">
        <UInput :model-value="authStore.currentUser?.primary_email" disabled />
      </UFormField>
      <USeparator />
      <UFormField name="username" label="Username" description="Your unique username for logging in and your profile URL." required class="flex max-sm:flex-col justify-between items-start gap-4">
        <UInput v-model="state.username" />
      </UFormField>
      <USeparator />
      <UFormField name="avatar" label="Avatar" description="JPG, GIF or PNG." class="flex max-sm:flex-col justify-between sm:items-center gap-4">
        <UAvatar
          :src="authStore.currentUser?.avatar ?? undefined"
          :alt="authStore.currentUser?.name ?? ''"
          size="lg"
        />
      </UFormField>
      <USeparator />
      <UFormField name="bio" label="Bio" description="Brief description for your profile." class="flex max-sm:flex-col justify-between items-start gap-4">
        <UTextarea v-model="state.bio" :rows="4" autoresize class="w-full" />
      </UFormField>
    </UPageCard>
  </UForm>
</template>
