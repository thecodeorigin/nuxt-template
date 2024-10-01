<script lang="ts" setup>
import type { InferSelectModel } from 'drizzle-orm'
import type { projectTable } from '@/server/db/schemas/project.schema.js'
import type { categoryTable } from '@/server/db/schemas/category.schema.js'

type Project = InferSelectModel<typeof projectTable>
type Category = InferSelectModel<typeof categoryTable>

interface ResponseProject {
  data: Project[]
  total: number
}

definePageMeta({
  sidebar: {
    order: 0,
    title: 'List',
    icon: { icon: 'ri-stack-line' },
  },
})

const { t } = useI18n()

const route = useRoute()

if (route.meta.sidebar)
  route.meta.sidebar.title = t('List')

const categoryStore = useCategoryStore()
const projectStore = useProjectStore()
const router = useRouter()
const itemsSelected = ref<string[]>([])
const searchValue = ref('')
const projectQuery = ref({
  page: 1,
  limit: 8,
  keyword: '',
  category: '',
  withCount: true,
  sortAsc: false,
  sortBy: 'created_at',
})
const categoryQuery = ref({
  page: 1,
  limit: 1000,
  keyword: '',
  parent_id: null as string | null,
  sortAsc: false,
  sortBy: 'created_at',
})
const isLoading = ref(false)
const { data: response, refresh: refreshProjects } = await useLazyAsyncData(() => projectStore.fetchProjects(projectQuery.value), {
  default: () => {
    return { data: [], total: 0 } as ResponseProject
  },
})
const { data: categories } = await useLazyAsyncData(() => categoryStore.fetchCategories(categoryQuery.value), {
  default: () => ({ data: [] as Category[], total: 0 }),

})
const listCategorires = computed(() => {
  return [{ id: '', name: 'All categories' }, ...categories.value.data]
})

watch(
  () => ({
    limit: projectQuery.value.limit,
    keyword: projectQuery.value.keyword,
    category: projectQuery.value.category,
  }),
  async () => {
    projectQuery.value.page = 1
    itemsSelected.value = []
    isLoading.value = true
    await refreshProjects()
    isLoading.value = false
  },
)
watch(
  () => projectQuery.value.page,
  async () => {
    itemsSelected.value = []
    isLoading.value = true
    await refreshProjects()
    isLoading.value = false
  },
  { deep: true },
)
watchDebounced(
  searchValue,
  () => {
    projectQuery.value.keyword = searchValue.value
  },
  { debounce: 500 },
)

async function handleDeleteProject() {
  try {
    const canDelete = await confirmation(`Are you sure you want to delete ${itemsSelected.value.length > 1 ? 'these projects' : 'this project'}?`)

    if (canDelete) {
      await projectStore.deleteProject(itemsSelected.value)

      itemsSelected.value = []
      await refreshProjects()
    }
  }
  catch (error) {
    console.error('error', error)
  }
}

function handleSelectProject(item: string) {
  if (itemsSelected.value.includes(item)) {
    itemsSelected.value.splice(
      itemsSelected.value.indexOf(item),
      1,
    )
  }
  else {
    itemsSelected.value.push(item)
  }
}
function handleGoToProject(project: Project) {
  if (project.status === 'succeeded') {
    router.push({
      name: 'projects-id',
      params: { id: project.id },
    })
  }
}

onMounted(() => setInterval(refreshProjects, 5000))

function handleCreateProject() {
  navigateTo('/projects/create')
}
let intervalId: any
onMounted(() => {
  intervalId = setInterval(refreshProjects, 5000)
})
onUnmounted(() => clearInterval(intervalId))
</script>

<template>
  <div>
    <div class="d-flex flex-wrap gap-4">
      <div class="d-flex align-center">
        <!-- 👉 Search  -->
        <VTextField
          v-model="searchValue"
          data-test="container-input-search-projects"
          placeholder="Project Title"
          style="inline-size: 200px;"
          clearable
          label="Search"
          class="me-3"
        />
        <VSelect
          v-model="projectQuery.category"
          data-test="container-select-category-projects"
          :items="listCategorires"
          item-title="name"
          item-value="id"
          label="Choose category"
          placeholder="Category"
          eager
        />
      </div>

      <VSpacer />

      <div class="d-flex gap-x-4 align-center">
        <VBtn v-if="itemsSelected.length > 0" color="error" @click="handleDeleteProject">
          Delete
        </VBtn>
        <VBtn
          color="primary"
          data-test="button-create-project"
          prepend-icon="ri-add-line"
          @click="handleCreateProject"
        >
          Create new project
        </VBtn>
      </div>
    </div>
    <div
      v-if="isLoading"
      class="d-flex justify-center pa-6"
    >
      <VProgressCircular
        :size="60"
        color="primary"
        indeterminate
      />
    </div>
    <div v-else-if="response.data.length > 0" class="gap-3 mt-5 intro-y sm:gap-6">
      <VRow data-test="grid-list-projects" class="match-height">
        <ProjectItem
          v-for="project in response.data"
          :key="project.id"
          :item="project"
          :category="categories.data.find((category) => category.id === project.category_id) as Category"
          @select="handleSelectProject"
          @click="handleGoToProject(project)"
        />
      </VRow>
      <VPagination
        v-model="projectQuery.page"
        class="mt-5"
        :length="Math.ceil(response.total / projectQuery.limit)"
      />
    </div>
    <div v-else class="flex justify-center mt-5">
      <div class="flex flex-col items-center gap-2 py-3">
        <!-- <Lucide icon="CloudOffIcon" class="inline-block w-8 h-8" /> -->
        <h4 data-v-2ed4a8d0="" class="text-h4 text-center mb-6">
          Empty Data
        </h4>
      </div>
    </div>
  </div>
</template>

<style module>
.courseTitle {
  &:not(:hover) {
    color: rgba(var(--v-theme-on-surface), var(--v-text-high-emphasis));
  }
}

.projectContainer {
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
}
</style>
