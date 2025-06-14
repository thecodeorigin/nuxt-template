<script setup lang="ts">
import { ref, reactive, computed, watchEffect } from 'vue'
import { useI18n } from 'vue-i18n'

type ReferenceHistory = any

const { t, locale } = useI18n()

const config = useRuntimeConfig()
const inputFileRef = ref<HTMLElement>()

const authApi = useApiAuth()
const apiReference = useApiReference()
const authStore = useAuthStore()
const formFile = ref<File | null>(null)

const pagination = reactive({
  page: 1,
  limit: 5,
  total: 0,
})

const referenceQuery = computed(() => ({
  page: pagination.page,
  limit: pagination.limit,
  keyword: '',
  sortAsc: false,
  sortBy: 'created_at',
  withCount: true,
}))

const { data: references } = await useAsyncData('available-reference', () =>
  apiReference.fetchAvailableReferences()
)

const {
  data: referenceHistoryData,
  refresh: refreshReferenceHistory,
} = await useLazyAsyncData('reference-usage-history', () =>
  apiReference.fetchUsageHistoryReferences(referenceQuery.value),
  {
    default: () => ({ data: [] as ReferenceHistory[], total: 0 }),
    watch: [referenceQuery],
  }
)

const referenceHistory = ref<ReferenceHistory[]>([])

watchEffect(() => {
  if (referenceHistoryData.value) {
    referenceHistory.value = referenceHistoryData.value.data
    pagination.total = referenceHistoryData.value.total
  }
})

const formData = ref({
  avatar: authStore.currentUser?.avatar || '',
  full_name: authStore.currentUser?.name || '',
  email: authStore.currentUser?.primary_email || ''
})

function resetForm() {
  formData.value.avatar = authStore.currentUser?.avatar || ''
  formData.value.full_name = authStore.currentUser?.name || ''
  formData.value.email = authStore.currentUser?.primary_email || ''
}

function changeAvatar(file: Event) {
  const fileReader = new FileReader()
  const { files } = file.target as HTMLInputElement

  fileReader.onload = () => {
    if (typeof fileReader.result === 'string') {
      formData.value.avatar = fileReader.result
    }
  }

  if (files && files.length) {
    formFile.value = files[0] as File
    fileReader.readAsDataURL(formFile.value)
  }
}

function resetAvatar() {
  formData.value.avatar = authStore.currentUser?.avatar || ''
}

async function handleSubmit() {
  try {
    let avatarUrl = authStore.currentUser?.avatar || ''

    if (formFile.value && authStore.currentUser)
      avatarUrl = await uploadToS3(formFile.value, formFile.value.name)

    await authApi.updateProfile({
      ...formData.value,
      avatar: avatarUrl,
    })

    notifySuccess({
      content: t('Account settings updated successfully'),
    })
  } catch (error) {
    console.error(error)
  }
}

function copyToClipboard(text: string) {
  navigator.clipboard
    .writeText(text)
    .then(() => {
      notifySuccess({ content: t('Copied to clipboard!') })
    })
    .catch(err => {
      console.error('Copy failed:', err)
    })
}
</script>

<template>
  <VRow>
    <VCol cols="12">
      <VCard data-test="account-form">
        <VCardText>
          <!-- <div class="d-flex mb-10"> -->
            <!-- 👉 Avatar -->
            

            <!-- 👉 Upload Photo -->
            <!-- <form class="d-flex flex-column justify-center gap-4">
              <div class="d-flex flex-wrap gap-4">
                <VBtn
                  color="primary"
                  data-test="upload-photo-button"
                  @click="inputFileRef?.click()"
                >
                  <VIcon
                    icon="ri-upload-cloud-line"
                    class="d-sm-none"
                  />
                  <span class="d-none d-sm-block">{{ $t('Upload New Photo') }}</span>
                </VBtn>
                <input
                  ref="inputFileRef"
                  type="file"
                  name="file"
                  accept=".jpeg,.png,.jpg,GIF"
                  hidden
                  @input="changeAvatar"
                >
                <VBtn
                  type="reset"
                  color="error"
                  variant="outlined"
                  data-test="reset-photo-button"
                  @click="resetAvatar"
                >
                  <span class="d-none d-sm-block">{{ $t('Reset') }}</span>
                  <VIcon
                    icon="ri-refresh-line"
                    class="d-sm-none"
                  />
                </VBtn>
              </div>
              <p class="text-body-1 mb-0">
                {{ $t('Allowed JPG, GIF or PNG, Max size of 800K') }}
              </p>
            </form> -->
          <!-- </div> -->
          <p class="mb-6 font-weight-medium">{{ $t('Account information') }}</p>
          <!-- 👉 Form -->
          <VForm @submit.prevent="handleSubmit">
            <VRow>
              <VCol cols="auto">
                <VAvatar
                  rounded
                  size="50"
                  class="bg-grey-100 cursor-pointer"
                  @click="inputFileRef?.click()"
                >
                  <VImg
                    v-if="formData.avatar"
                    :src="formData.avatar"
                  />
                  <VIcon
                    v-else
                    icon="ri-user-3-line text-grey-700"
                  />
                </VAvatar>
              </VCol>

              <!-- 👉 Full Name -->
              <VCol
                md="5"
                cols="12"
              >
                <VTextField
                  v-model="formData.full_name"
                  disabled
                  placeholder="John"
                  :label="$t('Full Name')"
                  data-test="full-name-input"
                />
              </VCol>

              <!-- 👉 Email -->
              <VCol
                cols="12"
                md="6"
              >
                <VTextField
                  v-model="formData.email"
                  disabled
                  label="E-mail"
                  placeholder="johndoe@gmail.com"
                  type="email"
                  data-test="email-input"
                />
              </VCol>

              <!-- 👉 Form Actions -->
              <!-- <VCol
                cols="12"
                class="d-flex flex-wrap gap-4"
              >
                <VBtn type="submit" data-test="save-button">
                  {{ $t('Save Change') }}
                </VBtn>

                <VBtn
                  color="secondary"
                  variant="outlined"
                  type="reset"
                  data-test="reset-button"
                  @click.prevent="resetForm"
                >
                  {{ $t('Reset') }}
                </VBtn>
              </VCol> -->
            </VRow>
          </VForm>
        </VCardText>
      </VCard>

      <!-- 👉 Reference Codes -->
      <VCard class="mt-6">
        <VCardText>
          <div class="mb-6">
            <p class="mb-4 font-weight-medium">{{ $t('Available referral code links') }}</p>
            <VList
              v-if="references?.length"
              lines="one"
              class="bg-grey-100 rounded"
            >
              <VListItem
                v-for="ref in references"
                :key="ref.id"
              >
              <div class="d-flex justify-space-between align-center w-100">
                <VListItemTitle>{{ `${config.public.apiBaseUrl}/api/ref/${ref.code}/apply` }}</VListItemTitle>
                <VBtn
                  icon
                  variant="text"
                  @click="copyToClipboard(`${config.public.apiBaseUrl}/api/ref/${ref.code}/apply`)"
                >
                  <VIcon icon="ri-file-copy-line" />
                </VBtn>
              </div>
              </VListItem>
            </VList>
            <p v-else class="text-body-2 text-grey">
              {{ $t('No reference links available') }}
            </p>
          </div>
        </VCardText>
      </VCard>

      <VCard class="mt-6">
        <VCardText>
          <p class="mb-4 font-weight-medium">{{ $t('Reference history') }}</p>

          <VTable v-if="referenceHistory.length">
            <thead>
              <tr>
                <th>{{ $t('Used by') }}</th>
                <th>{{ $t('Email') }}</th>
                <th>{{ $t('Referral Code') }}</th>
                <th>{{ $t('Discount') }}</th>
                <th>{{ $t('Used at') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="entry in referenceHistory" :key="entry.referenceUsageId">
                <td>{{ entry.usedByUserName }}</td>
                <td>{{ entry.usedByUserEmail }}</td>
                <td>{{ entry.referenceCode }}</td>
                <td>
                  <span v-if="entry.referenceAmount">-{{ entry.referenceAmount.toLocaleString() }}₫</span>
                  <span v-else-if="entry.referencePercentage">-{{ entry.referencePercentage }}%</span>
                  <span v-else>—</span>
                </td>
                <td>{{ new Date(entry.usedAt).toLocaleString(locale) }}</td>
              </tr>
            </tbody>
          </VTable>

          <div v-else class="text-body-2 text-grey">
            {{ $t('No reference usage history found.') }}
          </div>

          <!-- 👉 AppPagination -->
          <AppPagination
            v-model:page="pagination.page"
            v-model:limit="pagination.limit"
            :total="pagination.total"
          />
        </VCardText>
      </VCard>
    </VCol>
  </VRow>
</template>
