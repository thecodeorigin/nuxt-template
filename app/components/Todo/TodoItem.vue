<script lang="ts" setup>
import type { Todo } from '~~/shared/schemas/todo'

const props = defineProps<{
  todo: Todo
}>()

const { updateTodoStatus, deleteTodo } = useTodos()
const toast = useToast()

async function toggleCompletion() {
  try {
    await updateTodoStatus(props.todo.id, !props.todo.completed)
  }
  catch {
    toast.add({ title: 'Failed to update todo', color: 'error' })
  }
}

async function removeTodo() {
  try {
    await deleteTodo(props.todo.id)
  }
  catch {
    toast.add({ title: 'Failed to delete todo', color: 'error' })
  }
}
</script>

<template>
  <li class="flex items-center gap-3 py-3">
    <UCheckbox
      :model-value="todo.completed"
      :aria-label="`Mark ${todo.title} complete`"
      @update:model-value="toggleCompletion"
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
      @click="removeTodo"
    />
  </li>
</template>
