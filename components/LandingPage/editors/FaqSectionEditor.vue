<script lang="ts" setup>
import { z } from 'zod'
import { cloneDeep } from 'lodash-es'

import type { FAQ, FAQSectionType } from '@/types/landing-page'

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
const faqList = computed<FAQ[]>(() => faqForm.value.faq_data)

const isLoading = ref(false)

type FAQFormSchemaType = z.infer<typeof faqSchema>
const error = ref<z.ZodFormattedError<FAQFormSchemaType> | null>(null)

function onTitleUpdate(editorValue: string) {
  return faqForm.value.faq_title = removePTags(editorValue)
}

function onDescriptionUpdate(editorValue: string) {
  return faqForm.value.faq_title_desc = removePTags(editorValue)
}

const isValidFaq = computed(() => {
  if (faqForm.value.faq_data && faqList.value.length >= 0) {
    const currentFaq = faqList.value[faqList.value.length - 1]

    return currentFaq && currentFaq.question.trim() !== '' && currentFaq.answer.trim() !== ''
  }
  return false
})

async function onSubmit() {
  const validInput = faqSchema.safeParse(faqForm.value)

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
      const res = await $api('/api/pages/landing-page/faq', {
        method: 'PATCH',
        body: faqForm.value,
      })

      if (res.success) {
        notify('FAQ section updated successfully', {
          type: 'success',
          timeout: 2000,
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
          timeout: 3000,
        })
      }
    }
    finally {
      isLoading.value = false
    }
  }
}

watch(faqData, (val) => {
  if (val) {
    faqForm.value = cloneDeep(val)
  }
})
</script>

<template>
  <VForm @submit.prevent="onSubmit">
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
              class="border rounded-lg title-content"
              :class="{ 'border-error border-opacity-100': error?.faq_title && faqForm.faq_title?.length === 0 }"
              placeholder="Text here..."
              @update:model-value="onTitleUpdate"
            />

            <div v-if="error?.faq_title && faqForm.faq_title?.length === 0">
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
              class="border rounded-lg "
              :class="{ 'border-error border-opacity-100': error?.faq_title_desc }"
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
              class="mb-4"
            />
          </VCol>

          <VCol cols="12" sm="7">
            <VTextarea
              v-model="faqItem.answer"
              label="Feature description"
              placeholder="Text here..."
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
              @click="faqList.splice(index, 1)"
            >
              <VIcon icon="ri-close-circle-line" />
            </VBtn>
          </VCol>
        </VRow>

        <VBtn
          v-if="faqList.length === 0"
          class="mt-6"
          prepend-icon="ri-add-line"
          variant="tonal"
          @click="faqList.push({ question: '', answer: '' })"
        >
          Add a new faq
        </VBtn>

        <VBtn
          v-else
          class="mt-6"
          prepend-icon="ri-add-line"
          :disabled="!isValidFaq"
          variant="tonal"
          @click="faqList.push({ question: '', answer: '' })"
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
          @click="onSubmit"
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
</template>

<style lang="scss" scoped>
.label {
  line-height: 40px;
}

.remix-icon {
  font-size: 1.5rem;
  margin-right: 8px;
}

.title-content {
  :deep(.ProseMirror) {
    min-block-size: 5vh;
  }
}
</style>
