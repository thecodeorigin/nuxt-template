<script lang="ts" setup>
import { z } from 'zod'
import { PerfectScrollbar } from 'vue3-perfect-scrollbar'
import { cloneDeep } from 'lodash-es'

import type { DrawerConfig, LandingPageStatusEmit, TeamData, TeamSectionType } from '~/utils/types/landing-page'

const emit = defineEmits<LandingPageStatusEmit>()

const DRAWER_ACTION_TYPES = {
  ADD: 'add' as const,
  EDIT: 'edit' as const,
  DELETE: 'delete' as const,
}

type DrawerActionTypes = typeof DRAWER_ACTION_TYPES[keyof typeof DRAWER_ACTION_TYPES] | undefined

const { ourTeamData } = storeToRefs(useLandingPageStore())

const ourTeamForm = ref<TeamSectionType>({
  our_team_title: '',
  our_team_desc: '',
  our_team_data: [
    {
      id: '',
      name: '',
      position: '',
      image: null,
      background_color: '',
      border_color: '',
      social_networks: {
        facebook: null,
        twitterX: null,
        linkedin: null,
      },
    },
  ],
})
const teamData = ref<TeamData>({
  id: '',
  name: '',
  position: '',
  image: null,
  background_color: '',
  border_color: '',
  social_networks: {
    facebook: '',
    twitterX: '',
    linkedin: '',
  },
})
const memberDrawerOption = ref<DrawerConfig>({
  isVisible: false,
  type: DRAWER_ACTION_TYPES.ADD,
})
const isLoading = ref(false)

type TeamFormSchemaType = z.infer<typeof ourTeamSchema>
const error = ref<z.ZodFormattedError<TeamFormSchemaType> | null>(null)

function onTitleUpdate(editorValue: string) {
  if (editorValue.trim().length > 0 && error.value?.our_team_title) {
    error.value.our_team_title._errors = []
  }
  return ourTeamForm.value.our_team_title = removePTags(editorValue)
}

function onDescriptionUpdate(editorValue: string) {
  if (editorValue.trim().length > 0 && error.value?.our_team_desc) {
    error.value.our_team_desc._errors = []
  }
  return ourTeamForm.value.our_team_desc = removePTags(editorValue)
}

function clearTeamData() {
  teamData.value = {
    id: '',
    name: '',
    position: '',
    image: null,
    background_color: '',
    border_color: '',
    social_networks: {
      facebook: '',
      twitterX: '',
      linkedin: '',
    },
  }
}

const teamList = computed<TeamData[]>(() => ourTeamForm.value?.our_team_data || [])

function handleOpenAddDrawer() {
  memberDrawerOption.value = {
    isVisible: true,
    type: DRAWER_ACTION_TYPES.ADD,
  }

  clearTeamData()
}

function handleOpenEditDrawer(memberId: string) {
  const foundMember = teamList.value?.find((member: TeamData) => member.id === memberId)

  if (!foundMember)
    return false

  teamData.value = foundMember

  memberDrawerOption.value = {
    isVisible: true,
    type: DRAWER_ACTION_TYPES.EDIT,
  }
}

function handleToggleReviewerDrawer(val: boolean) {
  memberDrawerOption.value.isVisible = val
}

function handleReviewerChange(value: TeamData, type: DrawerActionTypes) {
  if (ourTeamForm.value && type === DRAWER_ACTION_TYPES.EDIT) {
    ourTeamForm.value.our_team_data = teamList.value.map(
      (member: TeamData) => {
        if (member.id === value.id) {
          return value
        }
        return member
      },
    ) || []
  }
  else if (ourTeamForm.value && type === DRAWER_ACTION_TYPES.ADD) {
    ourTeamForm.value.our_team_data = [
      ...teamList.value || [],
      value,
    ]
  }
  else if (ourTeamForm.value && type === DRAWER_ACTION_TYPES.DELETE) {
    ourTeamForm.value.our_team_data = teamList.value.filter(
      (member: TeamData) => member.id !== value.id,
    ) || []
  }
}

async function onOurTeamSubmit() {
  const validInput = ourTeamSchema.safeParse(ourTeamForm.value)

  if (!validInput.success) {
    error.value = validInput.error.format()

    notify('Invalid input, please check and try again', {
      type: 'error',
      timeout: 5000,
    })

    emit('update:sectionStatus', 'error')
  }
  else {
    error.value = null
    isLoading.value = true
    emit('update:sectionStatus', 'loading')

    try {
      const res = await $api('/api/pages/landing-page/our-team', {
        method: 'PATCH',
        body: ourTeamForm.value,
      })

      if ('success' in res && res.success) {
        notify('Successfully updated', {
          type: 'success',
          timeout: 3000,
        })

        emit('update:sectionStatus', 'success')
      }
      else if ('error' in res && res.error) {
        notify(res.error, {
          type: 'error',
          timeout: 5000,
        })

        emit('update:sectionStatus', 'error')
      }
    }
    catch (error) {
      if (error instanceof z.ZodError) {
        console.log(error.errors.map(err => err.message).join('\n'))
      }
      else {
        console.log('Unexpected error: ', error)
        notify(error as string, {
          type: 'error',
          timeout: 3000,
        })
      }

      emit('update:sectionStatus', 'error')
    }
    finally {
      isLoading.value = false
    }
  }
}

defineExpose({
  onOurTeamSubmit,
})

watch(ourTeamData, (value) => {
  if (value) {
    ourTeamForm.value = cloneDeep(value)
  }
}, {
  immediate: true,
  deep: true,
})
</script>

<template>
  <div>
    <VForm @submit.prevent="onOurTeamSubmit">
      <VLabel class="text-h3 text-capitalize text-primary font-weight-bold mb-4  d-block label">
        Our Team Section
      </VLabel>

      <div class="d-flex flex-column gap-4">
        <!-- 👉 Our Team Heading -->
        <VCard class="pa-4">
          <VCardTitle class="text-center mb-4">
            Our Team page heading
          </VCardTitle>

          <VRow>
            <VCol cols="12" sm="6" class="mb-6">
              <!-- 👉 Our Team Main Title -->
              <VLabel class="mb-2 label">
                Our team title:
                <VIcon icon="ri-asterisk" class="text-error text-overline mb-2" />
              </VLabel>
              <TiptapEditor
                v-model="ourTeamForm.our_team_title as string"
                class="border rounded-lg title-content mb-2"
                :class="{ 'border-error border-opacity-100': error?.our_team_title && error?.our_team_title?._errors.length > 0 }"
                placeholder="Text here..."
                @update:model-value="onTitleUpdate"
              />

              <div v-if="error?.our_team_title">
                <span v-for="(warn, index) in error?.our_team_title?._errors" :key="index" class="text-error error-text">
                  {{ warn }}
                </span>
              </div>
            </VCol>

            <VCol cols="12" sm="6" class="mb-6">
              <!-- 👉 Our team Description -->
              <VLabel class="mb-2 label">
                Description:
                <VIcon icon="ri-asterisk" class="text-error text-overline mb-2" />
              </VLabel>

              <TiptapEditor
                v-model="ourTeamForm.our_team_desc as string"
                class="border rounded-lg mb-2"
                :class="{ 'border-error border-opacity-100': error?.our_team_desc && error?.our_team_desc?._errors.length > 0 }"
                placeholder="Text here..."
                @update:model-value="onDescriptionUpdate"
              />

              <div v-if="error?.our_team_desc">
                <span v-for="(warn, index) in error?.our_team_desc?._errors" :key="index" class="text-error error-text">
                  {{ warn }}
                </span>
              </div>
            </VCol>
          </VRow>
        </VCard>

        <!-- 👉 Our Team members -->
        <VCard class="pa-4 h-100">
          <VCardTitle class="text-center mb-4">
            Our Team Members
          </VCardTitle>

          <PerfectScrollbar
            :options="{ wheelPropagation: false }"
            style="padding: 16px;
                  max-height: 500px;"
          >
            <VRow>
              <VCol cols="12" sm="6" md="4" lg="6">
                <VCard class="add-card d-flex justify-center align-center pa-2" hover height="100%" ripple @click="handleOpenAddDrawer">
                  <VIcon icon="ri-add-circle-line" size="40" />
                </VCard>
              </VCol>

              <VCol v-for="(member, index) in teamList" :key="index" cols="12" sm="6" md="4" lg="6" @click="handleOpenEditDrawer(member.id)">
                <VCard class="member-card d-flex flex-column align-center pa-2" hover height="100%" ripple>
                  <VCardTitle class="text-center mb-4 d-flex flex-column member-name">
                    {{ member.name }}

                    <span class="text-body-2">
                      {{ member.position }}
                    </span>
                  </VCardTitle>

                  <div class="member-image-container">
                    <VImg
                      :src="member.image"
                      class="align-center member-image"
                    />
                  </div>
                </VCard>
              </VCol>
            </VRow>
          </PerfectScrollbar>
        </VCard>

        <!-- 👉 Reviewer Button Submit -->
        <div class="w-100 d-flex justify-center align-center">
          <VBtn
            v-if="isLoading === false"
            class="mx-auto w-100"
            type="submit"
            color="primary"
            variant="outlined"
            @click="onOurTeamSubmit"
          >
            Update Our Team Section Content
          </VBtn>

          <VBtn
            v-else
            class="mx-auto w-100"
            type="submit"
            color="primary"
            variant="outlined"
          >
            <VProgressCircular
              indeterminate
              color="primary"
              size="24"
            />
          </VBtn>
        </div>
      </div>
    </VForm>

    <LandingPageOurTeamDrawer
      v-model="teamData"
      :drawer-config="memberDrawerOption" @update:is-drawer-open="handleToggleReviewerDrawer"
      @update:model-value="handleReviewerChange"
    />
  </div>
</template>

<style lang="scss" scoped>
.label {
  line-height: 40px;
}

.member-card {
  min-width: 30px;
  min-height: 180px;
  height: 100%;
  cursor: pointer;
  &:hover {
    background-color: rgba(var(--v-theme-on-surface), var(--v-hover-opacity));
  }
}

.add-card{
  min-height: 180px;
  cursor: pointer;
  border: 1px dashed rgba(var(--v-theme-on-surface), 0.12);
  &:hover {
    background-color: rgba(var(--v-theme-on-surface), var(--v-hover-opacity));
  }
}

.title-content {
  :deep(.ProseMirror) {
    min-block-size: 5vh;
  }
}

.error-text{
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 4px;
}

.member-name {
  width: 100%;
  flex: 1;
  white-space: wrap;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  word-wrap: break-word;
}

.member-image-container {
  flex: 0 0 auto;
  width: 100%;
  height: 100px;
  padding: 16px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.member-image{
  width: 100px;
  height: auto;
}
</style>
