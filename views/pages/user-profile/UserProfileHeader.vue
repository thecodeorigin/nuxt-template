<script lang="ts" setup>
import type { ProfileHeader } from '@db/pages/profile/types'

const profileHeaderData = ref<ProfileHeader>()

const { data, error } = await useApi<ProfileHeader>('/pages/profile/header')

if (error.value) {
  console.log(error.value)
}
else {
  if (data.value)
    profileHeaderData.value = data.value
}
</script>

<template>
  <VCard v-if="profileHeaderData">
    <VImg
      :src="profileHeaderData.coverImg"
      min-height="125"
      max-height="250"
      cover
    />

    <VCardText class="d-flex align-bottom flex-sm-row flex-column justify-center gap-x-6">
      <div class="d-flex h-0">
        <VAvatar
          rounded
          size="130"
          :image="profileHeaderData.profileImg"
          class="user-profile-avatar mx-auto"
        >
          <VImg
            :src="profileHeaderData.profileImg"
            height="120"
            width="120"
          />
        </VAvatar>
      </div>

      <div class="user-profile-info w-100 mt-16 pt-6 pt-sm-0 mt-sm-0">
        <h4 class="text-h4 text-center text-sm-start mb-2">
          {{ profileHeaderData.fullName }}
        </h4>

        <div class="d-flex align-center justify-center justify-sm-space-between flex-wrap gap-6">
          <div class="d-flex flex-wrap justify-center justify-sm-start flex-grow-1 gap-6">
            <div class="d-flex align-center gap-x-2">
              <VIcon
                size="24"
                icon="ri-palette-line"
              />
              <div class="text-body-1 font-weight-medium">
                {{ profileHeaderData.designation }}
              </div>
            </div>

            <div class="d-flex align-center gap-x-2">
              <VIcon
                size="24"
                icon="ri-map-pin-line"
              />
              <div class="text-body-1 font-weight-medium">
                {{ profileHeaderData.location }}
              </div>
            </div>

            <div class="d-flex align-center gap-x-2">
              <VIcon
                size="24"
                icon="ri-calendar-line"
              />
              <div class="text-body-1 font-weight-medium">
                {{ profileHeaderData.joiningDate }}
              </div>
            </div>
          </div>

          <VBtn prepend-icon="ri-user-follow-line">
            Connected
          </VBtn>
        </div>
      </div>
    </VCardText>
  </VCard>
</template>

<style lang="scss">
.user-profile-avatar {
  border: 5px solid rgb(var(--v-theme-surface));
  background-color: rgb(var(--v-theme-surface)) !important;
  inset-block-start: -3rem;

  .v-img__img {
    border-radius: 0.375rem;
  }
}
</style>
