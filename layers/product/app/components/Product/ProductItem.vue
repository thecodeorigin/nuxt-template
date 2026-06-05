<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'
import type { Product } from '@nuxthub/db/schema'

const props = defineProps<{ product: Product }>()
const emit = defineEmits<{ edit: [Product], delete: [Product] }>()

const formattedPrice = computed(() =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: props.product.price_currency,
    minimumFractionDigits: 0,
  }).format(props.product.price),
)

const intervalLabel = computed(() => {
  if (props.product.type === 'one_time')
    return 'One-time'
  return props.product.billing_interval === 'month' ? '/month' : '/year'
})

const menuItems: DropdownMenuItem[][] = [
  [
    { label: 'Edit', icon: 'i-lucide-pencil', onSelect: () => emit('edit', props.product) },
    { label: 'Delete', icon: 'i-lucide-trash-2', color: 'error' as const, onSelect: () => emit('delete', props.product) },
  ],
]
</script>

<template>
  <div
    class="flex items-center justify-between p-4 bg-elevated rounded-lg border border-default hover:cursor-pointer hover:bg-elevated/50"
    @click.stop="emit('edit', product)"
  >
    <div class="flex-1 min-w-0">
      <div class="flex items-center gap-2">
        <span class="font-medium text-highlighted truncate">{{ product.name }}</span>
        <UBadge
          :color="product.status === 'active' ? 'success' : 'neutral'"
          variant="subtle"
          size="xs"
        >
          {{ product.status }}
        </UBadge>
      </div>

      <p v-if="product.description" class="text-sm text-muted mt-0.5 truncate">
        {{ product.description }}
      </p>

      <p class="text-sm text-highlighted font-semibold mt-1">
        {{ formattedPrice }}
        <span class="text-muted font-normal">{{ intervalLabel }}</span>
      </p>
    </div>
    <UDropdownMenu :items="menuItems" class="hover:cursor-pointer hover:bg-secondary/10">
      <UButton icon="i-lucide-ellipsis-vertical" color="neutral" variant="ghost" size="sm" />
    </UDropdownMenu>
  </div>
</template>
