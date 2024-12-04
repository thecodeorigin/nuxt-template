<script setup lang="ts">
import { PerfectScrollbar } from 'vue3-perfect-scrollbar'
import type { NavItem } from '@base/@layouts/types'
import type { RawShortcut } from '@base/stores/shortcut'

export interface ShortcutItem {
  item: RawShortcut
  route: NavItem
}
interface Props {
  togglerIcon?: string
  shortcuts: ShortcutItem[]
}

const props = withDefaults(defineProps<Props>(), {
  togglerIcon: 'ri-star-smile-line',
})
const emit = defineEmits<{
  (e: 'add'): void
  (e: 'change', payload: boolean): void
  (e: 'delete', payload: string): void
}>()
const { t } = useI18n()
function handleAddShortcut() {
  emit('add')
}
function deleteShortcut(shortcutId: string) {
  emit('delete', shortcutId)
}

function navigate(route: string) {
  navigateTo(route)
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
            {{ $t('Shortcuts') }}
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
                {{ $t('Add current page to shortcut') }}
              </VTooltip>
            </IconBtn>
          </template>
        </VCardItem>

        <VDivider />

        <PerfectScrollbar :options="{ wheelPropagation: false }">
          <VRow class="ma-0 mt-n1">
            <template
              v-for="(shortcut, index) in props.shortcuts"
              :key="index"
            >
              <VCol
                v-if="shortcut.route"
                cols="6"
                class="text-center border-t cursor-pointer pa-6 shortcut-icon position-relative"
                :class="(index + 1) % 2 ? 'border-e' : ''"
                @click="navigate(shortcut.route.to as string)"
              >
                <VAvatar
                  variant="tonal"
                  size="50"
                >
                  <VIcon
                    color="high-emphasis"
                    size="26"
                    :icon="shortcut.route.icon?.icon || 'ri-star-smile-line'"
                  />
                </VAvatar>

                <h6 class="text-h6 mt-3">
                  {{ t(shortcut.route.title) }}
                </h6>
                <IconBtn
                  class="shortcut-icon-close"
                  size="x-small"
                  @click.stop="deleteShortcut(shortcut.item.id)"
                >
                  <VIcon
                    color="high-emphasis"
                    size="20"
                    icon="ri-close-large-fill"
                  />
                </IconBtn>
              </VCol>
            </template>
          </VRow>
        </PerfectScrollbar>
      </VCard>
    </VMenu>
  </IconBtn>
</template>

<style lang="scss" scoped>
.shortcut-icon:hover {
  background-color: rgba(var(--v-theme-on-surface), var(--v-hover-opacity));
}

.shortcut-icon-close {
  position: absolute;
  top: 4px;
  right: 4px;
}
</style>
