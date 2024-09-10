<script setup lang="ts">
import { z } from 'zod'
import { VForm, VTextField, VTextarea } from 'vuetify/components'
import { cloneDeep } from 'lodash-es'
import type { ContactUsSectionType, LandingPageStatusEmit } from '@/types/landing-page'

const emit = defineEmits<LandingPageStatusEmit>()

const { contactData } = storeToRefs(useLandingPageStore())
const formRef = ref<VForm>()
const isLoading = ref(false)

const contactUsForm = ref<ContactUsSectionType>({
  contact_us_title: '',
  contact_us_title_desc: '',
  contact_us_card_content: '',
  contact_us_card_title: '',
  contact_us_card_heading: '',
  contact_us_card_image: null,
})
type FormSchemaType = z.infer<typeof contactUsSchema>
const error = ref<z.ZodFormattedError<FormSchemaType> | null>(null)

function onTitleUpdate(editorValue: string) {
  if (editorValue.trim().length > 0 && error.value?.contact_us_title) {
    error.value.contact_us_title._errors = []
  }
  return contactUsForm.value.contact_us_title = removePTags(editorValue)
}

function onDescriptionUpdate(editorValue: string) {
  if (editorValue.trim().length > 0 && error.value?.contact_us_title_desc) {
    error.value.contact_us_title_desc._errors = []
  }
  return contactUsForm.value.contact_us_title_desc = removePTags(editorValue)
}

function handleImageUpdate(imageUrl: string, _: 'main' | 'sub', __: 'light' | 'dark') {
  contactUsForm.value.contact_us_card_image = imageUrl
}

async function onContactSubmit() {
  const validInput = contactUsSchema.safeParse(contactUsForm.value)

  if (!validInput.success) {
    error.value = validInput.error.format()
    notify('Invalid input, please check and try again', {
      type: 'error',
      timeout: 2000,
    })

    emit('update:sectionStatus', 'error')
  }
  else {
    error.value = null
    isLoading.value = true
    emit('update:sectionStatus', 'loading')

    try {
      const res = await $api('/api/pages/landing-page/contact', {
        method: 'PATCH',
        body: contactUsForm.value,
      })

      if ('success' in res && res.success) {
        notify('Successfully updated', {
          type: 'success',
          timeout: 3000,
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
  onContactSubmit,
})

watch(contactData, (value) => {
  if (value) {
    contactUsForm.value = cloneDeep(value)
  }
})
</script>

<template>
  <VForm ref="formRef" @submit.prevent="onContactSubmit">
    <VLabel class="text-h3 text-capitalize text-primary font-weight-bold mb-4  d-block label">
      Contact us Section
    </VLabel>

    <div class="d-flex flex-column gap-4 mb-4">
      <!-- 👉 Contact Heading -->
      <VCard class="pa-4">
        <VCardTitle class="text-center mb-4">
          Contact us heading
        </VCardTitle>

        <VRow>
          <!-- 👉 Contact Main Title -->
          <VCol cols="12" sm="6" class="mb-6">
            <VLabel class="mb-2 label">
              Contact us heading:
              <VIcon icon="ri-asterisk" class="text-error text-overline mb-2" />
            </VLabel>

            <TiptapEditor
              v-model="contactUsForm.contact_us_title as string"
              class="border rounded-lg title-content mb-2"
              :class="{ 'border-error border-opacity-100': error?.contact_us_title && error?.contact_us_title?._errors.length > 0 }"
              placeholder="Text here..."
              @update:model-value="onTitleUpdate"
            />

            <div v-if="error?.contact_us_title">
              <span v-for="(warn, index) in error?.contact_us_title?._errors" :key="index" class="text-error error-text">
                {{ warn }}
              </span>
            </div>
          </VCol>

          <!-- 👉 Contact Main Title -->
          <VCol cols="12" sm="6" class="mb-6 position-relative">
            <VLabel class="mb-2 label">
              Description:
              <VIcon icon="ri-asterisk" class="text-error text-overline mb-2" />
            </VLabel>

            <TiptapEditor
              v-model="contactUsForm.contact_us_title_desc as string"
              class="border rounded-lg"
              :class="{ 'border-error border-opacity-100': error?.contact_us_title_desc && error?.contact_us_title_desc?._errors.length > 0 }"
              placeholder="Text here..."
              @update:model-value="onDescriptionUpdate"
            />
            <div v-if="error?.contact_us_title_desc && contactUsForm.contact_us_title_desc?.length === 0">
              <span v-for="(warn, index) in error?.contact_us_title_desc?._errors" :key="index" class="text-error error-text">
                {{ warn }}
              </span>
            </div>
          </VCol>
        </VRow>
      </VCard>

      <!-- 👉 Contact Card -->
      <VCard class="pa-4">
        <VCardTitle class="text-center mb-4">
          Contact us card
        </VCardTitle>

        <VRow>
          <!-- 👉 Contact Card Title -->
          <VCol cols="12" sm="6" class="mb-4 position-relative">
            <VLabel class="mb-2 label">
              Card title:
              <VIcon icon="ri-asterisk" class="text-error text-overline mb-2" />
            </VLabel>

            <VTextField
              v-model="contactUsForm.contact_us_card_title"
              density="compact"
              variant="outlined"
              placeholder="Text here..."
            />
          </VCol>

          <!-- 👉 Contact Card Heading -->
          <VCol cols="12" sm="6" class="mb-4 position-relative">
            <VLabel class="mb-2 label">
              Card heading:
              <VIcon icon="ri-asterisk" class="text-error text-overline mb-2" />
            </VLabel>

            <VTextField
              v-model="contactUsForm.contact_us_card_heading"
              density="compact"
              variant="outlined"
              placeholder="Text here..."
            />
          </VCol>

          <!-- 👉 Contact Card Description -->
          <VCol cols="12" md="6" class="mb-4 position-relative">
            <VLabel class="mb-2 label">
              Card description:
              <VIcon icon="ri-asterisk" class="text-error text-overline mb-2" />
            </VLabel>

            <VTextarea
              v-model="contactUsForm.contact_us_card_content"
              density="compact"
              variant="outlined"
              placeholder="Text here..."
            />
          </VCol>

          <!-- 👉 Contact Card Image -->
          <VCol cols="12" md="6" class="mb-4 position-relative">
            <VLabel class="mb-2 label">
              Card image:
              <VIcon icon="ri-asterisk" class="text-error text-overline mb-2" />
            </VLabel>

            <LandingPageImagePreview
              id="image"
              image-theme="light"
              image-type="main"
              :model-value="contactUsForm.contact_us_card_image"
              @update:model-value="handleImageUpdate"
            />
          </VCol>
        </VRow>
      </VCard>
    </div>

    <!-- 👉 Contact Us Button Submit -->
    <div class="w-100 d-flex justify-center align-center">
      <VBtn
        v-if="isLoading === false"
        class="mx-auto w-100"
        type="submit"
        color="primary"
        variant="outlined"
      >
        Update About Us Section Content
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
  </VForm>
</template>

<style lang="scss" scoped>
.title-content {
  :deep(.ProseMirror) {
    min-block-size: 5vh;
  }
}

.error-text{
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 4px;
}

.label {
    line-height: 40px;
  }
</style>
