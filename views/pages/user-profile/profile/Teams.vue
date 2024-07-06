<script lang="ts" setup>
import type { ProfileTeamsTech } from '@db/pages/profile/types'

interface Props {
  teamsData: ProfileTeamsTech[]
}

const props = defineProps<Props>()

const moreList = [
  { title: 'Share connections', value: 'Share connections' },
  { title: 'Suggest edits', value: 'Suggest edits' },
  { title: 'Report Bug', value: 'Report Bug' },
]
</script>

<template>
  <VCard
    title="Teams"
    class="teamsCard"
  >
    <template #append>
      <div class="me-n2">
        <MoreBtn :menu-list="moreList" />
      </div>
    </template>

    <VCardText>
      <VList class="card-list">
        <VListItem
          v-for="data in props.teamsData"
          :key="data.title"
        >
          <template #prepend>
            <VAvatar
              size="38"
              :image="data.avatar"
            />
          </template>

          <VListItemTitle class="font-weight-medium mb-1">
            {{ data.title }}
          </VListItemTitle>
          <VListItemSubtitle>{{ data.members }} Members</VListItemSubtitle>

          <template #append>
            <VChip
              :color="data.ChipColor"
              size="small"
            >
              {{ data.chipText }}
            </VChip>
          </template>
        </VListItem>

        <VListItem>
          <VListItemTitle class="pt-1 text-center">
            <NuxtLink :to="{ name: 'pages-user-profile-tab', params: { tab: 'teams' } }">
              <p class="mb-0">
                View all Teams
              </p>
            </NuxtLink>
          </VListItemTitle>
        </VListItem>
      </VList>
    </VCardText>
  </VCard>
</template>

<style lang="scss" scoped>
.card-list {
  --v-card-list-gap: 16px;
}
</style>

<style lang="scss">
.teamsCard {
  .v-list {
    .v-list-item {
      &__prepend {
        .v-list-item__spacer {
          inline-size: 8px !important;
        }
      }
    }
  }
}
</style>
