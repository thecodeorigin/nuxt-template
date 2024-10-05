<script setup lang="ts">
import { useConfigStore } from '@base/@core/stores/config'
import type { ThemeSwitcherTheme } from '@base/@layouts/types'

const props = defineProps<{
  themes: ThemeSwitcherTheme[]
}>()

const configStore = useConfigStore()

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
    <VIcon :icon="props.themes.find(t => t.name === configStore.theme)?.icon" />

    <VTooltip
      activator="parent"
      open-delay="1000"
      scroll-strategy="close"
    >
      <span class="text-capitalize">{{ configStore.theme }}</span>
    </VTooltip>
    <VMenu
      activator="parent"
      offset="15px"
      width="160"
    >
      <VList
        v-model:selected="selectedItem"
        data-test="popup-theme-switcher"
        mandatory
      >
        <VListItem
          v-for="{ name, icon, data } in props.themes"
          :key="name"
          :value="name"
          :prepend-icon="icon"
          :data-test="data"
          color="primary"
          class="text-capitalize px-4"
          @click="() => { configStore.theme = name }"
        >
          <VListItemTitle class="text-capitalize">
            {{ name }}
          </VListItemTitle>
        </VListItem>
      </VList>
    </VMenu>
  </IconBtn>
</template>
