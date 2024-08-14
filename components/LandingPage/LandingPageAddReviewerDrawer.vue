<script setup lang="ts">
import { PerfectScrollbar } from 'vue3-perfect-scrollbar'
import { VForm } from 'vuetify/components/VForm'
import type { EditKanbanItem, KanbanItem } from '@db/apps/kanban/types'
import avatar1 from '@images/avatars/avatar-1.png'
import avatar2 from '@images/avatars/avatar-2.png'
import avatar3 from '@images/avatars/avatar-3.png'
import avatar4 from '@images/avatars/avatar-4.png'
import avatar5 from '@images/avatars/avatar-5.png'
import avatar6 from '@images/avatars/avatar-6.png'

interface Emit {
  (e: 'update:isDrawerOpen', value: boolean): void
  (e: 'update:kanbanItem', value: EditKanbanItem): void
  (e: 'deleteKanbanItem', value: EditKanbanItem): void
}

const props = withDefaults(defineProps<{
  kanbanItem?: EditKanbanItem | undefined
  isDrawerOpen: boolean
}>(), {
  kanbanItem: () => ({
    item: {
      title: '',
      dueDate: '2022-01-01T00:00:00Z',
      labels: [],
      members: [],
      id: 0,
      attachments: 0,
      commentsCount: 0,
      image: '',
      comments: '',
    },
    boardId: 0,
    boardName: '',
  }),
})

const emit = defineEmits<Emit>()

const refEditTaskForm = ref<VForm>()
const labelOptions = ['UX', 'Image', 'Code Review', 'Dashboard', 'Bug', 'Charts & maps']

const localKanbanItem = ref<KanbanItem>(JSON.parse(JSON.stringify(props.kanbanItem.item)))

function handleDrawerModelValueUpdate(val: boolean) {
  emit('update:isDrawerOpen', val)

  if (!val)
    refEditTaskForm.value?.reset()
}

// kanban item watcher
watch(() => props.kanbanItem, () => {
  localKanbanItem.value = JSON.parse(JSON.stringify(props.kanbanItem.item))
}, { deep: true })

function updateKanbanItem() {
  refEditTaskForm.value?.validate().then(async (valid) => {
    if (valid.valid) {
      emit('update:kanbanItem', { item: localKanbanItem.value, boardId: props.kanbanItem.boardId, boardName: props.kanbanItem.boardName })
      emit('update:isDrawerOpen', false)
      await nextTick()
      refEditTaskForm.value?.reset()
    }
  })
}

// delete kanban item
function deleteKanbanItem() {
  emit('deleteKanbanItem', { item: localKanbanItem.value, boardId: props.kanbanItem.boardId, boardName: props.kanbanItem.boardName })
  emit('update:isDrawerOpen', false)
}

// 👉 label/chip color
const resolveLabelColor: any = {
  'UX': 'success',
  'Image': 'warning',
  'Code Review': 'info',
  'Dashboard': 'primary',
  'Bug': 'error',
  'Charts & maps': 'primary',
}

const users = [
  { img: avatar1, name: 'John Doe' },
  { img: avatar2, name: 'Jane Smith' },
  { img: avatar3, name: 'Robert Johnson' },
  { img: avatar4, name: 'Lucy Brown' },
  { img: avatar5, name: 'Mike White' },
  { img: avatar6, name: 'Anna Black' },
]

const fileAttached = ref()
</script>

<template>
  <VNavigationDrawer
    location="end"
    :width="370"
    temporary
    border="0"
    :model-value="props.isDrawerOpen"
    @update:model-value="handleDrawerModelValueUpdate"
  >
    <!-- 👉 Header -->
    <AppDrawerHeaderSection
      title="Edit Task"
      @cancel="$emit('update:isDrawerOpen', false)"
    />
    <VDivider />

    <PerfectScrollbar
      :options="{ wheelPropagation: false }"
      style="block-size: calc(100vh - 4rem);"
    >
      <VForm
        v-if="localKanbanItem"
        ref="refEditTaskForm"
        @submit.prevent="updateKanbanItem"
      >
        <VCardText>
          <VRow>
            <VCol cols="12">
              <VTextField
                v-model="localKanbanItem.title"
                label="Title"
                :rules="[requiredValidator]"
              />
            </VCol>

            <VCol cols="12">
              <AppDateTimePicker
                v-model="localKanbanItem.dueDate"
                label="Due date"
              />
            </VCol>

            <VCol cols="12">
              <VSelect
                v-model="localKanbanItem.labels"
                :items="labelOptions"
                label="Label"
                multiple
                eager
              >
                <template #chip="{ item }">
                  <VChip :color="resolveLabelColor[item.raw]">
                    {{ item.raw }}
                  </VChip>
                </template>
              </VSelect>
            </VCol>

            <VCol cols="12">
              <p class="mb-1">
                Assigned
              </p>

              <div>
                <VSelect
                  v-model="localKanbanItem.members"
                  :items="users"
                  item-title="name"
                  item-value="name"
                  multiple
                  return-object
                  variant="plain"
                  :menu-props="{
                    offset: 10,
                  }"
                  class="assignee-select"
                >
                  <template #selection="{ item }">
                    <VAvatar size="26">
                      <VImg :src="item.raw.img" />

                      <VTooltip activator="parent">
                        {{ item.raw.name }}
                      </VTooltip>
                    </VAvatar>
                  </template>

                  <template #prepend-inner>
                    <IconBtn
                      size="26"
                      variant="tonal"
                      class="mt-1"
                    >
                      <VIcon
                        size="20"
                        icon="ri-add-line"
                      />
                    </IconBtn>
                  </template>
                </VSelect>
              </div>
            </VCol>

            <VCol cols="12">
              <VFileInput
                v-model="fileAttached"
                label="Choose file"
                multiple
              />
            </VCol>

            <VCol cols="12">
              <VTextarea
                v-model="localKanbanItem.comments"
                label="Comment"
                placeholder="Write a comment..."
                rows="5"
                textarea
              />
            </VCol>

            <VCol cols="12">
              <VBtn
                type="submit"
                class="me-3"
              >
                Update
              </VBtn>
              <VBtn
                color="error"
                variant="outlined"
                @click="deleteKanbanItem"
              >
                Delete
              </VBtn>
            </VCol>
          </VRow>
        </VCardText>
      </VForm>
    </PerfectScrollbar>
  </VNavigationDrawer>
</template>

<style lang="scss">
.assignee-select {
  .v-field__append-inner {
    .v-select__menu-icon {
      display: none;
    }
  }
}
</style>
