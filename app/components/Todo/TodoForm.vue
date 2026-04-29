<script setup lang="ts">
import { NewTodoSchema } from '~~/shared/schemas/todo'

const store = useTodosStore()
const toast = useToast()
const state = reactive({ title: '' })

async function onSubmit() {
  try {
    await store.createTodo({ title: state.title })
    state.title = ''
  }
  catch {
    toast.add({ title: 'Failed to create todo', color: 'error' })
  }
}
</script>

<template>
  <UCard>
    <UForm
      :schema="NewTodoSchema"
      :state="state"
      class="flex gap-2 items-start"
      @submit="onSubmit"
    >
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
</template>
