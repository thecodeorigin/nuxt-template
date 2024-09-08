<script lang="ts" setup>
import type { VForm } from 'vuetify/components'
import { z } from 'zod'
import { cloneDeep } from 'lodash-es'
import type { BannerSectionType } from '@/types/landing-page'

const { bannerData } = storeToRefs(useLandingPageStore())

const isLoading = ref(false)
const formRef = ref<VForm>()
const bannerForm = ref<BannerSectionType>({
  banner_title: '',
  banner_title_desc: '',
  banner_button: '',
  banner_image: null,
})

type BannerFormSchemaType = z.infer<typeof bannerSchema>
const error = ref<z.ZodFormattedError<BannerFormSchemaType> | null>(null)

function onTitleUpdate(editorValue: string) {
  if (!editorValue)
    return ''
  return bannerForm.value.banner_title = removePTags(editorValue)
}

function onDescriptionUpdate(editorValue: string) {
  if (!editorValue)
    return ''
  return bannerForm.value.banner_title_desc = removePTags(editorValue)
}

async function handleImageUpdate(file: string, _: 'main' | 'sub', __: 'light' | 'dark') {
  bannerForm.value.banner_image = file
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
    bannerForm.value = cloneDeep(val)
  }
})
</script>

<template>
  <VForm ref="formRef" @submit.prevent="onSubmit">
    <VLabel class="text-h3 text-capitalize text-primary font-weight-bold mb-4  d-block label">
      Banner Section
    </VLabel>

    <div class="d-flex flex-column gap-4">
      <!-- 👉 Banner Heading -->
      <VCard class="pa-4">
        <VRow>
          <!-- 👉 Banner Main Title -->
          <VCol cols="12" sm="6" class="mb-6 position-relative">
            <VLabel class="mb-2 label">
              Banner heading:
              <VIcon icon="ri-asterisk" class="text-error text-overline mb-2" />
            </VLabel>

            <TiptapEditor
              v-model="bannerForm.banner_title as string"
              class="border rounded-lg title-content"
              :class="{ 'border-error border-opacity-100': error?.banner_title && bannerForm.banner_title?.length === 0 }"
              placeholder="Text here..."
              @update:model-value="onTitleUpdate"
            />

            <div v-if="error?.banner_title && bannerForm.banner_title?.length === 0">
              <span v-for="(warn, index) in error?.banner_title?._errors" :key="index" class="text-error error-text">
                {{ warn }}
              </span>
            </div>
          </VCol>

          <!-- 👉 Banner Description -->
          <VCol cols="12" sm="6" class="mb-6 position-relative">
            <VLabel class="mb-2 label">
              Description:
              <VIcon icon="ri-asterisk" class="text-error text-overline mb-2" />
            </VLabel>

            <TiptapEditor
              v-model="bannerForm.banner_title_desc as string"
              class="border rounded-lg"
              :class="{ 'border-error border-opacity-100': error?.banner_title_desc && bannerForm.banner_title_desc?.length === 0 }"
              placeholder="Text here..."
              @update:model-value="onDescriptionUpdate"
            />
            <div v-if="error?.banner_title_desc && bannerForm.banner_title_desc?.length === 0">
              <span v-for="(warn, index) in error?.banner_title_desc?._errors" :key="index" class="text-error error-text">
                {{ warn }}
              </span>
            </div>
          </VCol>
        </VRow>
      </VCard>

      <!-- 👉 Banner Image -->
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
              :model-value="bannerForm.banner_image"
              image-theme="light"
              image-type="main"
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
