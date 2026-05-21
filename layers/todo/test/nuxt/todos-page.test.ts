// @vitest-environment nuxt
import { mountSuspended, registerEndpoint } from '@nuxt/test-utils/runtime'
import { describe, expect, it } from 'vitest'
import TodosPage from '#layers/todo/app/pages/todos.vue'

registerEndpoint('/api/todos', () => [])

describe('todos page', () => {
  it('renders the heading and empty state', async () => {
    const wrapper = await mountSuspended(TodosPage)
    const text = wrapper.text()
    expect(text).toContain('Todos')
    expect(text).toContain('No todos yet')
  })
})
