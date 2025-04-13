<script setup lang="ts">
withDefaults(
  defineProps<{
    index?: number
    orientation?: 'horizontal' | 'vertical'
    highlight?: boolean
    creditPackage: CreditPackage
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
    :title="creditPackage.title || ''"
    :description="creditPackage.description || ''"
    :scale="highlight"
    :highlight="highlight"
    :badge="highlight ? { label: $t('Most popular') } : undefined"
    :price="Number(creditPackage.amount) ? `${creditPackage.amount} credits` : $t('Contact us')"
    :billing-cycle="Number(creditPackage.amount) ? '/month' : ''"
    :features="creditPackage.features || []"
    :button="
      Number(creditPackage.price)
        ? {
          label: $t('Buy credits & Start'),
          variant: 'solid',
          onClick: () => handleBuyCredit(creditPackage.id),
        } : {
          label: $t('Contact us'),
          variant: 'solid',
          onClick: () => handleContact(),
        }"
  />
</template>
