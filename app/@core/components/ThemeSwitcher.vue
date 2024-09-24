<script setup lang="ts">
import { useConfigStore } from '@core/stores/config'
import type { ThemeSwitcherTheme } from '@layouts/types'

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
  <IconBtn>
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
        mandatory
      >
        <VListItem
          v-for="{ name, icon } in props.themes"
          :key="name"
          :value="name"
          :prepend-icon="icon"
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
