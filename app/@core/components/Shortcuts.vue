<script setup lang="ts">
import { PerfectScrollbar } from 'vue3-perfect-scrollbar'
import type { NavItem } from '@layouts/types'

interface Props {
  togglerIcon?: string
  shortcuts: NavItem[]
}

const props = withDefaults(defineProps<Props>(), {
  togglerIcon: 'ri-star-smile-line',
})

const emit = defineEmits<{
  (e: 'add'): void
  (e: 'change', payload: boolean): void
}>()

function handleAddShortcut() {
  emit('add')
}
</script>

<template>
  <IconBtn>
    <VIcon :icon="props.togglerIcon" />

    <VMenu
      activator="parent"
      offset="15px"
      location="bottom end"
      @update:model-value="$emit('change', $event)"
    >
      <VCard
        width="300"
        max-height="560"
        class="d-flex flex-column"
      >
        <VCardItem class="px-4 py-3">
          <h6 class="text-h6">
            Shortcuts
          </h6>

          <template #append>
            <IconBtn size="small" @click="handleAddShortcut">
              <VIcon
                icon="ri-add-line"
                color="high-emphasis"
              />
              <VTooltip
                activator="parent"
                location="start"
              >
                Add current page to shortcut
              </VTooltip>
            </IconBtn>
          </template>
        </VCardItem>

        <VDivider />

        <PerfectScrollbar :options="{ wheelPropagation: false }">
          <VRow class="ma-0 mt-n1">
            <VCol
              v-for="(shortcut, index) in props.shortcuts"
              :key="shortcut.title"
              cols="6"
              class="text-center border-t cursor-pointer pa-6 shortcut-icon"
              :class="(index + 1) % 2 ? 'border-e' : ''"
              @click="navigateTo(shortcut.to)"
            >
              <VAvatar
                variant="tonal"
                size="50"
              >
                <VIcon
                  color="high-emphasis"
                  size="26"
                  :icon="shortcut.icon?.icon || 'ri-star-smile-line'"
                />
              </VAvatar>

              <h6 class="text-h6 mt-3">
                {{ shortcut.title }}
              </h6>
            </VCol>
          </VRow>
        </PerfectScrollbar>
      </VCard>
    </VMenu>
  </IconBtn>
</template>

<style lang="scss">
.shortcut-icon:hover {
  background-color: rgba(var(--v-theme-on-surface), var(--v-hover-opacity));
}
</style>
