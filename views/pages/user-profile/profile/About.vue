<script lang="ts" setup>
import type { ProfileTab } from '@db/pages/profile/types'

interface Props {
  data: ProfileTab
}
const props = defineProps<Props>()
</script>

<template>
  <VCard class="mb-6">
    <VCardText>
      <div class="text-body-2 mb-4 text-disabled">
        ABOUT
      </div>
      <div class="d-flex flex-column gap-y-4">
        <div
          v-for="item in props.data.about"
          :key="item.property"
          class="d-flex align-center gap-x-2"
        >
          <VIcon
            :icon="item.icon"
            size="24"
          />
          <div class="font-weight-medium">
            {{ item.property }}:
          </div>
          <div>
            {{ item.value }}
          </div>
        </div>
      </div>

      <div class="text-body-2 text-disabled mt-6 mb-4">
        CONTACTS
      </div>
      <div class="d-flex flex-column gap-y-4">
        <div
          v-for="item in props.data.contacts"
          :key="item.property"
          class="d-flex align-center gap-x-2"
        >
          <VIcon
            :icon="item.icon"
            size="24"
          />
          <div class="font-weight-medium">
            {{ item.property }}:
          </div>
          <div class="text-truncate">
            {{ item.value }}
          </div>
        </div>
      </div>

      <div class="text-body-2 text-disabled mt-6 mb-4">
        TEAMS
      </div>

      <div class="d-flex flex-column gap-y-4">
        <div
          v-for="item in props.data.teams"
          :key="item.property"
        >
          <div class="d-flex align-center gap-x-2">
            <div class="font-weight-medium text-no-wrap">
              {{ item.property }}
            </div>
            <div class="text-no-wrap text-truncate">
              {{ item.value }}
            </div>
          </div>
        </div>
      </div>
    </VCardText>
  </VCard>

  <VCard>
    <VCardText>
      <div class="text-body-2 text-disabled mb-4">
        OVERVIEW
      </div>

      <div class="d-flex flex-column gap-y-4">
        <div
          v-for="item in props.data.overview"
          :key="item.property"
          class="d-flex gap-x-2 align-center"
        >
          <VIcon
            :icon="item.icon"
            size="24"
          />
          <div class="font-weight-medium">
            {{ item.property }}:
          </div>
          <div>{{ item.value }}</div>
        </div>
      </div>
    </VCardText>
  </VCard>
</template>

<style lang="scss" scoped>
.card-list {
  --v-card-list-gap: 16px;
}
</style>
