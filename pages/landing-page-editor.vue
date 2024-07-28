<script lang="ts" setup>
definePageMeta({
  sidebar: {
    title: 'Landing Page Editor',
    to: { name: 'landing-page-editor' },
    icon: { icon: 'ri-file-text-line' },
  },
})

const buttonHeading = ref({
  btnlabel: 'label',
  btnVariant: 'flat',
  btnBackground: 'primary',
  btnLink: '/landing-page',
  btnRadius: 0,
  btbRippled: false,
  btnPrependIcon: '',
  btnAppendIcon: '',
})

const imageFile = ref<File | null>(null)

function handleImageUpdate(file: File | null) {
  imageFile.value = file
}
</script>

<template>
  <form class="landing-page-editor">
    <h2>Hero Section </h2>
    <div class="d-flex flex-column gap-4">
      <VCard class="pa-4">
        <VRow>
          <VCol cols="12" sm="6">
            <VCardTitle>Main page heading: </VCardTitle>
            <VTextField
              label="Regular"
              placeholder="Placeholder Text"
            />
          </VCol>

          <VCol cols="12" sm="6">
            <VCardTitle>Sub page heading: </VCardTitle>
            <VTextarea
              label="Default"
              placeholder="Placeholder Text"
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
                    v-model="buttonHeading.btnlabel"
                    label="Button label"
                    placeholder="Placeholder Text"
                  />
                </VCol>

                <VCol cols="12" sm="6">
                  <VSelect
                    v-model="buttonHeading.btnVariant"
                    label="Button style"
                    :items="['flat', 'contained', 'outlined', 'text']"
                  >
                    <VCardTitle>Button label:</VCardTitle>

                    <VTextField
                      placeholder="Placeholder Text"
                    />
                  </vselect>
                </vcol>

                <VCol cols="6" sm="3">
                  <VSelect
                    v-model="buttonHeading.btnRadius"
                    label="Button radius"
                    :items="[0, 1, 2, 3, 4, 5]"
                  />
                </VCol>

                <VCol cols="6" sm="3">
                  <VSwitch
                    v-model="buttonHeading.btbRippled"
                    label="Ripple effect"
                  />
                </VCol>

                <VCol cols="6" sm="3">
                  <VSelect
                    v-model="buttonHeading.btnPrependIcon"
                    label="Prepend icon"
                    :items="['ri-arrow-left-line', 'ri-arrow-right-line']"
                  />
                </VCol>

                <VCol cols="6" sm="3">
                  <VSelect
                    v-model="buttonHeading.btnAppendIcon"
                    label="Append icon"
                    :items="['ri-arrow-right-line', 'ri-arrow-left-line']"
                  />
                </VCol>
              </vrow>

              <VDivider class="my-4" />

              <div class="d-flex align-center justify-end gap-3">
                <VBtn color="primary">
                  Save
                </VBtn>

                <VBtn color="secondary">
                  Set to default
                </VBtn>
              </div>
            </template>
          </VExpansionPanel>
        </VExpansionPanels>

        <VCardTitle class="mt-6">
          Preview button:
        </VCardTitle>
        <VBtn
          v-bind="buttonHeading"
          class="text-capitalize ml-3"
          :href="buttonHeading.btnLink"
          :prepend-icon="buttonHeading.btnPrependIcon"
          :append-icon="buttonHeading.btnAppendIcon"
          :variant="buttonHeading.btnVariant"
          :color="buttonHeading.btnBackground"
          :ripple="buttonHeading.btbRippled"
          :radius="buttonHeading.btnRadius"
        >
          {{ buttonHeading.btnlabel }}
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

    <VDivider class="my-6" />

    <h2>Features </h2>
  </form>
</template>

<style lang="scss" scoped>
.landing-page-editor {
  .landing-page-panel {
    :deep(.v-expansion-panel-text) {
      :deep(.v-expansion-panel-text__wrapper) {
        margin-top: 30px;
      }
    }
  }
}
</style>
