<script setup lang="ts">
import { PerfectScrollbar } from 'vue3-perfect-scrollbar'
import { VForm } from 'vuetify/components/VForm'
import { cloneDeep } from 'lodash-es'
import type { DrawerConfig, PlanData } from '@/types/landing-page'

interface Emit {
  (e: 'update:isDrawerOpen', value: boolean): void
  (e: 'update:modelValue', value: PlanData, type?: 'add' | 'edit' | 'delete'): void
}

type DialogType = 'warning' | 'info'

interface DialogConfig {
  isDialogVisible: boolean
  title: string
  label: string
  type: DialogType
}

interface Props {
  drawerConfig: DrawerConfig
  modelValue: PlanData
}

const props = defineProps<Props>()

const emit = defineEmits<Emit>()

const formRef = ref<VForm>()

const localPriceData = ref<PlanData>({
  title: '',
  price: 0,
  features: [],
  support_type: '',
  support_medium: '',
  respond_time: '',
})

const dialogConfig = ref<DialogConfig>({
  isDialogVisible: false,
  title: '',
  label: '',
  type: 'info',
})

function handleDrawerModelValueUpdate(val: boolean) {
  emit('update:isDrawerOpen', val)

  if (!val) {
    formRef.value?.reset()
  }
}

function checkActionSubmit() {
  formRef.value?.validate().then(async (valid) => {
    const formData = { ...localPriceData.value }

    if (valid.valid) {
      if (props.drawerConfig.type === 'edit') {
        emit('update:modelValue', formData, 'edit')
      }
      else {
        emit('update:modelValue', formData, 'add')
      }

      emit('update:isDrawerOpen', false)

      await nextTick()
      formRef.value?.reset()
    }
  })
}

// delete reviewer --------------------------------------
function handleOpenConfirmation() {
  if (props.drawerConfig.type === 'add') {
    if (formRef.value) {
      dialogConfig.value = {
        isDialogVisible: true,
        title: 'Discard New Pricing Card',
        label: 'Are you sure you want to discard this pricing card?',
        type: 'info',
      }
    }
  }
  else if (props.drawerConfig.type === 'edit') {
    if (formRef.value) {
      dialogConfig.value = {
        isDialogVisible: true,
        title: 'Delete Pricing Card',
        label: 'Are you sure you want to delete this pricing card?',
        type: 'warning',
      }
    }
  }
}

function handleImageUpdate(file: File | null) {
  console.log('««««« file »»»»»', file)
}

function onConfirmDialog(value: boolean) {
  if (value) {
    emit('update:isDrawerOpen', false)
    emit('update:modelValue', localPriceData.value, 'delete')
    dialogConfig.value.isDialogVisible = false
  }
  else {
    emit('update:isDrawerOpen', true)
    dialogConfig.value.isDialogVisible = false
  }
}

function addFeature() {
  localPriceData.value.features.push('')
}

function removeFeature(index: number) {
  localPriceData.value.features.splice(index, 1)
}

watch(() => props.drawerConfig.isVisible, (val) => {
  if (val) {
    if (props.modelValue) {
      localPriceData.value = cloneDeep(props.modelValue)
    }
  }
}, {
  deep: true,
})
</script>

<template>
  <VNavigationDrawer
    location="end"
    :width="370"
    temporary
    persistent
    border="0"
    :model-value="drawerConfig.isVisible"
    @update:model-value="handleDrawerModelValueUpdate"
  >
    <!-- 👉 Header -->
    <AppDrawerHeaderSection
      :title="drawerConfig.type === 'add' ? 'Add Reviewer' : 'Edit Reviewer'"
      @cancel="$emit('update:isDrawerOpen', false)"
    />
    <VDivider />

    <PerfectScrollbar
      :options="{ wheelPropagation: false }"
      style="block-size: calc(100vh - 4rem);"
    >
      <VForm
        v-if="drawerConfig.isVisible"
        ref="formRef"
        @submit.prevent="checkActionSubmit"
      >
        <VCardText>
          <VRow>
            <VCol cols="12">
              <VLabel class="label mb-2">
                Card title
              </VLabel>
              <VTextField
                v-model="localPriceData.title"
                :rules="[requiredValidator]"
              />
            </VCol>

            <VCol cols="12">
              <VLabel class="label mb-2">
                Price
              </VLabel>
              <VTextField
                v-model="localPriceData.price"
                label="Price"
                type="number"
                :rules="[requiredValidator]"
                @update:model-value="(value: string | number) => localPriceData.price = Number(value)"
              />
            </VCol>

            <VCol cols="12" class="d-flex flex-column align-start gap-2">
              <VLabel class="label mb-2">
                Support type:
              </VLabel>
              <VTextField
                v-model="localPriceData.support_type"
                class="w-100"
              />
            </VCol>

            <VCol cols="12" class="d-flex flex-column align-start gap-2">
              <VLabel class="label mb-2">
                Support medium:
              </VLabel>
              <VTextField
                v-model="localPriceData.support_medium"
                class="w-100"
              />
            </VCol>

            <VCol cols="12" class="d-flex flex-column align-start gap-2">
              <VLabel class="label mb-2">
                Response time:
              </VLabel>
              <VTextField
                v-model="localPriceData.respond_time"
                class="w-100"
              />
            </VCol>

            <VCol cols="12">
              <VLabel class="label mb-2">
                Features:
              </VLabel>
              <VRow v-for="(_, index) in localPriceData.features" :key="index">
                <VCol cols="10">
                  <VTextField
                    v-model="localPriceData.features[index]"
                    :rules="[requiredValidator]"
                    :label=" `Feature ${index + 1}`"
                  />
                </VCol>
                <VCol cols="2" class="d-flex align-center">
                  <VBtn variant="text" icon rounded="lg" @click="removeFeature(index)">
                    <VIcon icon="ri-close-circle-line" />
                  </VBtn>
                </VCol>
              </VRow>
              <VBtn color="primary" class="mt-3" @click="addFeature">
                Add Feature
              </VBtn>
            </VCol>

            <VCol cols="12">
              <VBtn
                type="submit"
                class="me-3"
              >
                {{ drawerConfig.type === 'add' ? 'Add' : 'Update' }}
              </VBtn>

              <VBtn
                color="error"
                variant="outlined"
                @click="handleOpenConfirmation"
              >
                {{ drawerConfig.type === 'add' ? 'Cancel' : 'Delete' }}
              </VBtn>
            </VCol>
          </VRow>
        </VCardText>
      </VForm>
    </PerfectScrollbar>
  </VNavigationDrawer>

  <LandingPageEditDiaglog
    :is-dialog-visible="dialogConfig.isDialogVisible"
    :title="dialogConfig.title"
    :label="dialogConfig.label"
    :type="dialogConfig.type"
    @confirm="onConfirmDialog"
    @update:is-dialog-visible="dialogConfig.isDialogVisible = $event"
  />
</template>

<style lang="scss">
.assignee-select {
  .v-field__append-inner {
    .v-select__menu-icon {
      display: none;
    }
  }
}
.label {
    line-height: 40px;
}
</style>
