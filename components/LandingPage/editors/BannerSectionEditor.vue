<script lang="ts" setup>
import type { VForm } from 'vuetify/components'
import { z } from 'zod'
import type { BannerSectionType } from '@/types/landing-page'

const { bannerData } = storeToRefs(useLandingPageStore())

const tiptapTitleInput = ref<string>('')
const tiptapDescriptionInput = ref<string>('')
const isLoading = ref(false)
const formRef = ref<VForm>()
const bannerForm = ref<BannerSectionType>({
  banner_title: '',
  banner_title_desc: '',
  banner_button: '',
  banner_img: null,
})

type BannerFormSchemaType = z.infer<typeof bannerSchema>
const error = ref<z.ZodFormattedError<BannerFormSchemaType> | null>(null)

function onTitleUpdate(editorValue: string) {
  if (!editorValue)
    return ''
  return tiptapTitleInput.value = removeEmptyTags(editorValue)
}

function onDescriptionUpdate(editorValue: string) {
  if (!editorValue)
    return ''
  return tiptapDescriptionInput.value = removeEmptyTags(editorValue)
}

function handleImageUpdate(file: File | null) {
  console.log('««««« file »»»»»', file)
}

async function onSubmit() {
  const validInput = bannerSchema.safeParse(bannerForm.value)

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
      const res = await $api('/api/pages/landing-page/banner', {
        method: 'PATCH',
        body: bannerForm.value,
      })

      if (res.success) {
        notify('Successfully updated', {
          type: 'success',
          timeout: 3000,
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

watch(bannerData, (val) => {
  if (val) {
    bannerForm.value = {
      banner_title: val.banner_title,
      banner_title_desc: val.banner_title_desc,
      banner_button: val.banner_button,
      banner_img: val.banner_img,
    }

    tiptapTitleInput.value = val.banner_title
    tiptapDescriptionInput.value = val.banner_title_desc
  }
})
</script>

<template>
  <VForm ref="formRef" @submit.prevent="onSubmit">
    <VLabel class="text-h3 text-capitalize text-primary font-weight-bold mb-4  d-block label">
      Banner Section
    </VLabel>

    <VRow class="mb-4">
      <VCol cols="12" md="6">
        <VCard class="pa-4">
          <div class="mb-6 position-relative">
            <VLabel class="mb-2 label">
              Pricing heading:
              <VIcon icon="ri-asterisk" class="text-error text-overline mb-2" />
            </VLabel>

            <TiptapEditor
              v-model="bannerForm.banner_title"
              class="border rounded-lg title-content"
              :class="{ 'border-error border-opacity-100': error?.banner_title && tiptapTitleInput.length === 0 }"
              placeholder="Text here..."
              @update:model-value="onTitleUpdate"
            />

            <div v-if="error?.banner_title && tiptapTitleInput.length === 0">
              <span v-for="(warn, index) in error?.banner_title?._errors" :key="index" class="text-error error-text">
                {{ warn }}
              </span>
            </div>
          </div>

          <div class="mb-6 position-relative">
            <VLabel class="mb-2 label">
              Description:
              <VIcon icon="ri-asterisk" class="text-error text-overline mb-2" />
            </VLabel>

            <TiptapEditor
              v-model="bannerForm.banner_title_desc as string"
              class="border rounded-lg"
              :class="{ 'border-error border-opacity-100': error?.banner_title_desc && tiptapDescriptionInput.length === 0 }"
              placeholder="Text here..."
              @update:model-value="onDescriptionUpdate"
            />
            <div v-if="error?.banner_title_desc && tiptapDescriptionInput.length === 0">
              <span v-for="(warn, index) in error?.banner_title_desc?._errors" :key="index" class="text-error error-text">
                {{ warn }}
              </span>
            </div>
          </div>
        </VCard>
      </VCol>

      <!-- 👉 Banner Image -->
      <VCol cols="12" md="6">
        <VCard class="pa-4">
          <VCardTitle class="text-center mb-4">
            Upload image
          </VCardTitle>

          <VRow>
            <VCol cols="12">
              <VLabel class="mb-2 label">
                Banner image:
              </VLabel>

              <LandingPageImagePreview
                id="image"
                :model-value="bannerForm.banner_img as string"
                @update:model-value="handleImageUpdate"
              />
            </VCol>

            <VCol cols="12">
              <VLabel class="mb-2 label">
                Button text:
                <VIcon icon="ri-asterisk" class="text-error text-overline mb-2" />
              </VLabel>

              <VTextField
                v-model="bannerForm.banner_button"
                :rules="[requiredValidator]"
              />
            </VCol>
          </VRow>
        </VCard>
      </VCol>
    </VRow>

    <!-- 👉 Banner Button Submit -->
    <div class="w-100 d-flex justify-center align-center">
      <VBtn
        v-if="isLoading === false"
        class="mx-auto w-100"
        type="submit"
        color="primary"
        variant="outlined"
        @click="onSubmit"
      >
        Update Banner Section Content
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
</style>
