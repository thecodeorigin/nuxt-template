<script setup lang="ts">
import ECommerceAddCategoryDrawer from '@/components/ecommerce/EcommerceAddCategoryDrawer.vue'
import type { Tables } from '@/server/types/supabase'

type Category = Tables<'categories'>
definePageMeta({
  sidebar: {
    title: 'Category',
    to: { name: 'category' },
    icon: { icon: 'ri-file-text-line' },
  },
})

const categories = ref<Category[]>([])

async function fetchCategories() {
  const { data: response } = await useApi<Category>('/categories')
  categories.value = response.value as any as Category[]
}

await fetchCategories()

const headers = [
  { title: 'Categories', key: 'categoryTitle' },
  { title: 'Total Products', key: 'totalProduct', align: 'center' },
  { title: 'Created at', key: 'createdAt', align: 'end' },
  { title: 'Action', key: 'actions', sortable: false },
]

const itemsPerPage = ref(10)
const searchQuery = ref('')
const isAddProductDrawerOpen = ref(false)
const page = ref(1)

// Update data table options
function updateOptions(options: any) {
  page.value = options.page
}

const categoryData = ref({
  id: '',
  name: '',
  description: '',
  slug: '',
})

function clearCategoryData() {
  categoryData.value = {
    id: '',
    name: '',
    description: '',
    slug: '',
  }
}

function handleSubmit() {
  if (categoryData.value.id) {
    handleUpdateCategory()
  }
  else {
    handleCreateCategory()
  }
}

async function handleCreateCategory() {
  try {
    const { data: newCategory } = await $fetch('/api/categories', {
      method: 'POST',
      body: {
        name: categoryData.value.name,
        description: categoryData.value.description,
        slug: categoryData.value.slug,
        image_url: '',
      },
    })
    categories.value.unshift(newCategory as Category)
    clearCategoryData()
    isAddProductDrawerOpen.value = false
  }
  catch (error) {
    console.error('error', error)
  }
}

async function handleUpdateCategory() {
  try {
    const { data: updatedCategory } = await $fetch(`/api/categories/${categoryData.value.id}`, {
      method: 'PATCH',
      body: {
        name: categoryData.value.name,
        description: categoryData.value.description,
        slug: categoryData.value.slug,
        image_url: '',
      },
    })
    const index = categories.value.findIndex(category => category.id === updatedCategory.id)
    categories.value[index] = updatedCategory
    clearCategoryData()
    isAddProductDrawerOpen.value = false
  }
  catch (error) {
    console.error('error', error)
  }
}

const confirmationDialogData = ref(
  {
    confirmationQuestion: 'Are you sure you want to delete this category?',
    isDialogVisible: false,
    categorySelectedId: 'null',
  },
)

function handleOpenDeleteDialog(id: string) {
  confirmationDialogData.value.categorySelectedId = id
  confirmationDialogData.value.isDialogVisible = true
}

async function handleDeleteCategory() {
  try {
    await $fetch(`/api/categories/${confirmationDialogData.value.categorySelectedId}`, {
      method: 'delete',
    })
    categories.value = categories.value.filter(category => category.id !== confirmationDialogData.value.categorySelectedId)
  }
  catch (error) {
    console.error('error', error)
  }
}

function handleSelectCategory(category: any) {
  categoryData.value = { ...category }
  isAddProductDrawerOpen.value = true
}

function handleOpenAddCategoryDrawer() {
  clearCategoryData()
  isAddProductDrawerOpen.value = true
}
</script>

<template>
  <div>
    <ConfirmDialog v-bind="confirmationDialogData" v-model:isDialogVisible="confirmationDialogData.isDialogVisible" @confirm="handleDeleteCategory" />
    <VCard>
      <VCardText>
        <div class="d-flex justify-md-space-between flex-wrap gap-4 justify-center">
          <VTextField
            v-model="searchQuery"
            placeholder="Search"
            density="compact"
            style="max-inline-size: 280px; min-inline-size: 200px;"
          />

          <div class="d-flex align-center flex-wrap gap-4">
            <VBtn
              prepend-icon="ri-add-line"
              @click="handleOpenAddCategoryDrawer"
            >
              Add Category
            </VBtn>
          </div>
        </div>
      </VCardText>

      <VDataTable
        v-if="categories"
        v-model:items-per-page="itemsPerPage"
        :headers="headers"
        :page="page"
        :items="categories"
        item-value="categoryTitle"
        :search="searchQuery"
        show-select
        class="text-no-wrap category-table"
        @update:options="updateOptions"
      >
        <template #item.actions="{ item }">
          <IconBtn size="small" @click="handleSelectCategory(item)">
            <VIcon icon="ri-edit-box-line" />
          </IconBtn>
          <IconBtn size="small" @click="handleOpenDeleteDialog(item.id)">
            <VIcon icon="ri-delete-bin-5-line" />
          </IconBtn>
        </template>

        <template #item.categoryTitle="{ item }">
          <div class="d-flex gap-x-3">
            <VAvatar
              variant="tonal"
              rounded
              size="38"
            >
              <img
                :src="item.image"
                :alt="item.categoryTitle"
                width="38"
                height="38"
              >
            </VAvatar>
            <div>
              <p class="text-high-emphasis font-weight-medium mb-0">
                {{ item.name }}
              </p>
              <div class="text-body-2">
                {{ item.description }}
              </div>
            </div>
          </div>
        </template>

        <template #item.createdAt="{ item }">
          <div class="text-end pe-4">
            {{ (item.created_at).toLocaleString().split("T")[0] }}
          </div>
        </template>

        <template #item.totalProduct="{ item }">
          <div class="text-center pe-4">
            <!-- FIXME - handle count number of product later -->
            {{ item.total_product || 0 }}
          </div>
        </template>

        <!-- Pagination -->
        <template #bottom>
          <VDivider />

          <div class="d-flex justify-end flex-wrap gap-x-6 px-2 py-1">
            <div class="d-flex align-center gap-x-2 text-medium-emphasis text-base">
              Rows Per Page:
              <VSelect
                v-model="itemsPerPage"
                class="per-page-select"
                variant="plain"
                :items="[10, 20, 25, 50, 100]"
              />
            </div>

            <p class="d-flex align-center text-base text-high-emphasis me-2 mb-0">
              {{ paginationMeta({ page, itemsPerPage }, categories.length) }}
            </p>

            <div class="d-flex gap-x-2 align-center me-2">
              <VBtn
                class="flip-in-rtl"
                icon="ri-arrow-left-s-line"
                variant="text"
                density="comfortable"
                color="high-emphasis"
                :disabled="page <= 1"
                @click="page <= 1 ? page = 1 : page--"
              />

              <VBtn
                class="flip-in-rtl"
                icon="ri-arrow-right-s-line"
                density="comfortable"
                variant="text"
                color="high-emphasis"
                :disabled="page >= Math.ceil(categories.length / itemsPerPage)"
                @click="page >= Math.ceil(categories.length / itemsPerPage) ? page = Math.ceil(categories.length / itemsPerPage) : page++ "
              />
            </div>
          </div>
        </template>
      </VDataTable>
    </VCard>

    <ECommerceAddCategoryDrawer v-model:drawerVisible="isAddProductDrawerOpen" v-model="categoryData" @submit="handleSubmit" />
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
