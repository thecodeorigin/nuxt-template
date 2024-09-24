<script setup lang="ts">
import { VideoPlayer } from '@videojs-player/vue'
import type { InferSelectModel } from 'drizzle-orm'
import ProjectInfor from '@/components/project/detail/ProjectInfor.vue'
import ProjectSubtitleGroup from '@/components/project/detail/subtitle/ProjectSubtitleGroup.vue'
import 'video.js/dist/video-js.css'
import type { Subtitle } from '@/utils/types/project'
import type { projectTable } from '@/server/db/schemas/project.schema.js'

type Project = InferSelectModel<typeof projectTable>

const project = ref<Project | null>(null)
const projectSubtitle = ref<Subtitle[]>([])

const projectStore = useProjectStore()
const route = useRoute()

async function fetchProject() {
  try {
    const data = await projectStore.fetchProject(route.params.id as string)
    project.value = data
    projectSubtitle.value = data.subtitle as Subtitle[] || []
  }
  catch (error) {
    console.error('error', error)
  }
}

await fetchProject()

const formSubtitle = computed<Subtitle[]>(() => project.value?.subtitle as Subtitle[])

const playerInstance = ref<any>(null)

function handleVideoSeek(time: number) {
  if (playerInstance.value) {
    playerInstance.value.currentTime(time)
  }
}

function onPlayerMounted({ player }: any) {
  playerInstance.value = player
}

interface DownloadOption {
  title: string
  type: 'pdf' | 'docx' | 'srt'
}

const downloadOptions: DownloadOption[] = [
  { title: 'Download PDF', type: 'pdf' },
  { title: 'Download DOCX', type: 'docx' },
  { title: 'Download SRT', type: 'srt' },
]

async function handleExport(type: typeof downloadOptions[0]['type']) {
  if (!project.value?.title)
    return

  try {
    if (type === 'srt')
      downloadSRT(formSubtitle.value, project.value.title)
    else if (type === 'pdf')
      downloadPdf(formSubtitle.value, project.value.title)
    else if (type === 'docx')
      downloadDocx(formSubtitle.value, project.value.title)
  }
  catch {
    console.error('error')
  }
}
</script>

<template>
  <div class="container-wrapper">
    <VRow v-if="project?.id">
      <VCol
        cols="12"
        md="8"
      >
        <VCard>
          <VCardItem
            :title="project.title"
            class="pb-6"
          >
            <template #append>
              <div class="d-flex gap-4 align-center">
                <VChip
                  v-if="project.is_voice_recognition"
                  variant="tonal"
                  color="error"
                  size="small"
                >
                  Voice recognition
                </VChip>

                <VMenu>
                  <template #activator="{ props }">
                    <VIcon
                      size="24"
                      v-bind="props"
                      class="cursor-pointer"
                      icon="ri-download-cloud-2-line"
                    />
                  </template>
                  <VList>
                    <VListItem
                      v-for="(item, index) in downloadOptions"
                      :key="index"
                      :value="index"
                      @click="handleExport(item.type)"
                    >
                      <VListItemTitle>{{ item.title }}</VListItemTitle>
                    </VListItem>
                  </VList>
                </VMenu>
              </div>
            </template>
          </VCardItem>
          <VCardText>
            <VCard
              flat
              border
            >
              <div class="px-2 pt-2">
                <VideoPlayer
                  :src="project.source_url || ''"
                  controls
                  plays-inline
                  :height="$vuetify.display.mdAndUp ? 440 : 250"
                  class="w-100 rounded video-player"
                  :poster="project.source_thumbnail || ''"
                  @mounted="onPlayerMounted"
                />
              </div>
              <ProjectInfor v-model="project" />
            </VCard>
          </VCardText>
        </VCard>
      </VCol>

      <VCol
        cols="12"
        md="4"
      >
        <ProjectSubtitleGroup v-model="projectSubtitle" :project="project" @video:seek="handleVideoSeek" />
      </VCol>
    </VRow>
  </div>
</template>

<style lang="scss" scoped>
.card-list {
  --v-card-list-gap: 8px;
}

.video-player {
  inline-size: 100%;
}

.course-content {
  position: sticky;
  inset-block: 4rem 0;

  .card-list {
    --v-card-list-gap: 1rem;
  }
}
</style>

<style lang="scss">
.course-content {
  .v-expansion-panels {
    border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
    border-radius: 10px;

    .v-expansion-panel {
      &--active {
        .v-expansion-panel-title--active {
          border-block-end: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));

          .v-expansion-panel-title__overlay {
            opacity: var(--v-hover-opacity) !important;
          }
        }
      }

      .v-expansion-panel-title {
        .v-expansion-panel-title__overlay {
          background-color: rgba(var(--v-theme-on-surface));
          opacity: var(--v-hover-opacity);
        }

        &:hover {
          .v-expansion-panel-title__overlay {
            opacity: var(--v-hover-opacity) !important;
          }
        }

        &__icon {
          .v-icon {
            block-size: 1.5rem;
            color: rgba(var(--v-theme-on-surface), var(--v-medium-emphasis-opacity));
            font-size: 1.5rem;
            inline-size: 1.5rem;
          }
        }
      }

      .v-expansion-panel-text {
        &__wrapper {
          padding-block: 1rem;
          padding-inline: 0.75rem;
        }
      }
    }
  }
}
</style>

<style>
.video-js {
  inline-size: 100%;
}
</style>
