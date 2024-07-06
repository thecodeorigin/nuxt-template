<script setup lang="ts">
const statData = ref([
  { title: 'Completed Sites', value: 137, icon: 'ri-layout-line', color: 'primary', isHover: false },
  { title: 'Working Hours', value: 1100, icon: 'ri-time-line', color: 'success', isHover: false },
  { title: 'Happy Customers', value: 137, icon: 'ri-user-smile-line', color: 'warning', isHover: false },
  { title: 'Awards Winning', value: 23, icon: 'ri-award-line', color: 'info', isHover: false },
])
</script>

<template>
  <div :style="{ 'background-color': 'rgb(var(--v-theme-surface))' }">
    <VContainer>
      <div class="py-12">
        <VRow>
          <VCol
            v-for="(product, index) in statData"
            :key="index"
          >
            <VCard flat>
              <VCardText class="text-center">
                <VAvatar
                  size="82"
                  :color="product.color"
                  :variant="product.isHover ? 'elevated' : 'tonal'"
                  class="mb-6 cursor-pointer"
                  @mouseenter="() => product.isHover = true"
                  @mouseleave="product.isHover = false"
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
