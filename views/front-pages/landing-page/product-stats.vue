<script setup lang="ts">
import { kFormatter } from '@core/utils/formatters.js'
import type { ProductStatType } from '~/utils/types/landing-page'
import { iconMappings } from '@/utils/landingPageUtils.js'

const store = useLandingPageStore()
const { productStatsData } = storeToRefs(store)

const hoverState: Ref<boolean[]> = ref([])

const productStatList = computed<ProductStatType[]>(() => {
  return productStatsData.value?.product_stats
})

function handleMouseEnter(index: number) {
  hoverState.value[index] = true
}

function handleMouseLeave(index: number) {
  hoverState.value[index] = false
}

watch(productStatsData, (newProductStatsData) => {
  if (newProductStatsData?.product_stats) {
    hoverState.value = Array(productStatList.value.length).fill(false)
  }
}, { immediate: true })
</script>

<template>
  <div v-if="productStatList" :style="{ 'background-color': 'rgb(var(--v-theme-surface))' }">
    <VContainer>
      <div class="py-12">
        <VRow>
          <VCol
            v-for="(product, index) in productStatList"
            :key="index"
          >
            <VCard flat>
              <VCardText class="text-center">
                <VAvatar
                  size="82"
                  :color="product.color"
                  :variant="hoverState[index] === true ? 'elevated' : 'tonal'"
                  class="mb-6 cursor-pointer"
                  @mouseenter="() => handleMouseEnter(index)"
                  @mouseleave="() => handleMouseLeave(index)"
                >
                  <VIcon
                    v-if="product.icon"
                    :icon="iconMappings[product.icon]"
                    size="42"
                  />
                </VAvatar>
                <div class="product-stat-text">
                  {{ kFormatter(product.value) }}+
                </div>
                <div class="text-body-1 font-weight-medium">
                  {{ product.title }}
                </div>
              </VCardText>
            </VCard>
          </VCol>
        </VRow>
      </div>
    </VContainer>
  </div>
</template>

<style lang="scss" scoped>
.product-stat-text{
  color: rgba(var(--v-theme-on-surface), var(--v-high-emphasis-opacity));
  font-size: 34px;
  font-weight: 700;
  letter-spacing: 0.25px;
  line-height: 42px;
}
</style>
