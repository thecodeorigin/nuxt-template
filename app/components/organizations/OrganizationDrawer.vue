<script setup lang="ts">
import { cloneDeep } from 'lodash-es'
import { PerfectScrollbar } from 'vue3-perfect-scrollbar'

import type { VForm } from 'vuetify/components/VForm'
import type { Organization } from '@base/stores/admin/organization'
import type { DialogConfig, DrawerConfig } from '@base/utils/types'

interface Emit {
  (e: 'update:isDrawerOpen', value: boolean): void
  (e: 'update:modelValue', value: Partial<Organization>, type: 'add' | 'edit'): void
}

interface Props {
  modelValue: Partial<Organization>
  drawerConfig: DrawerConfig
}

const props = defineProps<Props>()
const emit = defineEmits<Emit>()

const isFormValid = ref(false)
const refForm = ref<VForm>()
const localOrganization = ref<Partial<Organization>>({
  id: '',
  name: '',
  avatar_url: '',
})

// 👉  Upload image
const localFile = ref<File | null>(null)
async function handleUploadImage() {
  if (!localFile.value) {
    return
  }
  try {
    const ext = localFile.value.name.split('.').pop()
    const filename = localFile.value.name.replace(/\s/g, '_')
    const imageUrl = await uploadToS3(localFile.value, `sanntour/${filename || `${Date.now()}.${ext}`}`)

    return localOrganization.value.avatar_url = imageUrl
  }
  catch (error) {
    console.error(error)
  }
}

// 👉 Dialog confirmation
const dialogConfig = ref<DialogConfig>({
  isDialogVisible: false,
  title: '',
  label: '',
  type: 'info',
})

function onConfirmDialog(value: boolean) {
  if (value) {
    if (props.drawerConfig.type === 'edit') {
      emit('update:isDrawerOpen', false)
      emit('update:modelValue', localOrganization.value, 'edit')
      dialogConfig.value.isDialogVisible = false
    }
    else {
      emit('update:isDrawerOpen', false)
      dialogConfig.value.isDialogVisible = false
    }
  }
}

// 👉 Drawer
// drawer close
function handleCloseDrawer() {
  if (props.drawerConfig.type === 'add') {
    if (refForm.value) {
      dialogConfig.value = {
        isDialogVisible: true,
        title: 'Discard New Organization',
        label: 'Are you sure you want to discard this new organization?',
        type: 'info',
      }
    }
  }
  else {
    emit('update:isDrawerOpen', false)

    nextTick(() => {
      refForm.value?.reset()
      refForm.value?.resetValidation()
    })
  }
}

// drawer submit
function onSubmit() {
  refForm.value?.validate().then(async ({ valid }) => {
    if (valid) {
      await handleUploadImage()
      localFile.value = null

      if (props.drawerConfig.type === 'edit') {
        dialogConfig.value = {
          isDialogVisible: true,
          title: 'Update Organization',
          label: 'Are you sure you want to update this organization?',
          type: 'warning',
        }
      }
      else {
        emit('update:modelValue', {
          name: localOrganization.value.name,
          avatar_url: localOrganization.value.avatar_url,
        }, 'add')

        emit('update:isDrawerOpen', false)

        nextTick(() => {
          refForm.value?.reset()
          refForm.value?.resetValidation()
        })
      }
    }
  })
}

function handleDrawerModelValueUpdate(val: boolean) {
  emit('update:isDrawerOpen', val)
}

watch(() => props.drawerConfig.isVisible, (val) => {
  if (val) {
    if (props.modelValue) {
      localOrganization.value = cloneDeep(props.modelValue)
    }
  }
}, {
  deep: true,
})
</script>

<template>
  <VNavigationDrawer
    temporary
    :width="400"
    location="end"
    class="scrollable-content"
    :model-value="props.drawerConfig.isVisible"
    @update:model-value="handleDrawerModelValueUpdate"
  >
    <!-- 👉 Title -->
    <AppDrawerHeaderSection
      :title="drawerConfig.type === 'add' ? 'Add New Organization' : 'Edit Existing Organization'"
      @cancel="handleCloseDrawer"
    />

    <VDivider />

    <PerfectScrollbar :options="{ wheelPropagation: false }">
      <VCard flat>
        <VCardText>
          <!-- 👉 Form -->
          <VForm
            ref="refForm"
            v-model="isFormValid"
            @submit.prevent="onSubmit"
          >
            <VRow>
              <!-- 👉 Name -->
              <VCol cols="12">
                <VTextField
                  v-model="localOrganization.name"
                  :rules="[requiredValidator]"
                  label="Organization Name"
                  placeholder="Company John Doe"
                />
              </VCol>

              <!-- 👉 Avatar -->
              <VCol cols="12">
                <AppDropZoneSingle
                  :model-value="localOrganization.avatar_url"
                  @update:model-value="localFile = $event"
                />
              </VCol>

              <!-- 👉 Submit and Cancel -->
              <VCol cols="12">
                <VBtn
                  type="submit"
                  class="me-4"
                >
                  {{ drawerConfig.type === 'add' ? 'Add' : 'Update' }}
                </VBtn>

                <VBtn
                  type="reset"
                  variant="outlined"
                  color="error"
                  @click="handleCloseDrawer"
                >
                  Cancel
                </VBtn>
              </VCol>
            </VRow>
          </VForm>
        </VCardText>
      </VCard>
    </PerfectScrollbar>
  </VNavigationDrawer>

  <AppDialog
    :is-dialog-visible="dialogConfig.isDialogVisible"
    :title="dialogConfig.title"
    :label="dialogConfig.label"
    :type="dialogConfig.type"
    @confirm="onConfirmDialog"
    @update:is-dialog-visible="dialogConfig.isDialogVisible = $event"
  />
</template>
