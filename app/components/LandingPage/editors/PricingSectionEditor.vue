<script setup lang="ts">
import { z } from 'zod'
import type { VForm } from 'vuetify/components'
import { cloneDeep } from 'lodash-es'
import { PerfectScrollbar } from 'vue3-perfect-scrollbar'

import type { DrawerConfig, LandingPageStatusEmit, PlanData, PricingSectionType } from '@utils/types/landing-page'

const emit = defineEmits<LandingPageStatusEmit>()

const { pricingPlansData } = storeToRefs(useLandingPageStore())
const DRAWER_ACTION_TYPES = {
  ADD: 'add' as const,
  EDIT: 'edit' as const,
  DELETE: 'delete' as const,
}
export type DrawerActionTypes = typeof DRAWER_ACTION_TYPES[keyof typeof DRAWER_ACTION_TYPES] | undefined

const pricingDrawerOption = ref<DrawerConfig>({
  isVisible: false,
  type: DRAWER_ACTION_TYPES.ADD,
})
const formRef = ref<VForm>()
const isLoading = ref(false)
const selectedPricingIndex = ref<number | null>(null)
const pricingForm = ref<PricingSectionType>({
  pricing_title: '',
  pricing_title_desc: '',
  pricing_data: [
    {
      title: '',
      price: 0,
      features: [],
      support_type: '',
      support_medium: '',
      respond_time: '',
    },
  ],
})

const pricingList = computed<PlanData[]>(() => pricingForm.value.pricing_data)

const selectedPricingData = ref<PlanData>({
  title: '',
  price: 0,
  features: [],
  support_type: '',
  support_medium: '',
  respond_time: '',
})

function priceFormatted(price: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(price)
}

function clearPricingData() {
  selectedPricingData.value = {
    title: '',
    price: 0,
    features: [],
    support_type: '',
    support_medium: '',
    respond_time: '',
  }
}

type FormSchemaType = z.infer<typeof pricingSchema>
const error = ref<z.ZodFormattedError<FormSchemaType> | null>(null)

function onTitleUpdate(editorValue: string) {
  if (editorValue.trim().length > 0 && error.value?.pricing_title) {
    error.value.pricing_title._errors = []
  }
  return pricingForm.value.pricing_title = removePTags(editorValue)
}

function onDescriptionUpdate(editorValue: string) {
  if (editorValue.trim().length > 0 && error.value?.pricing_title_desc) {
    error.value.pricing_title_desc._errors = []
  }
  return pricingForm.value.pricing_title_desc = removePTags(editorValue)
}

function handleToggleDrawer(val: boolean) {
  pricingDrawerOption.value.isVisible = val
}

function handleOpenAddDrawer() {
  pricingDrawerOption.value = {
    isVisible: true,
    type: DRAWER_ACTION_TYPES.ADD,
  }

  clearPricingData()
}

function handleOpenEditDrawer(index: number) {
  if (!pricingList.value)
    return false

  const foundPrice = pricingList.value[index]

  if (!foundPrice)
    return false

  selectedPricingData.value = foundPrice

  selectedPricingIndex.value = index

  pricingDrawerOption.value = {
    isVisible: true,
    type: DRAWER_ACTION_TYPES.EDIT,
  }
}

function handlePricingChange(value: PlanData, type: DrawerActionTypes) {
  if (pricingForm.value && type === DRAWER_ACTION_TYPES.EDIT) {
    if (!selectedPricingIndex.value) {
      return
    }
    pricingList.value[selectedPricingIndex.value] = value

    selectedPricingIndex.value = null
  }
  else if (pricingForm.value && type === DRAWER_ACTION_TYPES.ADD) {
    pricingForm.value.pricing_data = [
      ...pricingForm.value.pricing_data as PlanData[] || [],
      value,
    ]
  }
  else if (pricingForm.value && type === DRAWER_ACTION_TYPES.DELETE) {
    pricingForm.value.pricing_data = pricingList.value.filter(
      (price: PlanData) => price.title !== value.title,
    ) || []
  }
}

async function onPricingSubmit() {
  const validInput = pricingSchema.safeParse(pricingForm.value)

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
      const res = await $api('/api/pages/landing-page/pricing', {
        method: 'PATCH',
        body: pricingForm.value,
      })

      if ('success' in res && res.success) {
        notify('Successfully updated', {
          type: 'success',
          timeout: 3000,
        })

        emit('update:sectionStatus', 'success')
      }
      else if ('error' in res && res.error) {
        notify(res.error, {
          type: 'error',
          timeout: 5000,
        })

        emit('update:sectionStatus', 'error')
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
  onPricingSubmit,
})

watch(pricingPlansData, (value) => {
  if (value) {
    pricingForm.value = cloneDeep(value)
  }
}, { deep: true, immediate: true })
</script>

<template>
  <div>
    <VForm ref="formRef" @submit.prevent="onPricingSubmit">
      <VLabel class="text-h3 text-capitalize text-primary font-weight-bold mb-4  d-block label">
        Pricing Section
      </VLabel>

      <div class="d-flex flex-column gap-4">
        <!-- 👉 Pricing Heading -->
        <VCard class="pa-4">
          <VCardTitle class="text-center mb-4">
            Pricing heading
          </VCardTitle>

          <VRow>
            <!-- 👉 Pricing Title -->
            <VCol cols="12" sm="6" class="mb-6 position-relative">
              <VLabel class="mb-2 label">
                Pricing heading:
                <VIcon icon="ri-asterisk" class="text-error text-overline mb-2" />
              </VLabel>

              <TiptapEditor
                v-model="pricingForm.pricing_title as string"
                class="border rounded-lg title-content mb-2"
                :class="{ 'border-error border-opacity-100': error?.pricing_title && error?.pricing_title?._errors.length > 0 }"
                placeholder="Text here..."
                @update:model-value="onTitleUpdate"
              />

              <div v-if="error?.pricing_title">
                <span v-for="(warn, index) in error?.pricing_title?._errors" :key="index" class="text-error error-text">
                  {{ warn }}
                </span>
              </div>
            </VCol>

            <!-- 👉 Pricing Description -->
            <VCol cols="12" sm="6" class="mb-6 position-relative">
              <VLabel class="mb-2 label">
                Description:
                <VIcon icon="ri-asterisk" class="text-error text-overline mb-2" />
              </VLabel>

              <TiptapEditor
                v-model="pricingForm.pricing_title_desc as string"
                class="border rounded-lg mb-2"
                :class="{ 'border-error border-opacity-100': error?.pricing_title_desc && error?.pricing_title_desc?._errors.length > 0 }"
                placeholder="Text here..."
                @update:model-value="onDescriptionUpdate"
              />
              <div v-if="error?.pricing_title_desc">
                <span v-for="(warn, index) in error?.pricing_title_desc?._errors" :key="index" class="text-error error-text">
                  {{ warn }}
                </span>
              </div>
            </VCol>
          </VRow>
        </VCard>

        <!-- 👉 Pricing Plans -->
        <VCard class="pa-4 h-100">
          <VCardTitle class="text-center mb-4">
            Pricing Plans
          </VCardTitle>
          <PerfectScrollbar
            :options="{ wheelPropagation: false }"
            style="padding: 16px;
                  max-block-size: 500px;"
          >
            <VRow>
              <VCol cols="12" md="6" lg="4">
                <VCard class="add-card d-flex justify-center align-center pa-2" hover height="100%" ripple @click="handleOpenAddDrawer">
                  <VIcon icon="ri-add-circle-line" size="40" />
                </VCard>
              </VCol>

              <VCol v-for="(priceCard, index) in pricingList" :key="index" cols="12" md="6" lg="4" @click="handleOpenEditDrawer(index)">
                <VCard class="price-card d-flex flex-column align-center pa-5" hover min-width="100" max-height="200" ripple>
                  <VCardTitle class="text-center d-flex flex-column">
                    {{ priceCard.title }}

                    <span class="text-body-2">
                      {{ priceFormatted(priceCard.price) }}
                    </span>
                  </VCardTitle>
                </VCard>
              </VCol>
            </VRow>
          </PerfectScrollbar>
        </VCard>

        <!-- 👉 Pricing Button Submit -->
        <div class="w-100 d-flex justify-center align-center">
          <VBtn
            v-if="isLoading === false"
            class="mx-auto w-100"
            type="submit"
            color="primary"
            variant="outlined"
          >
            Update Pricing Section Content
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
    <LandingPagePricingDrawer
      v-model="selectedPricingData"
      :drawer-config="pricingDrawerOption" @update:is-drawer-open="handleToggleDrawer"
      @update:model-value="handlePricingChange"
    />
  </div>
</template>

<style lang="scss" scoped>
.label {
  line-height: 40px;
}

.member-card {
  block-size: 100%;
  cursor: pointer;
  min-block-size: 180px;
  min-inline-size: 30px;

  &:hover {
    background-color: rgba(var(--v-theme-on-surface), var(--v-hover-opacity));
  }
}

.add-card {
  border: 1px dashed rgba(var(--v-theme-on-surface), 0.12);
  cursor: pointer;
  min-block-size: 100px;

  &:hover {
    background-color: rgba(var(--v-theme-on-surface), var(--v-hover-opacity));
  }
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
