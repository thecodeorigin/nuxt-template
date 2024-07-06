<script setup lang="ts">
import teamPerson1 from '@images/front-pages/landing-page/team-member-1.png'
import teamPerson2 from '@images/front-pages/landing-page/team-member-2.png'
import teamPerson3 from '@images/front-pages/landing-page/team-member-3.png'
import teamPerson4 from '@images/front-pages/landing-page/team-member-4.png'
import sectionTitleIcon from '@images/pages/section-title-icon.png'
import frontPageElement from '@images/svg/front-page-element.svg'

const teamData = ref([
  { name: 'Sophie Gilbert', position: 'Project Manager', image: teamPerson1, backgroundColor: 'rgba(144, 85, 253, 0.16)', borderColor: 'rgba(144, 85, 253,0.38)', isHover: false },
  { name: 'Nannie Ford', position: 'Development Lead', image: teamPerson2, backgroundColor: 'rgba(255, 76, 81, 0.16)', borderColor: 'rgba(255, 76, 81,0.38)', isHover: false },
  { name: 'Chris Watkins', position: 'Marketing Manager', image: teamPerson3, backgroundColor: 'rgba(86, 202, 0, 0.16)', borderColor: 'rgba(86, 202, 0,0.38)', isHover: false },
  { name: 'Paul Miles', position: 'UI Designer', image: teamPerson4, backgroundColor: 'rgba(22, 177, 255, 0.16)', borderColor: 'rgba(22, 177, 255,0.38)', isHover: false },
])
</script>

<template>
  <VContainer id="team">
    <div class="our-team">
      <div class="headers d-flex justify-center flex-column align-center">
        <Component
          :is="frontPageElement"
          class="front-page-element"
        />

        <div class="d-flex gap-x-3 mb-6">
          <img
            :src="sectionTitleIcon"
            alt="section title icon"
            height="24"
            width="25"
          >
          <div class="text-body-1 text-high-emphasis font-weight-medium">
            OUR GREAT TEAM
          </div>
        </div>

        <div class="mb-2">
          <span
            class="text-h4 d-inline-block font-weight-bold"
            style="line-height: 2rem;"
          >
            Supported
          </span> <span class="text-h5 d-inline-block">by Real People</span>
        </div>

        <p
          class="text-body-1 font-weight-medium text-center"
          style="letter-spacing: 0.15px !important;"
        >
          Who is behind these great-looking interfaces?
        </p>
      </div>

      <VRow>
        <VCol
          v-for="(data, index) in teamData"
          :key="index"
          cols="12"
          lg="3"
          sm="6"
        >
          <VCard
            flat
            variant="outlined"
            min-width="267"
            class="position-relative overflow-visible mt-16"
            :style="data.isHover ? { border: `1px solid ${data.borderColor}` } : {}"
            @mouseenter="data.isHover = true"

            @mouseleave="data.isHover = false"
          >
            <VImg
              :src="data.image"
              height="240px"
              class="team-image"
            />
            <div :style="{ 'maxHeight': '185px', 'minHeight': '185px', 'backgroundColor': data.backgroundColor, 'border-top-left-radius': '0.625rem', 'border-top-right-radius': '0.625rem' }" />
            <VCardText class="text-center">
              <div class="mb-3">
                <h5 class="text-h5">
                  {{ data.name }}
                </h5>
                <div class="text-body-1">
                  {{ data.position }}
                </div>
              </div>

              <div class="d-flex gap-x-2 align-center justify-center">
                <template
                  v-for="{ icon, color } in [
                    { icon: 'ri-facebook-circle-line', color: 'rgba(59, 89, 152, 1)', link: 'https://www.facebook.com/' },
                    { icon: 'ri-twitter-line', color: 'rgba(0, 172, 238, 1)', link: 'https://twitter.com/' },
                    { icon: 'ri-linkedin-box-line', color: 'rgba(0, 119, 181, 1)', link: 'https://linkedin.com' },
                  ]"
                  :key="color"
                >
                  <VIcon
                    :icon="icon"
                    size="22"
                    :color="data.isHover ? color : ''"
                    class="cursor-pointer"
                  />
                </template>
              </div>
            </VCardText>
          </VCard>
        </VCol>
      </VRow>
    </div>
  </VContainer>
</template>

<style lang="scss" scoped>
.team-image {
  position: absolute;
  inset-block-start: -3.4rem;
  inset-inline: 0;
}

.headers {
  margin-block-end: 1.25rem;
}

.our-team {
  position: relative;
  margin-block: 5.25rem;
}

.front-page-element {
  position: absolute;
  inset-block-start: 0;
  inset-inline-end: 0;
}
</style>
