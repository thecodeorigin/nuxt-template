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
const fileInput = ref<HTMLInputElement | null>(null)
const uploadingAvatar = ref(false)

async function onSubmit() {
  saving.value = true
  try {
    await authStore.updateCurrentUser({ name: state.name, username: state.username, bio: state.bio })
    toast.add({ title: 'Profile updated', color: 'success' })
  }
  catch (err: unknown) {
    const e = err as { data?: { statusMessage?: string } }
    toast.add({ title: 'Update failed', description: e?.data?.statusMessage ?? 'Unknown error', color: 'error' })
  }
  finally {
    saving.value = false
  }
}

async function onAvatarChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file)
    return
  if (file.size > 2 * 1024 * 1024) {
    toast.add({ title: 'Avatar must be ≤ 2MB', color: 'error' })
    return
  }
  uploadingAvatar.value = true
  try {
    await authStore.updateAvatar(file)
    toast.add({ title: 'Avatar updated', color: 'success' })
  }
  catch (err: unknown) {
    const e = err as { data?: { statusMessage?: string } }
    toast.add({ title: 'Upload failed', description: e?.data?.statusMessage ?? 'Unknown error', color: 'error' })
  }
  finally {
    uploadingAvatar.value = false
    if (fileInput.value)
      fileInput.value.value = ''
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
      <UFormField name="avatar" label="Avatar" description="PNG, JPEG, GIF or WEBP. Max 2MB." class="flex max-sm:flex-col justify-between sm:items-center gap-4">
        <div class="flex items-center gap-3">
          <UAvatar
            :src="authStore.currentUser?.avatar ?? undefined"
            :alt="authStore.currentUser?.name ?? ''"
            size="lg"
          />
          <UButton
            label="Change"
            icon="i-lucide-upload"
            variant="outline"
            :loading="uploadingAvatar"
            @click="fileInput?.click()"
          />
          <input
            ref="fileInput"
            type="file"
            accept="image/png,image/jpeg,image/gif,image/webp"
            class="hidden"
            @change="onAvatarChange"
          >
        </div>
      </UFormField>
      <USeparator />
      <UFormField name="bio" label="Bio" description="Brief description for your profile." class="flex max-sm:flex-col justify-between items-start gap-4">
        <UTextarea v-model="state.bio" :rows="4" autoresize class="w-full" />
      </UFormField>
    </UPageCard>
  </UForm>
</template>
