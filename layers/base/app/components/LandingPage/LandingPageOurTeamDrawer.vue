<script setup lang="ts">
import { PerfectScrollbar } from 'vue3-perfect-scrollbar'
import { VForm } from 'vuetify/components/VForm'
import { cloneDeep } from 'lodash-es'
import type { DrawerConfig, TeamData } from '@base/utils/types/landing-page'

interface Emit {
  (e: 'update:isDrawerOpen', value: boolean): void
  (e: 'update:modelValue', value: TeamData, type?: 'add' | 'edit' | 'delete'): void
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
  modelValue: TeamData
}

const props = defineProps<Props>()

const emit = defineEmits<Emit>()

const formRef = ref<VForm>()

const localMemberData = ref<TeamData>({
  id: '',
  name: '',
  position: '',
  image: null,
  background_color: '',
  border_color: '',
  social_networks: {
    facebook: '',
    twitterX: '',
    linkedin: '',
  },
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
    const formData = { ...localMemberData.value }

    if (valid.valid) {
      if (props.drawerConfig.type === 'edit') {
        emit('update:modelValue', formData, 'edit')
      }
      else {
        formData.id = crypto.randomUUID()
        emit('update:modelValue', formData, 'add')
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
        title: 'Discard New Member',
        label: 'Are you sure you want to discard this member?',
        type: 'info',
      }
    }
  }
  else if (props.drawerConfig.type === 'edit') {
    if (formRef.value) {
      dialogConfig.value = {
        isDialogVisible: true,
        title: 'Delete Member',
        label: 'Are you sure you want to delete this member?',
        type: 'warning',
      }
    }
  }
}

async function handleMemberImageUpdate(file: string, _: 'main' | 'sub', __: 'light' | 'dark') {
  localMemberData.value.image = file
}

function onConfirmDialog(value: boolean) {
  if (value) {
    emit('update:isDrawerOpen', false)
    emit('update:modelValue', localMemberData.value, 'delete')
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
      localMemberData.value = cloneDeep(props.modelValue)
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
                v-model="localMemberData.name"
                label="Memeber Name"
                :rules="[requiredValidator]"
              />
            </VCol>

            <VCol cols="12">
              <VTextField
                v-model="localMemberData.position"
                label="Position"
                :rules="[requiredValidator]"
              />
            </VCol>

            <VCol cols="12" class="d-flex flex-column align-start gap-2">
              <VLabel class="label">
                Facebook:
              </VLabel>
              <VTextField
                v-model="localMemberData.social_networks.facebook"
                label="Facebook link"
                class="w-100"
              />
            </VCol>

            <VCol cols="12" class="d-flex flex-column align-start gap-2">
              <VLabel class="label">
                Twitter:
              </VLabel>
              <VTextField
                v-model="localMemberData.social_networks.twitterX"
                label="Twitter link"
                class="w-100"
              />
            </VCol>

            <VCol cols="12" class="d-flex flex-column align-start gap-2">
              <VLabel class="label">
                LinkedIn:
              </VLabel>
              <VTextField
                v-model="localMemberData.social_networks.linkedin"
                label="LinkedIn link"
                class="w-100"
              />
            </VCol>

            <VCol cols="12">
              <LandingPageImagePreview
                id="image"
                :model-value="localMemberData.image"
                image-type="main"
                image-theme="light"
                @update:model-value="handleMemberImageUpdate"
              />
            </VCol>

            <VCol cols="12" class="d-flex flex-column align-start gap-2">
              <VLabel class="label">
                Prefer background color:
              </VLabel>
              <VTextField
                v-model="localMemberData.background_color"
                label="Background color"
                class="w-100"
              />
            </VCol>

            <VCol cols="12" class="d-flex flex-column align-start gap-2">
              <VLabel class="label">
                Prefer border color:
              </VLabel>
              <VTextField
                v-model="localMemberData.border_color"
                label="Border color"
                class="w-100"
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
