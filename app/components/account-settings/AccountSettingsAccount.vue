<script lang="ts" setup>
const { t, locale } = useI18n()

const config = useRuntimeConfig()

const inputFileRef = ref<HTMLElement>()

const authApi = useApiAuth()
const { fetchUnusedReferences } = useApiReference()
const authStore = useAuthStore()
const formFile = ref<File | null>(null)

const { data: references } = await useAsyncData('unused-reference', () => fetchUnusedReferences())

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
    if (typeof fileReader.result === 'string')
      formData.value.avatar = fileReader.result
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
  }
  catch (error) {
    console.error(error)
  }
}

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text)
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
          <div class="d-flex mb-10">
            <!-- 👉 Avatar -->
            <VAvatar
              rounded
              size="100"
              class="me-6 bg-grey-100"
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
          </div>

          <!-- 👉 Form -->
          <VForm @submit.prevent="handleSubmit">
            <VRow>
              <!-- 👉 Full Name -->
              <VCol
                md="6"
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
            <p class="mb-2">{{ $t('Available referral code links') }}</p>
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
                <VListItemTitle>{{ `${config.public.apiBaseUrl}/api/ref/${ref.code}` }}</VListItemTitle>
                <VBtn
                  icon
                  variant="text"
                  @click="copyToClipboard(`${config.public.apiBaseUrl}/api/ref/${ref.code}`)"
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
    </VCol>
  </VRow>
</template>
