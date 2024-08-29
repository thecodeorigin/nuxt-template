<script setup lang="ts">
import type { Tables } from '@/server/types/supabase'

type Category = Tables<'categories'>

type FormData = Pick<Category, 'name' | 'slug' | 'description' | 'image_url'>

definePageMeta({
  sidebar: {
    order: 2,
    title: 'Categories',
    icon: { icon: 'ri-bookmark-line' },
  },
})

const categoryStore = useCategoryStore()

const headers = [
  { title: 'Categories', key: 'categoryTitle' },
  { title: 'Total Products', key: 'totalProduct', align: 'center' },
  { title: 'Created at', key: 'createdAt', align: 'end' },
  { title: 'Action', key: 'actions', sortable: false },
]

const isCreatingCategory = ref(false)
const isEditingCategory = ref(false)

const categoryQuery = ref({
  page: 1,
  limit: 10,
  keyword: '',
})

const selectingCategory = ref<Category>()

const { data: categories, refresh: refreshCategories, error: categoriesError } = await useLazyAsyncData(() => categoryStore.fetchCategories(categoryQuery.value), {
  default: () => [] as Category[],
})

watchDebounced(categoriesError, (error) => {
  if (error)
    notify(getNuxtError(error).message, { type: 'error' })
}, { immediate: true, debounce: 500 })

watchDebounced(categoryQuery, () => {
  refreshCategories()
}, { deep: true, debounce: 500 })

async function handleSubmitNewCategory(payload: FormData) {
  try {
    await categoryStore.createCategory(payload)

    await refreshCategories()

    isCreatingCategory.value = false
  }
  catch (error) {
    console.error('error', error)
  }
}

async function handleUpdateCategory(payload: FormData) {
  try {
    if (!selectingCategory.value)
      return

    await categoryStore.updateCategory(selectingCategory.value.id, payload)

    await refreshCategories()

    isEditingCategory.value = false
  }
  catch (error) {
    console.error('error', error)
  }
}

async function handleDeleteCategory(item: Category) {
  try {
    if (!selectingCategory.value)
      return

    await categoryStore.deleteCategory(item.id)

    await refreshCategories()
  }
  catch (error) {
    console.error('error', error)
  }
}

async function handleSelectCategory(item: Category) {
  selectingCategory.value = item

  await nextTick()

  isEditingCategory.value = true
}
</script>

<template>
  <div>
    <VCard>
      <VCardText>
        <div class="d-flex justify-md-space-between flex-wrap gap-4 justify-center">
          <VTextField
            v-model="categoryQuery.keyword"
            placeholder="Search"
            density="compact"
            style="max-inline-size: 280px; min-inline-size: 200px;"
          />

          <div class="d-flex align-center flex-wrap gap-4">
            <VBtn
              prepend-icon="ri-add-line"
              @click="isCreatingCategory = true"
            >
              Add Category
            </VBtn>
          </div>
        </div>
      </VCardText>

      <VDataTable
        v-if="categories"
        v-model:items-per-page="categoryQuery.limit"
        v-model:page="categoryQuery.page"
        :headers="headers"
        :items="categories"
        :search="categoryQuery.keyword"
        show-select
        item-value="categoryTitle"
        class="text-no-wrap category-table"
      >
        <template #item.actions="{ item }">
          <IconBtn size="small" @click="handleSelectCategory(item)">
            <VIcon icon="ri-edit-box-line" />
          </IconBtn>
          <IconBtn size="small" @click="handleDeleteCategory(item)">
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
      </VDataTable>
    </VCard>

    <CategoryCreateDrawer v-model="isCreatingCategory" @submit="handleSubmitNewCategory" />
    <CategoryEditDrawer v-model="isEditingCategory" v-model:form-data="selectingCategory" @submit="handleUpdateCategory" />
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
