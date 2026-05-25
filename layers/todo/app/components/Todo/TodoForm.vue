<script lang="ts" setup>
import { NewTodoSchema } from '#layers/todo/shared/schemas/todo'

const { createTodo } = useTodos()
const toast = useToast()
const state = ref({ title: '' })
const isSubmitting = ref(false)

async function onSubmit() {
  isSubmitting.value = true
  try {
    await createTodo({ title: state.value.title })
    state.value.title = ''
  }
  catch {
    toast.add({ title: 'Failed to create todo', color: 'error' })
  }
  finally {
    isSubmitting.value = false
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
      <UButton type="submit" :loading="isSubmitting" icon="i-lucide-plus">
        Add
      </UButton>
    </UForm>
  </UCard>
</template>
