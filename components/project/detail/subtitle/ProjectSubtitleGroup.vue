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
</script>

<template>
  <div class="course-content">
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
