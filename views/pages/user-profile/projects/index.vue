<script setup lang="ts">
import type { ProjectsTab } from '@db/pages/profile/types'

const router = useRoute('pages-user-profile-tab')
const projectData = ref<ProjectsTab[]>([])

const fetchProjectData = async () => {
  if (router.params.tab === 'projects') {
    const data = await $api('/pages/profile', {
      query: {
        tab: router.params.tab,
      },
    }).catch(err => console.log(err))

    projectData.value = data
  }
}

watch(router, fetchProjectData, { immediate: true })

const moreList = [
  { title: 'Rename Project', value: 'Rename Project' },
  { title: 'View Details', value: 'View Details' },
  { title: 'Add to favorites', value: 'Add to favorites' },
  { type: 'divider', class: 'my-2' },
  { title: 'Leave Project', value: 'Leave Project', class: 'text-error' },
]
</script>

<template>
  <VRow v-if="projectData">
    <VCol
      v-for="data in projectData"
      :key="data.title"
      cols="12"
      sm="6"
      lg="4"
    >
      <VCard>
        <VCardItem class="pb-4">
          <template #prepend>
            <VAvatar
              :image="data.avatar"
              size="38"
              class="me-2"
            />
          </template>

          <VCardTitle>{{ data.title }}</VCardTitle>
          <div class="text-body-1">
            <span class="font-weight-medium">Client:</span>
            {{ data.client }}
          </div>

          <template #append>
            <div>
              <MoreBtn
                item-props
                :menu-list="moreList"
                class="text-disabled"
              />
            </div>
          </template>
        </VCardItem>

        <VCardText>
          <div class="d-flex align-center justify-space-between flex-wrap gap-x-2 gap-y-4">
            <div class="py-2 px-3 bg-var-theme-background rounded-lg">
              <div>
                <span class="text-high-emphasis font-weight-medium">{{ data.budgetSpent }}</span>/{{ data.budget }}
              </div>
              <div>Total Budget</div>
            </div>

            <div>
              <div>
                <span class="text-high-emphasis font-weight-medium">Start Date:</span> {{ data.startDate }}
              </div>
              <h6 class="text-base font-weight-medium">
                Deadline: <span class="text-body-1">{{ data.deadline }}</span>
              </h6>
            </div>
          </div>

          <p class="mt-4 mb-0 clamp-text">
            {{ data.description }}
          </p>
        </VCardText>

        <VDivider />

        <VCardText>
          <div class="d-flex align-center justify-space-between flex-wrap gap-2">
            <div>
              <span class="font-weight-medium text-high-emphasis">All Hours:</span> {{ data.hours }}
            </div>

            <VChip
              :color="data.chipColor"
              size="small"
            >
              {{ data.chipText }}
            </VChip>
          </div>

          <div class="d-flex align-center justify-space-between flex-wrap text-caption text-medium-emphasis mt-4 mb-2">
            <div>Tasks: {{ data.tasks }}</div>
            <div>{{ Math.round((data.completedTask / data.totalTask) * 100) }}% Completed</div>
          </div>
          <VProgressLinear
            rounded
            height="8"
            :model-value="data.completedTask"
            :max="data.totalTask"
            color="primary"
          />

          <div class="d-flex align-center justify-space-between flex-wrap gap-2 mt-4">
            <div class="d-flex align-center">
              <div class="v-avatar-group me-3">
                <VAvatar
                  v-for="avatar in data.avatarGroup"
                  :key="avatar.name"
                  :image="avatar.avatar"
                  :size="32"
                />
              </div>
              <div class="text-sm text-disabled">
                {{ data.members }}
              </div>
            </div>

            <div class="d-flex gap-x-1 align-center text-disabled">
              <VIcon
                icon="ri-wechat-line"
                size="24"
              />
              <div>{{ data.comments }}</div>
            </div>
          </div>
        </VCardText>
      </VCard>
    </VCol>
  </VRow>
</template>
