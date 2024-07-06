<script setup lang="ts">
import type { ConnectionsTab } from '@db/pages/profile/types'

const router = useRoute('pages-user-profile-tab')
const connectionData = ref<ConnectionsTab[]>([])

const fetchProjectData = async () => {
  if (router.params.tab === 'connections') {
    const data = await $api('/pages/profile', {
      query: {
        tab: router.params.tab,
      },
    }).catch(err => console.log(err))

    connectionData.value = data
  }
}

watch(router, fetchProjectData, { immediate: true })

const moreBtnList = [
  { title: 'Share connection', value: 'Share connection' },
  { title: 'Block connection', value: 'Block connection' },
  { type: 'divider', class: 'my-2' },
  { title: 'Delete', value: 'Delete', class: 'text-error' },
]
</script>

<template>
  <VRow>
    <VCol
      v-for="data in connectionData"
      :key="data.name"
      sm="6"
      lg="4"
      cols="12"
    >
      <VCard>
        <div class="vertical-more">
          <MoreBtn
            item-props
            :menu-list="moreBtnList"
            class="text-disabled"
          />
        </div>

        <VCardText>
          <div class="d-flex flex-column align-center justify-center mt-5">
            <VAvatar
              size="100"
              :image="data.avatar"
              class="mb-6"
            />

            <h5 class="text-h5">
              {{ data.name }}
            </h5>
            <div class="text-body-1">
              {{ data.designation }}
            </div>

            <div class="d-flex align-center flex-wrap gap-4 my-6">
              <VChip
                v-for="chip in data.chips"
                :key="chip.title"
                :color="chip.color"
                size="small"
              >
                {{ chip.title }}
              </VChip>
            </div>
          </div>

          <div class="d-flex justify-space-around">
            <div class="text-center">
              <h5 class="text-h5">
                {{ data.projects }}
              </h5>
              <div class="text-body-1">
                Projects
              </div>
            </div>
            <div class="text-center">
              <h5 class="text-h5">
                {{ data.tasks }}
              </h5>
              <div class="text-body-1">
                Tasks
              </div>
            </div>
            <div class="text-center">
              <h5 class="text-h5">
                {{ data.connections }}
              </h5>
              <div class="text-body-1">
                Connections
              </div>
            </div>
          </div>

          <div class="d-flex justify-center gap-4 mt-6">
            <VBtn
              :prepend-icon="data.isConnected ? 'ri-user-follow-line' : 'ri-user-add-line'"
              :variant="data.isConnected ? 'elevated' : 'outlined'"
            >
              {{ data.isConnected ? 'connected' : 'connect' }}
            </VBtn>

            <IconBtn
              color="secondary"
              variant="outlined"
              rounded
            >
              <VIcon icon="ri-mail-open-line" />
            </IconBtn>
          </div>
        </VCardText>
      </VCard>
    </VCol>
  </VRow>
</template>

<style lang="scss">
.vertical-more {
  position: absolute;
  inset-block-start: 1rem;
  inset-inline-end: 0.5rem;
}
</style>
