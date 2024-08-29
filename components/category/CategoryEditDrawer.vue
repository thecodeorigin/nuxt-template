<script setup lang="ts">
import { PerfectScrollbar } from 'vue3-perfect-scrollbar'

import { VForm } from 'vuetify/components/VForm'
import { kebabCase } from 'lodash-es'
import type { Tables } from '@/server/types/supabase'

type Category = Tables<'categories'>

type FormData = Pick<Category, 'name' | 'slug' | 'description' | 'image_url'>

const emit = defineEmits<{
  (e: 'submit', payload: FormData): void
}>()

const modelValue = defineModel('modelValue', {
  type: Boolean,
  default: false,
})

const formData = defineModel('formData', {
  type: Object as PropType<FormData>,
  default() {
    return {
      name: '',
      slug: '',
      description: '',
      image_url: '',
    }
  },
})

const formFiles = ref<File[]>([])

const vFormRef = ref<VForm>()

function resetForm() {
  modelValue.value = false

  vFormRef.value?.reset()
}

async function handleSubmit() {
  const { valid } = await vFormRef.value!.validate()
  if (valid) {
    const slug = formData.value.slug ?? kebabCase(formData.value.name || '')
    const ext = formFiles.value[0].name.split('.').pop()
    const filename = formFiles.value[0].name.replace(/\s/, '_')
    const imageUrl = await uploadToS3(formFiles.value[0], `categories/${slug}/${filename || `${new Date().getTime()}.${ext}`}`)

    emit('submit', {
      ...formData.value,
      image_url: imageUrl,
      slug,
    })
  }
}
</script>

<template>
  <VNavigationDrawer
    v-model="modelValue"
    temporary
    location="end"
    width="370"
    class="category-navigation-drawer scrollable-content"
    border="none"
  >
    <!-- 👉 Header -->
    <AppDrawerHeaderSection
      title="Edit Category"
      @cancel="modelValue = false"
    />

    <VDivider />

    <PerfectScrollbar :options="{ wheelPropagation: false }">
      <VCard flat>
        <VCardText>
          <VForm
            v-if="modelValue"
            ref="vFormRef"
            @submit.prevent="handleSubmit"
          >
            <VRow>
              <VCol cols="12">
                <VTextField
                  v-model="formData.name"
                  label="Title"
                  :rules="[requiredValidator]"
                  placeholder="Fashion"
                />
              </VCol>

              <VCol cols="12">
                <VTextField
                  v-model="formData.slug"
                  label="Slug"
                  placeholder="Trends fashion"
                />
              </VCol>

              <VCol cols="12">
                <VFileInput
                  v-model="formFiles"
                  prepend-icon=""
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
                  v-model="formData.description"
                  label="Description"
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
                    Update
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
