<script setup lang="ts">
import ProjectSubtitleItem from './ProjectSubtitleItem.vue'
import type { Subtitle } from '@/utils/types/project'
import type { Tables } from '@/server/types/supabase'

type Project = Tables<'projects'>

const prop = defineProps<{
  project: Project
}>()

defineEmits<{
  (e: 'video:seek', time: number): void
}>()
const subtitles = defineModel<Subtitle[]>({ required: true })

const panelStatus = ref(0)
const projectStore = useProjectStore()

async function handleDeleteSubtitles() {
  try {
    const canDelete = await confirmation('Are you sure you want to delete this subtitles?')

    if (canDelete) {
      await projectStore.updateProject(prop.project.id, {
        subtitle: subtitles.value.filter(subtitle => !subtitle.selected),
      })
      subtitles.value = subtitles.value.filter(subtitle => !subtitle.selected)
    }
  }
  catch (error) {
    console.error(error)
  }
}

async function handleDeleteSubtitle(index: number) {
  const subtitlesToDel = subtitles.value.filter((_, i: number) => i !== index)
  try {
    await projectStore.updateProject(prop.project.id, {
      subtitle: subtitlesToDel,
    })
    subtitles.value.splice(index, 1)
  }
  catch (error) {
    console.error(error)
  }
}

async function handleSaveSubtitle(index: number, value: string) {
  const textHolder = subtitles.value[index].text
  try {
    subtitles.value[index].text = value
    await projectStore.updateProject(prop.project.id, {
      subtitle: subtitles.value,
    })
  }
  catch (error) {
    subtitles.value[index].text = textHolder
    console.error(error)
  }
}

const subtitleSelected = computed(() => subtitles.value.filter(subtitle => subtitle.selected))

function handleDeselectAll() {
  subtitles.value.forEach(subtitle => subtitle.selected = false)
}
</script>

<template>
  <div class="course-content">
    <div v-if="subtitleSelected.length > 0" class="d-flex justify-end mb-3">
      <VBtn
        color="error"
        @click="handleDeleteSubtitles"
      >
        Delete
      </VBtn>

      <VBtn
        color="primary"
        class="ml-2"
        @click="handleDeselectAll"
      >
        Cancel
      </VBtn>
    </div>
    <VExpansionPanels
      v-model="panelStatus"
      variant="accordion"
    >
      <VExpansionPanel
        elevation="0"
        collapse-icon="ri-arrow-down-s-line"
        :expand-icon="$vuetify.locale.isRtl ? 'ri-arrow-left-s-line' : 'ri-arrow-right-s-line'"
      >
        <template #title>
          <div>
            <h5 class="text-h5">
              Transcriptions
            </h5>
          </div>
        </template>

        <template #text>
          <VList class="card-list">
            <ProjectSubtitleItem
              v-for="(_, index) in subtitles"
              :key="index"
              v-model="subtitles[index]"
              :index="index"
              @video:seek="(time: number) => $emit('video:seek', time)"
              @delete-subtitle="handleDeleteSubtitle"
              @save-subtitle="handleSaveSubtitle"
            />
          </VList>
        </template>
      </VExpansionPanel>
    </VExpansionPanels>
  </div>
</template>
