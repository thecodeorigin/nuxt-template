<script setup lang="ts">
import Shepherd from 'shepherd.js'
import { withQuery } from 'ufo'
import type { RouteLocationRaw } from 'vue-router'
import type { SearchResults } from '@db/app-bar-search/types'
import { useConfigStore } from '@core/stores/config'

interface Suggestion {
  icon: string
  title: string
  url: RouteLocationRaw
}

defineOptions({
  inheritAttrs: false,
})

const configStore = useConfigStore()

interface SuggestionGroup {
  title: string
  content: Suggestion[]
}

// 👉 Is App Search Bar Visible
const isAppSearchBarVisible = ref(false)

// 👉 Default suggestions

const suggestionGroups: SuggestionGroup[] = [
  {
    title: 'Popular Searches',
    content: [
      { icon: 'ri-bar-chart-line', title: 'Analytics', url: { name: 'dashboards-analytics' } },
      { icon: 'ri-pie-chart-2-line', title: 'CRM', url: { name: 'dashboards-crm' } },
      { icon: 'ri-shopping-bag-3-line', title: 'eCommerce', url: { name: 'dashboards-ecommerce' } },
      { icon: 'ri-car-line', title: 'Logistics', url: { name: 'apps-logistics-dashboard' } },
    ],
  },
  {
    title: 'Apps & Pages',
    content: [
      { icon: 'ri-calendar-line', title: 'Calendar', url: { name: 'apps-calendar' } },
      { icon: 'ri-lock-unlock-line', title: 'Roles & Permissions', url: { name: 'apps-roles' } },
      { icon: 'ri-settings-4-line', title: 'Account Settings', url: { name: 'pages-account-settings-tab', params: { tab: 'account' } } },
      { icon: 'ri-file-copy-line', title: 'Dialog Examples', url: { name: 'pages-dialog-examples' } },
    ],
  },
  {
    title: 'User Interface',
    content: [
      { icon: 'ri-text', title: 'Typography', url: { name: 'pages-typography' } },
      { icon: 'ri-menu-line', title: 'Accordion', url: { name: 'components-expansion-panel' } },
      { icon: 'ri-alert-line', title: 'Alerts', url: { name: 'components-alert' } },
      { icon: 'ri-checkbox-blank-line', title: 'Cards', url: { name: 'pages-cards-card-basic' } },
    ],
  },
  {
    title: 'Forms & Tables',
    content: [
      { icon: 'ri-radio-button-line', title: 'Radio', url: { name: 'forms-radio' } },
      { icon: 'ri-file-text-line', title: 'Form Layouts', url: { name: 'forms-form-layouts' } },
      { icon: 'ri-table-line', title: 'Table', url: { name: 'tables-simple-table' } },
      { icon: 'ri-edit-box-line', title: 'Editor', url: { name: 'forms-editors' } },
    ],
  },
]

// 👉 No Data suggestion
const noDataSuggestions: Suggestion[] = [
  {
    title: 'Analytics',
    icon: 'ri-bar-chart-line',
    url: { name: 'dashboards-analytics' },
  },
  {
    title: 'CRM',
    icon: 'ri-pie-chart-2-line',
    url: { name: 'dashboards-crm' },
  },
  {
    title: 'eCommerce',
    icon: 'ri-shopping-bag-3-line',
    url: { name: 'dashboards-ecommerce' },
  },
]

const searchQuery = ref('')

const router = useRouter()
const searchResult = ref<SearchResults[]>([])
const isLoading = ref(false)

const fetchResults = async () => {
  isLoading.value = true

  const { data } = await useApi<any>(withQuery('/app-bar/search', { q: searchQuery.value }))

  searchResult.value = data.value

  // ℹ️ simulate loading: we have used setTimeout for better user experience your can remove it
  setTimeout(() => {
    isLoading.value = false
  }, 500)
}

watch(searchQuery, fetchResults)

// 👉 redirect the selected page
const redirectToSuggestedOrSearchedPage = (selected: Suggestion) => {
  router.push(selected.url as string)
  isAppSearchBarVisible.value = false
  searchQuery.value = ''
}

const LazyAppBarSearch = defineAsyncComponent(() => import('@core/components/AppBarSearch.vue'))
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
        Search
      </div>
      <div class="meta-key">
        &#8984;K
      </div>
    </div>
  </div>

  <!-- 👉 App Bar Search -->
  <LazyAppBarSearch
    v-model:isDialogVisible="isAppSearchBarVisible"
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
    <template #noDataSuggestion>
      <div class="mt-6">
        <div class="text-center text-disabled py-2">
          Try searching for
        </div>
        <h6
          v-for="suggestion in noDataSuggestions"
          :key="suggestion.title"
          class="app-bar-search-suggestion text-h6 font-weight-regular cursor-pointer py-2 px-4"
          @click="redirectToSuggestedOrSearchedPage(suggestion)"
        >
          <VIcon
            size="20"
            :icon="suggestion.icon"
            class="me-2"
          />
          <span class="d-inline-block">{{ suggestion.title }}</span>
        </h6>
      </div>
    </template>

    <!-- search result -->
    <template #searchResult="{ item }">
      <VListSubheader class="text-disabled custom-letter-spacing font-weight-regular ps-4">
        {{ item.title }}
      </VListSubheader>
      <VListItem
        v-for="list in item.children"
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
@use "@styles/variables/vuetify.scss";

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
