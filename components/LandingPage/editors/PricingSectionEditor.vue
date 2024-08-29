<script setup lang="ts">
import { z } from 'zod'
import type { VForm } from 'vuetify/components'
import type { DrawerConfig, PlanData, PricingSectionType } from '@/types/landing-page'

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
const tiptapTitleInput = ref<string>('')
const tiptapDescriptionInput = ref<string>('')
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

const pricingData = ref<PlanData>({
  title: '',
  price: 0,
  features: [],
  support_type: '',
  support_medium: '',
  respond_time: '',
})

const pricingDataList = computed(() => {
  return pricingForm.value?.pricing_data
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
  pricingData.value = {
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
  return tiptapTitleInput.value = removeEmptyTags(editorValue)
}

function onDescriptionUpdate(editorValue: string) {
  return tiptapDescriptionInput.value = removeEmptyTags(editorValue)
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
  if (!pricingForm.value?.pricing_data)
    return false

  const foundPrice = pricingForm.value?.pricing_data[index]

  if (!foundPrice)
    return false

  pricingData.value = foundPrice

  selectedPricingIndex.value = index

  pricingDrawerOption.value = {
    isVisible: true,
    type: DRAWER_ACTION_TYPES.EDIT,
  }
}

function handlePricingChange(value: PlanData, type: DrawerActionTypes) {
  if (!pricingForm.value?.pricing_data || selectedPricingIndex.value === null)
    return

  if (pricingForm.value && type === DRAWER_ACTION_TYPES.EDIT) {
    pricingForm.value.pricing_data[selectedPricingIndex.value] = value

    selectedPricingIndex.value = null
  }
  else if (pricingForm.value && type === DRAWER_ACTION_TYPES.ADD) {
    pricingForm.value.pricing_data = [
      ...pricingForm.value?.pricing_data || [],
      value,
    ]
  }
  else if (pricingForm.value && type === DRAWER_ACTION_TYPES.DELETE) {
    pricingForm.value.pricing_data = pricingForm.value?.pricing_data?.filter(
      (price: PlanData) => price.title !== value.title,
    ) || []
  }
}

async function onSubmit() {
  const formData = {
    ...pricingForm.value,
  }

  const validInput = pricingSchema.safeParse(formData)

  if (!validInput.success) {
    error.value = validInput.error.format()
    console.log('««««« error.value »»»»»', error.value)

    notify('Invalid input, please check and try again', {
      type: 'error',
      timeout: 2000,
    })
  }
  else {
    error.value = null
    isLoading.value = true
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
      }
      else if ('error' in res && res.error) {
        notify(res.error, {
          type: 'error',
          timeout: 5000,
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

watch(pricingPlansData, (value) => {
  pricingForm.value = {
    pricing_title: value?.pricing_title as string,
    pricing_title_desc: value?.pricing_title_desc as string,
    pricing_data: [
      ...value?.pricing_data || [],
    ],
  }

  tiptapTitleInput.value = pricingForm.value.pricing_title
  tiptapDescriptionInput.value = pricingForm.value.pricing_title_desc as string
}, { deep: true, immediate: true })
</script>

<template>
  <VForm ref="formRef" @submit.prevent="onSubmit">
    <VLabel class="text-h3 text-capitalize text-primary font-weight-bold mb-4  d-block label">
      Pricing Section
    </VLabel>

    <div class="d-flex flex-column gap-4">
      <VRow>
        <VCol cols="12" md="4">
          <VCard class="pa-4">
            <div class="mb-6 position-relative">
              <VLabel class="mb-2 label">
                Pricing heading:
                <VIcon icon="ri-asterisk" class="text-error text-overline mb-2" />
              </VLabel>

              <TiptapEditor
                v-model="pricingForm.pricing_title"
                class="border rounded-lg title-content"
                :class="{ 'border-error border-opacity-100': error?.pricing_title && tiptapTitleInput.length === 0 }"
                placeholder="Text here..."
                @update:model-value="onTitleUpdate"
              />

              <div v-if="error?.pricing_title && tiptapTitleInput.length === 0">
                <span v-for="(warn, index) in error?.pricing_title?._errors" :key="index" class="text-error error-text">
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
                v-model="pricingForm.pricing_title_desc as string"
                class="border rounded-lg"
                :class="{ 'border-error border-opacity-100': error?.pricing_title_desc && tiptapDescriptionInput.length === 0 }"
                placeholder="Text here..."
                @update:model-value="onDescriptionUpdate"
              />
              <div v-if="error?.pricing_title_desc && tiptapDescriptionInput.length === 0">
                <span v-for="(warn, index) in error?.pricing_title_desc?._errors" :key="index" class="text-error error-text">
                  {{ warn }}
                </span>
              </div>
            </div>
          </VCard>
        </VCol>

        <VCol cols="12" md="8">
          <VCard class="pa-4">
            <VCardTitle class="text-center mb-4">
              Pricing Plans
            </VCardTitle>

            <VRow>
              <VCol cols="12" md="6" lg="4">
                <VCard class="add-card d-flex justify-center align-center pa-2" hover height="100%" ripple @click="handleOpenAddDrawer">
                  <VIcon icon="ri-add-circle-line" size="40" />
                </VCard>
              </VCol>

              <VCol v-for="(priceCard, index) in pricingForm.pricing_data" :key="index" cols="12" md="6" lg="4" @click="handleOpenEditDrawer(index)">
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
          </VCard>
        </VCol>
      </VRow>

      <!-- 👉 Pricing Button Submit -->
      <div class="w-100 d-flex justify-center align-center">
        <VBtn
          v-if="isLoading === false"
          class="mx-auto w-100"
          type="submit"
          color="primary"
          variant="outlined"
          @click="onSubmit"
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
    v-model="pricingData"
    :drawer-config="pricingDrawerOption" @update:is-drawer-open="handleToggleDrawer"
    @update:model-value="handlePricingChange"
  />
</template>

<style lang="scss" scoped>
  .label {
    line-height: 40px;
  }
.member-card {
  min-width: 30px;
  min-height: 180px;
  height: 100%;
  cursor: pointer;
  &:hover {
    background-color: rgba(var(--v-theme-on-surface), var(--v-hover-opacity));
  }
}

.add-card{
  min-height: 100px;
  cursor: pointer;
  border: 1px dashed rgba(var(--v-theme-on-surface), 0.12);
  &:hover {
    background-color: rgba(var(--v-theme-on-surface), var(--v-hover-opacity));
  }
}

.title-content {
  :deep(.ProseMirror) {
    min-block-size: 5vh;
  }
}
</style>
