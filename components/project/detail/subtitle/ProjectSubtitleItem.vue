<script setup lang="ts">
import type { Subtitle } from '@/utils/types/project'

const prop = defineProps<{
  index: number
}>()

const emit = defineEmits<{
  (e: 'video:seek', time: number): void
  (e: 'delete-subtitle', id: number): void
  (e: 'save-subtitle', index: number, value: string): void
}>()

const subtitle = defineModel<Subtitle>({ required: true })

const subtitleText = ref(subtitle.value.text)

const isEditVisible = ref(false)

async function handleOpenDeleteDialog(index: number) {
  const canDelete = await confirmation('Are you sure you want to delete this subtitle?')

  if (canDelete) {
    emit('delete-subtitle', index)
  }
}

function handleSaveSubtitle() {
  emit('save-subtitle', prop.index, subtitleText.value)
  isEditVisible.value = false
}
</script>

<template>
  <div
    class="p-3"
    @click="() => $emit('video:seek', subtitle.start)"
  >
    <div
      v-if="!isEditVisible"
      class="card-list-item"
    >
      <VCheckbox
        v-model="subtitle.selected"
        class="checkbox"
      />
      <div>
        <h6 class="text-h6">
          {{ subtitle.text }}
        </h6>
        <p class="text-sm mt-2">
          {{ formatTime(subtitle.start) }} -> {{ formatTime(subtitle.end) }}
        </p>
      </div>

      <VMenu>
        <template #activator="{ props }">
          <VIcon
            size="24"
            v-bind="props"
            class="menu cursor-pointer"
            icon="ri-more-line"
          />
        </template>
        <VList>
          <VListItem value="edit" @click="isEditVisible = true">
            <VListItemTitle>Edit</VListItemTitle>
          </VListItem>
          <VListItem value="delete" @click="handleOpenDeleteDialog(index)">
            <VListItemTitle>Delete</VListItemTitle>
          </VListItem>
        </VList>
      </VMenu>
    </div>

    <!-- edit subtitle form -->
    <VCard v-else class="v-card">
      <VCardText>
        <VRow>
          <VCol cols="12">
            <VTextarea
              v-model="subtitleText"
              label="Subtitle"
              placeholder="Enter subtitle"
            />
          </VCol>
        </VRow>

        <!-- action save & cancel -->
        <VRow>
          <VCol cols="12">
            <VBtn
              color="primary"
              class="mr-2"
              @click="handleSaveSubtitle"
            >
              Save
            </VBtn>
            <VBtn
              color="error"
              @click="isEditVisible = false"
            >
              Cancel
            </VBtn>
          </VCol>
        </VRow>
      </VCardText>
    </VCard>
  </div>
</template>

<style scoped lang="scss">
.card-list-item {
  cursor: pointer;
  --v-card-list-gap: 0;
  padding: 12px 10px 12px 0;
  display: flex;
  border-radius: 8px;
}

.menu {
  opacity: 0;
  pointer-events: none;
}

.card-list-item:hover .menu {
  opacity: 1;
  pointer-events: auto;
}

.card-list-item:hover {
  background-color: #f5f5f5
}
.checkbox {
  min-width: 36px;
}

.v-card {
  --v-shadow-key-umbra-color: trasparent;
}
</style>
