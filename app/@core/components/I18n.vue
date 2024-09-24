<script setup lang="ts">
import type { I18nLanguage } from '@layouts/types'

interface Props {
  languages: I18nLanguage[]
  location?: any
}

const props = withDefaults(defineProps<Props>(), {
  location: 'bottom end',
})

const { locale } = useI18n({ useScope: 'global' })
</script>

<template>
  <IconBtn>
    <VIcon icon="ri-translate-2" />

    <!-- Menu -->
    <VMenu
      activator="parent"
      :location="props.location"
      offset="15px"
      width="160"
    >
      <!-- List -->
      <VList
        :selected="[locale]"
        color="primary"
        mandatory
      >
        <!-- List item -->
        <VListItem
          v-for="lang in props.languages"
          :key="lang.i18nLang"
          class="px-4"
          :value="lang.i18nLang"
          @click="locale = lang.i18nLang"
        >
          <!-- Language label -->
          <VListItemTitle>
            {{ lang.label }}
          </VListItemTitle>
        </VListItem>
      </VList>
    </VMenu>
  </IconBtn>
</template>
