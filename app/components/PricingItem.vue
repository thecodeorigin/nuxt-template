<script setup lang="ts">
withDefaults(
  defineProps<{
    index?: number
    orientation?: 'horizontal' | 'vertical'
    highlight?: boolean
    product: Product
  }>(),
  {
    orientation: 'vertical',
  },
)

const emit = defineEmits<{
  (e: 'buy', payload: string): void
  (e: 'contact'): void
}>()

function handleContact() {
  emit('contact')
}

async function handleBuyCredit(productId: string) {
  emit('buy', productId)
}
</script>

<template>
  <UPricingPlan
    :orientation="orientation"
    :title="product.title || ''"
    :description="product.description || ''"
    :scale="highlight"
    :highlight="highlight"
    :badge="highlight ? { label: $t('Most popular') } : undefined"
    :price="product.amount ? `${product.amount} credits` : $t('Contact us')"
    :billing-cycle="product.amount ? '/month' : ''"
    :features="product.features || []"
    :button="
      product.price
        ? {
          label: $t('Buy credits & Start'),
          variant: 'solid',
          onClick: () => handleBuyCredit(product.id),
        } : {
          label: $t('Contact us'),
          variant: 'solid',
          onClick: () => handleContact(),
        }"
  />
</template>
