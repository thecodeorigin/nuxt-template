<script setup lang="ts">
import { VForm } from 'vuetify/components/VForm'
import type { InferSelectModel } from 'drizzle-orm'

import { AIModel, ProjectStatus } from '@/utils/types/project.js'
import type { categoryTable } from '@/server/db/schemas/category.schema.js'
import type { projectTable } from '@/server/db/schemas/project.schema.js'

import type { PostSenlyzerDownloadableResponse, PostSenlyzerResponse } from '@/utils/types/senlyzer.ts'

type Project = InferSelectModel<typeof projectTable>
type Category = InferSelectModel<typeof categoryTable>
interface FileData {
  files: File[]
  url: string
}
definePageMeta({
  sidebar: {
    order: 1,
    title: 'Create New',
    icon: { icon: 'ri-add-circle-line' },
  },
})
const router = useRouter()
const creating = ref(false)
const senlyzerStore = useSenlyzerStore()
const projectStore = useProjectStore()
const authStore = useAuthStore()
const refForm = ref<VForm | null>(null)
const languages = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Spanish' },
  { value: 'fr', label: 'French' },
  { value: 'de', label: 'German' },
  { value: 'it', label: 'Italian' },
  { value: 'pt', label: 'Portuguese' },
  { value: 'nl', label: 'Dutch' },
  { value: 'ru', label: 'Russian' },
  { value: 'tr', label: 'Turkish' },
  { value: 'ar', label: 'Arabic' },
  { value: 'zh', label: 'Chinese' },
  { value: 'ja', label: 'Japanese' },
  { value: 'ko', label: 'Korean' },
  { value: 'id', label: 'Indonesian' },
  { value: 'th', label: 'Thai' },
  { value: 'vi', label: 'Vietnamese' },
]
const listModel: { value: AIModel, label: string }[] = [
  { value: AIModel.FASTED, label: 'Tiny' },
  { value: AIModel.BALANCE, label: 'Medium' },
  { value: AIModel.MOST_ACCURATE, label: 'Large v3' },
]
const fileData = ref<FileData>({
  files: [],
  url: '',
})
const categoryStore = useCategoryStore()
const categoryQuery = ref({
  page: 1,
  limit: 1000,
  keyword: '',
  parent_id: null as string | null,
})
const { data: categories } = await useLazyAsyncData(() => categoryStore.fetchCategories(categoryQuery.value), {
  default: () => ({ data: [] as Category[], total: 0 }),
})
const formData = ref({
  title: 'New Subtitle Project',
  description: `New subtitle project on ${new Date().toLocaleDateString()}`,
  translate_from: 'en',
  translate_to: 'vi',
  model: AIModel.BALANCE,
  is_voice_recognition: false,
  source_downloadable: '',
  source_title: '',
  source_url: '',
  source_duration: 0,
  summarize: '',
  subtitle: [] as any[],
  structure: {
    resources: [] as any[],
  },
  category_id: categories.value.data[0]?.id || '',
  status: ProjectStatus.PROCESSING,
})
function resetForm() {
  formData.value = {
    title: 'New Subtitle Project',
    description: `New subtitle project on ${new Date().toLocaleDateString()}`,
    translate_from: 'en',
    translate_to: 'vi',
    model: AIModel.BALANCE,
    is_voice_recognition: false,
    source_downloadable: '',
    source_title: '',
    source_url: '',
    source_duration: 0,
    summarize: '',
    subtitle: [] as any[],
    structure: {
      resources: [] as any[],
    },
    category_id: categories.value.data[0]?.id || '',
    status: ProjectStatus.PROCESSING,
  }
  fileData.value = {
    files: [],
    url: '',
  }
}

function updateModelValue(val: AIModel) {
  formData.value.model = val
}

async function handleGetSubtitleFromFile(files: File[]) {
  const subtitleFile = files.find(file => isSubtitleFile(file))

  if (subtitleFile) {
    const result = await readSRTFile(subtitleFile)

    const subtitle = result.map((item, index) => ({
      ...item,
      id: item.id || index,
      selected: false,
    }))

    return subtitle
  }

  return []
}
async function handleUploadFile(files: File[]) {
  return await Promise.all(files.map(async (file) => {
    try {
      const signedGetUrl = await uploadToS3(file, file.name)

      return signedGetUrl
    }
    catch {
      // oh no image
      return 'https://cdn.dribbble.com/users/1274627/screenshots/3390285/media/2e05c7f2310efc8c5d972f7363ffa6af.jpg?resize=400x0'
    }
  }))
}
async function createProject() {
  const { valid } = await refForm.value!.validate()
  if (!valid)
    return

  creating.value = true
  let downloadableData: PostSenlyzerDownloadableResponse | null = null
  if (fileData.value.files.length) {
    const subtitle = await handleGetSubtitleFromFile(fileData.value.files)
    if (subtitle.length) {
      formData.value.subtitle = subtitle
    }
    else {
      formData.value.source_duration = await getFileDuration(fileData.value.files[0])

      if (formData.value.source_duration > (60 * 60)
      ) {
        console.log('Free subscription only allows files with 1 hour duration!')
        return
      }

      const resources = await handleUploadFile(fileData.value.files)
      formData.value.structure = {
        resources: resources.map(url => ({
          type: 'sourceUrl',
          value: url,
        })),
      }
    }
  }
  else if (fileData.value.url) {
    formData.value.source_url = fileData.value.url
    const { data } = await useLazyAsyncData(() => senlyzerStore.getDownloadable({ url: formData.value.source_url }), {
      default: () => {
        return { } as PostSenlyzerDownloadableResponse
      },
    })

    downloadableData = data.value

    if (downloadableData.duration > (60 * 60)
    ) {
      console.log('Free subscription only allows files with 1 hour duration!')
      return
    }

    formData.value.structure = {
      resources: [{
        type: 'sourceUrl',
        value: formData.value.source_url,
      }],
    }
  }

  const { data: newProject } = await useLazyAsyncData(() => projectStore.createProject({
    title: formData.value.title || '',
    description: formData.value.description || '',
    translate_from: formData.value.translate_from!,
    translate_to: formData.value.translate_to!,
    category_id: formData.value.category_id || '',
    model: formData.value.model || AIModel.BALANCE,
    is_voice_recognition: formData.value.is_voice_recognition || false,
    subtitle: formData.value.subtitle || [],
    structure: {
      resources: formData.value.structure?.resources || [],
    },
    source_downloadable: downloadableData?.videoUrl || downloadableData?.audioUrl || '',
    source_title: downloadableData?.title || '',
    source_thumbnail: downloadableData?.thumbnail || '',
    source_duration: formData.value.source_duration || downloadableData?.duration || 0,
    source_url: formData.value.source_url || '',
    summarize: formData.value.summarize || '',
    status: formData.value.subtitle?.length ? ProjectStatus.SUCCEEDED : ProjectStatus.PROCESSING,
  }), {
    default: () => {
      return { } as PostSenlyzerResponse
    },
  })
  if (!formData.value.subtitle?.length && formData.value.structure?.resources.length) {
    await useLazyAsyncData(() => senlyzerStore.uploadBatch({
      records: formData.value.structure.resources.filter(r => r.type === 'sourceUrl').map(r => ({
        link: r.value,
        language: formData.value.translate_from,
        diarization: formData.value.is_voice_recognition,
        xid: authStore.currentUser!.id,
      })),
      project: newProject.value as Project,
      model: formData.value.model,
    }), {
      default: () => {
        return { } as PostSenlyzerResponse
      },
    })
  }
  router.push({
    name: 'projects',
  })
}
</script>

<template>
  <div
    v-if="creating"
    class="d-flex justify-center pa-6"
  >
    <VProgressCircular
      :size="60"
      color="primary"
      indeterminate
    />
  </div>
  <VForm
    v-else
    ref="refForm"
    @submit.prevent="createProject"
  >
    <div class="d-flex flex-wrap justify-space-between gap-4 mb-6">
      <div class="d-flex flex-column justify-center">
        <h4 class="text-h4 mb-1">
          Add a new project
        </h4>
      </div>

      <div class="d-flex gap-4 align-center flex-wrap">
        <VBtn
          variant="outlined"
          color="secondary"
          @click="resetForm"
        >
          Reset
        </VBtn>
        <VBtn
          type="submit"
          :disabled="creating"
        >
          Create Project
        </VBtn>
      </div>
    </div>

    <VRow>
      <VCol md="8">
        <ProjectFileUploader v-model="fileData" />

        <VCard title="Project Information">
          <VCardText>
            <VRow>
              <VCol md="6" cols="12">
                <VTextField
                  v-model="formData.title"
                  label="Name"
                  :rules="[requiredValidator]"
                  placeholder="Project's Name"
                />
              </VCol>
              <VCol md="6" cols="12">
                <VSelect
                  v-model="formData.category_id"
                  :items="categories.data"
                  item-title="name"
                  item-value="id"
                  label="Category"
                  placeholder="Select Category"
                  :rules="[requiredValidator]"
                  eager
                />
              </VCol>
              <VCol cols="12">
                <VTextarea
                  v-model="formData.description"
                  label="Description"
                  placeholder="Project's Description"
                />
              </VCol>
            </VRow>
          </VCardText>
        </VCard>
      </VCol>

      <VCol
        md="4"
        cols="12"
      >
        <VCard title="AI Options" class="mb-6">
          <VCardText>
            <div class="d-flex flex-raw align-center justify-space-between mb-5">
              <span>Speaker Recognition</span>
              <VSwitch
                v-model="formData.is_voice_recognition"
                density="compact"
              />
            </div>
            <div class="d-flex flex-column gap-y-5">
              <VSelect
                v-model="formData.translate_from"
                :items="languages"
                item-title="label"
                item-value="value"
                label="Original Language"
                :menu-props="{ transition: 'scroll-y-transition' }"
                placeholder="Select Original Language"
              />
              <VSelect
                v-model="formData.translate_to"
                :items="languages"
                item-title="label"
                item-value="value"
                label="Language"
                :menu-props="{ transition: 'scroll-y-transition' }"
                placeholder="Select Language"
              />
              <VSelect
                :model-value="formData.model"
                placeholder="Select AI Model"
                label="AI Model"
                :items="listModel"
                item-title="label"
                item-value="value"
                @update:model-value="updateModelValue"
              />
            </div>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>
  </VForm>
</template>
