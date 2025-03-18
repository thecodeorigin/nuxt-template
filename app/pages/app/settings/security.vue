<script setup lang="ts">
import * as z from 'zod'
import type { FormError, FormSubmitEvent } from '@nuxt/ui'

const passwordSchema = z.object({
  password: z.string().min(8, 'Must be at least 8 characters'),
  password_new: z.string().min(8, 'Must be at least 8 characters'),
})

type PasswordSchema = z.output<typeof passwordSchema>

const formData = reactive<Partial<PasswordSchema>>({
  password: undefined,
  password_new: undefined,
})

function validate(state: Partial<PasswordSchema>): FormError[] {
  const errors: FormError[] = []

  if (state.password && state.password_new && state.password === state.password_new) {
    errors.push({ name: 'password_new', message: 'Passwords must be different' })
  }

  return errors
}

const authApi = useApiAuth()

const toast = useToast()

async function onSubmit(event: FormSubmitEvent<PasswordSchema>) {
  try {
    await authApi.updatePassword(event.data)

    toast.add({ title: 'Profile updated', icon: 'i-heroicons-check-circle' })
  }
  catch (error) {
    console.log(error)
    toast.add({ title: 'Error updating profile', icon: 'i-heroicons-x-circle', color: 'error' })
  }
}
</script>

<template>
  <UPageCard
    title="Password"
    description="Confirm your password password before setting a new one."
    variant="subtle"
  >
    <UForm
      :schema="passwordSchema"
      :state="formData"
      :validate="validate"
      class="flex flex-col gap-4 max-w-xs"
      @submit="onSubmit"
    >
      <UFormField name="password">
        <UInput
          v-model="formData.password"
          type="password"
          placeholder="Current password"
          class="w-full"
        />
      </UFormField>

      <UFormField name="password_new">
        <UInput
          v-model="formData.password_new"
          type="password"
          placeholder="New password"
          class="w-full"
        />
      </UFormField>

      <UButton label="Update" class="w-fit" type="submit" />
    </UForm>
  </UPageCard>
</template>
