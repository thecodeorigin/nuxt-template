<script lang="ts" setup>
import type { ProfileConnections } from '@db/pages/profile/types'

interface Props {
  connectionsData: ProfileConnections[]
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
    title="Connection"
    class="connectionCard"
  >
    <template #append>
      <div class="me-n2">
        <MoreBtn :menu-list="moreList" />
      </div>
    </template>

    <VCardText>
      <VList class="card-list">
        <VListItem
          v-for="data in props.connectionsData"
          :key="data.name"
        >
          <template #prepend>
            <VAvatar
              size="38"
              :image="data.avatar"
            />
          </template>

          <VListItemTitle class="font-weight-medium mb-1">
            {{ data.name }}
          </VListItemTitle>
          <VListItemSubtitle>{{ data.connections }} Connections</VListItemSubtitle>

          <template #append>
            <VBtn
              icon
              rounded
              :variant="data.isFriend ? 'elevated' : 'outlined' "
            >
              <VIcon :icon="data.isFriend ? 'ri-user-line' : 'ri-user-add-line'" />
            </VBtn>
          </template>
        </VListItem>

        <VListItem>
          <VListItemTitle class="pt-1 text-center">
            <NuxtLink :to="{ name: 'pages-user-profile-tab', params: { tab: 'connections' } }">
              <p class="mb-0">
                View all connections
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
.connectionCard {
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
