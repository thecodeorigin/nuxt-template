---
name: data-fetching-best-practices
description: Patterns and best practices for efficient data fetching in Nuxt
---

# Data Fetching Best Practices

Effective data fetching patterns for SSR-friendly, performant Nuxt applications.

## Choose the Right Tool

| Scenario | Use |
|----------|-----|
| Component initial data | `useFetch` or `useAsyncData` |
| User interactions (clicks, forms) | `$fetch` |
| Third-party SDK/API | `useAsyncData` with custom function |
| Multiple parallel requests | `useAsyncData` with `Promise.all` |

## Non-Blocking Form Is Always Preferred

**Never top-level `await useFetch` or `await useAsyncData` in `<script setup>`.**
Top-level `await` forces Vue Suspense, blocks client-side navigation, and is an
anti-pattern in this project. Always use the non-blocking form with a `default`
factory and `whenError`:

```vue
<script setup lang="ts">
const { data, error, status } = useFetch('/api/posts', { default: () => [] })
whenError(error)
</script>

<template>
  <div v-if="status === 'pending'">Loading...</div>
  <div v-else>{{ data }}</div>
</template>
```

Or with `useAsyncData`:

```vue
<script setup lang="ts">
const { data, error } = useAsyncData('posts', () => fetchPosts(), { default: () => [] })
whenError(error)
</script>
```

If you genuinely need blocking behavior, wrap the component in `<Suspense>` explicitly,
or use `useLazyFetch`/`useLazyAsyncData` (these never block navigation regardless of `await`).

### ❌ Anti-Pattern: Blocking Navigation with `await`

```vue
<script setup lang="ts">
// NEVER do this — blocks navigation, forces Suspense implicitly
const { data } = await useFetch('/api/posts')
const { data: post } = await useAsyncData('post', () => fetchPost(id))
</script>
```

## Avoid Double Fetching

### ❌ Wrong: Using $fetch Alone in Setup

```vue
<script setup lang="ts">
// This fetches TWICE: once on server, once on client
const data = await $fetch('/api/posts')
</script>
```

### ✅ Correct: Use useFetch

```vue
<script setup lang="ts">
// Fetches on server, hydrates on client (no double fetch)
const { data, error } = useFetch('/api/posts', { default: () => [] })
whenError(error)
</script>
```

## Use Explicit Cache Keys

### ❌ Avoid: Auto-generated Keys

```vue
<script setup lang="ts">
// Key is auto-generated from file/line - can cause issues
const { data, error } = useAsyncData(() => fetchPosts(), { default: () => [] })
whenError(error)
</script>
```

### ✅ Better: Explicit Keys

```vue
<script setup lang="ts">
// Explicit key for predictable caching
const { data, error } = useAsyncData(
  'posts',
  () => fetchPosts(),
  { default: () => [] },
)
whenError(error)

// Dynamic keys for parameterized data
const route = useRoute()
const { data: post } = useAsyncData(
  `post-${route.params.id}`,
  () => fetchPost(route.params.id),
)
</script>
```

## Handle Loading States Properly

```vue
<script setup lang="ts">
const { data, status, error } = useFetch('/api/posts', { default: () => [] })
whenError(error)
</script>

<template>
  <div v-if="status === 'pending'">
    <SkeletonLoader />
  </div>
  <div v-else-if="error">
    <ErrorMessage :error="error" />
  </div>
  <div v-else>
    <PostList :posts="data" />
  </div>
</template>
```

## Use Lazy Fetching for Non-critical Data

```vue
<script setup lang="ts">
const id = useRoute().params.id

// Non-blocking — always preferred
const { data: post, error: postError } = useFetch(`/api/posts/${id}`)
whenError(postError)

// Also non-blocking
const { data: comments, status } = useFetch(`/api/posts/${id}/comments`, {
  lazy: true,
  default: () => [],
})

// useLazyFetch is equivalent to { lazy: true }
const { data: related } = useLazyFetch(`/api/posts/${id}/related`, { default: () => [] })
</script>

<template>
  <article>
    <h1>{{ post?.title }}</h1>
    <p>{{ post?.content }}</p>
  </article>

  <section v-if="status === 'pending'">Loading comments...</section>
  <CommentList v-else :comments="comments" />
</template>
```

## Minimize Payload Size

### Use `pick` for Simple Filtering

```vue
<script setup lang="ts">
const { data } = useFetch('/api/users', {
  // Only include these fields in payload
  pick: ['id', 'name', 'avatar'],
  default: () => [],
})
</script>
```

### Use `transform` for Complex Transformations

```vue
<script setup lang="ts">
const { data } = useFetch('/api/posts', {
  transform: (posts) => {
    return posts.map(post => ({
      id: post.id,
      title: post.title,
      excerpt: post.content.slice(0, 100),
      date: new Date(post.createdAt).toLocaleDateString(),
    }))
  },
  default: () => [],
})
</script>
```

## Parallel Fetching

### Fetch Independent Data with useAsyncData

```vue
<script setup lang="ts">
const { data, error } = useAsyncData(
  'dashboard',
  async (_nuxtApp, { signal }) => {
    const [user, posts, stats] = await Promise.all([
      $fetch('/api/user', { signal }),
      $fetch('/api/posts', { signal }),
      $fetch('/api/stats', { signal }),
    ])
    return { user, posts, stats }
  },
)
whenError(error)
</script>
```

### Multiple useFetch Calls

```vue
<script setup lang="ts">
// These run in parallel automatically — no await needed
const { data: user } = useFetch('/api/user', { default: () => null })
const { data: posts } = useFetch('/api/posts', { default: () => [] })
</script>
```

## Efficient Refresh Patterns

### Watch Reactive Dependencies

```vue
<script setup lang="ts">
const page = ref(1)
const category = ref('all')

const { data } = useFetch('/api/posts', {
  query: { page, category },
  // Auto-refresh when these change
  watch: [page, category],
  default: () => [],
})
</script>
```

### Manual Refresh

```vue
<script setup lang="ts">
const { data, refresh, status } = useFetch('/api/posts', { default: () => [] })

async function refreshPosts() {
  await refresh()
}
</script>
```

### Conditional Fetching

```vue
<script setup lang="ts">
const userId = ref<string | null>(null)

const { data, execute } = useFetch(() => `/api/users/${userId.value}`, {
  immediate: false, // Don't fetch until userId is set
})

// Later, when userId is available
function loadUser(id: string) {
  userId.value = id
  execute()
}
</script>
```

## Server-only Fetching

```vue
<script setup lang="ts">
// Only fetch on server, skip on client navigation
const { data } = useFetch('/api/static-content', {
  server: true,
  lazy: true,
  getCachedData: (key, nuxtApp) => nuxtApp.payload.data[key],
  default: () => null,
})
</script>
```

## Error Handling

```vue
<script setup lang="ts">
const { data, error, refresh } = useFetch('/api/posts', { default: () => [] })

// whenError handles the error ref reactively (shows toast, etc.)
whenError(error)

// Or watch manually for custom handling
watch(error, (err) => {
  if (err) {
    console.error('Fetch failed:', err)
  }
}, { immediate: true })
</script>

<template>
  <div v-if="error">
    <p>Failed to load: {{ error.message }}</p>
    <button @click="refresh()">Retry</button>
  </div>
</template>
```

## Shared Data Across Components

```vue
<!-- ComponentA.vue -->
<script setup lang="ts">
const { data } = useFetch('/api/user', { key: 'current-user', default: () => null })
</script>

<!-- ComponentB.vue -->
<script setup lang="ts">
// Access cached data without refetching
const { data: user } = useNuxtData('current-user')

// Or refresh it
const { refresh } = useFetch('/api/user', { key: 'current-user', default: () => null })
</script>
```

## Avoid useAsyncData for Side Effects

### ❌ Wrong: Side Effects in useAsyncData

```vue
<script setup lang="ts">
// Don't trigger Pinia actions or side effects
await useAsyncData(() => store.fetchUser()) // Can cause issues
</script>
```

### ✅ Correct: Use callOnce for Side Effects

```vue
<script setup lang="ts">
await callOnce(async () => {
  await store.fetchUser()
})
</script>
```

<!-- 
Source references:
- https://nuxt.com/docs/getting-started/data-fetching
- https://nuxt.com/docs/api/composables/use-fetch
- https://nuxt.com/docs/api/composables/use-async-data
- https://nuxt.com/docs/api/composables/use-lazy-fetch
-->
