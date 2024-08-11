<script lang="ts" setup>
import { z } from 'zod'

import { VTextField } from 'vuetify/components'
import type { HeroSectionType } from '@/types/landing-page'

const { heroData } = storeToRefs(useLandingPageStore())

const imageFile = ref<File | null>(null)

function handleImageUpdate(file: File | null) {
  imageFile.value = file
}

const heroForm = ref<HeroSectionType>({
  hero_title: '',
  hero_title_desc: '',
  hero_title_button: {
    btn_link: '',
    btn_label: '',
    btn_radius: 0,
    btn_rippled: false,
    btn_variant: 'flat',
    btn_apend_icon: '',
    btn_background: '',
    btn_prepend_icon: '',
  },
})

const heroSchema = z.object({
  hero_title: z.string().min(2, { message: 'Hero title is 2 or more characters long' }),
  hero_title_desc: z.string(),
  hero_title_button: z.object({
    btn_link: z.string(),
    btn_label: z.string(),
    btn_radius: z.union([z.string(), z.number()]),
    btn_rippled: z.boolean(),
    btn_variant: z.string(),
    btn_apend_icon: z.string(),
    btn_background: z.string(),
    btn_prepend_icon: z.string(),
  }),
})

type FormSchemaType = z.infer<typeof heroSchema>
const error = ref<z.ZodFormattedError<FormSchemaType> | null>(null)

async function onSubmit() {
  const validInput = heroSchema.safeParse(heroForm.value)

  if (!validInput.success) {
    error.value = validInput.error.format()
    notify('Invalid input, please check and try again', {
      type: 'error',
      timeout: 2000,
    })
  }
  else {
    console.log('««««« error »»»»»', error)
    console.log('««««« heroForm run »»»»»')
    error.value = null

    // try {
    //   await $api('/api/pages/landing-page/hero', {
    //     method: 'PATCH',
    //     body: heroForm.value,
    //   })
    // }
    // catch (e) {
    //   if (e instanceof z.ZodError) {
    //     console.log(e.errors.map(err => err.message).join('\n'))
    //   }
    //   else {
    //     console.log('Unexpected error: ', e)
    //   }
    // }
  }
}

watch(heroData, (newHeroData) => {
  heroForm.value = {
    hero_title: newHeroData?.hero_title ?? '',
    hero_title_desc: newHeroData?.hero_title_desc ?? '',
    hero_title_button: {
      btn_link: newHeroData?.hero_title_button?.btn_link ?? '',
      btn_label: newHeroData?.hero_title_button?.btn_label ?? '',
      btn_radius: newHeroData?.hero_title_button?.btn_radius ?? 0,
      btn_rippled: newHeroData?.hero_title_button?.btn_rippled ?? false,
      btn_variant: newHeroData?.hero_title_button?.btn_variant ?? '',
      btn_apend_icon: newHeroData?.hero_title_button?.btn_apend_icon ?? '',
      btn_background: newHeroData?.hero_title_button?.btn_background ?? '',
      btn_prepend_icon: newHeroData?.hero_title_button?.btn_prepend_icon ?? '',
    },
  }
}, { deep: true })
</script>

<template>
  Error: {{ error }}
  <form class="landing-page-hero" @submit.prevent="onSubmit">
    <VLabel class="text-h3 text-capitalize text-primary font-weight-bold mb-4  d-block label">
      Hero Section
    </VLabel>

    <div class="d-flex flex-column gap-4">
      <VRow>
        <VCol cols="12" md="8">
          <VCard class="pa-4">
            <!-- 👉 Hero Main Title -->
            <VCardTitle class="text-center mb-4">
              Main page heading
            </VCardTitle>

            <VLabel class="mb-2 label">
              Main Title:
            </VLabel>
            <TiptapEditor
              v-model="heroForm.hero_title"
              class="border rounded-lg mb-5"
              placeholder="Text here..."
            />
            <div v-if="error?.hero_title">
              <span v-for="(warn, index) in error?.hero_title?._errors" :key="index">
                {{ warn }}
              </span>
            </div>

            <!-- 👉 Hero Main Description -->
            <VLabel class="mb-2 label">
              Description:
            </VLabel>
            <TiptapEditor
              v-model="heroForm.hero_title_desc"
              label="Sub page heading"
              placeholder="Text here..."
              :rules="[requiredValidator, lengthValidator(heroForm.hero_title_desc, 5)]"
            />
          </VCard>
        </VCol>

        <VCol cols="12" md="4">
          <VCard class="pa-4">
            <VCardTitle class="text-center mb-4">
              Main page Button
            </VCardTitle>

            <VLabel class="mb-2 label">
              Button settings
            </VLabel>

            <VRow class="mt-2">
              <VCol cols="12" sm="12" class="mb-2">
                <VTextField
                  v-model="heroForm.hero_title_button.btn_label"
                  label="Button label"
                  placeholder="Placeholder Text"
                />
              </VCol>

              <VCol cols="12" sm="12" class="mb-2">
                <VSelect
                  v-model="heroForm.hero_title_button.btn_variant"
                  label="Button style"
                  :items="['flat', 'contained', 'outlined', 'text']"
                />
              </vcol>

              <VCol cols="12" sm="12" class="mb-2">
                <VSelect
                  v-model="heroForm.hero_title_button.btn_background"
                  label="Button style"
                  :items="['primary', 'secondary', 'accent', 'error', 'warning', 'info', 'success']"
                />
              </vcol>

              <VCol cols="12" sm="6" class="mb-2">
                <VSelect
                  v-model="heroForm.hero_title_button.btn_radius"
                  label="Button radius"
                  :items="['0', 'sx', 'sm', 'md', 'lg', 'xl']"
                />
              </VCol>

              <VCol cols="12" sm="6">
                <VSwitch
                  v-model="heroForm.hero_title_button.btn_rippled"
                  label="Ripple effect"
                />
              </VCol>

              <VCol cols="12" sm="6">
                <VSelect
                  v-model="heroForm.hero_title_button.btn_prepend_icon"
                  label="Prepend icon"
                  :items="['', 'ri-arrow-left-line', 'ri-arrow-right-line']"
                />
              </VCol>

              <VCol cols="12" sm="6">
                <VSelect
                  v-model="heroForm.hero_title_button.btn_apend_icon"
                  label="Append icon"
                  :items="['', 'ri-arrow-right-line', 'ri-arrow-left-line']"
                />
              </VCol>
            </vrow>
          </VCard>

          <VCard class="pa-4 mt-4 d-flex justify-center align-center flex-column">
            <VCardTitle class="text-center mb-1">
              Preview button
            </VCardTitle>
            <VBtn
              v-bind="heroForm.hero_title_button"
              :href="heroForm.hero_title_button.btn_link"
              :prepend-icon="heroForm.hero_title_button.btn_prepend_icon"
              :append-icon="heroForm.hero_title_button.btn_apend_icon"
              :variant="heroForm.hero_title_button.btn_variant"
              :color="heroForm.hero_title_button.btn_background"
              :ripple="heroForm.hero_title_button.btn_rippled"
              :rounded="heroForm.hero_title_button.btn_radius"
            >
              {{ heroForm.hero_title_button.btn_label }}
            </vbtn>
          </VCard>
        </VCol>
      </VRow>

      <!-- 👉 Hero Image -->
      <VCard class="pa-4">
        <VCardTitle class="text-center mb-4">
          Upload image
        </VCardTitle>

        <VRow class="mb-6">
          <VCol cols="12" sm="6">
            <VLabel class="mb-2 label">
              Main Hero image (Light to dark):
            </VLabel>

            <LandingPageImagePreview
              id="image"
              :model-value="imageFile"
              @update:model-value="handleImageUpdate"
            />
          </VCol>

          <VCol cols="12" sm="6">
            <VLabel class="mb-2 label">
              Sub Hero image (Light to dark):
            </VLabel>
            <LandingPageImagePreview
              id="image"
              :model-value="imageFile"
              @update:model-value="handleImageUpdate"
            />
          </VCol>
        </VRow>
      </VCard>

      <div class="w-100 d-flex justify-center align-center">
        <VBtn
          class="mx-auto w-100"
          type="submit"
          color="primary"
          variant="outlined"
          @click="onSubmit"
        >
          Update Hero Section Content
        </VBtn>
      </div>
    </div>

    <VBtn
      class="text-capitalize mt-6"
      type="submit"
      color="primary"
      @click="onSubmit"
    >
      Save
    </VBtn>
  </form>
</template>

<style lang="scss" scoped>
 .drop-zone {
    border: 1px dashed rgba(var(--v-theme-on-surface), 0.12);
    border-radius: 8px;
  }

  .label {
    line-height: 20px;
  }
</style>
