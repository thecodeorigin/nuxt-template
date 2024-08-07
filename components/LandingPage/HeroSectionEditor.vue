<script lang="ts" setup>
import { z } from 'zod'

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
  hero_title: z.string(),
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

async function onSubmit() {
  const validInput = heroSchema.safeParse(heroForm.value)

  if (!validInput.success) {
    error.value = validInput.error.format()
    console.log('««««« error.value »»»»»', error.value)
  }
  else {
    error.value = null

    try {
      await $api('/api/pages/landing-page/hero', {
        method: 'PATCH',
        body: heroForm.value,
      })
    }
    catch (e) {
      if (e instanceof z.ZodError) {
        console.log(e.errors.map(err => err.message).join('\n'))
      }
      else {
        console.log('Unexpected error: ', e)
      }
    }
  }
}
</script>

<template>
  <form class="landing-page-hero" @submit.prevent="onSubmit">
    <h2>Hero Section </h2>

    <div class="d-flex flex-column gap-4">
      <VCard class="pa-4">
        <VRow>
          <VCol cols="12" sm="12">
            <VCardTitle>Main page heading: </VCardTitle>
            <TiptapEditor
              v-model="heroForm.hero_title"
              class="border rounded-lg"
              placeholder="Text here..."
            />
          </VCol>

          <VCol cols="12" sm="12">
            <VCardTitle>Sub page heading: </VCardTitle>

            <VTextarea
              v-model="heroForm.hero_title_desc"
              label="Sub page heading"
              placeholder="Text here..."
            />
          </VCol>
        </VRow>
      </VCard>

      <VCard class="pa-4">
        <VCardTitle>Main page button: </VCardTitle>
        <VExpansionPanels ripple>
          <VExpansionPanel
            title="Button settings panel"
            class="landing-page-pannel"
          >
            <template #text>
              <VRow class="mt-2">
                <VCol cols="12" sm="6">
                  <VTextField
                    v-model="heroForm.hero_title_button.btn_label"
                    label="Button label"
                    placeholder="Placeholder Text"
                  />
                </VCol>

                <VCol cols="12" sm="6">
                  <VSelect
                    v-model="heroForm.hero_title_button.btn_variant"
                    label="Button style"
                    :items="['flat', 'contained', 'outlined', 'text']"
                  />
                </vcol>

                <VCol cols="6" sm="3">
                  <VSelect
                    v-model="heroForm.hero_title_button.btn_radius"
                    label="Button radius"
                    :items="['0', 'sx', 'sm', 'md', 'lg', 'xl']"
                  />
                </VCol>

                <VCol cols="6" sm="3">
                  <VSwitch
                    v-model="heroForm.hero_title_button.btn_rippled"
                    label="Ripple effect"
                  />
                </VCol>

                <VCol cols="6" sm="3">
                  <VSelect
                    v-model="heroForm.hero_title_button.btn_prepend_icon"
                    label="Prepend icon"
                    :items="['ri-arrow-left-line', 'ri-arrow-right-line']"
                  />
                </VCol>

                <VCol cols="6" sm="3">
                  <VSelect
                    v-model="heroForm.hero_title_button.btn_apend_icon"
                    label="Append icon"
                    :items="['ri-arrow-right-line', 'ri-arrow-left-line']"
                  />
                </VCol>
              </vrow>

              <!-- <VDivider class="my-4" />

              <div class="d-flex align-center justify-end gap-3">
                <VBtn color="primary">
                  Save
                </VBtn>

                <VBtn color="secondary">
                  Set to default
                </VBtn>
              </div> -->
            </template>
          </VExpansionPanel>
        </VExpansionPanels>

        <VCardTitle class="mt-6">
          Preview button:
        </VCardTitle>
        <VBtn
          v-bind="heroForm.hero_title_button"
          class="text-capitalize ml-3"
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

      <VCard class="pa-4">
        <VCardTitle>Upload image:</VCardTitle>
        <VExpansionPanels>
          <VExpansionPanel title="Upload pannel">
            <template #text>
              <LandingPageImagePreview
                id="image"
                :model-value="imageFile"
                @update:model-value="handleImageUpdate"
              />
            </template>
          </VExpansionPanel>
        </VExpansionPanels>
      </VCard>
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
</style>
