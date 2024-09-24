<script setup lang="ts">
import { PerfectScrollbar } from 'vue3-perfect-scrollbar'
import { VForm } from 'vuetify/components/VForm'
import type { CustomerReview, DrawerConfig } from '@utils/types/landing-page'

interface Emit {
  (e: 'update:isDrawerOpen', value: boolean): void
  (e: 'update:modelValue', value: CustomerReview, type?: 'add' | 'edit' | 'delete'): void
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
  modelValue: CustomerReview
}

const props = defineProps<Props>()

const emit = defineEmits<Emit>()

const formRef = ref<VForm>()

const localReviewerData = ref<CustomerReview>({
  id: '',
  desc: '',
  main_logo: null,
  logo_dark: '',
  logo_light: '',
  name: '',
  position: '',
  rating: null,
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
    if (valid.valid) {
      if (props.drawerConfig.type === 'edit') {
        emit('update:modelValue', localReviewerData.value, 'edit')
      }
      else {
        localReviewerData.value.id = crypto.randomUUID()
        emit('update:modelValue', localReviewerData.value, 'add')
      }

      emit('update:isDrawerOpen', false)

      await nextTick()
      formRef.value?.reset()
    }
  })
}

function handleOpenConfirmation() {
  if (props.drawerConfig.type === 'add') {
    if (formRef.value) {
      dialogConfig.value = {
        isDialogVisible: true,
        title: 'Discard New Reviewer',
        label: 'Are you sure you want to discard this reviewer?',
        type: 'info',
      }
    }
  }
  else if (props.drawerConfig.type === 'edit') {
    if (formRef.value) {
      dialogConfig.value = {
        isDialogVisible: true,
        title: 'Delete Reviewer',
        label: 'Are you sure you want to delete this reviewer?',
        type: 'warning',
      }
    }
  }
}

async function handleMainLogoUpdate(file: string, imageType: 'main' | 'sub', theme: 'light' | 'dark') {
  if (imageType === 'main') {
    localReviewerData.value.main_logo = file
  }
  else {
    if (theme === 'light') {
      localReviewerData.value.logo_light = file
    }
    else {
      localReviewerData.value.logo_dark = file
    }
  }
}

function onConfirmDialog(value: boolean) {
  if (value) {
    emit('update:isDrawerOpen', false)
    emit('update:modelValue', localReviewerData.value, 'delete')
    dialogConfig.value.isDialogVisible = false
  }
  else {
    emit('update:isDrawerOpen', true)
    dialogConfig.value.isDialogVisible = false
  }
}

watch(() => props.drawerConfig.isVisible, (val) => {
  if (val) {
    if (props.modelValue) {
      localReviewerData.value = { ...props.modelValue }
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
              <VTextField
                v-model="localReviewerData.name"
                label="Reviewer Name"
                :rules="[requiredValidator]"
              />
            </VCol>

            <VCol cols="12">
              <VTextField
                v-model="localReviewerData.position"
                label="Position"
                :rules="[requiredValidator]"
              />
            </VCol>

            <VCol cols="12" class="d-flex align-center gap-2">
              <VLabel class="label">
                Rating:
              </VLabel>
              <VRating
                v-model="localReviewerData.rating"
                @update:model-value="(value: string | number) => localReviewerData.rating = Number(value)"
              />
            </VCol>

            <VCol cols="12">
              <VLabel class="label">
                Main Logo:
              </VLabel>

              <LandingPageImagePreview
                id="image"
                image-type="main"
                image-theme="light"
                :model-value="localReviewerData.main_logo"
                @update:model-value="handleMainLogoUpdate"
              />
            </VCol>

            <VCol cols="12">
              <VLabel class="label">
                Sub Logo Light:
              </VLabel>

              <LandingPageImagePreview
                id="image"
                image-type="sub"
                image-theme="light"
                :model-value="localReviewerData.logo_light"
                @update:model-value="handleMainLogoUpdate"
              />
            </VCol>

            <VCol cols="12">
              <VLabel class="label">
                Sub Logo Dark:
              </VLabel>

              <LandingPageImagePreview
                id="image"
                image-type="sub"
                image-theme="dark"
                :model-value="localReviewerData.logo_dark"
                @update:model-value="handleMainLogoUpdate"
              />
            </VCol>

            <VCol cols="12">
              <VTextarea
                v-model="localReviewerData.desc"
                label="Comment"
                placeholder="Write a comment..."
                rows="5"
                textarea
              />
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
  line-height: 20px;
}
</style>
