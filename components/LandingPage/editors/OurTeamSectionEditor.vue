<script lang="ts" setup>
import type { z } from 'zod'
import { cloneDeep } from 'lodash-es'

import type { TeamData, TeamSectionType } from '@/types/landing-page'

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
      backgroundColor: '',
      borderColor: '',
      social_networks: {
        facebook: '',
        twitterX: '',
        linkedin: '',
      },
    },
  ],
})
const teamData = ref<TeamData>({
  id: '',
  name: '',
  position: '',
  image: null,
  backgroundColor: '',
  borderColor: '',
  social_networks: {
    facebook: '',
    twitterX: '',
    linkedin: '',
  },
})
const tiptapTitleInput = ref<string>('')
const tiptapDescriptionInput = ref<string>('')

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
    backgroundColor: '',
    borderColor: '',
    social_networks: {
      facebook: '',
      twitterX: '',
      linkedin: '',
    },
  }
}

const teamList = computed(() => ourTeamData.value?.our_team_data || [])

async function onSubmit() {

}

watch(ourTeamData, (value) => {
  console.log('««««« value »»»»»', value)
  if (value) {
    ourTeamForm.value = cloneDeep(value)
  }
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
  </VForm>

  <div class="d-flex flex-column gap-4">
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

        <!-- 👉 Review Main Description -->
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
  </div>
</template>

<style lang="scss" scoped>
.title-content {
  :deep(.ProseMirror) {
    min-block-size: 5vh;
  }
}
</style>
