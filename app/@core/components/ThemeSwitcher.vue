<script setup lang="ts">
import { useConfigStore } from '@base/@core/stores/config'
import type { ThemeSwitcherTheme } from '@base/@layouts/types'

const props = defineProps<{
  themes: ThemeSwitcherTheme[]
}>()

const configStore = useConfigStore()
const { t } = useI18n()

const selectedItem = ref([configStore.theme])

// Update icon if theme is changed from other sources
watch(
  () => configStore.theme,
  () => {
    selectedItem.value = [configStore.theme]
  },
  { deep: true },
)
</script>

<template>
  <IconBtn data-test="button-active-popup-theme-switcher">
    <VIcon :icon="props.themes.find(t => t.value === configStore.theme)?.icon" />

    <VTooltip
      activator="parent"
      open-delay="1000"
      scroll-strategy="close"
    >
      <span class="text-capitalize">{{ t(configStore.theme) }}</span>
    </VTooltip>
    <VMenu
      activator="parent"
      offset="15px"
      width="180"
    >
      <VList
        v-model:selected="selectedItem"
        data-test="popup-theme-switcher"
        mandatory
      >
        <VListItem
          v-for="{ label, value, icon, data } in props.themes"
          :key="value"
          :value="value"
          :prepend-icon="icon"
          :data-test="data"
          color="primary"
          class="text-capitalize px-4"
          @click="() => { configStore.theme = value }"
        >
          <VListItemTitle class="text-capitalize">
            {{ label }}
          </VListItemTitle>
        </VListItem>
      </VList>
    </VMenu>
  </IconBtn>
</template>
