<script lang="ts" setup>
import { z } from 'zod'

import SelectSolid from '@images/svg/3d-select-solid.svg'
import Edit from '@images/svg/edit.svg'
import GoogleDocs from '@images/svg/google-docs.svg'
import LaptopCharging from '@images/svg/laptop-charging.svg'
import Lifebelt from '@images/svg/lifebelt.svg'
import TransitionUp from '@images/svg/transition-up.svg'

import type { FeatureSectionType } from '@/types/landing-page'

const { featureData } = storeToRefs(useLandingPageStore())

const tiptapTitleInput = ref<string>('')
const tiptapDescriptionInput = ref<string>('')
const isLoading = ref(false)

const featureForm = ref<FeatureSectionType>({
  feature_title: '',
  feature_title_desc: '',
  feature_data: [
    {
      name: '',
      desc: '',
      icon: '',
    },
  ],
})

type FormSchemaType = z.infer<typeof featureSchema>
const error = ref<z.ZodFormattedError<FormSchemaType> | null>(null)

const iconMap: Record<string, any> = {
  SelectSolid,
  Edit,
  GoogleDocs,
  LaptopCharging,
  Lifebelt,
  TransitionUp,
}

function onTitleUpdate(editorValue: string) {
  return tiptapTitleInput.value = removeEmptyTags(editorValue)
}

function onDescriptionUpdate(editorValue: string) {
  return tiptapDescriptionInput.value = removeEmptyTags(editorValue)
}

const isCurrentFeatureValid = computed(() => {
  const featureDataArray = featureForm.value.feature_data || []

  if (featureDataArray.length === 0) {
    return false
  }

  const currentFeature = featureDataArray[featureDataArray.length - 1]

  return currentFeature && currentFeature.name.trim() !== ''
    && currentFeature.desc.trim() !== ''
    && currentFeature.icon !== ''
})

async function onFeatureSubmit() {
  const formData = {
    ...featureForm.value,
    feature_title: tiptapTitleInput.value,
    feature_title_desc: tiptapDescriptionInput.value,
  }
  const validInput = featureSchema.safeParse(formData)

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
      await $api('/api/pages/landing-page/feature', {
        method: 'PATCH',
        body: featureForm.value,
      })

      notify('Feature section updated successfully', {
        type: 'success',
        timeout: 2000,
      })
    }
    catch (error) {
      if (error instanceof z.ZodError) {
        console.log(error.errors.map(err => err.message).join('\n'))
      }
      else {
        console.log('Unexpected error: ', error)
      }
    }
    finally {
      isLoading.value = false
    }
  }
}

watch(featureData, (value) => {
  featureForm.value = {
    feature_title: value?.feature_title ? removeEmptyTags(value.feature_title) : '',
    feature_title_desc: value?.feature_title_desc ? removeEmptyTags(value.feature_title_desc) : '',
    feature_data: [
      ...value?.feature_data || [],
    ],
  }
  tiptapTitleInput.value = featureForm.value.feature_title

  tiptapDescriptionInput.value = featureForm.value.feature_title_desc
}, {
  deep: true,
  immediate: true,
})
</script>

<template>
  <form class="landing-page-feature" @submit.prevent="onFeatureSubmit">
    <VLabel class="text-h3 text-capitalize text-primary font-weight-bold mb-4  d-block label">
      Feature Section
      <br>
      {{ featureForm.feature_title }}
      <br>
      {{ featureForm.feature_title_desc }}
    </VLabel>

    <div class="d-flex flex-column gap-4">
      <!-- 👉 Features Heading -->
      <VCard class="pa-4">
        <VCardTitle class="text-center mb-4">
          Feature heading
        </VCardTitle>

        <!-- 👉 Feature Main Title -->
        <div class="mb-6 position-relative">
          <VLabel class="mb-2 label">
            Feature title:
            <VIcon icon="ri-asterisk" class="text-error text-overline mb-2" />
          </VLabel>

          <TiptapEditor
            v-model="featureForm.feature_title"
            class="border rounded-lg title-content"
            :class="{ 'border-error border-opacity-100': error?.feature_title && tiptapTitleInput.length === 0 }"
            placeholder="Text here..."
            @update:model-value="onTitleUpdate"
          />

          <div v-if="error?.feature_title && tiptapTitleInput.length === 0">
            <span v-for="(warn, index) in error?.feature_title?._errors" :key="index" class="text-error error-text">
              {{ warn }}
            </span>
          </div>
        </div>

        <!-- 👉 Feature Main Description -->
        <div class="mb-6 position-relative">
          <VLabel class="mb-2 label">
            Description:
            <VIcon icon="ri-asterisk" class="text-error text-overline mb-2" />
          </VLabel>

          <TiptapEditor
            v-model="featureForm.feature_title_desc"
            class="border rounded-lg"
            :class="{ 'border-error border-opacity-100': error?.feature_title_desc && tiptapDescriptionInput.length === 0 }"
            placeholder="Text here..."
            @update:model-value="onDescriptionUpdate"
          />
        </div>
      </VCard>

      <!-- 👉 Features -->
      <VCard class="pa-4">
        <VCardTitle class="text-center mb-4">
          Feature content
        </VCardTitle>

        <VLabel class="mb-3 label">
          Feature title:
          <VIcon icon="ri-asterisk" class="text-error text-overline mb-2" />
        </VLabel>

        <VRow v-for="(feature, index) in featureForm.feature_data" :key="index" class="feature-container">
          <VCol cols="12" sm="4">
            <VTextField
              v-model="feature.name"
              placeholder="Text here..."
              label="Feature Name"
              class="mb-4"
            />

            <VSelect
              v-model="feature.icon"
              label="Icon"
              :items="['LaptopCharging', 'TransitionUp', 'Edit', 'SelectSolid', 'Lifebelt', 'GoogleDocs']"
            />
          </VCol>

          <VCol cols="12" sm="8">
            <VTextarea
              v-model="feature.desc"
              label="Feature description"
              placeholder="Text here..."
              rows="4"
            />
          </VCol>
        </VRow>

        <VBtn
          class="mt-6"
          prepend-icon="ri-add-line"
          :disabled="!isCurrentFeatureValid"
          variant="tonal"
          @click="featureForm?.feature_data?.push({ name: '', desc: '', icon: '' })"
        >
          Add another option
        </VBtn>
      </VCard>

      <!-- 👉 Features review -->
      <VCard class="pa-4">
        <VCardTitle class="text-center mb-4">
          Feature content
        </VCardTitle>

        <VCardText>
          <VRow>
            <VCol v-for="(feature, index) in featureForm.feature_data" :key="index" cols="12" sm="6" md="4">
              <div class="feature d-flex flex-column gap-y-2 align-center justify-center mt-2">
                <VAvatar variant="outlined" size="82" color="primary" class="mb-2">
                  <component :is="iconMap[feature.icon]" />
                </VAvatar>
                <h5 class="text-h5">
                  {{ feature.name }}
                </h5>
                <p class="text-center text-medium-emphasis" style="max-inline-size: 360px;">
                  {{ feature.desc }}
                </p>
              </div>
            </VCol>
          </VRow>
        </VCardText>
      </VCard>

      <!-- 👉 Feature Button Submit -->
      <div class="w-100 d-flex justify-center align-center">
        <VBtn
          v-if="isLoading === false"
          class="mx-auto w-100"
          type="submit"
          color="primary"
          variant="outlined"
          @click="onFeatureSubmit"
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
  </form>
</template>

<style lang="scss" scoped>
.emphasis-panels {
  border-color:rgba(133, 133, 133, 0.5) !important;

  &:hover {
  border-color:rgba(234, 234, 255, 0.7) !important;
  }
}

.title-content {
  :deep(.ProseMirror) {
    min-block-size: 5vh;
  }
}

.feature-container {
  margin-bottom: 8px;

  &:last-of-type {
    margin-bottom: 0;
  }
}
</style>
