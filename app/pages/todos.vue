<script setup lang="ts">
import type { Todo } from '~~/shared/schemas/todo'
import { NewTodoSchema } from '~~/shared/schemas/todo'

definePageMeta({ public: true })
useHead({ title: 'Todos' })

const store = useTodosStore()
const toast = useToast()

const state = reactive({ title: '' })

await useAsyncData('todos', () => store.fetchAll())

async function onSubmit() {
  try {
    await store.create({ title: state.title })
    state.title = ''
  }
  catch {
    toast.add({ title: 'Failed to create todo', color: 'error' })
  }
}

async function toggle(todo: Todo) {
  try {
    await store.update(todo.id, { completed: !todo.completed })
  }
  catch {
    toast.add({ title: 'Failed to update todo', color: 'error' })
  }
}

async function remove(id: string) {
  try {
    await store.remove(id)
  }
  catch {
    toast.add({ title: 'Failed to delete todo', color: 'error' })
  }
}
</script>

<template>
  <UContainer class="py-12 max-w-2xl">
    <div class="space-y-6">
      <div>
        <h1 class="text-2xl font-semibold text-highlighted">
          Todos
        </h1>
        <p class="text-muted">
          Reference vertical slice — Nuxt UI + Pinia + Zod + Vitest + Playwright.
        </p>
      </div>

      <UCard>
        <UForm :schema="NewTodoSchema" :state="state" class="flex gap-2 items-start" @submit="onSubmit">
          <UFormField name="title" class="flex-1">
            <UInput
              v-model="state.title"
              placeholder="What needs doing?"
              autofocus
              class="w-full"
            />
          </UFormField>
          <UButton type="submit" :loading="store.isLoading" icon="i-lucide-plus">
            Add
          </UButton>
        </UForm>
      </UCard>

      <UCard>
        <div v-if="store.todos.length === 0" class="text-center text-muted py-8">
          No todos yet. Add one above.
        </div>
        <ul v-else class="divide-y divide-default">
          <li
            v-for="todo in store.todos"
            :key="todo.id"
            class="flex items-center gap-3 py-3"
          >
            <UCheckbox
              :model-value="todo.completed"
              :aria-label="`Mark ${todo.title} complete`"
              @update:model-value="toggle(todo)"
            />
            <span class="flex-1" :class="{ 'line-through text-muted': todo.completed }">
              {{ todo.title }}
            </span>
            <UButton
              variant="ghost"
              color="error"
              icon="i-lucide-trash-2"
              size="sm"
              :aria-label="`Delete ${todo.title}`"
              @click="remove(todo.id)"
            />
          </li>
        </ul>
      </UCard>
    </div>
  </UContainer>
</template>
