<script lang="ts" setup>
import SelectSolid from '@images/svg/3d-select-solid.svg'
import Edit from '@images/svg/edit.svg'
import GoogleDocs from '@images/svg/google-docs.svg'
import LaptopCharging from '@images/svg/laptop-charging.svg'
import Lifebelt from '@images/svg/lifebelt.svg'
import TransitionUp from '@images/svg/transition-up.svg'

interface Feature {
  name: string
  description: string
  icon: any
}

const titleSettings = ref({
  emphasizedTitle: '',
  title: '',
  subTitle: '',
  isEmphasized: false,
  emphasizedSettings: {
    variant: 'h2',
    color: 'primary',
    fontSize: 16,
    fontWeight: 600, // normal | bold
    textDecoration: 'none', // none | underline | line-through | overline,
    textTransform: 'none', // none | capitalize | uppercase | lowercase
  },
})

const featuresData = ref<Feature[]>([
  { name: '', description: '', icon: '' },
])

const iconMap: Record<string, any> = {
  SelectSolid,
  Edit,
  GoogleDocs,
  LaptopCharging,
  Lifebelt,
  TransitionUp,
}

const isCurrentFeatureValid = computed(() => {
  const currentFeature = featuresData.value[featuresData.value.length - 1]
  return currentFeature.name.trim() !== ''
    && currentFeature.description.trim() !== ''
    && currentFeature.icon !== ''
})
</script>

<template>
  <form class="landing-page-feature">
    <h2>Features </h2>

    <div class="d-flex flex-column gap-4">
      <!-- 👉 Feature title -->
      <VCard class="pa-4">
        <VCardTitle>Feature title: </VCardTitle>

        <VRow>
          <VCol cols="12" sm="12">
            <VSwitch
              v-model="titleSettings.isEmphasized"
              label="Allow to emphasize title"
            />
          </VCol>

          <VCol cols="12" sm="6">
            <VTextField
              v-model="titleSettings.title"
              label="Main feature title"
              placeholder="Text here..."
            />
          </VCol>

          <VCol v-if="titleSettings.isEmphasized" cols="12" sm="6">
            <VTextField
              v-model="titleSettings.emphasizedTitle"
              label="Main feature title emphasized"
              placeholder="Emphasized title"
            />
          </VCol>

          <VExpansionPanels v-if="titleSettings.isEmphasized" class="emphasis-panels ma-3 border-md rounded-lg">
            <VExpansionPanel
              title="Emphasis title settings panel"
              class="landing-page-pannel"
            >
              <template #text>
                <VRow class="mt-2">
                  <VCol cols="12" sm="6">
                    <VSelect
                      v-model="titleSettings.emphasizedSettings.variant"
                      label="Title variant"
                      :items="['h2', 'h3', 'h4', 'h5', 'h6']"
                    />
                  </VCol>

                  <VCol cols="12" sm="6">
                    <VSelect
                      v-model="titleSettings.emphasizedSettings.color"
                      label="Title color"
                      :items="['primary', 'secondary', 'error', 'warning', 'info', 'success']"
                    />
                  </VCol>

                  <VCol cols="12" sm="6">
                    <VTextField
                      v-model="titleSettings.emphasizedSettings.fontSize"
                      label="Title size"
                      type="number"
                    />
                  </VCol>

                  <VCol cols="12" sm="6">
                    <VSelect
                      v-model="titleSettings.emphasizedSettings.fontWeight"
                      label="Title weight"
                      :items="[100, 200, 300, 400, 500, 600, 700, 800, 900]"
                    />
                  </VCol>

                  <VCol cols="12" sm="6">
                    <VSelect
                      v-model="titleSettings.emphasizedSettings.textDecoration"
                      label="Title style"
                      :items="['none', 'underline', 'overline', 'line-through']"
                    />
                  </VCol>

                  <VCol cols="12" sm="6">
                    <VSelect
                      v-model="titleSettings.emphasizedSettings.textTransform"
                      label="Title transform"
                      :items="['none', 'capitalize', 'uppercase', 'lowercase']"
                    />
                  </VCol>
                </VRow>

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

          <VCol>
            <VTextarea
              v-model="titleSettings.subTitle"
              label="Feature description"
              placeholder="Text here..."
            />
          </VCol>
        </VRow>

        <VCardTitle class="mt-6">
          Title preview:
        </VCardTitle>

        <VCardText class="mt-2 d-flex align-center gap-1 justify-center">
          <Component
            :is="titleSettings.emphasizedSettings.variant"
            v-if="titleSettings.isEmphasized"
            :style="{
              color: titleSettings.emphasizedSettings.color,
              fontSize: `${titleSettings.emphasizedSettings.fontSize}px`,
              fontWeight: titleSettings.emphasizedSettings.fontWeight,
              textDecoration: titleSettings.emphasizedSettings.textDecoration,
              textTransform: titleSettings.emphasizedSettings.textTransform,
            }"
          >
            {{ titleSettings.emphasizedTitle }}
          </Component>
          <span>
            {{ titleSettings.title }}
          </span>
        </VCardText>

        <VCardText class="text-center">
          {{ titleSettings.subTitle }}
        </VCardText>
      </VCard>

      <!-- 👉 Features -->
      <VCard class="pa-4">
        <VCardTitle>Features:</VCardTitle>
        <VCardText>
          <VRow v-for="(feature, index) in featuresData" :key="index">
            <VCol cols="12" sm="6" md="4">
              <VTextField v-model="feature.name" placeholder="Text here..." label="Feature Name" />
            </VCol>
            <VCol cols="12" sm="6" md="4">
              <VTextField v-model="feature.description" label="Feature description" placeholder="Text here..." />
            </VCol>
            <VCol cols="12" sm="6" md="4">
              <VSelect v-model="feature.icon" label="Icon" :items="['LaptopCharging', 'TransitionUp', 'Edit', 'SelectSolid', 'Lifebelt', 'GoogleDocs']" />
            </VCol>
          </VRow>

          <VBtn
            v-if="isCurrentFeatureValid"
            class="mt-6"
            prepend-icon="ri-add-line"
            @click="featuresData.push({ name: '', description: '', icon: '' })"
          >
            Add another option
          </VBtn>
        </VCardText>

        <VCardTitle>Features preview:</VCardTitle>
        <VCardText>
          <VRow>
            <VCol v-for="(feature, index) in featuresData" :key="index" cols="12" sm="6" md="4">
              <div class="feature d-flex flex-column gap-y-2 align-center justify-center mt-2">
                <VAvatar variant="outlined" size="82" color="primary" class="mb-2">
                  <component :is="iconMap[feature.icon]" />
                </VAvatar>
                <h5 class="text-h5">
                  {{ feature.name }}
                </h5>
                <p class="text-center text-medium-emphasis" style="max-inline-size: 360px;">
                  {{ feature.description }}
                </p>
              </div>
            </VCol>
          </VRow>
        </VCardText>
      </VCard>
    </div>
  </form>
</template>

<style lang="scss" scoped>
.emphasis-panels {
  border-color:rgba(133, 133, 133, 0.5) !important;

  &:hover {
  border-color:rgba(234, 234, 255, 0.7) !important;
  }
}
</style>
