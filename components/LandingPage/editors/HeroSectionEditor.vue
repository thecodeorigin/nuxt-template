<script lang="ts" setup>
import { z } from 'zod'

import type { HeroSectionType } from '@/types/landing-page'

const { heroData } = storeToRefs(useLandingPageStore())

const imageFile = ref<File | null>(null)
const tiptapTitleInput = ref<string>('')
const tiptapDescriptionInput = ref<string>('')
const isLoading = ref(false)

function handleImageUpdate(file: File | null) {
  imageFile.value = file
}

const heroForm = ref<HeroSectionType>({
  hero_title: '',
  hero_title_desc: '',
  hero_title_button: {
    btn_link: '',
    btn_label: '',
    btn_radius: 0,
    btn_rippled: false,
    btn_variant: 'flat',
    btn_apend_icon: '',
    btn_background: '',
    btn_prepend_icon: '',
  },
})

type FormSchemaType = z.infer<typeof heroSchema> // validation.ts
const error = ref<z.ZodFormattedError<FormSchemaType> | null>(null)

function onTitleUpdate(editorValue: string) {
  return tiptapTitleInput.value = removeEmptyTags(editorValue)
}

function onDescriptionUpdate(editorValue: string) {
  return tiptapDescriptionInput.value = removeEmptyTags(editorValue)
}

async function onSubmit() {
  const formData = {
    ...heroForm.value,
    hero_title: tiptapTitleInput.value,
    hero_title_desc: tiptapDescriptionInput.value,
  }

  const validInput = heroSchema.safeParse(formData)

  if (!validInput.success) {
    error.value = validInput.error.format()
    notify('Invalid input, please check and try again', {
      type: 'error',
      timeout: 2000,
    })
  }
  else {
    error.value = null
    isLoading.value = true
    try {
      const res = await $api('/api/pages/landing-page/hero', {
        method: 'PATCH',
        body: heroForm.value,
      })

      if (res.success) {
        notify('Hero section updated successfully', {
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

watch(heroData, (value) => {
  heroForm.value = {
    hero_title: value?.hero_title ? removeEmptyTags(value.hero_title) : '',
    hero_title_desc: value?.hero_title_desc ? removeEmptyTags(value.hero_title_desc) : '',
    hero_main_img_light: value?.hero_main_img_light || '',
    hero_main_img_dark: value?.hero_main_img_dark || '',
    hero_sub_img_light: value?.hero_sub_img_light || '',
    hero_sub_img_dark: value?.hero_sub_img_dark || '',
    hero_title_button: {
      btn_link: value?.hero_title_button?.btn_link || '',
      btn_label: value?.hero_title_button?.btn_label || '',
      btn_radius: value?.hero_title_button?.btn_radius || '',
      btn_rippled: value?.hero_title_button?.btn_rippled || false,
      btn_variant: value?.hero_title_button?.btn_variant || 'flat',
      btn_apend_icon: value?.hero_title_button?.btn_apend_icon || '',
      btn_background: value?.hero_title_button?.btn_background || '',
      btn_prepend_icon: value?.hero_title_button?.btn_prepend_icon || '',
    },
  }

  tiptapTitleInput.value = heroForm.value.hero_title

  tiptapDescriptionInput.value = heroForm.value.hero_title_desc
}, { deep: true, immediate: true })
</script>

<template>
  <form class="landing-page-hero" @submit.prevent="onSubmit">
    <VLabel class="text-h3 text-capitalize text-primary font-weight-bold mb-4  d-block label">
      Hero Section
    </VLabel>

    <div class="d-flex flex-column gap-4">
      <VRow>
        <!-- 👉 Hero Heading -->
        <VCol cols="12" md="8">
          <VCard class="pa-4">
            <VCardTitle class="text-center mb-4">
              Hero page heading
            </VCardTitle>

            <!-- 👉 Hero Main Title -->
            <div class="mb-6 position-relative">
              <VLabel class="mb-2 label">
                Hero title:
                <VIcon icon="ri-asterisk" class="text-error text-overline mb-2" />
              </VLabel>

              <TiptapEditor
                v-model="heroForm.hero_title"
                class="border rounded-lg title-content"
                :class="{ 'border-error border-opacity-100': error?.hero_title && tiptapTitleInput.length === 0 }"
                placeholder="Text here..."
                @update:model-value="onTitleUpdate"
              />

              <div v-if="error?.hero_title && tiptapTitleInput.length === 0">
                <span v-for="(warn, index) in error?.hero_title?._errors" :key="index" class="text-error error-text">
                  {{ warn }}
                </span>
              </div>
            </div>

            <!-- 👉 Hero Main Description -->
            <div class="mb-6 position-relative">
              <VLabel class="mb-2 label">
                Description:
                <VIcon icon="ri-asterisk" class="text-error text-overline mb-2" />
              </VLabel>
              <TiptapEditor
                v-model="heroForm.hero_title_desc"
                class="border rounded-lg "
                :class="{ 'border-error border-opacity-100': error?.hero_title_desc && tiptapDescriptionInput.length === 0 }"
                placeholder="Text here..."
                @update:model-value="onDescriptionUpdate"
              />

              <div v-if="error?.hero_title_desc && tiptapDescriptionInput.length === 0">
                <span v-for="(warn, index) in error?.hero_title_desc?._errors" :key="index" class="text-error error-text">
                  {{ warn }}
                </span>
              </div>
            </div>
          </VCard>
        </VCol>

        <!-- 👉 Hero Heading Button -->
        <VCol cols="12" md="4">
          <VCard class="pa-4">
            <VCardTitle class="text-center mb-4">
              Main page Button
            </VCardTitle>

            <VLabel class="mb-2 label">
              Button settings:
              <VIcon icon="ri-asterisk" class="text-error text-overline mb-2" />
            </VLabel>

            <VRow>
              <VCol cols="12" sm="12" class="mb-2 position-relative">
                <VTextField
                  v-model="heroForm.hero_title_button.btn_label"
                  label="Button label"
                  placeholder="Placeholder Text"
                  :color="error?.hero_title_button?.btn_label && heroForm.hero_title_button.btn_label.length === 0 ? 'error' : ''"
                  :base-color="error?.hero_title_button?.btn_label && heroForm.hero_title_button.btn_label.length === 0 ? 'error' : ''"
                />

                <div v-if="error?.hero_title_button?.btn_label && heroForm.hero_title_button.btn_label.length === 0">
                  <span v-for="(warn, index) in error?.hero_title_button?.btn_label?._errors" :key="index" class="text-error error-text mb-3">
                    {{ warn }}
                  </span>
                </div>
              </VCol>

              <VCol cols="12" sm="12" class="mb-2">
                <VSelect
                  v-model="heroForm.hero_title_button.btn_variant"
                  label="Button style"
                  :items="['flat', 'contained', 'outlined', 'text']"
                />
              </vcol>

              <VCol cols="12" sm="12" class="mb-2">
                <VSelect
                  v-model="heroForm.hero_title_button.btn_background"
                  label="Button style"
                  :items="['primary', 'secondary', 'accent', 'error', 'warning', 'info', 'success']"
                />
              </vcol>

              <VCol cols="12" sm="6" class="mb-2">
                <VSelect
                  v-model="heroForm.hero_title_button.btn_radius"
                  label="Button radius"
                  :items="['0', 'sx', 'sm', 'md', 'lg', 'xl']"
                />
              </VCol>

              <VCol cols="12" sm="6">
                <VSwitch
                  v-model="heroForm.hero_title_button.btn_rippled"
                  label="Ripple effect"
                />
              </VCol>

              <VCol cols="12" sm="6">
                <VSelect
                  v-model="heroForm.hero_title_button.btn_prepend_icon"
                  label="Prepend icon"
                  :items="['', 'ri-arrow-left-line', 'ri-arrow-right-line']"
                />
              </VCol>

              <VCol cols="12" sm="6">
                <VSelect
                  v-model="heroForm.hero_title_button.btn_apend_icon"
                  label="Append icon"
                  :items="['', 'ri-arrow-right-line', 'ri-arrow-left-line']"
                />
              </VCol>
            </vrow>
          </VCard>

          <VCard class="pa-4 mt-4 d-flex justify-center align-center flex-column">
            <VCardTitle class="text-center mb-1">
              Preview button
            </VCardTitle>
            <VBtn
              v-bind="heroForm.hero_title_button"
              :href="heroForm.hero_title_button.btn_link"
              :prepend-icon="heroForm.hero_title_button.btn_prepend_icon"
              :append-icon="heroForm.hero_title_button.btn_apend_icon"
              :variant="heroForm.hero_title_button.btn_variant"
              :color="heroForm.hero_title_button.btn_background"
              :ripple="heroForm.hero_title_button.btn_rippled"
              :rounded="heroForm.hero_title_button.btn_radius"
            >
              {{ heroForm.hero_title_button.btn_label }}
            </vbtn>
          </VCard>
        </VCol>
      </VRow>

      <!-- 👉 Hero Image -->
      <VCard class="pa-4">
        <VCardTitle class="text-center mb-4">
          Upload image
        </VCardTitle>

        <VRow class="mb-6">
          <VCol cols="12" sm="6">
            <VLabel class="mb-2 label">
              Main Hero image light amd dark (Optional):
            </VLabel>

            <LandingPageImagePreview
              id="image"
              :model-value="imageFile"
              @update:model-value="handleImageUpdate"
            />
          </VCol>

          <VCol cols="12" sm="6">
            <VLabel class="mb-2 label">
              Sub Hero image light and dark (Optional):
            </VLabel>
            <LandingPageImagePreview
              id="image"
              :model-value="imageFile"
              @update:model-value="handleImageUpdate"
            />
          </VCol>
        </VRow>
      </VCard>

      <!-- 👉 Hero Button Submit -->
      <div class="w-100 d-flex justify-center align-center">
        <VBtn
          v-if="isLoading === false"
          class="mx-auto w-100"
          type="submit"
          color="primary"
          variant="outlined"
          @click="onSubmit"
        >
          Update Hero Section Content
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

    <VBtn
      class="text-capitalize mt-6"
      type="submit"
      color="primary"
      @click="onSubmit"
    >
      Save
    </VBtn>
  </form>
</template>

<style lang="scss" scoped>
 .drop-zone {
    border: 1px dashed rgba(var(--v-theme-on-surface), 0.12);
    border-radius: 8px;
  }

  .label {
    line-height: 40px;
  }

  .title-content {
    :deep(.ProseMirror) {
      min-block-size: 5vh;
    }
  }

  .error-text{
    position: absolute;
    bottom: -20px;
    left: 50%;
    transform: translateX(-50%);
    white-space: nowrap;
  }
</style>
