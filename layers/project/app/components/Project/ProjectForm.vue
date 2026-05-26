<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui'
import { z } from 'zod'

const props = defineProps<{
  initialValues?: Partial<{ name: string, description: string, status: 'active' | 'archived' }>
  loading?: boolean
}>()

const emit = defineEmits<{
  submit: [values: z.output<typeof schema>]
  cancel: []
}>()

const schema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  description: z.string().max(2000).optional(),
  status: z.enum(['active', 'archived']),
})

type Schema = z.output<typeof schema>

const state = reactive<Partial<Schema>>({
  name: props.initialValues?.name ?? '',
  description: props.initialValues?.description ?? '',
  status: props.initialValues?.status ?? 'active',
})

const statusOptions = [
  { label: 'Active', value: 'active' },
  { label: 'Archived', value: 'archived' },
]

function onSubmit(event: FormSubmitEvent<Schema>) {
  emit('submit', event.data)
}
</script>

<template>
  <UForm :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
    <UFormField label="Name" name="name" required>
      <UInput v-model="state.name" placeholder="Project name" class="w-full" />
    </UFormField>

    <UFormField label="Description" name="description">
      <UTextarea v-model="state.description" placeholder="Optional description" :rows="3" class="w-full" />
    </UFormField>

    <UFormField label="Status" name="status" required>
      <USelect v-model="state.status" :items="statusOptions" value-key="value" label-key="label" class="w-full" />
    </UFormField>

    <div class="flex justify-end gap-2">
      <UButton color="neutral" variant="ghost" label="Cancel" @click="emit('cancel')" />
      <UButton type="submit" label="Save" :loading="loading" />
    </div>
  </UForm>
</template>
