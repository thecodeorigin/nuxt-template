<script setup lang="ts">
const store = useTodosStore()
</script>

<template>
  <UCard>
    <div v-if="store.todos.length === 0" class="text-center text-muted py-8">
      No todos yet. Add one above.
    </div>
    <ul v-else class="divide-y divide-default">
      <TodoItem
        v-for="todo in store.todos"
        :key="todo.id"
        :todo="todo"
      />
    </ul>
  </UCard>
</template>
