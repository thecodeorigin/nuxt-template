<script setup lang="ts">
import { register } from 'swiper/element/bundle'
import { z } from 'zod'

import { PerfectScrollbar } from 'vue3-perfect-scrollbar'
import type { CustomerReview, CustomerReviewSectionType, DrawerConfig } from '@/types/landing-page'

register()

const { customerReviewData } = storeToRefs(useLandingPageStore())

const DRAWER_ACTION_TYPES = {
  ADD: 'add' as const,
  EDIT: 'edit' as const,
  DELETE: 'delete' as const,
}

export type DrawerActionTypes = typeof DRAWER_ACTION_TYPES[keyof typeof DRAWER_ACTION_TYPES] | undefined

const tiptapTitleInput = ref<string>('')
const tiptapDescriptionInput = ref<string>('')
const reviewForm = ref<CustomerReviewSectionType>({
  customer_review_title: '',
  customer_review_title_desc: '',
  customer_review_data: [
    {
      id: '',
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
const reviewerData = ref<CustomerReview>({
  id: '',
  desc: '',
  main_logo: null,
  logo_dark: null,
  logo_light: null,
  name: '',
  position: '',
  rating: 0,
})

function clearReviewerData() {
  reviewerData.value = {
    id: '',
    desc: '',
    main_logo: null,
    logo_dark: null,
    logo_light: null,
    name: '',
    position: '',
    rating: 0,
  }
}
const isLoading = ref(false)

const reviewerList = computed(() => reviewForm.value?.customer_review_data)

const reviewerDrawerOption = ref<DrawerConfig>({
  isVisible: false,
  type: DRAWER_ACTION_TYPES.ADD,
})

type FormSchemaType = z.infer<typeof customerReviewSchema>
const error = ref<z.ZodFormattedError<FormSchemaType> | null>(null)

function onTitleUpdate(editorValue: string) {
  return tiptapTitleInput.value = removeEmptyTags(editorValue)
}

function onDescriptionUpdate(editorValue: string) {
  return tiptapDescriptionInput.value = removeEmptyTags(editorValue)
}

function handleOpenEditDrawer(ReviewId: string) {
  const foundReviewer = reviewerList.value?.find((reviewer: CustomerReview) => reviewer.id === ReviewId)
  if (!foundReviewer)
    return false

  reviewerData.value = foundReviewer

  reviewerDrawerOption.value = {
    isVisible: true,
    type: DRAWER_ACTION_TYPES.EDIT,
  }
}

function handleOpenAddDrawer() {
  reviewerDrawerOption.value = {
    isVisible: true,
    type: DRAWER_ACTION_TYPES.ADD,
  }

  clearReviewerData()
}

function handleReviewerChange(value: CustomerReview, type: DrawerActionTypes) {
  if (reviewForm.value && type === DRAWER_ACTION_TYPES.EDIT) {
    reviewForm.value.customer_review_data = reviewForm.value?.customer_review_data?.map(
      (reviewer: CustomerReview) => {
        if (reviewer.id === value.id) {
          return value
        }
        return reviewer
      },
    ) || []
  }
  else if (reviewForm.value && type === DRAWER_ACTION_TYPES.ADD) {
    reviewForm.value.customer_review_data = [
      ...reviewForm.value?.customer_review_data || [],
      value,
    ]
  }
  else if (reviewForm.value && type === DRAWER_ACTION_TYPES.DELETE) {
    reviewForm.value.customer_review_data = reviewForm.value?.customer_review_data?.filter(
      (reviewer: CustomerReview) => reviewer.id !== value.id,
    ) || []
  }
}

function handleToggleReviewerDrawer(val: boolean) {
  reviewerDrawerOption.value.isVisible = val
}

async function onSubmit() {
  const formData = {
    ...reviewForm.value,
    customer_review_title: tiptapTitleInput.value,
    customer_review_title_desc: tiptapDescriptionInput.value,
  }

  const validInput = customerReviewSchema.safeParse(formData)

  if (!validInput.success) {
    error.value = validInput.error.format()
    notify('Invalid input, please check and try again', {
      type: 'error',
      timeout: 5000,
    })
  }
  else {
    error.value = null
    isLoading.value = true

    try {
      await $api<CustomerReviewSectionType>('/api/pages/landing-page/customer-review', {
        method: 'PATCH',
        body: reviewForm.value,
      })

      notify('Customer Review updated successfully', {
        type: 'success',
        timeout: 2000,
      })
    }
    catch (e) {
      if (e instanceof z.ZodError) {
        console.log(e.errors.map(err => err.message).join('\n'))
      }
      else {
        console.log('Unexpected error: ', e)
      }
    }
    finally {
      isLoading.value = false
    }
  }
}

watch(customerReviewData, (value) => {
  reviewForm.value = {
    customer_review_title: value?.customer_review_title ? removeEmptyTags(value.customer_review_title) : '',
    customer_review_title_desc: value?.customer_review_title_desc ? removeEmptyTags(value.customer_review_title_desc as string) : '',
    customer_review_data: [
      ...value?.customer_review_data?.map(review => ({
        ...review,
        rating: Number(review.rating),
      })) || [],
    ],
  }

  tiptapTitleInput.value = reviewForm.value.customer_review_title
  tiptapDescriptionInput.value = reviewForm.value.customer_review_title_desc as string
}, {
  immediate: true,
  deep: true,
})
</script>

<template>
  <form class="customer-reviews" @submit.prevent="onSubmit">
    <VLabel class="text-h3 text-capitalize text-primary font-weight-bold mb-4  d-block label">
      Customer Review Section
    </VLabel>

    <div class="d-flex flex-column gap-4">
      <VRow>
        <!-- 👉 Review Heading -->
        <VCol cols="12" md="4">
          <VCard class="pa-4">
            <VCardTitle class="text-center mb-4">
              Customer heading
            </VCardTitle>

            <!-- 👉 Review Main Title -->
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

            <!-- 👉 Review Main Description -->
            <div class="mb-6 position-relative">
              <VLabel class="mb-2 label">
                Review:
                <VIcon icon="ri-asterisk" class="text-error text-overline mb-2" />
              </VLabel>
              <TiptapEditor
                v-model="reviewForm.customer_review_title_desc as string"
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

        <!-- 👉 Reviewers -->
        <VCol cols="12" md="8">
          <VCard class="pa-4 h-100 customer-reviews-container">
            <VCardTitle class="text-center mb-4">
              Customer reviews
            </VCardTitle>

            <PerfectScrollbar
              :options="{ wheelPropagation: false, suppressScrollX: true, swipeEasing: true }"
              style="padding: 16px;
                max-height: 490px;"
            >
              <VRow>
                <VCol cols="12" md="6" lg="4">
                  <VCard class="add-card d-flex justify-center align-center pa-2" hover height="100%" ripple @click="handleOpenAddDrawer">
                    <VIcon icon="ri-add-circle-line" size="40" />
                  </VCard>
                </VCol>

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
                  </VCard>
                </VCol>
              </VRow>
            </PerfectScrollbar>
          </VCard>
        </VCol>
      </VRow>

      <!-- 👉 Reviewer Button Submit -->
      <div class="w-100 d-flex justify-center align-center">
        <VBtn
          v-if="isLoading === false"
          class="mx-auto w-100"
          type="submit"
          color="primary"
          variant="outlined"
          @click="onSubmit"
        >
          Update Reviewer Section Content
        </VBtn>

        <VBtn
          v-else
          class="mx-auto w-100"
          type="submit"
          color="primary"
          variant="outlined"
        >
          <VProgressCircular
            indeterminate
            color="primary"
            size="24"
          />
        </VBtn>
      </div>
    </div>
  </form>

  <LandingPageReviewerDrawer
    v-model="reviewerData"
    :drawer-config="reviewerDrawerOption" @update:is-drawer-open="handleToggleReviewerDrawer"
    @update:model-value="handleReviewerChange"
  />
</template>

<style lang="scss" scoped>
.rating-container {
  transform: scale(0.6);
}

.review-card {
  min-width: 30px;
  min-height: 180px;
  cursor: pointer;
  &:hover {
    background-color: rgba(var(--v-theme-on-surface), var(--v-hover-opacity));
  }
}

.add-card{
  cursor: pointer;
  border: 1px dashed rgba(var(--v-theme-on-surface), 0.12);
  min-height: 180px;
  &:hover {
    background-color: rgba(var(--v-theme-on-surface), var(--v-hover-opacity));
  }
}

.title-content {
  :deep(.ProseMirror) {
    min-block-size: 5vh;
  }
}
</style>
