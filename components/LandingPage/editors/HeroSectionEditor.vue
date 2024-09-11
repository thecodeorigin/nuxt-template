<script lang="ts" setup>
import { z } from 'zod'

import type { HeroButtonType, HeroSectionType, LandingPageStatus, LandingPageStatusEmit } from '~/utils/types/landing-page'
import { getRemixIcon, iconNameList } from '@/utils/landingPageUtils.js'

const emit = defineEmits<LandingPageStatusEmit>()

const { heroData } = storeToRefs(useLandingPageStore())

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
const isLoading = ref(false)

const heroButtonData = computed<HeroButtonType>(() => {
  return heroForm.value?.hero_title_button as HeroButtonType
})

async function handleMainImageUpdate(file: string, imageType: 'main' | 'sub', theme: 'light' | 'dark') {
  if (imageType === 'main') {
    if (theme === 'light')
      heroForm.value.hero_main_img_light = file
    else
      heroForm.value.hero_main_img_dark = file
  }
  else {
    if (imageType === 'sub') {
      if (theme === 'light') {
        heroForm.value.hero_sub_img_light = file
      }
      else {
        heroForm.value.hero_sub_img_dark = file
      }
    }
  }
}

type FormSchemaType = z.infer<typeof heroSchema>
const error = ref<z.ZodFormattedError<FormSchemaType> | null>(null)

function onTitleUpdate(editorValue: string) {
  if (editorValue.trim().length > 0 && error.value?.hero_title) {
    error.value.hero_title._errors = []
  }
  return heroForm.value.hero_title = removePTags(editorValue)
}

function onDescriptionUpdate(editorValue: string) {
  if (editorValue.trim().length > 0 && error.value?.hero_title_desc) {
    error.value.hero_title_desc._errors = []
  }
  return heroForm.value.hero_title_desc = removePTags(editorValue)
}

async function onHeroSubmit() {
  const validInput = heroSchema.safeParse(heroForm.value)

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
      const res = await $api('/api/pages/landing-page/hero', {
        method: 'PATCH',
        body: heroForm.value,
      })

      if (res.success) {
        notify('Hero section updated successfully', {
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
  onHeroSubmit,
})

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
  <form class="landing-page-hero" @submit.prevent="onHeroSubmit">
    <VLabel v-if="heroData" class="text-h3 text-capitalize text-primary font-weight-bold mb-4 d-block label">
      Hero Section
    </VLabel>

    <div class="d-flex flex-column gap-4">
      <VRow>
        <!-- 👉 Hero Heading -->
        <VCol cols="12">
          <VCard class="pa-4">
            <VCardTitle class="text-center mb-4">
              Hero page heading
            </VCardTitle>

            <VRow>
              <!-- 👉 Hero Main Title -->
              <VCol cols="12" sm="6" class="mb-6">
                <VLabel class="mb-2 label">
                  Hero title:
                  <VIcon icon="ri-asterisk" class="text-error text-overline mb-2" />
                </VLabel>

                <TiptapEditor
                  v-model="heroForm.hero_title as string"
                  class="border rounded-lg mb-2 title-content"
                  :class="{ 'border-error border-opacity-100': error?.hero_title && error?.hero_title?._errors.length > 0 }"
                  placeholder="Text here..."
                  @update:model-value="onTitleUpdate"
                />

                <div v-if="error?.hero_title">
                  <span v-for="(warn, index) in error?.hero_title?._errors" :key="index" class="text-error error-text">
                    {{ warn }}
                  </span>
                </div>
              </VCol>

              <!-- 👉 Hero Main Description -->
              <VCol cols="12" sm="6" class="mb-6 position-relative">
                <VLabel class="mb-2 label">
                  Description:
                  <VIcon icon="ri-asterisk" class="text-error text-overline mb-2" />
                </VLabel>
                <TiptapEditor
                  v-model="heroForm.hero_title_desc as string"
                  class="border rounded-lg "
                  :class="{ 'border-error border-opacity-100': error?.hero_title_desc && error?.hero_title_desc?._errors.length > 0 }"
                  placeholder="Text here..."
                  @update:model-value="onDescriptionUpdate"
                />

                <div v-if="error?.hero_title_desc && error?.hero_title_desc?._errors.length > 0">
                  <span v-for="(warn, index) in error?.hero_title_desc?._errors" :key="index" class="text-error error-text">
                    {{ warn }}
                  </span>
                </div>
              </VCol>
            </VRow>
          </VCard>
        </VCol>

        <!-- 👉 Hero Image -->
        <VCol cols="12" md="6">
          <VCard class="pa-4">
            <VCardTitle class="text-center mb-4">
              Upload image
            </VCardTitle>

            <VRow class="mb-6">
              <VCol cols="12" sm="6" md="12">
                <VLabel class="mb-2 label">
                  Main Hero image light (Optional):
                </VLabel>

                <LandingPageImagePreview
                  id="image"
                  :model-value="heroForm.hero_main_img_light"
                  image-type="main"
                  image-theme="light"
                  @update:model-value="handleMainImageUpdate"
                />
              </VCol>

              <VCol cols="12" sm="6" md="12">
                <VLabel class="mb-2 label">
                  Main Hero image dark (Optional):
                </VLabel>
                <LandingPageImagePreview
                  id="image"
                  :model-value="heroForm.hero_main_img_dark"
                  image-type="main"
                  image-theme="dark"
                  @update:model-value="handleMainImageUpdate"
                />
              </VCol>
            </VRow>
          </VCard>
        </VCol>

        <!-- 👉 Hero Heading Button -->
        <VCol cols="12" md="6">
          <VCard class="pa-4">
            <VCardTitle class="text-center mb-4">
              Hero button
            </VCardTitle>

            <div class="mb-6">
              <VLabel class="mb-2 label">
                Button settings:
                <VIcon icon="ri-asterisk" class="text-error text-overline mb-2" />
              </VLabel>

              <VRow>
                <VCol cols="12" sm="8" class="mb-2 position-relative">
                  <VTextField
                    v-model="heroButtonData.btn_label"
                    label="Button label"
                    placeholder="Placeholder Text"
                    :rules="[requiredValidator]"
                  />
                </VCol>

                <VCol cols="12" sm="4" class="mb-2">
                  <VSelect
                    v-model="heroButtonData.btn_variant"
                    label="Button style"
                    :items="['flat', 'contained', 'outlined', 'text']"
                  />
                </vcol>

                <VCol cols="12" sm="12" class="mb-2">
                  <VSelect
                    v-model="heroButtonData.btn_background"
                    label="Button style"
                    :items="['primary', 'secondary', 'accent', 'error', 'warning', 'info', 'success']"
                  />
                </vcol>

                <VCol cols="12" sm="6" class="mb-2">
                  <VSelect
                    v-model="heroButtonData.btn_radius"
                    label="Button radius"
                    :items="['0', 'sx', 'sm', 'md', 'lg', 'xl']"
                  />
                </VCol>

                <VCol cols="12" sm="6">
                  <VSwitch
                    v-model="heroButtonData.btn_rippled"
                    label="Ripple effect"
                  />
                </VCol>

                <VCol cols="12" sm="6">
                  <VSelect
                    v-model="heroButtonData.btn_prepend_icon"
                    :items="iconNameList"
                    label="Prepend icon"
                    :item-value="(iconName: string) => getRemixIcon(iconName)"
                  />
                </VCol>

                <VCol cols="12" sm="6">
                  <VSelect
                    v-model="heroButtonData.btn_apend_icon"
                    :items="iconNameList"
                    label="Prepend icon"
                    :item-value="(iconName: string) => getRemixIcon(iconName)"
                  />
                </VCol>
              </vrow>
            </div>

            <div class="d-flex justify-center flex-column">
              <VCardTitle class="text-center mb-1">
                Preview button
              </VCardTitle>

              <VBtn
                v-bind="heroButtonData"
                :href="heroButtonData.btn_link"
                :prepend-icon="heroButtonData.btn_prepend_icon"
                :append-icon="heroButtonData.btn_apend_icon"
                :variant="heroButtonData.btn_variant"
                :color="heroButtonData.btn_background"
                :ripple="heroButtonData.btn_rippled"
                :rounded="heroButtonData.btn_radius"
                class="mx-auto"
              >
                {{ heroButtonData.btn_label }}
              </vbtn>
            </div>
          </VCard>
        </VCol>
      </VRow>

      <!-- 👉 Hero Button Submit -->
      <div class="w-100 d-flex justify-center align-center">
        <VBtn
          v-if="!isLoading"
          class="mx-auto w-100"
          type="submit"
          color="primary"
          variant="outlined"
          @click="onHeroSubmit"
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
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 4px;
  }
</style>
