<script lang="ts" setup>
import { z } from 'zod'
import { cloneDeep } from 'lodash-es'
import type { VForm } from 'vuetify/components'
import { PerfectScrollbar } from 'vue3-perfect-scrollbar'

import SelectSolid from '@materialize/images/svg/3d-select-solid.svg'
import Edit from '@materialize/images/svg/edit.svg'
import GoogleDocs from '@materialize/images/svg/google-docs.svg'
import LaptopCharging from '@materialize/images/svg/laptop-charging.svg'
import Lifebelt from '@materialize/images/svg/lifebelt.svg'
import TransitionUp from '@materialize/images/svg/transition-up.svg'

import type { Feature, FeatureSectionType, LandingPageStatusEmit } from '@utils/types/landing-page'

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

const featureArrayData = computed<Feature[]>(() => featureForm.value.feature_data ?? [])
type FormSchemaType = z.infer<typeof featureSchema>
const error = ref<z.ZodFormattedError<FormSchemaType> | null>(null)

function onTitleUpdate(editorValue: string) {
  if (!editorValue)
    return ''

  if (editorValue.trim().length > 0 && error.value?.feature_title) {
    error.value.feature_title._errors = []
  }
  return featureForm.value.feature_title = removePTags(editorValue)
}

function onDescriptionUpdate(editorValue: string) {
  if (!editorValue)
    return ''

  if (editorValue.trim().length > 0 && error.value?.feature_title_desc) {
    error.value.feature_title_desc._errors = []
  }
  return featureForm.value.feature_title_desc = removePTags(editorValue)
}

const isCurrentFeatureValid = computed(() => {
  const currentFeature = featureArrayData.value[featureArrayData.value.length - 1]

  return currentFeature && currentFeature.name.trim() !== ''
    && currentFeature.desc.trim() !== ''
    && currentFeature.icon !== ''
})

function handleAddFeature() {
  featureForm.value?.feature_data?.push({ name: '', desc: '', icon: '' })
}

function handleRemoveFeature(index: number) {
  featureForm.value.feature_data?.splice(index, 1)
}

async function onFeatureSubmit() {
  const validInput = featureSchema.safeParse(featureForm.value)

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
  if (value) {
    featureForm.value = {
      feature_title: value.feature_title,
      feature_title_desc: value.feature_title_desc,
      feature_data: cloneDeep(value.feature_data as Feature[] ?? []),
    }
  }
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
              :class="{ 'border-error border-opacity-100': error?.feature_title && error?.feature_title?._errors?.length > 0 }"
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
              :class="{ 'border-error border-opacity-100': error?.feature_title_desc && error?.feature_title_desc?._errors?.length > 0 }"
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
                max-block-size: 500px;"
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
                @click="handleRemoveFeature(index)"
              >
                <VIcon icon="ri-close-circle-line" />
              </VBtn>
            </VCol>
          </VRow>
        </PerfectScrollbar>

        <VBtn
          v-if="featureArrayData && featureArrayData?.length > 0"
          class="mt-6"
          prepend-icon="ri-add-line"
          :disabled="!isCurrentFeatureValid"
          variant="tonal"
          @click="handleAddFeature"
        >
          Add another option
        </VBtn>

        <VBtn
          v-else
          class="mt-6"
          prepend-icon="ri-add-line"
          variant="tonal"
          @click="handleAddFeature"
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
                max-block-size: 500px;"
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
  margin-block-end: 8px;

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

.feature-container {
  margin-block-end: 8px;
  max-block-size: 400px;
  overflow-y: auto;

  &:last-of-type {
    margin-block-end: 0;
  }
}

.label {
  line-height: 40px;
}
</style>
