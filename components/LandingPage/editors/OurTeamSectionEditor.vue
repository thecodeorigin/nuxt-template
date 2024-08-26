<script lang="ts" setup>
import { z } from 'zod'
import { PerfectScrollbar } from 'vue3-perfect-scrollbar'

import type { DrawerConfig, TeamData, TeamSectionType } from '@/types/landing-page'

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
const tiptapTitleInput = ref<string>('')
const tiptapDescriptionInput = ref<string>('')
const memberDrawerOption = ref<DrawerConfig>({
  isVisible: false,
  type: DRAWER_ACTION_TYPES.ADD,
})
const isLoading = ref(false)

type TeamFormSchemaType = z.infer<typeof ourTeamSchema>
const error = ref<z.ZodFormattedError<TeamFormSchemaType> | null>(null)

function onTitleUpdate(editorValue: string) {
  return tiptapTitleInput.value = removeEmptyTags(editorValue)
}

function onDescriptionUpdate(editorValue: string) {
  return tiptapDescriptionInput.value = removeEmptyTags(editorValue)
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

const teamList = computed(() => ourTeamForm.value?.our_team_data || [])

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
    ourTeamForm.value.our_team_data = ourTeamForm.value?.our_team_data?.map(
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
      ...ourTeamForm.value?.our_team_data || [],
      value,
    ]
  }
  else if (ourTeamForm.value && type === DRAWER_ACTION_TYPES.DELETE) {
    ourTeamForm.value.our_team_data = ourTeamForm.value?.our_team_data?.filter(
      (member: TeamData) => member.id !== value.id,
    ) || []
  }
}

async function onSubmit() {
  const formData = {
    ...ourTeamForm.value,
    our_team_title: tiptapTitleInput.value,
    our_team_desc: tiptapDescriptionInput.value,
    our_team_data: [
      ...teamList.value || [],
    ],
  }

  const validInput = ourTeamSchema.safeParse(formData)

  if (!validInput.success) {
    error.value = validInput.error.format()
    console.log('««««« error »»»»»', error.value)
    notify('Invalid input, please check and try again', {
      type: 'error',
      timeout: 5000,
    })
  }
  else {
    error.value = null
    isLoading.value = true

    try {
      await $api('/api/pages/landing-page/our-team', {
        method: 'PATCH',
        body: ourTeamForm.value,
      })

      notify('Successfully updated', {
        type: 'success',
        timeout: 3000,
      })
    }
    catch (e) {
      if (e instanceof z.ZodError) {
        console.log(e.errors.map(err => err.message).join('\n'))
      }
      else {
        console.log('Unexpected error: ', e)
      }
    }
    finally {
      isLoading.value = false
    }
  }
}

watch(ourTeamData, (value) => {
  if (value) {
    ourTeamForm.value = {
      our_team_title: value.our_team_title,
      our_team_desc: value.our_team_desc,
      our_team_data: [
        ...value.our_team_data || [],
      ],
    }
  }

  tiptapTitleInput.value = ourTeamForm.value.our_team_title
  tiptapDescriptionInput.value = ourTeamForm.value.our_team_desc as string
}, {
  immediate: true,
  deep: true,
})
</script>

<template>
  <VForm @submit.prevent="onSubmit">
    <VLabel class="text-h3 text-capitalize text-primary font-weight-bold mb-4  d-block label">
      Our Team Section
    </VLabel>

    <div class="d-flex flex-column gap-4">
      <VRow>
        <!-- 👉 Our Team Heading -->
        <VCol cols="12" md="4">
          <VCard class="pa-4">
            <VCardTitle class="text-center mb-4">
              Our Team page heading
            </VCardTitle>
            <!-- 👉 Our Team Main Title -->
            <div class="mb-6 position-relative">
              <VLabel class="mb-2 label">
                Our team title:
                <VIcon icon="ri-asterisk" class="text-error text-overline mb-2" />
              </VLabel>
              <TiptapEditor
                v-model="ourTeamForm.our_team_title"
                class="border rounded-lg title-content"
                :class="{ 'border-error border-opacity-100': error?.our_team_title && tiptapTitleInput.length === 0 }"
                placeholder="Text here..."
                @update:model-value="onTitleUpdate"
              />
              <div v-if="error?.our_team_title && tiptapTitleInput.length === 0">
                <span v-for="(warn, index) in error?.our_team_title?._errors" :key="index" class="text-error error-text">
                  {{ warn }}
                </span>
              </div>
            </div>
            <!-- 👉 Our team Description -->
            <div class="mb-6 position-relative">
              <VLabel class="mb-2 label">
                Review:
                <VIcon icon="ri-asterisk" class="text-error text-overline mb-2" />
              </VLabel>
              <TiptapEditor
                v-model="ourTeamForm.our_team_desc as string"
                class="border rounded-lg "
                :class="{ 'border-error border-opacity-100': error?.our_team_desc && tiptapDescriptionInput.length === 0 }"
                placeholder="Text here..."
                @update:model-value="onDescriptionUpdate"
              />
              <div v-if="error?.our_team_desc && tiptapDescriptionInput.length === 0">
                <span v-for="(warn, index) in error?.our_team_desc?._errors" :key="index" class="text-error error-text">
                  {{ warn }}
                </span>
              </div>
            </div>
          </VCard>
        </VCol>

        <VCol cols="12" md="8">
          <VCard class="pa-4 h-100">
            <VCardTitle class="text-center mb-4">
              Our Team Members
            </VCardTitle>

            <PerfectScrollbar
              :options="{ wheelPropagation: false, suppressScrollX: true }"
              class="h-100"
            >
              <VRow>
                <VCol cols="12" sm="6" md="4" lg="6">
                  <VCard class="add-card d-flex justify-center align-center pa-2" hover height="100%" ripple @click="handleOpenAddDrawer">
                    <VIcon icon="ri-add-circle-line" size="40" />
                  </VCard>
                </VCol>

                <VCol v-for="(member, index) in ourTeamForm.our_team_data" :key="index" cols="12" sm="6" md="4" lg="6" @click="handleOpenEditDrawer(member.id)">
                  <VCard class="member-card d-flex flex-column align-center pa-2" hover height="100%" ripple>
                    <VCardTitle class="text-center mb-4 d-flex flex-column">
                      {{ member.name }}

                      <span class="text-body-2">
                        {{ member.position }}
                      </span>
                    </VCardTitle>

                    <VImg
                      v-if="member.image"
                      :src="member.image"
                      class="rounded-circle"
                      cover
                    />
                  </VCard>
                </VCol>
              </VRow>
            </PerfectScrollbar>
          </VCard>
        </VCol>
      </VRow>

      <!-- 👉 Reviewer Button Submit -->
      <div class="w-100 d-flex justify-center align-center">
        <VBtn
          v-if="isLoading === false"
          class="mx-auto w-100"
          type="submit"
          color="primary"
          variant="outlined"
          @click="onSubmit"
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
</template>

<style lang="scss" scoped>
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
</style>
