<script setup lang="ts">
import type { InferSelectModel } from 'drizzle-orm'
import type { projectTable } from '@/server/db/schemas/project.schema.js'
import type { categoryTable } from '@/server/db/schemas/category.schema.js'

type Project = InferSelectModel<typeof projectTable>
type Category = InferSelectModel<typeof categoryTable>
const props = defineProps<{
  item: Project
  category: Category
}>()
defineEmits<{
  (e: 'select', id: string): void
}>()

const router = useRouter()

const resolveChipColor = computed(() => {
  const map: { [key: string]: string } = {
    'medium': 'info',
    'tiny': 'success',
    'large-v3': 'warning',
  }

  if (props.item.model !== null) {
    return map[props.item.model] || ''
  }

  return ''
})
</script>

<template>
  <VCol
    cols="12"
    lg="3"
    md="4"
    sm="6"
  >
    <div
      class="relative px-5 pt-8 pb-5 file sm:px-5 zoom-in"
      :class="$style.box"
    >
      <div :class="$style.inputCheckbox" @click.stop>
        <VCheckbox :checked="false" @update:model-value="$emit('select', item.id)" />
      </div>
      <VCard
        flat
      >
        <div class="pa-2">
          <div :class="$style.thumbnail">
            <VProgressCircular
              v-if="item.status !== 'succeeded'"
              :size="60"
              color="primary"
              indeterminate
            />
            <template
              v-else
            >
              <VImg
                v-if="item.source_thumbnail"
                :src="item.source_thumbnail"
                :alt="item.title || item.source_title || ''"
                class="cursor-pointer"
                @click="() => router.push({ name: 'projects-id', params: { id: item.id } })"
              />
              <FileIcon
                v-else
                variant="directory"
                style="height: 100%; width: 60%;"
              />
            </template>
          </div>
        </div>
        <VCardText class="pa-2">
          <div class="d-flex justify-space-between align-center mb-4">
            <VChip
              variant="tonal"
              size="small"
              class="text-capitalize"
              :color="resolveChipColor"
            >
              {{ item.model }}
            </VChip>
          </div>

          <h5 class="text-h5 mb-1">
            <a
              data-test="project-item-title"
              :class="$style.courseTitle"
              :aria-disabled="item.status !== 'succeeded'"
              class="text-truncate"
            >
              {{ item.title }}
            </a>
          </h5>
          <p
            data-test="project-item-description"
            :class="$style.description" class="mb-2"
          >
            {{ item.description }}
          </p>

          <div
            class="d-flex align-center mb-4"
          >
            <VIcon
              icon="ri-menu-fold-4-line"
              size="20"
              class="me-1"
            />
            <div
              data-test="project-item-category-title"
              class="text-slate-500 text-sm text-center mt-0.5"
            >
              {{ category.name }}
            </div>
          </div>
          <div
            class="d-flex align-center mb-4"
          >
            <VIcon
              icon="ri-time-line"
              size="20"
              class="me-1"
            />
            <div class="text-slate-500 text-xs text-center mt-0.5">
              {{ item.source_duration || 0 }}
            </div>
          </div>

          <div class="d-flex flex-wrap gap-4">
            <VBtn
              variant="outlined"
              class="flex-grow-1"
              data-test="project-item-button-detail"
              :disabled="item.status !== 'succeeded'"
              :to="{ name: 'projects-id', params: { id: item.id } }"
            >
              <template #append>
                <VIcon
                  icon="ri-arrow-right-line"
                  class="flip-in-rtl"
                />
              </template>
              Details
            </VBtn>
          </div>
        </VCardText>
      </VCard>
    </div>
  </VCol>
</template>

<style lang="scss" module>
.thumbnail {
  height: 11rem;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.375rem;
  img {
    height: 100%;
    object-fit: cover;
    border-radius: 0.375rem;
  }
}

.box {
  position: relative;
  box-shadow: 0 3px 5px #0000000b;
  background-color: #fff;
  border: 1px solid #e2e8f0;
  border-radius: .375rem;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
  transition-duration: 300ms;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;

  &:hover {
    transform: scale(1.05);
    box-shadow: 0 20px 25px -5px #0000001a, 0 8px 10px -6px #0000001a;
  }
}
.inputCheckbox {
  position: absolute;
  top: 0;
  left: 0;
  margin-top: 3px;
  margin-left: 3px;
  z-index: 1;
}
.description {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  min-height: 44px;
}
</style>
