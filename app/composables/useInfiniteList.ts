import type { Page } from '~~/shared/schemas/pagination'

export function useInfiniteList<T>(
  fetcher: (opts: { q: string, limit: number, offset: number }) => Promise<Page<T>>,
  options: { limit?: number, immediate?: boolean } = {},
) {
  const limit = options.limit ?? 20
  const items = ref<T[]>([]) as Ref<T[]>
  const q = ref('')
  const offset = ref(0)
  const hasMore = ref(true)
  const loading = ref(false)

  async function loadMore() {
    if (loading.value || !hasMore.value)
      return
    loading.value = true
    try {
      const page = await fetcher({ q: q.value, limit, offset: offset.value })
      items.value.push(...page.items)
      offset.value += page.items.length
      hasMore.value = page.hasMore
    }
    finally {
      loading.value = false
    }
  }

  function reset() {
    items.value = []
    offset.value = 0
    hasMore.value = true
  }

  watchDebounced(q, async () => {
    reset()
    await loadMore()
  }, { debounce: 300 })

  if (options.immediate !== false)
    loadMore()

  return { items, q, hasMore, loading, loadMore, reset }
}
