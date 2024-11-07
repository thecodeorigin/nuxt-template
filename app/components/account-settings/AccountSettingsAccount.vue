<script lang="ts" setup>
const { t, locale } = useI18n()

const inputFileRef = ref<HTMLElement>()

const authStore = useAuthStore()
const formFile = ref<File | null>(null)

const formData = ref({
  avatar_url: authStore.currentUser?.avatar_url || '',
  full_name: authStore.currentUser?.full_name || '',
  email: authStore.currentUser?.email || '',
  organization: authStore.currentUser?.organization || '',
  phone: authStore.currentUser?.phone || '',
  address: authStore.currentUser?.address || '',
  city: authStore.currentUser?.city || '',
  postcode: authStore.currentUser?.postcode || '',
  country: authStore.currentUser?.country || null,
  language: authStore.currentUser?.language || null,
})

watch(locale, (value) => {
  formData.value.language = value
})

function resetForm() {
  formData.value.avatar_url = authStore.currentUser?.avatar_url || ''
  formData.value.full_name = authStore.currentUser?.full_name || ''
  formData.value.email = authStore.currentUser?.email || ''
  formData.value.organization = authStore.currentUser?.organization || ''
  formData.value.phone = authStore.currentUser?.phone || ''
  formData.value.address = authStore.currentUser?.address || ''
  formData.value.city = authStore.currentUser?.city || ''
  formData.value.postcode = authStore.currentUser?.postcode || ''
  formData.value.country = authStore.currentUser?.country || null
  formData.value.language = authStore.currentUser?.language || null
}

function changeAvatar(file: Event) {
  const fileReader = new FileReader()
  const { files } = file.target as HTMLInputElement

  fileReader.onload = () => {
    if (typeof fileReader.result === 'string')
      formData.value.avatar_url = fileReader.result
  }

  if (files && files.length) {
    formFile.value = files[0] as File
    fileReader.readAsDataURL(formFile.value)
  }
}

function resetAvatar() {
  formData.value.avatar_url = authStore.currentUser?.avatar_url || ''
}
interface Country {
  name: string
  flag: string
  iso2: string
  iso3: string
}

interface City {
  name: string
  state_code: string
}
type CountryList = Array<Country>

type CityList = Array<City>

const { data: countryList } = await $fetch<{ data: CountryList }>('https://countriesnow.space/api/v0.1/countries/flag/images')

const cityList = ref<CityList>([])
async function fetchCities() {
  const { data } = await $fetch<{ data: Country & { states: CityList } }>('https://countriesnow.space/api/v0.1/countries/states', {
    method: 'POST',
    body: {
      country: formData.value.country,
    },
  })

  cityList.value = data.states || []
}

watch(() => formData.value.country, (value) => {
  if (value)
    fetchCities()
}, { immediate: true })

async function handleSubmit() {
  try {
    let avatarUrl = authStore.currentUser?.avatar_url

    if (formFile.value && authStore.currentUser)
      avatarUrl = await uploadToS3(formFile.value, authStore.currentUser.id)

    await authStore.updateCurrentUser({
      ...formData.value,
      avatar_url: avatarUrl,
    })

    notifySuccess({
      content: t('Account settings updated successfully'),
    })
  }
  catch (error) {
    console.error(error)
  }
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
                v-if="formData.avatar_url"
                :src="formData.avatar_url"
              />
              <VIcon
                v-else
                icon="ri-user-3-line text-grey-700"
              />
            </VAvatar>

            <!-- 👉 Upload Photo -->
            <form class="d-flex flex-column justify-center gap-4">
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
            </form>
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

              <!-- 👉 Organization -->
              <VCol
                cols="12"
                md="6"
              >
                <VTextField
                  v-model="formData.organization"
                  :label="$t('Organization')"
                  placeholder="Thecodeorigin"
                  data-test="organization-input"
                />
              </VCol>

              <!-- 👉 Phone -->
              <VCol
                cols="12"
                md="6"
              >
                <VTextField
                  v-model="formData.phone"
                  :label="$t('Phone Number')"
                  placeholder="+1 (917) 543-9876"
                  data-test="phone-input"
                />
              </VCol>

              <!-- 👉 Address -->
              <VCol
                cols="12"
                md="6"
              >
                <VTextField
                  v-model="formData.address"
                  :label="$t('Address')"
                  placeholder="123 Main St, New York, NY 10001"
                  data-test="address-input"
                />
              </VCol>

              <!-- 👉 Zip Code -->
              <VCol
                cols="12"
                md="6"
              >
                <VTextField
                  v-model="formData.postcode"
                  :label="$t('Zip Code')"
                  placeholder="10001"
                  data-test="zip-code-input"
                />
              </VCol>

              <!-- 👉 Country -->
              <VCol
                cols="12"
                md="6"
              >
                <VSelect
                  v-model="formData.country"
                  :items="countryList || []"
                  :label="$t('Country')"
                  item-title="name"
                  item-value="name"
                  placeholder="Select Country"
                  data-test="country-select"
                >
                  <template #item="{ props, item }">
                    <VListItem v-bind="props">
                      <template #prepend>
                        <VImg :src="item.raw.flag" :style="{ marginRight: '0.5rem' }" :width="24" height="auto" cover />
                      </template>
                    </VListItem>
                  </template>
                </VSelect>
              </VCol>

              <!-- 👉 State -->
              <VCol
                cols="12"
                md="6"
              >
                <VSelect
                  v-model="formData.city"
                  :items="cityList || []"
                  :disabled="!formData.country"
                  :label="$t('City')"
                  item-title="name"
                  item-value="state_code"
                  placeholder="Select City"
                  data-test="city-select"
                />
              </VCol>

              <!-- 👉 Language -->
              <VCol
                cols="12"
                md="6"
              >
                <VSelect
                  v-model="formData.language"
                  :label="$t('Language')"
                  chips
                  closable-chips
                  placeholder="Select Language"
                  :items="[{ label: 'English', value: 'en' }, { label: 'Tiếng Việt', value: 'vi' }]"
                  item-title="label"
                  item-value="value"
                  data-test="language-select"
                />
              </VCol>

              <!-- 👉 Form Actions -->
              <VCol
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
              </VCol>
            </VRow>
          </VForm>
        </VCardText>
      </VCard>
    </VCol>
  </VRow>
</template>
