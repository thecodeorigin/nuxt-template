<script setup lang="ts">
import Shepherd from 'shepherd.js'
import type { RouteLocationRaw } from 'vue-router'
import { debouncedWatch } from '@vueuse/core'
import { useConfigStore } from '@base/@core/stores/config'
import { NavGroupType } from '@base/@layouts/types'

defineOptions({
  inheritAttrs: false,
})
const { t } = useI18n()
const LazyAppBarSearch = defineAsyncComponent(() => import('@base/@core/components/AppBarSearch.vue'))

interface Suggestion {
  icon: string
  title: string
  url: RouteLocationRaw
}

const configStore = useConfigStore()

interface SuggestionGroup {
  title: string
  content: Suggestion[]
}

// 👉 Is App Search Bar Visible
const isAppSearchBarVisible = ref(false)

// 👉 Default suggestions

const layoutStore = useLayoutStore()

const suggestionGroups = computed(() => {
  const results: SuggestionGroup[] = [
    { title: t('Popular'), content: [] } as SuggestionGroup,
    { title: t('Apps'), content: [] } as SuggestionGroup,
    { title: t('Settings'), content: [] } as SuggestionGroup,
  ]

  for (const layoutItem of layoutStore.layoutItems) {
    const item = {
      icon: 'icon' in layoutItem ? layoutItem.icon?.icon : '',
      title: 'title' in layoutItem ? layoutItem.title : '',
      url: 'to' in layoutItem ? layoutItem.to : { },
    } as Suggestion

    if ('group' in layoutItem) {
      switch (layoutItem.group) {
        case NavGroupType.POPULAR:
          results[0]?.content.push(item)
          break
        case NavGroupType.APP:
          results[1]?.content.push(item)
          break
        case NavGroupType.SETTINGS:
          results[2]?.content.push(item)
          break
        default:
          results[1]?.content.push(item)
          break
      }
    }
    else {
      results[1]?.content.push(item)
    }
  }

  return results.filter(group => group.content.length)
})

const searchQuery = ref('')

const router = useRouter()

const isLoading = ref(false)

const searchResult = ref<SuggestionGroup[]>([])
debouncedWatch(searchQuery, () => {
  if (!searchQuery.value)
    searchResult.value = suggestionGroups.value

  searchResult.value = suggestionGroups.value.reduce((acc, cur) => {
    if (cur.content.length) {
      const content = cur.content.filter((item) => {
        return item.title.toLowerCase().includes(searchQuery.value.toLowerCase())
      })

      if (content.length) {
        return [...acc, { title: cur.title, content }]
      }
    }

    return acc
  }, [] as SuggestionGroup[])
}, { debounce: 100, immediate: true })

// 👉 redirect the selected page
function redirectToSuggestedOrSearchedPage(selected: Suggestion) {
  router.push(selected.url as string)
  isAppSearchBarVisible.value = false
  searchQuery.value = ''
}
</script>

<template>
  <div
    class="d-flex align-center cursor-pointer gap-x-2"
    v-bind="$attrs"
    style="user-select: none;"
    @click="isAppSearchBarVisible = !isAppSearchBarVisible"
  >
    <!-- 👉 Search Trigger button -->
    <!-- close active tour while opening search bar using icon -->
    <IconBtn @click="Shepherd.activeTour?.cancel()">
      <VIcon icon="ri-search-line" />
    </IconBtn>

    <div
      v-if="configStore.appContentLayoutNav === 'vertical'"
      class="d-none d-md-flex text-disabled text-body-1 gap-x-2"
      @click="Shepherd.activeTour?.cancel()"
    >
      <div>
        {{ $t('Search') }}
      </div>
      <div class="meta-key">
        &#8984;K
      </div>
    </div>
  </div>

  <!-- 👉 App Bar Search -->
  <LazyAppBarSearch
    v-model:is-dialog-visible="isAppSearchBarVisible"
    :search-results="searchResult"
    :is-loading="isLoading"
    @search="searchQuery = $event"
  >
    <!-- suggestion -->
    <template #suggestions>
      <VCardText class="app-bar-search-suggestions pa-12">
        <VRow v-if="suggestionGroups">
          <VCol
            v-for="suggestion in suggestionGroups"
            :key="suggestion.title"
            cols="12"
            sm="6"
          >
            <p class="custom-letter-spacing text-xs text-disabled text-uppercase py-2 px-4 mb-0">
              {{ suggestion.title }}
            </p>
            <VList class="card-list">
              <VListItem
                v-for="item in suggestion.content"
                :key="item.title"
                link
                class="app-bar-search-suggestion mx-4 mt-2"
                @click="redirectToSuggestedOrSearchedPage(item)"
              >
                <VListItemTitle>{{ item.title }}</VListItemTitle>
                <template #prepend>
                  <VIcon
                    :icon="item.icon"
                    size="20"
                    class="me-n1"
                  />
                </template>
              </VListItem>
            </VList>
          </VCol>
        </VRow>
      </VCardText>
    </template>

    <!-- no data suggestion -->
    <!-- <template #noDataSuggestion>
    </template> -->

    <!-- search result -->
    <template #searchResult="{ item }">
      <VListSubheader class="text-disabled custom-letter-spacing font-weight-regular ps-4">
        {{ item.title }}
      </VListSubheader>
      <VListItem
        v-for="list in item.content"
        :key="list.title"
        @click="redirectToSuggestedOrSearchedPage(list)"
      >
        <template #prepend>
          <VIcon
            size="20"
            :icon="list.icon"
            class="me-n1"
          />
        </template>
        <template #append>
          <VIcon
            size="20"
            icon="ri-corner-down-left-line"
            class="enter-icon text-medium-emphasis"
          />
        </template>
        <VListItemTitle>
          {{ list.title }}
        </VListItemTitle>
      </VListItem>
    </template>
  </LazyAppBarSearch>
</template>

<style lang="scss">
@use "@base/styles/variables/vuetify.scss";

.meta-key {
  border: thin solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: 6px;
  block-size: 1.5625rem;
  padding-block: 0.1rem;
  padding-inline: 0.25rem;
}

.app-bar-search-dialog {
  .custom-letter-spacing {
    letter-spacing: 0.8px;
  }

  .card-list {
    --v-card-list-gap: 8px;
  }
}
</style>
