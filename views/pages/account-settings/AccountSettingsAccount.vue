<script lang="ts" setup>
const inputFileRef = ref<HTMLElement>()

const { currentUser } = useAuthStore()

const formData = ref({
  avatar_url: currentUser?.avatar_url || '',
  full_name: currentUser?.full_name || '',
  email: currentUser?.email || '',
  organization: currentUser?.organization || '',
  phone: currentUser?.phone || '',
  address: currentUser?.address || '',
  city: currentUser?.city || '',
  postcode: currentUser?.postcode || '',
  country: currentUser?.country || null,
  language: currentUser?.language || null,
})

function resetForm() {
  formData.value.avatar_url = currentUser?.avatar_url || ''
  formData.value.full_name = currentUser?.full_name || ''
  formData.value.email = currentUser?.email || ''
  formData.value.organization = currentUser?.organization || ''
  formData.value.phone = currentUser?.phone || ''
  formData.value.address = currentUser?.address || ''
  formData.value.city = currentUser?.city || ''
  formData.value.postcode = currentUser?.postcode || ''
  formData.value.country = currentUser?.country || null
  formData.value.language = currentUser?.language || null
}

function changeAvatar(file: Event) {
  const fileReader = new FileReader()
  const { files } = file.target as HTMLInputElement

  if (files && files.length) {
    fileReader.readAsDataURL(files[0])
    fileReader.onload = () => {
      if (typeof fileReader.result === 'string')
        formData.value.avatar_url = fileReader.result
    }
  }
}

function resetAvatar() {
  formData.value.avatar_url = currentUser?.avatar_url || ''
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
  await $api(`/users/${currentUser?.id}`, {
    method: 'PATCH',
    body: formData.value,
  })
}
</script>

<template>
  <VRow>
    <VCol cols="12">
      <VCard>
        <VCardText>
          <div class="d-flex mb-10">
            <!-- 👉 Avatar -->
            <VAvatar
              rounded
              size="100"
              class="me-6"
              :image="formData.avatar_url"
            />

            <!-- 👉 Upload Photo -->
            <form class="d-flex flex-column justify-center gap-4">
              <div class="d-flex flex-wrap gap-4">
                <VBtn
                  color="primary"
                  @click="inputFileRef?.click()"
                >
                  <VIcon
                    icon="ri-upload-cloud-line"
                    class="d-sm-none"
                  />
                  <span class="d-none d-sm-block">Upload new photo</span>
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
                  @click="resetAvatar"
                >
                  <span class="d-none d-sm-block">Reset</span>
                  <VIcon
                    icon="ri-refresh-line"
                    class="d-sm-none"
                  />
                </VBtn>
              </div>
              <p class="text-body-1 mb-0">
                Allowed JPG, GIF or PNG. Max size of 800K
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
                  label="Full Name"
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
                />
              </VCol>

              <!-- 👉 Organization -->
              <VCol
                cols="12"
                md="6"
              >
                <VTextField
                  v-model="formData.organization"
                  label="Organization"
                  placeholder="Thecodeorigin"
                />
              </VCol>

              <!-- 👉 Phone -->
              <VCol
                cols="12"
                md="6"
              >
                <VTextField
                  v-model="formData.phone"
                  label="Phone Number"
                  placeholder="+1 (917) 543-9876"
                />
              </VCol>

              <!-- 👉 Address -->
              <VCol
                cols="12"
                md="6"
              >
                <VTextField
                  v-model="formData.address"
                  label="Address"
                  placeholder="123 Main St, New York, NY 10001"
                />
              </VCol>

              <!-- 👉 Zip Code -->
              <VCol
                cols="12"
                md="6"
              >
                <VTextField
                  v-model="formData.postcode"
                  label="Zip Code"
                  placeholder="10001"
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
                  label="Country"
                  item-title="name"
                  item-value="name"
                  placeholder="Select Country"
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
                  label="City"
                  item-title="name"
                  item-value="state_code"
                  placeholder="Select City"
                />
              </VCol>

              <!-- 👉 Language -->
              <VCol
                cols="12"
                md="6"
              >
                <VSelect
                  v-model="formData.language"
                  label="Language"
                  chips
                  closable-chips
                  placeholder="Select Language"
                  :items="['English', 'Spanish', 'Arabic', 'Hindi', 'Urdu']"
                />
              </VCol>

              <!-- 👉 Form Actions -->
              <VCol
                cols="12"
                class="d-flex flex-wrap gap-4"
              >
                <VBtn type="submit">
                  Save changes
                </VBtn>

                <VBtn
                  color="secondary"
                  variant="outlined"
                  type="reset"
                  @click.prevent="resetForm"
                >
                  Reset
                </VBtn>
              </VCol>
            </VRow>
          </VForm>
        </VCardText>
      </VCard>
    </VCol>
  </VRow>
</template>
