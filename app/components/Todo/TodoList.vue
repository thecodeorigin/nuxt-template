<script lang="ts" setup>
const { todos } = useTodos()
</script>

<template>
  <UCard>
    <div v-if="todos.length === 0" class="text-center text-muted py-8">
      No todos yet. Add one above.
    </div>
    <ul v-else class="divide-y divide-default">
      <TodoItem
        v-for="todo in todos"
        :key="todo.id"
        :todo="todo"
      />
    </ul>
  </UCard>
</template>
