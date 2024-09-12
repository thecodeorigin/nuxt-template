<script setup lang="ts">
import sectionTitleIcon from '@images/pages/section-title-icon.png'
import frontPageElement from '@images/svg/front-page-element.svg'
import type { TeamData } from '@/utils/types/landing-page'

const { ourTeamData } = storeToRefs(useLandingPageStore())

function getIcon(iconName: string) {
  switch (iconName) {
    case 'facebook':
      return 'ri-facebook-circle-line'
    case 'twitterX':
      return 'ri-twitter-line'
    case 'linkedin':
      return 'ri-linkedin-box-line'
    default:
      return 'ri-facebook-circle-line'
  }
}

function getIconColor(iconName: string) {
  switch (iconName) {
    case 'facebook':
      return 'white'
    case 'twitterX':
      return 'white'
    case 'linkein':
      return 'white'
    default:
      return 'white'
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

        <div class="mb-2 text-center gap-1 ">
          <span class="our-team-title text-h5 d-inline-block" v-html="ourTeamData?.our_team_title" />
        </div>

        <p
          class="text-body-1 font-weight-medium text-center"
          v-html="ourTeamData?.our_team_desc"
        />
      </div>

      <div class="our-team-members-wrapper">
        <div
          v-for="(member, index) in ourTeamData?.our_team_data as TeamData[]"
          :key="index"
          class="our-team-members"
        >
          <VCard
            flat
            variant="outlined"
            min-width="267"
            class="position-relative overflow-visible mt-16"
            :style="{
              '--hover-border-color': member.border_color,
            }"
          >
            <VImg
              :src="member.image as string"
              height="240px"
              class="team-image"
            />
  
            <div :style="{ 'maxHeight': '185px', 'minHeight': '185px', 'backgroundColor': member.background_color, 'border-top-left-radius': '0.625rem', 'border-top-right-radius': '0.625rem' }" />
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
                    @click="openLink(link as string)"
                  />
                </template>
              </div>
            </VCardText>
          </VCard>
        </div>
      </div>
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

.v-card:hover {
  border-color: var(--hover-border-color) !important;
}

.v-icon {
  &:hover {
    color: var(--hover-border-color) !important;
  }
}

.our-team-members-wrapper {
  display: flex;
  justify-content: space-around;
  flex-wrap: wrap;
  gap: 24px;
}

.our-team-members {
  flex: 1;
}
</style>
