<script setup lang="ts">
import { PerfectScrollbar } from 'vue3-perfect-scrollbar'
import { VForm } from 'vuetify/components/VForm'
import type { InferSelectModel } from 'drizzle-orm'
import type { projectTable } from '@/server/db/schemas/project.schema.js'
import type { categoryTable } from '@/server/db/schemas/category.schema.js'

type ProjectInterface = InferSelectModel<typeof projectTable>
type Category = InferSelectModel<typeof categoryTable>
interface Project extends ProjectInterface {
  category: Partial<Category>
}

interface Props {
  drawerVisible: boolean
  modelValue: any
  categories: Category[]
}

interface Emit {
  (e: 'update:drawerVisible', value: boolean): void
  (e: 'update:modelValue', value: any): void
  (e: 'submit'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emit>()

function handleDrawerModelValueUpdate(val: boolean) {
  emit('update:drawerVisible', val)
}

const vFormRef = ref<VForm>()

const projectData = ref<Partial<Project>>({
  id: '',
  category_id: null,
  description: null,
  title: null,
  user_id: null,
  category: {
    name: '',
    id: '',
    description: null,
    image_url: null,
    slug: '',
    updated_at: null,
    user_id: null,
  },
})

function resetForm() {
  emit('update:drawerVisible', false)
  vFormRef.value?.reset()
}

watch(() => projectData.value, (val) => {
  projectData.value.category = props.categories.find(item => item.id === val.category_id) || {
    name: '',
    id: '',
    description: null,
    image_url: null,
    slug: '',
    updated_at: null,
    user_id: null,
  }
  emit('update:modelValue', val)
})

watch(() => props.drawerVisible, (val) => {
  if (val) {
    if (props.modelValue) {
      projectData.value = props.modelValue
    }
  }
})
async function onSubmitted() {
  const { valid } = await vFormRef.value!.validate()
  if (valid) {
    emit('submit')
  }
}
</script>

<template>
  <VNavigationDrawer
    :model-value="props.drawerVisible"
    temporary
    location="end"
    width="370"
    class="category-navigation-drawer scrollable-content"
    border="none"
    @update:model-value="handleDrawerModelValueUpdate"
  >
    <!-- 👉 Header -->
    <AppDrawerHeaderSection
      :title="props.modelValue.id ? 'Edit Project' : 'Add Project'"
      @cancel="$emit('update:drawerVisible', false)"
    />

    <VDivider />

    <PerfectScrollbar :options="{ wheelPropagation: false }">
      <VCard flat>
        <VCardText>
          <VForm
            v-if="props.drawerVisible"
            ref="vFormRef"
            @submit.prevent="onSubmitted"
          >
            <VRow>
              <VCol cols="12">
                <VTextField
                  v-model="projectData.title"
                  label="Title"
                  :rules="[requiredValidator]"
                  placeholder="Title"
                />
              </VCol>

              <VCol cols="12">
                <VTextField
                  v-model="projectData.description"
                  label="Description"
                  :rules="[requiredValidator]"
                  placeholder="Description"
                />
              </VCol>

              <VCol cols="12">
                <VSelect
                  v-model="projectData.category_id"
                  :items="props.categories || []"
                  label="Category"
                  item-title="name"
                  item-value="id"
                  placeholder="Select Category"
                  :rules="[requiredValidator]"
                />
              </VCol>

              <VCol cols="12">
                <div class="d-flex justify-start">
                  <VBtn
                    type="submit"
                    color="primary"
                    class="me-4"
                  >
                    {{ props.modelValue.id ? 'Update' : 'Add' }}
                  </VBtn>
                  <VBtn
                    color="error"
                    variant="outlined"
                    @click="resetForm"
                  >
                    Discard
                  </VBtn>
                </div>
              </VCol>
            </VRow>
          </VForm>
        </VCardText>
      </VCard>
    </PerfectScrollbar>
  </VNavigationDrawer>
</template>

<style lang="scss">
.category-navigation-drawer {
  .ProseMirror {
    padding: 0.5rem;
    block-size: auto;
    min-block-size: 6.25rem;

    p {
      margin-block-end: 0;
    }

    p.is-editor-empty:first-child::before {
      block-size: 0;
      color: #adb5bd;
      content: attr(data-placeholder);
      float: inline-start;
      pointer-events: none;
    }
  }

  .is-active {
    border-color: rgba(var(--v-theme-primary), var(--v-border-opacity)) !important;
    background-color: rgba(var(--v-theme-primary), var(--v-activated-opacity));
    color: rgb(var(--v-theme-primary));
  }

  .ProseMirror-focused {
    outline: none !important;
  }

  .tiptap-editor-wrapper {
    border: 1px solid rgba(var(--v-border-color), 0.22);

    &:hover {
      border-color: rgba(var(--v-border-color), 0.6);
    }
  }
}
</style>
