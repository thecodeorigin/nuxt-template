<script setup lang="ts">
import { register } from 'swiper/element/bundle'
import { z } from 'zod'

import { PerfectScrollbar } from 'vue3-perfect-scrollbar'
import { cloneDeep } from 'lodash-es'
import type { CustomerReview, CustomerReviewSectionType, DrawerConfig } from '@/types/landing-page'

register()

const { customerReviewData } = storeToRefs(useLandingPageStore())

const DRAWER_ACTION_TYPES = {
  ADD: 'add' as const,
  EDIT: 'edit' as const,
  DELETE: 'delete' as const,
}

export type DrawerActionTypes = typeof DRAWER_ACTION_TYPES[keyof typeof DRAWER_ACTION_TYPES] | undefined

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

const reviewerList = computed<CustomerReview[]>(() => reviewForm.value?.customer_review_data || [])

const reviewerDrawerOption = ref<DrawerConfig>({
  isVisible: false,
  type: DRAWER_ACTION_TYPES.ADD,
})

type FormSchemaType = z.infer<typeof customerReviewSchema>
const error = ref<z.ZodFormattedError<FormSchemaType> | null>(null)

function onTitleUpdate(editorValue: string) {
  return reviewForm.value.customer_review_title = removePTags(editorValue)
}

function onDescriptionUpdate(editorValue: string) {
  return reviewForm.value.customer_review_title_desc = removePTags(editorValue)
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
    reviewForm.value.customer_review_data = reviewerList.value.map(
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
      ...reviewerList.value || [],
      value,
    ]
  }
  else if (reviewForm.value && type === DRAWER_ACTION_TYPES.DELETE) {
    reviewForm.value.customer_review_data = reviewerList.value.filter(
      (reviewer: CustomerReview) => reviewer.id !== value.id,
    ) || []
  }
}

function handleToggleReviewerDrawer(val: boolean) {
  reviewerDrawerOption.value.isVisible = val
}

async function onSubmit() {
  const validInput = customerReviewSchema.safeParse(reviewForm.value)

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
      const res = await $api('/api/pages/landing-page/customer-review', {
        method: 'PATCH',
        body: reviewForm.value,
      })

      if ('success' in res && res.success) {
        notify('Successfully updated', {
          type: 'success',
          timeout: 3000,
        })
      }
      else if ('error' in res && res.error) {
        notify(res.error, {
          type: 'error',
          timeout: 5000,
        })
      }
    }
    catch (error) {
      if (error instanceof z.ZodError) {
        console.log(error.errors.map(err => err.message).join('\n'))
      }
      else {
        console.log('Unexpected error: ', error)
        notify(error as string, {
          type: 'error',
          timeout: 5000,
        })
      }
    }
    finally {
      isLoading.value = false
    }
  }
}

watch(customerReviewData, (value) => {
  if (value) {
    reviewForm.value = cloneDeep(value)
  }
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
                v-model="reviewForm.customer_review_title as string"
                class="border rounded-lg title-content"
                :class="{ 'border-error border-opacity-100': error?.customer_review_title && reviewForm.customer_review_title?.length === 0 }"
                placeholder="Text here..."
                @update:model-value="onTitleUpdate"
              />

              <div v-if="error?.customer_review_title && reviewForm.customer_review_title?.length === 0">
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
                :class="{ 'border-error border-opacity-100': error?.customer_review_title_desc && reviewForm.customer_review_title_desc?.length === 0 }"
                placeholder="Text here..."
                @update:model-value="onDescriptionUpdate"
              />

              <div v-if="error?.customer_review_title_desc && reviewForm.customer_review_title_desc?.length === 0">
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

                <VCol v-for="(review, index) in reviewerList" :key="index" cols="12" md="6" lg="4" @click="handleOpenEditDrawer(review.id)">
                  <VCard class="review-card" hover min-width="100" max-height="200" ripple>
                    <VCardTitle class="text-center d-flex flex-column align-center reviewer-name">
                      {{ review.name }}

                      <span class="text-body-2">
                        {{ review.position }}
                      </span>
                    </VCardTitle>

                    <div class="reviewer-logo-container">
                      <VImg
                        :src="review.main_logo"
                        class="align-center reviewer-logo"
                      />
                    </div>
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
.title-content {
  :deep(.ProseMirror) {
    min-block-size: 5vh;
  }
}

.label {
  line-height: 40px;
}

.review-card {
  min-width: 30px;
  min-height: 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  padding: 8px;
  cursor: pointer;
  &:hover {
    background-color: rgba(var(--v-theme-on-surface), var(--v-hover-opacity));
  }
}

.add-card{
  cursor: pointer;
  border: 1px dashed rgba(var(--v-theme-on-surface), 0.12);
  min-height: 200px;
  &:hover {
    background-color: rgba(var(--v-theme-on-surface), var(--v-hover-opacity));
  }
}

.reviewer-name {
  width: 100%;
  flex: 1;
  white-space: wrap;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  word-wrap: break-word;
}

.reviewer-logo-container {
  flex: 0 0 auto;
  width: 100%;
  height: 100px;
  padding: 16px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.reviewer-logo{
  width: 100px;
  height: auto;
}
</style>
