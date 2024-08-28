<script setup lang="ts">
import { Image } from '@tiptap/extension-image'
import { Link } from '@tiptap/extension-link'
import { Placeholder } from '@tiptap/extension-placeholder'
import { Underline } from '@tiptap/extension-underline'
import { StarterKit } from '@tiptap/starter-kit'
import { EditorContent, useEditor } from '@tiptap/vue-3'
import { PerfectScrollbar } from 'vue3-perfect-scrollbar'

import { VForm } from 'vuetify/components/VForm'

interface Props {
  drawerVisible: boolean
  modelValue: any
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

const editor = useEditor({
  content: '',
  extensions: [
    StarterKit,
    Image,
    Placeholder.configure({
      placeholder: 'Write a Comment...',
    }),
    Underline,
    Link.configure(
      {
        openOnClick: false,
      },
    ),
  ],
})

const vFormRef = ref<VForm>()

const categoryData = ref({
  name: '',
  slug: '',
  description: '',
  img: '',
})

function resetForm() {
  emit('update:drawerVisible', false)
  vFormRef.value?.reset()
  editor.value?.commands.clearContent()
}

watch(() => categoryData.value, (val) => {
  emit('update:modelValue', val)
}, {
  deep: true,
  immediate: true,
})

watch(() => props.drawerVisible, (val) => {
  if (val) {
    if (props.modelValue) {
      categoryData.value = props.modelValue
    }
  }
})
async function onSubmitted() {
  const { valid } = await vFormRef.value!.validate()
  if (valid)
    emit('submit')
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
      :title="props.modelValue.id ? 'Edit Category' : 'Add Category'"
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
                  v-model="categoryData.name"
                  label="Title"
                  :rules="[requiredValidator]"
                  placeholder="Fashion"
                />
              </VCol>

              <VCol cols="12">
                <VTextField
                  v-model="categoryData.slug"
                  label="Slug"
                  :rules="[requiredValidator]"
                  placeholder="Trends fashion"
                />
              </VCol>

              <VCol cols="12">
                <VFileInput
                  v-model="categoryData.img"
                  prepend-icon=""
                  :rules="modelValue ? [] : [requiredValidator]"
                  density="compact"
                  label="No file chosen"
                  clearable
                >
                  <template #append>
                    <VBtn variant="outlined">
                      Choose
                    </VBtn>
                  </template>
                </VFileInput>
              </VCol>
              <VCol cols="12">
                <VTextField
                  v-model="categoryData.description"
                  label="Description"
                  :rules="[requiredValidator]"
                  placeholder="Trends fashion"
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
