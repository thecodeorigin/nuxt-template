<script setup lang="ts">
import type { HelpCenterArticlesOverview } from '@db/pages/help-center/types'

interface Props {
  articles: HelpCenterArticlesOverview[]
}

const props = defineProps<Props>()
</script>

<template>
  <VRow>
    <VCol
      v-for="article in props.articles"
      :key="article.title"
      cols="12"
      md="4"
    >
      <VCard
        flat
        border
      >
        <VCardText class="align-center text-center d-flex flex-column gap-3">
          <VImg
            :src="article.img"
            alt="images"
            height="58"
            width="58"
          />
          <h5 class="text-h5">
            {{ article.title }}
          </h5>
          <p class="clamp-text text-body-1 mb-0 mx-auto">
            {{ article.subtitle }}
          </p>

          <VBtn
            variant="outlined"
            :to="{
              name: 'front-pages-help-center-article-title',
              params: {
                title: 'how-to-add-product-in-cart',
              },

            }"
          >
            Read More
          </VBtn>
        </VCardText>
      </VCard>
    </VCol>
  </VRow>
</template>

<style lang="scss">
.help-center-article-icon svg {
  block-size: 58px;
  inline-size: 58px;
}
</style>
