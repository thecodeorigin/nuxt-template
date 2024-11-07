<script setup lang="ts">
import { cloneDeep } from 'lodash-es'
import { PerfectScrollbar } from 'vue3-perfect-scrollbar'

import type { VForm } from 'vuetify/components/VForm'
import { type Organization, useOrganizationStore } from '~/stores/admin/organization'
import type { User } from '~/stores/admin/user'
import type { DialogConfig, DrawerConfig } from '~/utils/types'

interface Emit {
  (e: 'update:isDrawerOpen', value: boolean): void
  (e: 'update:modelValue', value: Partial<User>, type: 'add' | 'edit'): void
}

interface Props {
  modelValue: Partial<User>
  drawerConfig: DrawerConfig
}

const props = defineProps<Props>()
const emit = defineEmits<Emit>()

const organizationStore = useOrganizationStore()
const { organizationList } = storeToRefs(organizationStore)
const { fetchOrganizations } = organizationStore
const localOrganization = computed(() =>
  organizationList.value?.map((organization: Organization) => ({
    id: organization.id,
    name: organization.name,
  })) || [],
)

const isFormValid = ref(false)
const refForm = ref<VForm>()

const localUser = ref<Partial<User>>({
  id: '',
  email: '',
  phone: '',
  provider: '',
  full_name: '',
  avatar_url: '',
  role_id: '',
  organization_id: null,
  country: '',
  language: '',
  postcode: '',
  status: 'pending',
  address: '',
  city: '',
  email_verified: null,
})

// 👉  Upload image
const localFile = ref<File | null>(null)
async function handleUploadImage() {
  if (!localFile.value) {
    return ''
  }
  try {
    const ext = localFile.value.name.split('.').pop()
    const filename = localFile.value.name.replace(/\s/g, '_')
    const imageUrl = await uploadToS3(localFile.value, `sanntour/${filename || `${Date.now()}.${ext}`}`)

    return localUser.value.avatar_url = imageUrl
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
      emit('update:modelValue', localUser.value, 'edit')
      dialogConfig.value.isDialogVisible = false
    }
    else {
      dialogConfig.value.isDialogVisible = false
      emit('update:isDrawerOpen', false)
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
        title: 'Discard New Member',
        label: 'Are you sure you want to discard this new user?',
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
  refForm.value?.validate().then(({ valid }) => {
    if (valid) {
      if (props.drawerConfig.type === 'edit') {
        dialogConfig.value = {
          isDialogVisible: true,
          title: 'Delete Member',
          label: 'Are you sure you want to update this user?',
          type: 'warning',
        }
      }
      else {
        emit('update:modelValue', {
          email: localUser.value.email,
          phone: localUser.value.phone,
          full_name: localUser.value.full_name,
          avatar_url: localUser.value.avatar_url,
          country: localUser.value.country,
          language: localUser.value.language,
          postcode: localUser.value.postcode,
          status: localUser.value.status && localUser.value.status?.length > 0 ? localUser.value.status : 'pending',
          address: localUser.value.address,
          city: localUser.value.city,
          role_id: '4b181352-d30c-4d63-83b6-7ce842caa873', // TODO: update role when CRUD for role
          organization_id: localUser.value.organization_id,
          email_verified: localUser.value.email_verified,
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

watch(() => props.drawerConfig.isVisible, async (val) => {
  if (val) {
    if (props.modelValue) {
      localUser.value = cloneDeep(props.modelValue)
    }

    await fetchOrganizations()
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
      :title="drawerConfig.type === 'add' ? 'Add New User' : 'Edit Existing User'"
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
              <!-- 👉 Full name -->
              <VCol cols="12">
                <VTextField
                  v-model="localUser.full_name"
                  :rules="[requiredValidator]"
                  label="Full Name"
                  placeholder="John Doe"
                />
              </VCol>

              <!-- 👉 Email -->
              <VCol cols="12">
                <VTextField
                  v-model="localUser.email"
                  :rules="[requiredValidator, emailValidator]"
                  label="Email"
                  placeholder="johndoe@email.com"
                />
              </VCol>

              <!-- 👉 Phone -->
              <VCol cols="12">
                <VTextField
                  v-model="localUser.phone"
                  type="number"
                  label="Phone Number"
                  placeholder="+1-541-754-3010"
                />
              </VCol>

              <!-- 👉 Organization -->
              <VCol cols="12">
                <VSelect
                  v-model="localUser.organization_id"
                  label="Select Organization"
                  placeholder="Select Organization"
                  :items="[{ id: null, name: 'No Organization' }, ...localOrganization]"
                  item-title="name"
                  item-value="id"
                />
              </VCol>

              <!-- 👉 Country -->
              <VCol cols="12">
                <VSelect
                  v-model="localUser.country"
                  label="Select Country"
                  placeholder="Select Country"
                  :items="['United States', 'United Kingdom', 'France']"
                />
              </VCol>

              <!-- 👉 Language -->
              <VCol cols="12">
                <VSelect
                  v-model="localUser.language"
                  label="Select Language"
                  placeholder="Select Language"
                  :items="['English', 'French', 'Spanish']"
                />
              </VCol>

              <!-- 👉 Status -->
              <VCol cols="12">
                <VSelect
                  v-model="localUser.status"
                  label="Select Status"
                  placeholder="Select Status"
                  :items="[{ title: 'Active', value: 'active' }, { title: 'Inactive', value: 'deactivated' }, { title: 'Pending', value: 'pending' }]"
                />
              </VCol>

              <!-- 👉 Address -->
              <VCol cols="12">
                <VTextField
                  v-model="localUser.address"
                  label="Address"
                  placeholder="123, Main Road, Your City"
                />
              </VCol>

              <!-- 👉 City -->
              <VCol cols="12">
                <VTextField
                  v-model="localUser.city"
                  label="City"
                  placeholder="New York"
                />
              </VCol>

              <!-- 👉 Avatar -->
              <VCol cols="12">
                <AppDropZoneSingle
                  :model-value="localUser.avatar_url!"
                  @update:model-value="localFile = $event"
                />
              </VCol>

              <!-- 👉 Submit and Cancel -->
              <VCol cols="12">
                <VBtn
                  type="submit"
                  class="me-4"
                >
                  Submit
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
