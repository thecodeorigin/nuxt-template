<script setup lang="ts">
import { register } from 'swiper/element/bundle'
import logo1dark from '@images/front-pages/branding/logo-1-dark.png'
import logo1light from '@images/front-pages/branding/logo-1-light.png'
import logo1 from '@images/front-pages/branding/logo-1.png'
import logo2dark from '@images/front-pages/branding/logo-2-dark.png'
import logo2light from '@images/front-pages/branding/logo-2-light.png'
import logo2 from '@images/front-pages/branding/logo-2.png'
import logo3dark from '@images/front-pages/branding/logo-3-dark.png'
import logo3light from '@images/front-pages/branding/logo-3-light.png'
import logo3 from '@images/front-pages/branding/logo-3.png'
import logo4dark from '@images/front-pages/branding/logo-4-dark.png'
import logo4light from '@images/front-pages/branding/logo-4-light.png'
import logo4 from '@images/front-pages/branding/logo-4.png'
import logo5dark from '@images/front-pages/branding/logo-5-dark.png'
import logo5light from '@images/front-pages/branding/logo-5-light.png'

import type { z } from 'zod'

import sectionTitleIcon from '@images/pages/section-title-icon.png'
import { VTextField } from 'vuetify/components'
import { useGenerateImageVariant } from '@/@core/composable/useGenerateImageVariant'
import type { CustomerReviewSectionType } from '@/types/landing-page'

register()

const { customerReviewData } = storeToRefs(useLandingPageStore())
const tiptapTitleInput = ref<string>('')
const tiptapDescriptionInput = ref<string>('')
const isLoading = ref(false)
const reviewerDrawerOption = ref({
  isVisible: false,
  type: 'edit',
})

const reviewForm = ref<CustomerReviewSectionType>({
  customer_review_title: '',
  customer_review_title_desc: '',
  customer_review_data: [
    {
      id: null,
      desc: '',
      main_logo: '',
      logo_dark: '',
      logo_light: '',
      name: '',
      position: '',
      rating: 0,
    },
  ],
})

type FormSchemaType = z.infer<typeof customerReviewSchema>
const error = ref<z.ZodFormattedError<FormSchemaType> | null>(null)

function onTitleUpdate(editorValue: string) {
  return tiptapTitleInput.value = removeEmptyTags(editorValue)
}

function onDescriptionUpdate(editorValue: string) {
  return tiptapDescriptionInput.value = removeEmptyTags(editorValue)
}

const brandLogo1 = useGenerateImageVariant(logo1light, logo1dark)
const brandLogo2 = useGenerateImageVariant(logo2light, logo2dark)
const brandLogo3 = useGenerateImageVariant(logo3light, logo3dark)
const brandLogo4 = useGenerateImageVariant(logo4light, logo4dark)
const brandLogo5 = useGenerateImageVariant(logo5light, logo5dark)

async function onSubmit() {

}

function handleOpenEditDrawer(ReviewId: string) {
  reviewerDrawerOption.value = {
    isVisible: true,
    type: 'edit',
  }
}

function handleOpenAddDrawer() {
  reviewerDrawerOption.value = {
    isVisible: true,
    type: 'add',
  }
}

watch(customerReviewData, (value) => {
  reviewForm.value = {
    customer_review_title: value?.customer_review_title ? removeEmptyTags(value.customer_review_title) : '',
    customer_review_title_desc: value?.customer_review_title_desc ? removeEmptyTags(value.customer_review_title_desc) : '',
    customer_review_data: [
      ...value?.customer_review_data || [],
    ],
  }

  tiptapTitleInput.value = reviewForm.value.customer_review_title
  tiptapDescriptionInput.value = reviewForm.value.customer_review_title_desc
}, {
  immediate: true,
  deep: true,
})
</script>

<template>
  <div>
    <form class="customer-reviews" @submit.prevent="onSubmit">
      <VLabel class="text-h3 text-capitalize text-primary font-weight-bold mb-4  d-block label">
        Customer Review Section
      </VLabel>

      <div class="d-flex flex-column gap-4">
        <VRow>
          <!-- 👉 Review Heading -->
          <VCol cols="12" md="6">
            <VCard class="pa-4">
              <VCardTitle class="text-center mb-4">
                Customer page heading
              </VCardTitle>

              <!-- 👉 Hero Main Title -->
              <div class="mb-6 position-relative">
                <VLabel class="mb-2 label">
                  Review title:
                  <VIcon icon="ri-asterisk" class="text-error text-overline mb-2" />
                </VLabel>

                <TiptapEditor
                  v-model="reviewForm.customer_review_title"
                  class="border rounded-lg title-content"
                  :class="{ 'border-error border-opacity-100': error?.customer_review_title && tiptapTitleInput.length === 0 }"
                  placeholder="Text here..."
                  @update:model-value="onTitleUpdate"
                />

                <div v-if="error?.customer_review_title && tiptapTitleInput.length === 0">
                  <span v-for="(warn, index) in error?.customer_review_title?._errors" :key="index" class="text-error error-text">
                    {{ warn }}
                  </span>
                </div>
              </div>

              <!-- 👉 Hero Main Description -->
              <div class="mb-6 position-relative">
                <VLabel class="mb-2 label">
                  Review:
                  <VIcon icon="ri-asterisk" class="text-error text-overline mb-2" />
                </VLabel>
                <TiptapEditor
                  v-model="reviewForm.customer_review_title_desc"
                  class="border rounded-lg "
                  :class="{ 'border-error border-opacity-100': error?.customer_review_title_desc && tiptapDescriptionInput.length === 0 }"
                  placeholder="Text here..."
                  @update:model-value="onDescriptionUpdate"
                />

                <div v-if="error?.customer_review_title_desc && tiptapDescriptionInput.length === 0">
                  <span v-for="(warn, index) in error?.customer_review_title_desc?._errors" :key="index" class="text-error error-text">
                    {{ warn }}
                  </span>
                </div>
              </div>
            </VCard>
          </VCol>

          <VCol cols="12" md="6">
            <VCard class="pa-4">
              <VCardTitle class="text-center mb-4">
                Customer reviews
              </VCardTitle>

              <VRow>
                <VCol v-for="(review, index) in reviewForm.customer_review_data" :key="index" cols="12" md="6" lg="4" @click="handleOpenEditDrawer(review.id)">
                  <VCard class="review-card d-flex flex-column align-center pa-2" hover min-width="100" max-height="200" ripple>
                    <VCardTitle class="text-center mb-4 d-flex flex-column">
                      {{ review.name }}

                      <span class="text-body-2">
                        {{ review.position }}
                      </span>
                    </VCardTitle>

                    <VImg
                      v-if="review.main_logo"
                      :src="review.main_logo"
                      class="rounded-circle"
                      cover
                    />

                    <VAvatar
                      variant="outlined"
                      size="40"
                      color="primary"
                    />

                    <VCardText>
                      <VRating
                        :model-value="review.rating"
                        color="warning"
                        readonly
                        class="rating-container"
                      />
                    </VCardText>
                  </VCard>
                </VCol>

                <VCol cols="12" md="6" lg="4">
                  <VCard class="add-card d-flex justify-center align-center pa-2" hover height="100%" ripple @click="handleOpenAddDrawer">
                    <VIcon icon="ri-add-circle-line" size="40" />
                  </VCard>
                </VCol>
              </VRow>
            </VCard>
          </VCol>
        </VRow>
      </div>
    </form>

    <LandingPageAddReviewerDrawer :is-drawer-open="reviewerDrawerOption.isVisible" @update:is-drawer-open="reviewerDrawerOption.isVisible = $event" />
  </div>
</template>

<style lang="scss" scoped>
.rating-container {
  transform: scale(0.6);
}

.review-card {
  min-width: 30px;
  cursor: pointer;
  &:hover {
    background-color: rgba(var(--v-theme-on-surface), var(--v-hover-opacity));
  }
}

.add-card{
  cursor: pointer;
  border: 1px dashed rgba(var(--v-theme-on-surface), 0.12);
  &:hover {
    background-color: rgba(var(--v-theme-on-surface), var(--v-hover-opacity));
  }
}
</style>
