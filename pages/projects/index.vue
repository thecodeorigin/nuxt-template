<script lang="ts" setup>
import { debouncedWatch } from '@vueuse/core'
import AddProjectDrawer from '@/components/project/AddProjectDrawer.vue'
import type { Tables } from '@/server/types/supabase'

type Category = Tables<'categories'>
interface Project extends Tables<'projects'> {
  category: Category
}

definePageMeta({
  sidebar: {
    title: 'Projects',
    icon: { icon: 'ri-projector-fill' },
  },
})

const projectQuery = ref({
  page: 1,
  limit: 10,
  keyword: '',
})

const drawerVisible = ref(false)

const projectData = ref<Project>({
  id: '',
  category_id: null,
  created_at: '',
  description: null,
  title: null,
  user_id: null,
  category: {
    name: '',
    id: '',
    created_at: '',
    description: null,
    image_url: null,
    slug: '',
    updated_at: null,
    user_id: null,
  },
})
const headers = [
  { title: 'Title', key: 'projectTitle' },
  { title: 'Description', key: 'description', align: 'center' },
  { title: 'Category', key: 'category', align: 'center' },
  { title: 'Created at', key: 'createdAt', align: 'end' },
  { title: 'Action', key: 'actions', sortable: false },
]

const { data: projects, refresh: refreshProjects } = useLazyApi<Project[]>('/projects', {
  params: projectQuery.value,
  default() {
    return []
  },
})

// const { data: categories } = useLazyApi<Category[]>('/categories', {
//   default() {
//     return []
//   },
// })

// function clearProjectData() {
//   projectData.value = {
//     id: '',
//     category_id: null,
//     created_at: '',
//     description: null,
//     title: null,
//     user_id: null,
//     category: {
//       name: '',
//       id: '',
//       created_at: '',
//       description: null,
//       image_url: null,
//       slug: '',
//       updated_at: null,
//       user_id: null,
//     },
//   }
// }

debouncedWatch(
  projectQuery,
  () => refreshProjects(),
  { deep: true, debounce: 500 },
)

// function handleSubmit() {
//   if (projectData.value.id) {
//     handleUpdateProject()
//   }
//   else {
//     handleCreateProjectt()
//   }
// }

// async function handleCreateProjectt() {
//   try {
//     const { data: newProject } = await $api<{ data: Project }>('/projects', {
//       method: 'POST',
//       body: projectData.value,
//     })
//     projects.value.push(newProject)
//     clearProjectData()
//     drawerVisible.value = false
//   }
//   catch (error) {
//     console.error(error)
//   }
// }

// async function handleUpdateProject() {
//   try {
//     const { data: updatedProject } = await $api<{ data: Project }>(`/projects/${projectData.value.id}`, {
//       method: 'PATCH',
//       body: {
//         title: projectData.value.title,
//         description: projectData.value.description,
//         category_id: projectData.value.category_id,
//       },
//     })
//     const index = projects.value.findIndex(project => project.id === updatedProject.id)
//     projects.value[index] = updatedProject
//     clearProjectData()
//     drawerVisible.value = false
//   }
//   catch (error) {
//     console.error(error)
//   }
// }

const confirmationDialogData = ref(
  {
    confirmationQuestion: 'Are you sure you want to delete this project?',
    isDialogVisible: false,
    projectSelectedId: 'null',
  },
)

function handleOpenDeleteDialog(id: string) {
  confirmationDialogData.value.projectSelectedId = id
  confirmationDialogData.value.isDialogVisible = true
}

async function handleDeleteProject(value: boolean) {
  try {
    if (!value)
      return
    const id = confirmationDialogData.value.projectSelectedId
    await $api<Project>(`/projects/${id}`, {
      method: 'DELETE',
    })
    const index = projects.value.findIndex(project => project.id === id)
    projects.value.splice(index, 1)
  }
  catch (error) {
    console.error(error)
  }
}

function handleSelectProject(project: Project) {
  projectData.value = { ...project }
  drawerVisible.value = true
}

// function handleOpenAddProjectDrawer() {
//   clearProjectData()
//   drawerVisible.value = true
// }
</script>

<template>
  <div>
    <ConfirmDialog v-bind="confirmationDialogData" v-model:isDialogVisible="confirmationDialogData.isDialogVisible" @confirm="handleDeleteProject" />
    <VCard>
      <VCardText>
        <div class="d-flex justify-md-space-between flex-wrap gap-4 justify-center">
          <VTextField
            v-model="projectQuery.keyword"
            placeholder="Search"
            density="compact"
            style="max-inline-size: 280px; min-inline-size: 200px;"
          />

          <div class="d-flex align-center flex-wrap gap-4">
            <VBtn
              prepend-icon="ri-add-line"
              :to="{ name: 'projects-create' }"
            >
              Add Project
            </VBtn>
          </div>
        </div>
      </VCardText>

      <VDataTable
        v-model:items-per-page="projectQuery.limit"
        v-model:page="projectQuery.page"
        :headers="headers"
        :items="projects"
        item-value="projectTitle"
        show-select
        class="text-no-wrap category-table"
      >
        <template #item.actions="{ item }">
          <IconBtn size="small" @click="handleSelectProject(item)">
            <VIcon icon="ri-edit-box-line" />
          </IconBtn>
          <IconBtn size="small" @click="handleOpenDeleteDialog(item.id)">
            <VIcon icon="ri-delete-bin-5-line" />
          </IconBtn>
        </template>

        <template #item.projectTitle="{ item }">
          <div class="d-flex gap-x-3">
            <p class="text-high-emphasis font-weight-medium mb-0">
              {{ item.name }}
            </p>
            <div class="text-body-2">
              {{ item.title }}
            </div>
          </div>
        </template>

        <template #item.createdAt="{ item }">
          <div class="text-end pe-4">
            {{ (item.created_at).toLocaleString().split("T")[0] }}
          </div>
        </template>

        <template #item.description="{ item }">
          <div class="text-center pe-4">
            {{ item.description || 0 }}
          </div>
        </template>
        <template #item.category="{ item }">
          <div class="text-center pe-4">
            {{ item.category.name || 0 }}
          </div>
        </template>

        <template #bottom>
          <AppPagination
            v-model:page="projectQuery.page"
            v-model:limit="projectQuery.limit"
            :total="projects.length"
          />
        </template>
      </VDataTable>
    </VCard>

    <!-- <AddProjectDrawer v-model:drawerVisible="drawerVisible" v-model="projectData" :categories="categories" @submit="handleSubmit" /> -->
  </div>
</template>

<style lang="scss">
.ProseMirror-focused {
  border: none;
}

.category-table.v-table.v-data-table {
  .v-table__wrapper {
    table {
      thead {
        tr {
          th.v-data-table-column--align-end {
            .v-data-table-header__content {
              flex-direction: row;
              justify-content: end;
            }
          }
        }
      }
    }
  }
}
</style>
