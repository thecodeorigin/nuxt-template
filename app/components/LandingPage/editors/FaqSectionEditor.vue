<script lang="ts" setup>
import { z } from 'zod'
import { cloneDeep } from 'lodash-es'

import type { FAQ, FAQSectionType, LandingPageStatusEmit } from '@utils/types/landing-page'

const emit = defineEmits<LandingPageStatusEmit>()

const { faqData } = storeToRefs(useLandingPageStore())
const faqForm = ref<FAQSectionType>({
  faq_title: '',
  faq_title_desc: '',
  faq_data: [
    {
      question: '',
      answer: '',
    },
  ],
})
const faqList = computed<FAQ[]>(() => faqForm.value.faq_data || [])

const isLoading = ref(false)

type FAQFormSchemaType = z.infer<typeof faqSchema>
const error = ref<z.ZodFormattedError<FAQFormSchemaType> | null>(null)

function onTitleUpdate(editorValue: string) {
  if (!editorValue)
    return ''

  if (editorValue.trim().length > 0 && error.value?.faq_title) {
    error.value.faq_title._errors = []
  }
  return faqForm.value.faq_title = removePTags(editorValue)
}

function onDescriptionUpdate(editorValue: string) {
  if (!editorValue)
    return ''

  if (editorValue.trim().length > 0 && error.value?.faq_title_desc) {
    error.value.faq_title_desc._errors = []
  }
  return faqForm.value.faq_title_desc = removePTags(editorValue)
}

const isValidFaq = computed(() => {
  if (faqForm.value.faq_data && faqList.value.length >= 0) {
    const currentFaq = faqForm.value.faq_data[faqForm.value.faq_data.length - 1]

    return currentFaq && currentFaq.question.trim() !== '' && currentFaq.answer.trim() !== ''
  }
  return false
})

function handleAddFaq() {
  faqForm.value?.faq_data?.push({
    question: '',
    answer: '',
  })
}

function handleRemoveFaq(index: number) {
  faqForm.value?.faq_data?.splice(index, 1)
}

async function onFaqSubmit() {
  const validInput = faqSchema.safeParse(faqForm.value)

  if (!validInput.success) {
    error.value = validInput.error.format()
    notify('Invalid input, please check and try again', {
      type: 'error',
      timeout: 5000,
    })

    emit('update:sectionStatus', 'error')
  }
  else {
    error.value = null
    isLoading.value = true
    emit('update:sectionStatus', 'loading')

    try {
      const res = await $api('/api/pages/landing-page/faq', {
        method: 'PATCH',
        body: faqForm.value,
      })

      if (res.success) {
        notify('FAQ section updated successfully', {
          type: 'success',
          timeout: 2000,
        })

        emit('update:sectionStatus', 'success')
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
          timeout: 3000,
        })
      }

      emit('update:sectionStatus', 'error')
    }
    finally {
      isLoading.value = false
    }
  }
}

defineExpose({
  onFaqSubmit,
})

watch(faqData, (value) => {
  if (value) {
    faqForm.value = {
      faq_title: value.faq_title,
      faq_title_desc: value.faq_title_desc,
      faq_data: cloneDeep(value.faq_data as FAQ[] ?? []),
    }
  }
})
</script>

<template>
  <div>
    <VForm @submit.prevent="onFaqSubmit">
      <div class="d-flex flex-column gap-4">
        <VLabel class="text-h3 text-capitalize text-primary font-weight-bold mb-4 d-block label">
          FAQ Section
        </VLabel>
        <!-- 👉 FAQ Heading -->
        <VCard class="pa-4">
          <VCardTitle class="text-center mb-4">
            FAQ heading
          </VCardTitle>

          <VRow>
            <!-- 👉 Faq Main Title -->
            <VCol cols="12" sm="6" class="mb-6 position-relative">
              <VLabel class="mb-2 label">
                Faq title:
                <VIcon icon="ri-asterisk" class="text-error text-overline mb-2" />
              </VLabel>

              <TiptapEditor
                v-model="faqForm.faq_title as string"
                class="border rounded-lg title-content mb-2"
                :class="{ 'border-error border-opacity-100': error?.faq_title && error?.faq_title?._errors?.length > 0 }"
                placeholder="Text here..."
                @update:model-value="onTitleUpdate"
              />

              <div v-if="error?.faq_title">
                <span v-for="(warn, index) in error?.faq_title?._errors" :key="index" class="text-error error-text">
                  {{ warn }}
                </span>
              </div>
            </VCol>

            <!-- 👉 Faq Main Description -->
            <VCol cols="12" sm="6" class="mb-6 position-relative">
              <VLabel class="mb-2 label">
                Description:
                <VIcon icon="ri-asterisk" class="text-error text-overline mb-2" />
              </VLabel>
              <TiptapEditor
                v-model="faqForm.faq_title_desc as string"
                class="border rounded-lg mb-2"
                :class="{ 'border-error border-opacity-100': error?.faq_title_desc && error?.faq_title_desc?._errors?.length > 0 }"
                placeholder="Text here..."
                @update:model-value="onDescriptionUpdate"
              />

              <div v-if="error?.faq_title_desc">
                <span v-for="(warn, index) in error?.faq_title_desc?._errors" :key="index" class="text-error error-text">
                  {{ warn }}
                </span>
              </div>
            </VCol>
          </VRow>
        </VCard>

        <!-- 👉 FAQs -->
        <VCard class="pa-4 h-100">
          <VCardTitle class="text-center mb-4">
            FAQs
          </VCardTitle>

          <VRow v-for="(faqItem, index) in faqList" :key="index" class="faqItem-container">
            <VCol cols="12" sm="4">
              <VTextField
                v-model="faqItem.question"
                placeholder="Text here..."
                label="Feature Name"
                :rules="[requiredValidator]"
                class="mb-4"
              />
            </VCol>

            <VCol cols="12" sm="7">
              <VTextarea
                v-model="faqItem.answer"
                label="Feature description"
                placeholder="Text here..."
                :rules="[requiredValidator]"
                rows="4"
              />
            </VCol>

            <VCol cols="12" sm="1" class="d-flex align-center">
              <VBtn
                icon
                variant="tonal"
                color="error"
                rounded="lg"
                class="w-100 h-100 d-flex align-center justify-center pa-2"
                @click="handleRemoveFaq(index)"
              >
                <VIcon icon="ri-close-circle-line" />
              </VBtn>
            </VCol>
          </VRow>

          <VBtn
            v-if="faqForm.faq_data?.length === 0"
            class="mt-6"
            prepend-icon="ri-add-line"
            variant="tonal"
            @click="handleAddFaq"
          >
            Add a new faq
          </VBtn>

          <VBtn
            v-else
            class="mt-6"
            prepend-icon="ri-add-line"
            :disabled="!isValidFaq"
            variant="tonal"
            @click="handleAddFaq"
          >
            Add another option
          </VBtn>
        </VCard>

        <!-- 👉 FAQ Button Submit -->
        <div class="w-100 d-flex justify-center align-center">
          <VBtn
            v-if="isLoading === false"
            class="mx-auto w-100"
            type="submit"
            color="primary"
            variant="outlined"
          >
            Update Feature Section Content
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
    </VForm>
  </div>
</template>

<style lang="scss" scoped>
.label {
  line-height: 40px;
}

.remix-icon {
  font-size: 1.5rem;
  margin-inline-end: 8px;
}

.title-content {
  :deep(.ProseMirror) {
    min-block-size: 5vh;
  }
}

.error-text {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
}
</style>
