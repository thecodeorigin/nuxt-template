<script lang="ts" setup>
import boyWithTab from '@images/illustrations/account-settings-security-illustration.png'

const isCurrentPasswordVisible = ref(false)
const isNewPasswordVisible = ref(false)
const isConfirmPasswordVisible = ref(false)
const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')

const passwordRequirements = [
  'Minimum 8 characters long - the more, the better',
  'At least one lowercase character',
  'At least one number, symbol, or whitespace character',
]

const serverKeys = [
  {
    name: 'Server Key 1',
    key: '23eaf7f0-f4f7-495e-8b86-fad3261282ac',
    createdOn: '28 Apr 2021, 18:20 GTM+4:10',
    permission: 'Full Access',
  },
  {
    name: 'Server Key 2',
    key: 'bb98e571-a2e2-4de8-90a9-2e231b5e99',
    createdOn: '12 Feb 2021, 10:30 GTM+2:30',
    permission: 'Read Only',
  },
  {
    name: 'Server Key 3',
    key: '2e915e59-3105-47f2-8838-6e46bf83b711',
    createdOn: '28 Dec 2020, 12:21 GTM+4:10',
    permission: 'Full Access',
  },
]

const recentDevicesHeaders = [
  { title: 'BROWSER', key: 'browser' },
  { title: 'DEVICE', key: 'device' },
  { title: 'LOCATION', key: 'location' },
  { title: 'RECENT ACTIVITY', key: 'recentActivity' },
]

const recentDevices = [
  {
    browser: 'Chrome on Windows',
    device: 'HP Spectre 360',
    location: 'New York, NY',
    recentActivity: '28 Apr 2022, 18:20',
    deviceIcon: { icon: 'ri-macbook-line', color: 'primary' },
  },
  {
    browser: 'Chrome on iPhone',
    device: 'iPhone 12x',
    location: 'Los Angeles, CA',
    recentActivity: '20 Apr 2022, 10:20',
    deviceIcon: { icon: 'ri-android-line', color: 'error' },
  },
  {
    browser: 'Chrome on Android',
    device: 'Oneplus 9 Pro',
    location: 'San Francisco, CA',
    recentActivity: '16 Apr 2022, 04:20',
    deviceIcon: { icon: 'ri-smartphone-line', color: 'success' },
  },
  {
    browser: 'Chrome on macOS',
    device: 'Apple iMac',
    location: 'New York, NY',
    recentActivity: '28 Apr 2022, 18:20',
    deviceIcon: { icon: 'ri-mac-line', color: 'secondary' },
  },
  {
    browser: 'Chrome on Windows',
    device: 'HP Spectre 360',
    location: 'Los Angeles, CA',
    recentActivity: '20 Apr 2022, 10:20',
    deviceIcon: { icon: 'ri-macbook-line', color: 'primary' },
  },
  {
    browser: 'Chrome on Android',
    device: 'Oneplus 9 Pro',
    location: 'San Francisco, CA',
    recentActivity: '16 Apr 2022, 04:20',
    deviceIcon: { icon: 'ri-android-line', color: 'success' },
  },
]

const isOneTimePasswordDialogVisible = ref(false)
</script>

<template>
  <VRow>
    <!-- SECTION: Change Password -->
    <VCol cols="12">
      <VCard>
        <VCardItem class="pb-6">
          <VCardTitle>Change Password</VCardTitle>
        </VCardItem>
        <VForm>
          <VCardText class="pt-0">
            <!-- 👉 Current Password -->
            <VRow>
              <VCol
                cols="12"
                md="6"
              >
                <!-- 👉 current password -->
                <VTextField
                  v-model="currentPassword"
                  :type="isCurrentPasswordVisible ? 'text' : 'password'"
                  :append-inner-icon="isCurrentPasswordVisible ? 'ri-eye-off-line' : 'ri-eye-line'"
                  autocomplete="on"
                  label="Current Password"
                  placeholder="············"
                  @click:append-inner="isCurrentPasswordVisible = !isCurrentPasswordVisible"
                />
              </VCol>
            </VRow>

            <!-- 👉 New Password -->
            <VRow>
              <VCol
                cols="12"
                md="6"
              >
                <!-- 👉 new password -->
                <VTextField
                  v-model="newPassword"
                  :type="isNewPasswordVisible ? 'text' : 'password'"
                  :append-inner-icon="isNewPasswordVisible ? 'ri-eye-off-line' : 'ri-eye-line'"
                  label="New Password"
                  autocomplete="on"
                  placeholder="············"
                  @click:append-inner="isNewPasswordVisible = !isNewPasswordVisible"
                />
              </VCol>

              <VCol
                cols="12"
                md="6"
              >
                <!-- 👉 confirm password -->
                <VTextField
                  v-model="confirmPassword"
                  :type="isConfirmPasswordVisible ? 'text' : 'password'"
                  :append-inner-icon="isConfirmPasswordVisible ? 'ri-eye-off-line' : 'ri-eye-line'"
                  autocomplete="on"
                  label="Confirm New Password"
                  placeholder="············"
                  @click:append-inner="isConfirmPasswordVisible = !isConfirmPasswordVisible"
                />
              </VCol>
            </VRow>
          </VCardText>

          <!-- 👉 Password Requirements -->
          <VCardText>
            <h6 class="text-h6 text-medium-emphasis mt-1">
              Password Requirements:
            </h6>

            <VList>
              <VListItem
                v-for="(item, index) in passwordRequirements"
                :key="index"
                class="px-0"
              >
                <template #prepend>
                  <VIcon
                    size="8"
                    icon="ri-circle-fill"
                    color="rgba(var(--v-theme-on-surface), var(--v-medium-emphasis-opacity))"
                  />
                </template>
                <VListItemTitle class="text-medium-emphasis text-wrap">
                  {{ item }}
                </VListItemTitle>
              </VListItem>
            </VList>

            <!-- 👉 Action Buttons -->
            <div class="d-flex flex-wrap gap-4 mt-2">
              <VBtn>Save changes</VBtn>

              <VBtn
                type="reset"
                color="secondary"
                variant="outlined"
              >
                Reset
              </VBtn>
            </div>
          </VCardText>
        </VForm>
      </VCard>
    </VCol>
    <!-- !SECTION -->

    <!-- SECTION Two-steps verification -->
    <VCol cols="12">
      <VCard>
        <VCardItem class="pb-6">
          <VCardTitle>Two-steps verification</VCardTitle>
        </VCardItem>
        <VCardText>
          <p>
            Two factor authentication is not enabled yet.
          </p>
          <p class="mb-6">
            Two-factor authentication adds an additional layer of security to your account by requiring more than just a password to log in.
            <a
              href="javascript:void(0)"
              class="text-decoration-none"
            >Learn more.</a>
          </p>

          <VBtn @click="isOneTimePasswordDialogVisible = true">
            Enable two-factor authentication
          </VBtn>
        </VCardText>
      </VCard>
    </VCol>
    <!-- !SECTION -->

    <VCol cols="12">
      <!-- SECTION: Create an API key -->
      <VCard>
        <VCardItem class="pb-6">
          <VCardTitle>Create an API key</VCardTitle>
        </VCardItem>
        <VRow>
          <!-- 👉 Choose API Key -->
          <VCol
            cols="12"
            md="5"
            order-md="0"
            order="0"
          >
            <VCardText class="pt-10">
              <VForm @submit.prevent="() => {}">
                <!-- 👉 Choose API Key -->
                <VSelect
                  label="Choose the API key type you want to create"
                  placeholder="Select API key type"
                  :items="['Full Control', 'Modify', 'Read & Execute', 'List Folder Contents', 'Read Only', 'Read & Write']"
                />

                <!-- 👉 Name the API Key -->
                <VTextField
                  label="Name the API key"
                  placeholder="Name the API key"
                  class="my-5"
                />

                <!-- 👉 Create Key Button -->
                <VBtn
                  type="submit"
                  block
                >
                  Create Key
                </VBtn>
              </VForm>
            </VCardText>
          </VCol>

          <!-- 👉 Boy image -->
          <VCol
            cols="12"
            md="7"
            order="1"
            order-md="1"
            class="d-flex flex-column justify-center align-center"
          >
            <VImg
              :src="boyWithTab"
              :width="143"
              :style="$vuetify.display.smAndDown ? '' : 'position: absolute; bottom: 0;'"
            />
          </VCol>
        </VRow>
      </VCard>
    <!-- !SECTION -->
    </VCol>

    <VCol cols="12">
      <!-- SECTION: API Keys List -->
      <VCard>
        <VCardItem class="pb-4">
          <VCardTitle>API Key List &amp; Access</VCardTitle>
        </VCardItem>

        <VCardText>
          <p class="mb-6">
            An API key is a simple encrypted string that identifies an application without any principal. They are useful for accessing public data anonymously, and are used to associate API requests with your project for quota and billing.
          </p>

          <!-- 👉 Server Status -->
          <div class="d-flex flex-column gap-y-6">
            <div
              v-for="serverKey in serverKeys"
              :key="serverKey.key"
              class="bg-var-theme-background pa-4 rounded-lg"
            >
              <div class="d-flex align-center flex-wrap mb-2 gap-x-3">
                <h6 class="text-h6">
                  {{ serverKey.name }}
                </h6>
                <VChip
                  color="primary"
                  size="small"
                >
                  {{ serverKey.permission }}
                </VChip>
              </div>

              <h6 class="text-h6 d-flex gap-x-3 text-medium-emphasis align-center mb-2">
                {{ serverKey.key }}
                <VIcon
                  :size="20"
                  icon="ri-file-copy-line"
                  class="cursor-pointer"
                />
              </h6>
              <div class="text-disabled">
                Created on {{ serverKey.createdOn }}
              </div>
            </div>
          </div>
        </VCardText>
      </VCard>
      <!-- !SECTION -->
    </VCol>

    <!-- SECTION Recent Devices -->
    <VCol cols="12">
      <!-- 👉 Table -->
      <VCard
        title="Recent Devices"
        class="recentDeviceCard"
      >
        <VDataTable
          :headers="recentDevicesHeaders"
          :items="recentDevices"
          hide-default-footer
          class="text-no-wrap"
        >
          <template #item.browser="{ item }">
            <div class="d-flex gap-x-3">
              <VIcon
                size="20"
                :icon="item.deviceIcon.icon"
                :color="item.deviceIcon.color"
              />
              <h6 class="text-body-1 text-high-emphasis">
                {{ item.browser }}
              </h6>
            </div>
          </template>
          <!-- TODO Refactor this after vuetify provides proper solution for removing default footer -->
          <template #bottom />
        </VDataTable>
      </VCard>
    </VCol>
    <!-- !SECTION -->
  </VRow>

  <!-- SECTION Enable One time password -->
  <TwoFactorAuthDialog v-model:isDialogVisible="isOneTimePasswordDialogVisible" />
  <!-- !SECTION -->
</template>
