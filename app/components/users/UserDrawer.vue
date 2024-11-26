<script setup lang="ts">
import type { User, UserWithRoles } from '@base/stores/admin/user'
import { emailValidator, requiredValidator } from '#imports'
import { useOrganizationStore } from '@base/stores/admin/organization'
import { useRoleStore } from '@base/stores/admin/role'
import { cloneDeep } from 'lodash-es'
import { PerfectScrollbar } from 'vue3-perfect-scrollbar'

const props = defineProps<{
  user?: UserWithRoles
}>()

const emit = defineEmits<{
  (e: 'edit', payload: Partial<User> & { roles: string[], organizations: string[] }): void
  (e: 'create', payload: Partial<User> & { roles: string[], organizations: string[] }): void
  (e: 'cancel'): void
}>()

const modelValue = defineModel<boolean>('modelValue', {
  default: false,
})

const roleStore = useRoleStore()

const organizationStore = useOrganizationStore()

const { data: roleData, execute: fetchRoles } = useAsyncData(() => roleStore.fetchRoles(), {
  immediate: false,
})

const { data: organizationData, execute: fetchOrganizations } = useAsyncData(() => organizationStore.fetchOrganizations(), {
  immediate: false,
})

function getDefaultFormData(): Partial<User> & { roles: string[], organizations: string[] } {
  return {
    email: '',
    phone: '',
    password: '',
    full_name: '',
    avatar_url: '',
    country: '',
    language: '',
    postcode: '',
    status: 'active',
    address: '',
    city: '',
    roles: [],
    organizations: [],
  }
}

const formData = ref(getDefaultFormData())

let syncStop: () => void
watch(modelValue, (value) => {
  if (value) {
    // non-block fetching
    fetchRoles()
    fetchOrganizations()

    syncStop = syncRef(computed(() => props.user), formData, {
      direction: 'ltr',
      transform: {
        ltr(left) {
          if (left)
            return cloneDeep(left)

          return getDefaultFormData()
        },
      },
    })
  }
  else {
    syncStop()
  }
})

// 👉  Upload image
const formFile = ref<File | null>(null)

async function handleUploadImage() {
  if (!formFile.value) {
    return
  }
  try {
    const ext = formFile.value.name.split('.').pop()
    const filename = formFile.value.name.replace(/\s/g, '_')
    const imageUrl = await uploadToS3(formFile.value, `sannatour/${filename || `${Date.now()}.${ext}`}`)

    return formData.value.avatar_url = imageUrl
  }
  catch {
    notifyError({
      content: 'Failed to upload image',
    })
  }
}

const formTemplate = useTemplateRef('formRef')

function handlesubmit() {
  formTemplate.value?.validate().then(async ({ valid }) => {
    if (valid) {
      await handleUploadImage()

      if (valid) {
        if (formData.value.id)
          emit('edit', formData.value)
        else
          emit('create', formData.value)
      }
    }
  })
}

function handleCancel() {
  modelValue.value = false

  emit('cancel')
}
</script>

<template>
  <VNavigationDrawer
    v-model="modelValue"
    temporary
    :width="400"
    location="end"
    class="scrollable-content"
  >
    <!-- 👉 Title -->
    <AppDrawerHeaderSection
      :title="user ? $t('Edit User') : $t('Add User')"
      @cancel="handleCancel"
    />

    <VDivider />

    <PerfectScrollbar :options="{ wheelPropagation: false }">
      <VCard flat>
        <VCardText>
          <!-- 👉 Form -->
          <VForm ref="formRef">
            <VRow>
              <VCol cols="12">
                <VSelect
                  v-model="formData.roles"
                  label="Select Role"
                  multiple
                  :items="roleData?.data || []"
                  placeholder="Select Role"
                  item-title="name"
                  item-value="id"
                />
              </VCol>

              <!-- 👉 Full name -->
              <VCol cols="12">
                <VTextField
                  v-model="formData.full_name"
                  :rules="[requiredValidator]"
                  label="Full Name"
                  placeholder="John Doe"
                />
              </VCol>

              <!-- 👉 Email -->
              <VCol cols="12">
                <VTextField
                  v-model="formData.email"
                  :rules="[requiredValidator, emailValidator]"
                  label="Email"
                  placeholder="johndoe@email.com"
                />
              </VCol>

              <!-- 👉 Phone -->
              <VCol cols="12">
                <VTextField
                  v-model="formData.phone"
                  type="number"
                  label="Phone Number"
                  placeholder="+1-541-754-3010"
                />
              </VCol>

              <VCol cols="12">
                <VSelect
                  v-model="formData.organizations"
                  label="Select Organization"
                  placeholder="Select Organization"
                  :items="organizationData?.data || []"
                  item-title="name"
                  item-value="id"
                />
              </VCol>

              <!-- 👉 Country -->
              <VCol cols="12">
                <VSelect
                  v-model="formData.country"
                  label="Select Country"
                  placeholder="Select Country"
                  :items="['United States', 'United Kingdom', 'France']"
                />
              </VCol>

              <!-- 👉 Language -->
              <VCol cols="12">
                <VSelect
                  v-model="formData.language"
                  label="Select Language"
                  placeholder="Select Language"
                  :items="['English', 'French', 'Spanish']"
                />
              </VCol>

              <!-- 👉 Status -->
              <VCol cols="12">
                <VSelect
                  v-model="formData.status"
                  label="Select Status"
                  placeholder="Select Status"
                  :items="[{ title: 'Active', value: 'active' }, { title: 'Inactive', value: 'deactivated' }, { title: 'Pending', value: 'pending' }]"
                />
              </VCol>

              <!-- 👉 Address -->
              <VCol cols="12">
                <VTextField
                  v-model="formData.address"
                  label="Address"
                  placeholder="123, Main Road, Your City"
                />
              </VCol>

              <!-- 👉 City -->
              <VCol cols="12">
                <VTextField
                  v-model="formData.city"
                  label="City"
                  placeholder="New York"
                />
              </VCol>

              <!-- 👉 Avatar -->
              <VCol cols="12">
                <AppDropZoneSingle
                  :model-value="formData.avatar_url!"
                  @update:model-value="formFile = $event"
                />
              </VCol>

              <VCol cols="12" class="text-right">
                <VBtn
                  class="me-4"
                  @click="handlesubmit"
                >
                  {{ $t('Submit') }}
                </VBtn>
                <VBtn
                  type="reset"
                  variant="outlined"
                  color="error"
                  @click="handleCancel"
                >
                  {{ $t('Cancel') }}
                </VBtn>
              </VCol>
            </VRow>
          </VForm>
        </VCardText>
      </VCard>
    </PerfectScrollbar>
  </VNavigationDrawer>
</template>
