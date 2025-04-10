<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

const fileRef = ref<HTMLInputElement>()

const profileSchema = z.object({
  name: z.string().min(2, 'Name has to be at least 2 characters'),
  email: z.string().email('Email has to be valid'),
  username: z.string().min(2, 'Username has to be at least 2 characters'),
  avatar: z.string().optional(),
})

type ProfileSchema = z.output<typeof profileSchema>

const currentUser = useLogtoUser()

const formData = ref({
  name: 'Benjamin Canac',
  email: 'ben@nuxtlabs.com',
  username: 'benjamincanac',
  avatar: '',
})

syncRef(computed(() => currentUser), formData, {
  direction: 'ltr',
  transform: {
    ltr(left) {
      return {
        name: left?.name,
        email: left?.email,
        username: left?.username,
        avatar: left?.image,
      }
    },
  },
})

const toast = useToast()
const authApi = useApiAuth()

async function onSubmit(event: FormSubmitEvent<ProfileSchema>) {
  try {
    await authApi.updateProfile(event.data)

    toast.add({ title: 'Profile updated', icon: 'i-lucide-circle-check' })
  }
  catch {
    toast.add({ title: 'Error updating profile', icon: 'i-lucide-circle-x', color: 'error' })
  }
}

function onFileChange(e: Event) {
  const input = e.target as HTMLInputElement

  if (!input.files?.length) {
    return
  }

  formData.value.avatar = URL.createObjectURL(input.files[0]!)
}

function onFileClick() {
  fileRef.value?.click()
}
</script>

<template>
  <UForm
    id="settings"
    :schema="profileSchema"
    :state="formData"
    @submit="onSubmit"
  >
    <UPageCard
      :title="$t('Profile')"
      :description="$t('These informations will be displayed publicly.')"
      variant="naked"
      orientation="horizontal"
      class="mb-4"
    >
      <UButton
        form="settings"
        :label="$t('Save changes')"
        color="neutral"
        type="submit"
        class="w-fit lg:ms-auto"
      />
    </UPageCard>

    <UPageCard variant="subtle">
      <UFormField
        name="name"
        :label="$t('Name')"
        :description="$t('Will appear on receipts, invoices, and other communication.')"
        required
        class="flex max-sm:flex-col justify-between items-start gap-4"
      >
        <UInput
          v-model="formData.name"
          autocomplete="off"
        />
      </UFormField>
      <USeparator />
      <UFormField
        name="email"
        label="Email"
        :description="$t('Used to sign in, for email receipts and product updates.')"
        required
        class="flex max-sm:flex-col justify-between items-start gap-4"
      >
        <UInput
          v-model="formData.email"
          type="email"
          autocomplete="off"
        />
      </UFormField>
      <USeparator />
      <UFormField
        name="username"
        label="Username"
        :description="$t('Your unique username for logging in and your profile URL.')"
        required
        class="flex max-sm:flex-col justify-between items-start gap-4"
      >
        <UInput
          v-model="formData.username"
          type="username"
          autocomplete="off"
        />
      </UFormField>
      <USeparator />
      <UFormField
        name="avatar"
        :label="$t('Avatar')"
        description="JPG, GIF or PNG. 1MB Max."
        class="flex max-sm:flex-col justify-between sm:items-center gap-4"
      >
        <div class="flex flex-wrap items-center gap-3">
          <UAvatar
            :src="formData.avatar"
            :alt="formData.name"
            size="lg"
          />
          <UButton
            :label="$t('Choose')"
            color="neutral"
            @click="onFileClick"
          />
          <input
            ref="fileRef"
            type="file"
            class="hidden"
            accept=".jpg, .jpeg, .png, .gif"
            @change="onFileChange"
          >
        </div>
      </UFormField>
    </UPageCard>
  </UForm>
</template>
