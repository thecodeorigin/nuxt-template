<script setup lang="ts">
import sectionTitleIcon from '@images/pages/section-title-icon.png'
import SelectSolid from '@images/svg/3d-select-solid.svg'
import Edit from '@images/svg/edit.svg'
import GoogleDocs from '@images/svg/google-docs.svg'
import LaptopCharging from '@images/svg/laptop-charging.svg'
import Lifebelt from '@images/svg/lifebelt.svg'
import TransitionUp from '@images/svg/transition-up.svg'

const featuresData = [
  { title: 'Quality Code', desc: 'Code structure that all developers will easily understand and fall in love with.', img: LaptopCharging },
  { title: 'Continuous Updates', desc: 'Free updates for the next 12 months, including new demos and features.', img: TransitionUp },
  { title: 'Starter Kit', desc: 'Start your project quickly without having to remove unnecessary features.', img: Edit },
  { title: 'API Ready', desc: 'Just change the endpoint and see your own data loaded within seconds.', img: SelectSolid },
  { title: 'Well Documented', desc: 'An easy-to-follow doc with lots of references and code examples.', img: Lifebelt },
  { title: 'Excellent Support', desc: 'An easy-to-follow doc with lots of references and code examples.', img: GoogleDocs },
]
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

        <div class="mb-2 text-center">
          <span
            class="text-h4 d-inline-block font-weight-bold"
            style="line-height: 2rem;"
          >
            Everything you need
          </span> <span class="text-h5 d-inline-block">to start your next project</span>
        </div>

        <p class="text-body-1 font-weight-medium text-center">
          Not just a set of tools, the package includes ready-to-deploy conceptual application.
        </p>
      </div>

      <VRow>
        <VCol
          v-for="(data, index) in featuresData"
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
              <Component :is="data.img" />
            </VAvatar>

            <h5 class="text-h5">
              {{ data.title }}
            </h5>
            <p
              class="text-center text-medium-emphasis"
              style="max-inline-size: 360px;"
            >
              {{ data.desc }}
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
