<script setup lang="ts">
import type { Product } from '#layers/product/server/db/schema'
import ProductItem from '#layers/product/app/components/Product/ProductItem.vue'

defineProps<{
  products: Product[]
  loading?: boolean
}>()

const emit = defineEmits<{ edit: [Product], delete: [Product] }>()
</script>

<template>
  <div>
    <div v-if="loading" class="space-y-3">
      <USkeleton v-for="i in 3" :key="i" class="h-20 rounded-lg" />
    </div>
    <div v-else-if="products.length === 0" class="text-center py-12 text-muted">
      <UIcon name="i-lucide-package" class="size-10 mx-auto mb-3 opacity-40" />
      <p>No products yet</p>
    </div>
    <div v-else class="space-y-3">
      <ProductItem
        v-for="product in products"
        :key="product.id"
        :product="product"
        @edit="emit('edit', $event)"
        @delete="emit('delete', $event)"
      />
    </div>
  </div>
</template>
