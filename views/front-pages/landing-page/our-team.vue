<script setup lang="ts">
import teamPerson1 from '@images/front-pages/landing-page/team-member-1.png'
import teamPerson2 from '@images/front-pages/landing-page/team-member-2.png'
import teamPerson3 from '@images/front-pages/landing-page/team-member-3.png'
import teamPerson4 from '@images/front-pages/landing-page/team-member-4.png'
import sectionTitleIcon from '@images/pages/section-title-icon.png'
import frontPageElement from '@images/svg/front-page-element.svg'

import type { TeamSectionType } from '@/types/landing-page'

defineProps({
  data: {
    type: Object as PropType<TeamSectionType>,
  },
})

function getIcon(iconName: string) {
  switch (iconName) {
    case 'facebook':
      return 'ri-facebook-circle-line'
    case 'twitterX':
      return 'ri-twitter-line'
    case 'linkein':
      return 'ri-linkedin-box-line'
    default:
      return 'ri-facebook-circle-line'
  }
}

function getIconColor(iconName: string) {
  switch (iconName) {
    case 'facebook':
      return 'primary'
    case 'twitterX':
      return 'primary'
    case 'linkein':
      return 'primary'
    default:
      return 'primary'
  }
}

function getImage(imageName: string) {
  switch (imageName) {
    case 'teamPerson1':
      return teamPerson1
    case 'teamPerson2':
      return teamPerson2
    case 'teamPerson3':
      return teamPerson3
    case 'teamPerson4':
      return teamPerson4
    default:
      return teamPerson1
  }
}

function openLink(url: string) {
  window.open(url, '_blank')
}
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

        <div class="our-team-title-wrapper mb-2 d-flex align-end gap-1 ">
          <component
            :is="data?.our_team_emphasized_title?.variant"
            v-if="data?.our_team_emphasized_title"
            :style="{
              color: data?.our_team_emphasized_title?.color,
              fontSize: `${data?.our_team_emphasized_title?.font_size}px`,
              fontWeight: data?.our_team_emphasized_title?.font_weight,
              textTransform: data?.our_team_emphasized_title?.text_transform,
              textDecoration: data?.our_team_emphasized_title?.text_decoration,
            }"
          >
            {{ data?.our_team_emphasized_title?.text }}
          </component>

          <span class="our-team-title text-h5 d-inline-block">
            {{ data?.our_team_title }}
          </span>
        </div>

        <p
          v-for="(description, index) in data?.our_team_desc"
          :key="index"
          class="text-body-1 font-weight-medium text-center"
        >
          {{ description }}
        </p>
      </div>

      <VRow>
        <VCol
          v-for="(member, index) in data?.our_team_data"
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
            :style="{
              '--hover-border-color': member.borderColor,
            }"
          >
            <VImg
              :src="getImage(member.image)"
              height="240px"
              class="team-image"
            />
            <div :style="{ 'maxHeight': '185px', 'minHeight': '185px', 'backgroundColor': member.backgroundColor, 'border-top-left-radius': '0.625rem', 'border-top-right-radius': '0.625rem' }" />
            <VCardText class="text-center">
              <div class="mb-3">
                <h5 class="text-h5">
                  {{ member.name }}
                </h5>
                <div class="text-body-1">
                  {{ member.position }}
                </div>
              </div>

              <div class="d-flex gap-x-2 align-center justify-center">
                <template
                  v-for=" (link, key) in member.social_networks"
                  :key="key"
                >
                  <VIcon
                    :icon="getIcon(key)"
                    size="22"
                    :color="getIconColor(key)"
                    class="cursor-pointer"
                    @click="openLink(link)"
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

@media screen and (max-width: 510px) {
  .our-team-title-wrapper {
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0;
  }
}

.v-card:hover {
  border-color: var(--hover-border-color) !important;
}

.v-icon {
  &:hover {
    color: var(--hover-border-color) !important;
  }
}
</style>
