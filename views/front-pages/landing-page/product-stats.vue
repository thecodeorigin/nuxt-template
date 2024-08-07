<script setup lang="ts">
const store = useLandingPageStore()
const { productStatsData } = storeToRefs(store)

const hoverState: Ref<boolean[]> = ref([])

// Watch for changes in productStatsData and update hoverState accordingly
watch(productStatsData, (newProductStatsData) => {
  if (newProductStatsData?.product_stats) {
    hoverState.value = Array(newProductStatsData.product_stats.length).fill(false)
  }
}, { immediate: true })

function handleMouseEnter(index: number) {
  hoverState.value[index] = true
}

function handleMouseLeave(index: number) {
  hoverState.value[index] = false
}
</script>

<template>
  <div :style="{ 'background-color': 'rgb(var(--v-theme-surface))' }">
    <VContainer>
      <div class="py-12">
        <VRow>
          <VCol
            v-for="(product, index) in productStatsData?.product_stats"
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
                    :icon="product.icon"
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
