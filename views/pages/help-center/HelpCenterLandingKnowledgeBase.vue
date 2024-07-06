<script setup lang="ts">
import type { HelpCenterAllCategoryArticles } from '@db/pages/help-center/types'

interface Props {
  categories: HelpCenterAllCategoryArticles[]
}

const props = defineProps<Props>()
</script>

<template>
  <VRow>
    <VCol
      v-for="article in props.categories"
      :key="article.title"
      cols="12"
      sm="6"
      lg="4"
    >
      <VCard>
        <VCardItem class="pb-6">
          <div class="d-flex align-center">
            <VAvatar
              rounded
              color="primary"
              variant="tonal"
              class="me-3"
              size="32"
            >
              <VIcon
                :icon="article.icon"
                size="20"
              />
            </VAvatar>
            <VCardTitle>{{ article.title }}</VCardTitle>
          </div>
        </VCardItem>

        <VCardText>
          <VList class="card-list">
            <VListItem
              v-for="(item, index) in article.articles"
              :key="index"
            >
              <NuxtLink
                :to="{
                  name: 'front-pages-help-center-article-title',
                  params: {
                    title: 'how-to-add-product-in-cart',
                  },
                }"
                class="text-high-emphasis"
              >
                {{ item.title }}
              </NuxtLink>

              <template #append>
                <VIcon
                  icon="ri-arrow-right-s-line"
                  size="20"
                  class="text-disabled"
                />
              </template>
            </VListItem>
          </VList>

          <div class="text-base font-weight-medium mt-6 d-flex align-center gap-x-3">
            <NuxtLink
              :to="{
                name: 'front-pages-help-center-article-title',
                params: {
                  title: 'how-to-add-product-in-cart',
                },
              }"
            >
              <div class="d-flex align-center gap-x-3">
                <div>
                  See all {{ article.articles.length }} Articles
                </div>
                <VIcon
                  icon="ri-arrow-right-line"
                  size="18"
                  color="primary"
                />
              </div>
            </NuxtLink>
          </div>
        </VCardText>
      </VCard>
    </VCol>
  </VRow>
</template>

<style lang="scss">
.card-list {
  --v-card-list-gap: 0.5rem;
}
</style>
