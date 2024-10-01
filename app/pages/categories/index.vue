<script setup lang="ts">
import type { InferSelectModel } from 'drizzle-orm'
import type { categoryTable } from '@/server/db/schemas/category.schema.js'

type Category = InferSelectModel<typeof categoryTable>

type FormData = Pick<Category, 'name' | 'slug' | 'description' | 'image_url' | 'parent_id'>

definePageMeta({
  sidebar: {
    order: 2,
    title: 'Categories',
    icon: { icon: 'ri-bookmark-line' },
  },
})

const { t } = useI18n()

const route = useRoute()

if (route.meta.sidebar)
  route.meta.sidebar.title = t('Categories')

const categoryStore = useCategoryStore()

const isCreatingCategory = ref(false)
const isEditingCategory = ref(false)

const categoryQuery = ref({
  page: 1,
  limit: 10,
  keyword: '',
  parent_id: null as string | null,
})
const categoryDebouncedQuery = useDebounce(categoryQuery, 500)

const selectingParentCategory = ref<Category>()
const { undo: backToPreviousParent, clear: clearParentHistory } = useRefHistory(selectingParentCategory)

const selectingCategory = ref<Category>()

const categoryHeaders = computed(() => [
  {
    title: selectingParentCategory.value
      ? `${selectingParentCategory.value.name}'s sub-categories`
      : t('Name'),
    key: 'name',
  },
  {
    title: '',
    key: 'actions',
    align: 'end' as const,
    sortable: false,
  },
])

const { data: categoryData, refresh: refreshCategories, error: categoriesError, status } = await useLazyAsyncData(() => categoryStore.fetchCategories(categoryQuery.value), {
  default: () => ({ data: [] as Category[], total: 0 }),
})

watchDebounced(categoriesError, (error) => {
  if (error)
    notify(getNuxtError(error).message, { type: 'error' })
}, { immediate: true, debounce: 300 })

watch(categoryQuery, () => {
  refreshCategories()
}, { deep: true })

watch(selectingParentCategory, () => {
  categoryQuery.value.parent_id = selectingParentCategory.value?.id ?? null
}, { deep: true })

watch(() => categoryQuery.value.keyword, () => {
  selectingParentCategory.value = undefined

  clearParentHistory()
})

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
    const canDelete = await confirmation(t('Are you sure you want to delete this category?'))

    if (canDelete) {
      await categoryStore.deleteCategory(item.id)

      await refreshCategories()
    }
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

function handleSelectParentCategory(e: Event, context: any) {
  selectingParentCategory.value = context.item
}
</script>

<template>
  <div>
    <VCard>
      <VCardText>
        <div class="d-flex justify-md-space-between flex-wrap gap-4 justify-center">
          <div class="d-flex align-center flex-wrap gap-4">
            <VBtn v-if="selectingParentCategory" variant="outlined" color="secondary" @click="backToPreviousParent">
              <VIcon size="28" icon="ri-arrow-drop-left-line" />
              {{ $t('Go Back') }}
            </VBtn>

            <VTextField
              v-model="categoryDebouncedQuery.keyword"
              :placeholder="$t('Search')"
              density="compact"
              style="max-inline-size: 280px; min-inline-size: 200px;"
            />
          </div>

          <div class="d-flex align-center flex-wrap gap-4">
            <VBtn
              prepend-icon="ri-add-line"
              @click="isCreatingCategory = true"
            >
              {{
                selectingParentCategory
                  ? $t('Add {parentName}\'s sub-categories', { parentName: selectingParentCategory.name })
                  : $t('Add Parent Category')
              }}
            </VBtn>
          </div>
        </div>
      </VCardText>

      <VDataTable
        v-if="categoryData"
        v-model:items-per-page="categoryQuery.limit"
        v-model:page="categoryQuery.page"
        :loading="status === 'pending'"
        :headers="categoryHeaders"
        :items="categoryData.data"
        :search="categoryQuery.keyword"
        show-select
        item-value="name"
        class="text-no-wrap category-table"
        @click:row="handleSelectParentCategory"
      >
        <template #item.actions="{ item }">
          <IconBtn size="small">
            <VIcon icon="ri-more-2-fill" />

            <VMenu activator="parent">
              <VList>
                <VListItem
                  value="duplicate"
                  prepend-icon="ri-stack-line"
                  @click="handleSelectCategory(item)"
                >
                  {{ $t('Edit') }}
                </VListItem>

                <VListItem
                  value="delete"
                  prepend-icon="ri-delete-bin-line"
                  @click="handleDeleteCategory(item)"
                >
                  {{ $t('Delete') }}
                </VListItem>
              </VList>
            </VMenu>
          </IconBtn>
        </template>

        <template #item.name="{ item }">
          <div class="d-flex gap-x-3">
            <VImg
              v-if="item.image_url"
              :src="item.image_url"
              :alt="item.name || ''"
              width="40"
              height="40"
              max-width="40"
              max-height="40"
              rounded
              cover
            />
            <div>
              <p class="text-high-emphasis font-weight-medium mb-0">
                {{ item.name }}
              </p>
              <div class="text-body-2">
                {{ item.description || '-' }}
              </div>
            </div>
          </div>
        </template>
      </VDataTable>
    </VCard>

    <CategoryCreateDrawer
      v-model="isCreatingCategory"
      :parent="selectingParentCategory"
      :data="categoryData.data"
      @submit="handleSubmitNewCategory"
    />

    <CategoryEditDrawer
      v-model="isEditingCategory"
      v-model:form-data="selectingCategory"
      :parent="selectingParentCategory"
      :data="categoryData.data"
      @submit="handleUpdateCategory"
    />
  </div>
</template>
