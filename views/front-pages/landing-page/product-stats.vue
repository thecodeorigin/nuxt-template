<script setup lang="ts">
import type { Ref } from 'vue'
import { ref } from 'vue'
import type { ProductStatsSectionType } from '@/types/landing-page'

const props = defineProps({
  data: {
    type: Object as PropType<ProductStatsSectionType>,
  },
})

const hoverState: Ref<boolean[]> = ref(Array(props.data?.product_stats.length).fill(false))

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
            v-for="(product, index) in data?.product_stats"
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
