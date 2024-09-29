<script setup lang="ts">
import sectionTitleIcon from '@base/images/pages/section-title-icon.png'
import SelectSolid from '@base/images/svg/3d-select-solid.svg'
import Edit from '@base/images/svg/edit.svg'
import GoogleDocs from '@base/images/svg/google-docs.svg'
import LaptopCharging from '@base/images/svg/laptop-charging.svg'
import Lifebelt from '@base/images/svg/lifebelt.svg'
import TransitionUp from '@base/images/svg/transition-up.svg'

const { featureData } = storeToRefs(useLandingPageStore())

function getIcon(iconName: string) {
  switch (iconName) {
    case 'SelectSolid':
      return SelectSolid
    case 'Edit':
      return Edit
    case 'GoogleDocs':
      return GoogleDocs
    case 'LaptopCharging':
      return LaptopCharging
    case 'Lifebelt':
      return Lifebelt
    case 'TransitionUp':
      return TransitionUp
    default:
      return SelectSolid
  }
}
</script>

<template>
  <VContainer id="features">
    <div class="feature-cards">
      <div class="headers d-flex justify-center flex-column align-center mb-6">
        <div class="d-flex gap-x-3 mb-6">
          <img
            :src="sectionTitleIcon"
            alt="section title icon"
            height="24"
            width="25"
          >
          <div class="text-body-1 text-high-emphasis font-weight-medium">
            USEFUL FEATURES
          </div>
        </div>

        <p class="feature-title text-h5 d-inline-block" v-html="featureData?.feature_title" />

        <p class="text-body-1 font-weight-medium text-center" v-html="featureData?.feature_title_desc" />
      </div>

      <VRow>
        <VCol
          v-for="(feature, index) in featureData?.feature_data"
          :key="index"
          cols="12"
          sm="6"
          md="4"
        >
          <div class="feature d-flex flex-column gap-y-2 align-center justify-center mt-2">
            <VAvatar
              variant="outlined"
              size="82"
              color="primary"
              class="mb-2"
            >
              <Component :is="getIcon(feature.icon)" />
            </VAvatar>

            <h5 class="text-h5">
              {{ feature.name }}
            </h5>
            <p
              class="text-center text-medium-emphasis"
              style="max-inline-size: 360px;"
            >
              {{ feature.desc }}
            </p>
          </div>
        </VCol>
      </VRow>
    </div>
  </VContainer>
</template>

<style lang="scss" scoped>
.feature-cards {
  margin-block-end: 4.25rem;
}

#features {
  padding-block-start: 13rem;
}

@media (max-width: 960px) {
  #features {
    padding-block-start: 6rem;
  }
}

@media (max-width: 600px) {
  #features {
    padding-block-start: 2rem;
  }
}
</style>

<style lang="scss" scoped>
.feature {
  .v-avatar {
    &.v-avatar--variant-outlined {
      border: 2px solid rgba(var(--v-theme-primary), 0.32);

      &:hover {
        background: rgba(var(--v-theme-primary), 0.16);
        cursor: pointer;
      }
    }
  }
}
</style>
