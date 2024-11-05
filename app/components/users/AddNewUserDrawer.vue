<script setup lang="ts">
import crypto from 'node:crypto'
import { PerfectScrollbar } from 'vue3-perfect-scrollbar'

import type { VForm } from 'vuetify/components/VForm'

interface Emit {
  (e: 'update:isDrawerOpen', value: boolean): void
  (e: 'userData', value: any): void
}

interface Props {
  isDrawerOpen: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<Emit>()

const isFormValid = ref(false)
const refForm = ref<VForm>()

const email = ref('')
const phone = ref('')
const fullName = ref('')
const country = ref()
const language = ref()
const status = ref()
const address = ref('')
const city = ref('')

// 👉 drawer close
function closeNavigationDrawer() {
  emit('update:isDrawerOpen', false)

  nextTick(() => {
    refForm.value?.reset()
    refForm.value?.resetValidation()
  })
}

function onSubmit() {
  refForm.value?.validate().then(({ valid }) => {
    if (valid) {
      emit('userData', {
        id: crypto.randomUUID(),
        email: email.value,
        phone: phone.value,
        provider: '',
        full_name: fullName.value,
        avatar: '',
        role_id: '',
        organization_id: '2de22df6-8773-478b-8895-2f2efd9f76e1',
        country: country.value,
        language: language.value,
        organization: '',
        postcode: '',
        status: status.value,
        address: '',
        city: '',
        email_verified: null,
      })
      emit('update:isDrawerOpen', false)
      nextTick(() => {
        refForm.value?.reset()
        refForm.value?.resetValidation()
      })
    }
  })
}

function handleDrawerModelValueUpdate(val: boolean) {
  emit('update:isDrawerOpen', val)
}
</script>

<template>
  <VNavigationDrawer
    temporary
    :width="400"
    location="end"
    class="scrollable-content"
    :model-value="props.isDrawerOpen"
    @update:model-value="handleDrawerModelValueUpdate"
  >
    <!-- 👉 Title -->
    <AppDrawerHeaderSection
      title="Add User"
      @cancel="closeNavigationDrawer"
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
                  v-model="fullName"
                  :rules="[requiredValidator]"
                  label="Full Name"
                  placeholder="John Doe"
                />
              </VCol>

              <!-- 👉 Email -->
              <VCol cols="12">
                <VTextField
                  v-model="email"
                  :rules="[requiredValidator, emailValidator]"
                  label="Email"
                  placeholder="johndoe@email.com"
                />
              </VCol>

              <!-- 👉 Phone -->
              <VCol cols="12">
                <VTextField
                  v-model="phone"
                  type="number"
                  :rules="[requiredValidator]"
                  label="Phone Number"
                  placeholder="+1-541-754-3010"
                />
              </VCol>

              <!-- 👉 Company -->
              <!-- <VCol cols="12">
                <VTextField
                  v-model="company"
                  :rules="[requiredValidator]"
                  label="Company"
                  placeholder="Pixinvent"
                />
              </VCol> -->

              <!-- 👉 Country -->
              <VCol cols="12">
                <VSelect
                  v-model="country"
                  label="Select Country"
                  placeholder="Select Country"
                  :items="['United States', 'United Kingdom', 'France']"
                />
              </VCol>

              <!-- 👉 Language -->
              <VCol cols="12">
                <VSelect
                  v-model="language"
                  label="Select Language"
                  placeholder="Select Language"
                  :items="['English', 'French', 'Spanish']"
                />
              </VCol>

              <!-- 👉 Role -->
              <!-- <VCol cols="12">
                <VSelect
                  v-model="roleId"
                  label="Select Role"
                  placeholder="Select Role"
                  :rules="[requiredValidator]"
                  :items="['Admin', 'Author', 'Editor', 'Maintainer', 'Subscriber']"
                />
              </VCol> -->

              <!-- 👉 Status -->
              <VCol cols="12">
                <VSelect
                  v-model="status"
                  label="Select Status"
                  placeholder="Select Status"
                  :items="[{ title: 'Active', value: 'Active' }, { title: 'Inactive', value: 'Inactive' }, { title: 'Pending', value: 'Pending' }]"
                />
              </VCol>

              <!-- 👉 Address -->
              <VCol cols="12">
                <VTextField
                  v-model="address"
                  label="Address"
                  placeholder="123, Main Road, Your City"
                />
              </VCol>

              <!-- 👉 City -->
              <VCol cols="12">
                <VTextField
                  v-model="city"
                  label="City"
                  placeholder="New York"
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
                  @click="closeNavigationDrawer"
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
</template>
