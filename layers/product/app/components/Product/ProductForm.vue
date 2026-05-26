<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui'
import { z } from 'zod'
import { PRODUCT_CURRENCIES } from '#layers/product/shared/schemas/product'

const props = defineProps<{
  initialValues?: Partial<{
    name: string
    description: string
    type: 'one_time' | 'recurring'
    price: number
    price_currency: string
    billing_interval: 'month' | 'year' | null
    status: 'active' | 'inactive'
  }>
  loading?: boolean
}>()

const emit = defineEmits<{
  submit: [values: z.output<typeof schema>]
  cancel: []
}>()

const schema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  description: z.string().max(2000).optional(),
  type: z.enum(['one_time', 'recurring']),
  price: z.number().int().min(0, 'Price must be non-negative'),
  price_currency: z.enum(PRODUCT_CURRENCIES),
  billing_interval: z.enum(['month', 'year']).optional(),
  status: z.enum(['active', 'inactive']),
})

type Schema = z.output<typeof schema>

const state = reactive<Partial<Schema>>({
  name: props.initialValues?.name ?? '',
  description: props.initialValues?.description ?? '',
  type: props.initialValues?.type ?? 'one_time',
  price: props.initialValues?.price ?? 0,
  price_currency: (props.initialValues?.price_currency as typeof PRODUCT_CURRENCIES[number]) ?? 'USD',
  billing_interval: props.initialValues?.billing_interval ?? undefined,
  status: props.initialValues?.status ?? 'active',
})

const typeOptions = [
  { label: 'One-time', value: 'one_time' },
  { label: 'Recurring', value: 'recurring' },
]

const intervalOptions = [
  { label: 'Monthly', value: 'month' },
  { label: 'Yearly', value: 'year' },
]

const statusOptions = [
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
]

const currencyOptions = PRODUCT_CURRENCIES.map(c => ({ label: c, value: c }))

watch(() => state.type, (type) => {
  if (type === 'one_time')
    state.billing_interval = undefined
})

function onSubmit(event: FormSubmitEvent<Schema>) {
  emit('submit', event.data)
}
</script>

<template>
  <UForm :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
    <UFormField label="Name" name="name" required>
      <UInput v-model="state.name" placeholder="Product name" class="w-full" />
    </UFormField>

    <UFormField label="Description" name="description">
      <UTextarea v-model="state.description" placeholder="Optional description" :rows="3" class="w-full" />
    </UFormField>

    <div class="grid grid-cols-2 gap-4">
      <UFormField label="Type" name="type" required>
        <USelect v-model="state.type" :items="typeOptions" value-key="value" label-key="label" class="w-full" />
      </UFormField>

      <UFormField v-if="state.type === 'recurring'" label="Billing Interval" name="billing_interval" required>
        <USelect v-model="state.billing_interval" :items="intervalOptions" value-key="value" label-key="label" class="w-full" />
      </UFormField>
    </div>

    <div class="grid grid-cols-2 gap-4">
      <UFormField label="Price" name="price" required>
        <UInput v-model.number="state.price" type="number" min="0" placeholder="0" class="w-full" />
      </UFormField>

      <UFormField label="Currency" name="price_currency" required>
        <USelect v-model="state.price_currency" :items="currencyOptions" value-key="value" label-key="label" class="w-full" />
      </UFormField>
    </div>

    <UFormField label="Status" name="status" required>
      <USelect v-model="state.status" :items="statusOptions" value-key="value" label-key="label" class="w-full" />
    </UFormField>

    <div class="flex justify-end gap-2">
      <UButton color="neutral" variant="ghost" label="Cancel" @click="emit('cancel')" />
      <UButton type="submit" label="Save" :loading="loading" />
    </div>
  </UForm>
</template>
