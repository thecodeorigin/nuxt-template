<script setup lang="ts">
interface Props {
  location?: any
}

const props = withDefaults(defineProps<Props>(), {
  location: 'bottom end',
})

const { locale, locales } = useI18n({ useScope: 'global' })
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
          v-for="lang in locales"
          :key="lang.code"
          class="px-4"
          :value="lang.code"
          @click="locale = lang.code"
        >
          <!-- Language label -->
          <VListItemTitle>
            {{ lang.name || lang.code }}
          </VListItemTitle>
        </VListItem>
      </VList>
    </VMenu>
  </IconBtn>
</template>
