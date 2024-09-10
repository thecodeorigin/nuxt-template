<script lang="ts" setup>
import { z } from 'zod'
import { cloneDeep } from 'lodash-es'
import type { VForm } from 'vuetify/components'
import { PerfectScrollbar } from 'vue3-perfect-scrollbar'

import SelectSolid from '@images/svg/3d-select-solid.svg'
import Edit from '@images/svg/edit.svg'
import GoogleDocs from '@images/svg/google-docs.svg'
import LaptopCharging from '@images/svg/laptop-charging.svg'
import Lifebelt from '@images/svg/lifebelt.svg'
import TransitionUp from '@images/svg/transition-up.svg'

import type { Feature, FeatureSectionType, LandingPageStatusEmit } from '@/types/landing-page'

const emit = defineEmits<LandingPageStatusEmit>()

const { featureData } = storeToRefs(useLandingPageStore())

const isLoading = ref(false)
const formRef = ref<VForm>()
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
const imageMappings: { [key: string]: string | null } = {
  '': null,
  'Select Solid': SelectSolid,
  'Edit': Edit,
  'Google Docs': GoogleDocs,
  'Laptop Charging': LaptopCharging,
  'Life Belt': Lifebelt,
  'Transition Up': TransitionUp,
}

const imageNameList = Object.keys(imageMappings)

const featureArrayData = computed(() => featureForm.value?.feature_data as Feature[])

type FormSchemaType = z.infer<typeof featureSchema>
const error = ref<z.ZodFormattedError<FormSchemaType> | null>(null)

function onTitleUpdate(editorValue: string) {
  if (editorValue.trim().length > 0 && error.value?.feature_title) {
    error.value.feature_title._errors = []
  }
  return featureForm.value.feature_title = removePTags(editorValue)
}

function onDescriptionUpdate(editorValue: string) {
  if (editorValue.trim().length > 0 && error.value?.feature_title_desc) {
    error.value.feature_title_desc._errors = []
  }
  return featureForm.value.feature_title_desc = removePTags(editorValue)
}

const isCurrentFeatureValid = computed(() => {
  if (featureArrayData.value.length === 0) {
    return false
  }

  const currentFeature = featureArrayData.value[featureArrayData.value.length - 1]

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

    emit('update:sectionStatus', 'error')
  }
  else {
    error.value = null
    isLoading.value = true
    emit('update:sectionStatus', 'loading')

    try {
      const res = await $api('/api/pages/landing-page/feature', {
        method: 'PATCH',
        body: featureForm.value,
      })

      if (res.success) {
        notify('Feature section updated successfully', {
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
  onFeatureSubmit,
})

watch(featureData, (value) => {
  if (value)
    featureForm.value = cloneDeep(value)
}, {
  deep: true,
  immediate: true,
})
</script>

<template>
  <VForm ref="formRef" class="landing-page-feature" @submit.prevent="onFeatureSubmit">
    <VLabel class="text-h3 text-capitalize text-primary font-weight-bold mb-4  d-block label">
      Feature Section
    </VLabel>

    <div class="d-flex flex-column gap-4">
      <!-- 👉 Features Heading -->
      <VCard class="pa-4">
        <VCardTitle class="text-center mb-4">
          Feature heading
        </VCardTitle>

        <VRow>
          <!-- 👉 Feature Main Title -->
          <VCol class="mb-6 position-relative" cols="12" sm="6">
            <VLabel class="mb-2 label">
              Feature heading:
              <VIcon icon="ri-asterisk" class="text-error text-overline mb-2" />
            </VLabel>

            <TiptapEditor
              v-model="featureForm.feature_title as string"
              class="border rounded-lg title-content"
              :class="{ 'border-error border-opacity-100': error?.feature_title && error?.feature_title?._errors.length > 0 }"
              placeholder="Text here..."
              @update:model-value="onTitleUpdate"
            />

            <div v-if="error?.feature_title">
              <span v-for="(warn, index) in error?.feature_title?._errors" :key="index" class="text-error error-text">
                {{ warn }}
              </span>
            </div>
          </VCol>

          <!-- 👉 Feature Main Description -->
          <VCol class="mb-6 position-relative" cols="12" sm="6">
            <VLabel class="mb-2 label">
              Description:
              <VIcon icon="ri-asterisk" class="text-error text-overline mb-2" />
            </VLabel>

            <TiptapEditor
              v-model="featureForm.feature_title_desc as string"
              class="border rounded-lg mb-2"
              :class="{ 'border-error border-opacity-100': error?.feature_title_desc && error?.feature_title_desc?._errors.length > 0 }"
              placeholder="Text here..."
              @update:model-value="onDescriptionUpdate"
            />

            <div v-if="error?.feature_title_desc">
              <span v-for="(warn, index) in error?.feature_title_desc?._errors" :key="index" class="text-error error-text">
                {{ warn }}
              </span>
            </div>
          </VCol>
        </VRow>
      </VCard>

      <!-- 👉 Features -->
      <VCard class="features-card pa-4">
        <VCardTitle class="text-center mb-4">
          Feature content
        </VCardTitle>

        <VLabel class="mb-3 mr-2 label">
          Features:
          <VIcon icon="ri-asterisk" class="text-error text-overline mb-2" />
        </VLabel>

        <PerfectScrollbar
          :options="{ wheelPropagation: false }"
          style="padding: 16px;
                max-height: 500px;"
        >
          <VRow v-for="(feature, index) in featureArrayData" :key="index">
            <VCol cols="12" sm="4">
              <VTextField
                v-model="feature.name"
                placeholder="Text here..."
                label="Feature Name"
                :rules="[requiredValidator]"
                class="mb-4"
              />

              <VSelect
                v-model="feature.icon"
                label="Icon"
                :items="imageNameList"
              />
            </VCol>

            <VCol cols="12" sm="7">
              <VTextarea
                v-model="feature.desc"
                label="Feature description"
                placeholder="Text here..."
                rows="4"
                :rules="[requiredValidator]"
              />
            </VCol>

            <VCol cols="12" sm="1" class="d-flex align-center">
              <VBtn
                icon
                variant="tonal"
                color="error"
                rounded="lg"
                class="w-100 h-100 d-flex align-center justify-center pa-2"
                @click="featureArrayData?.splice(index, 1)"
              >
                <VIcon icon="ri-close-circle-line" />
              </VBtn>
            </VCol>
          </VRow>
        </PerfectScrollbar>

        <VBtn
          v-if="featureArrayData.length > 0"
          class="mt-6"
          prepend-icon="ri-add-line"
          :disabled="!isCurrentFeatureValid"
          variant="tonal"
          @click="featureArrayData?.push({ name: '', desc: '', icon: '' })"
        >
          Add another option
        </VBtn>

        <VBtn
          v-if="featureArrayData.length === 0"
          class="mt-6"
          prepend-icon="ri-add-line"
          variant="tonal"
          @click="featureArrayData?.push({ name: '', desc: '', icon: '' })"
        >
          Add a new feature
        </VBtn>
      </VCard>

      <!-- 👉 Features review -->
      <VCard class="pa-4">
        <VCardTitle class="text-center mb-4">
          Feature display
        </VCardTitle>

        <PerfectScrollbar
          :options="{ wheelPropagation: false, suppressScrollX: true, swipeEasing: true }"
          style="padding: 16px;
                max-height: 500px;"
        >
          <VRow>
            <VCol v-for="(feature, index) in featureArrayData" :key="index" cols="12" sm="6" md="4">
              <div class="feature d-flex flex-column gap-y-2 align-center justify-center mt-2">
                <VAvatar variant="outlined" size="82" color="primary" class="mb-2">
                  <component :is="imageMappings[feature.icon]" />
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
        </PerfectScrollbar>
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
  </VForm>
</template>

<style lang="scss" scoped>
  .title-content {
    margin-bottom: 8px;
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

.feature-container {
  margin-bottom: 8px;
  max-height: 400px;
  overflow-y: auto;

  &:last-of-type {
    margin-bottom: 0;
  }
}
.label {
    line-height: 40px;
  }
</style>
